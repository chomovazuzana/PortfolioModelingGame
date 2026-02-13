import { Router } from 'express';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../auth/pkce';
import { buildAuthorizationUrl, exchangeCodeForTokens, decodeUserFromToken } from '../auth/oauth';
import { setEncryptedCookies, getEncryptedCookies, clearEncryptedCookies } from '../auth/crypto';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();
const COOKIE_NAME = 'auth_session';
const TEMP_COOKIE_MAX_AGE = 10 * 60 * 1000; // 10 minutes
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

function getEncryptionKey(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be exactly 32 characters');
  }
  return key;
}

// GET /api/auth/login — Initiate OAuth2 PKCE flow
router.get('/login', (_req, res) => {
  if (process.env.DISABLE_LOGIN === 'true') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/games`);
    return;
  }

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateState();

  // Store PKCE verifier and state in temporary cookies
  res.cookie('oauth_verifier', verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TEMP_COOKIE_MAX_AGE,
    path: '/',
  });
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TEMP_COOKIE_MAX_AGE,
    path: '/',
  });

  const authUrl = buildAuthorizationUrl(challenge, state);
  res.redirect(authUrl);
});

// GET /api/auth/callback — Handle OAuth2 callback
router.get('/callback', async (req, res) => {
  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const savedVerifier = req.cookies?.oauth_verifier as string | undefined;
    const savedState = req.cookies?.oauth_state as string | undefined;

    if (!code || !state || !savedVerifier || !savedState) {
      res.status(400).json({ error: 'Missing OAuth2 parameters', code: 'OAUTH_ERROR' });
      return;
    }

    if (state !== savedState) {
      res.status(400).json({ error: 'State mismatch — possible CSRF', code: 'OAUTH_STATE_MISMATCH' });
      return;
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, savedVerifier);
    const user = decodeUserFromToken(tokens.id_token);

    // Upsert user in database
    const existing = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
    if (existing.length === 0) {
      await db.insert(users).values({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        organizationalUnit: user.organizationalUnit,
      });
    } else {
      await db
        .update(users)
        .set({
          displayName: user.displayName,
          organizationalUnit: user.organizationalUnit,
        })
        .where(eq(users.email, user.email));
      user.id = existing[0]!.id;
      user.role = existing[0]!.role as 'player' | 'admin';
    }

    // Clear temporary cookies
    res.clearCookie('oauth_verifier', { path: '/' });
    res.clearCookie('oauth_state', { path: '/' });

    // Store tokens in encrypted cookies
    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token,
      user_id: user.id,
    });
    setEncryptedCookies(res, COOKIE_NAME, tokenData, getEncryptionKey(), SESSION_MAX_AGE);

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/games`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).json({ error: 'Authentication failed', code: 'OAUTH_ERROR' });
  }
});

// GET /api/auth/session — Return current user from session
router.get('/session', (req, res) => {
  if (process.env.DISABLE_LOGIN === 'true') {
    res.json({
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'dev@example.com',
        displayName: 'Dev User',
        role: 'admin',
        organizationalUnit: 'Development',
      },
    });
    return;
  }

  try {
    const tokenData = getEncryptedCookies(req, COOKIE_NAME, getEncryptionKey());
    if (!tokenData) {
      res.status(401).json({ error: 'Not authenticated', code: 'AUTH_REQUIRED' });
      return;
    }

    const parsed = JSON.parse(tokenData);
    const user = decodeUserFromToken(parsed.id_token);
    // Use stored user_id (from DB upsert) instead of JWT sub
    if (parsed.user_id) {
      user.id = parsed.user_id;
    }
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid session', code: 'AUTH_REQUIRED' });
  }
});

// GET /api/auth/logout — Clear session cookies
router.get('/logout', (_req, res) => {
  clearEncryptedCookies(res, COOKIE_NAME);
  res.json({ success: true });
});

export default router;
