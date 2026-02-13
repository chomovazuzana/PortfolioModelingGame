import jwt from 'jsonwebtoken';
import type { User, UserRole } from '../shared/types';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token: string;
}

export function buildAuthorizationUrl(codeChallenge: string, state: string): string {
  const baseUrl = process.env.OAUTH_AUTHORIZATION_URL!;
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: process.env.OAUTH_REDIRECT_URI!,
    response_type: 'code',
    scope: process.env.OAUTH_SCOPE || 'openid profile email organizational_unit',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });
  return `${baseUrl}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const response = await fetch(process.env.OAUTH_TOKEN_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET || '',
      redirect_uri: process.env.OAUTH_REDIRECT_URI!,
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<TokenResponse>;
}

export function decodeUserFromToken(idToken: string): User {
  // In development, decode without verification
  // In production, verify with IdP's public key
  const decoded = jwt.decode(idToken) as Record<string, unknown> | null;
  if (!decoded) {
    throw new Error('Failed to decode ID token');
  }

  const role = (decoded.role as string) || 'player';
  return {
    id: decoded.sub as string,
    email: (decoded.email as string) || '',
    displayName: (decoded.name as string) || (decoded.preferred_username as string) || '',
    role: (role === 'admin' ? 'admin' : 'player') as UserRole,
    organizationalUnit: (decoded.organizational_unit as string) || null,
  };
}
