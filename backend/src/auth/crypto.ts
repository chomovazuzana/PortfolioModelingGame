import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const CHUNK_SIZE = 3800; // Stay under 4KB cookie limit

export function encrypt(plaintext: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'utf-8');
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`;
}

export function decrypt(encrypted: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'utf-8');
  const parts = encrypted.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }
  const iv = Buffer.from(parts[0]!, 'base64');
  const authTag = Buffer.from(parts[1]!, 'base64');
  const ciphertext = Buffer.from(parts[2]!, 'base64');
  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext) + decipher.final('utf-8');
}

export function setEncryptedCookies(
  res: Response,
  name: string,
  data: string,
  key: string,
  maxAge: number
): void {
  const encrypted = encrypt(data, key);
  const chunks = splitIntoChunks(encrypted, CHUNK_SIZE);
  for (let i = 0; i < chunks.length; i++) {
    res.cookie(`${name}_${i}`, chunks[i], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });
  }
  res.cookie(`${name}_count`, String(chunks.length), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

export function getEncryptedCookies(req: Request, name: string, key: string): string | null {
  const countStr = req.cookies?.[`${name}_count`] as string | undefined;
  if (!countStr) return null;
  const count = parseInt(countStr, 10);
  if (isNaN(count) || count <= 0) return null;

  const chunks: string[] = [];
  for (let i = 0; i < count; i++) {
    const chunk = req.cookies?.[`${name}_${i}`] as string | undefined;
    if (!chunk) return null;
    chunks.push(chunk);
  }

  try {
    return decrypt(chunks.join(''), key);
  } catch {
    return null;
  }
}

export function clearEncryptedCookies(res: Response, name: string, count: number = 5): void {
  for (let i = 0; i < count; i++) {
    res.clearCookie(`${name}_${i}`, { path: '/' });
  }
  res.clearCookie(`${name}_count`, { path: '/' });
}

function splitIntoChunks(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}
