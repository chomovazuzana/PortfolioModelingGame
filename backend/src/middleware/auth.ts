import type { Request, Response, NextFunction } from 'express';
import type { User } from '../shared/types';
import { getEncryptedCookies } from '../auth/crypto';
import { decodeUserFromToken } from '../auth/oauth';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@dev.local',
  displayName: 'Admin User',
  role: 'admin',
  organizationalUnit: 'Development',
};

const COOKIE_NAME = 'auth_session';
const DEV_COOKIE_NAME = 'dev_user_id';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (process.env.DISABLE_LOGIN === 'true') {
    try {
      const devUserId = req.cookies?.[DEV_COOKIE_NAME] as string | undefined;
      if (devUserId) {
        const [userRow] = await db.select().from(users).where(eq(users.id, devUserId)).limit(1);
        if (userRow) {
          req.user = {
            id: userRow.id,
            email: userRow.email,
            displayName: userRow.displayName,
            role: userRow.role as 'player' | 'admin',
            organizationalUnit: userRow.organizationalUnit,
          };
          return next();
        }
      }
      req.user = MOCK_USER;
      return next();
    } catch {
      req.user = MOCK_USER;
      return next();
    }
  }

  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    res.status(500).json({ error: 'Server configuration error', code: 'CONFIG_ERROR' });
    return;
  }

  const tokenData = getEncryptedCookies(req, COOKIE_NAME, key);
  if (!tokenData) {
    res.status(401).json({ error: 'Not authenticated', code: 'AUTH_REQUIRED' });
    return;
  }

  try {
    const parsed = JSON.parse(tokenData);
    const user = decodeUserFromToken(parsed.id_token);
    if (parsed.user_id) {
      user.id = parsed.user_id;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid session', code: 'AUTH_REQUIRED' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required', code: 'ADMIN_REQUIRED' });
      return;
    }
    next();
  });
}
