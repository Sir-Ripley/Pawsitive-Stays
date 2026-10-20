// src/lib/auth.ts
// Email + password auth with a persistent (30-day) signed session cookie.
// "Stayed login": the cookie is httpOnly, secure, and long-lived; logging in
// again with email + password always works from any device.
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'paws_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'pawsitive-dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(sessionSecret());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.petParent.findUnique({
    where: { id: userId },
    include: {
      verifications: { orderBy: { verifiedAt: 'desc' }, take: 10 },
    },
  });
  return user;
}

// Public view of a profile: never leak the password hash or email to others.
export function toPublicProfile<T extends { passwordHash?: string | null; email?: string }>(
  profile: T,
  includeEmail = false
) {
  const { passwordHash: _ph, email, ...rest } = profile as T & { email?: string };
  return includeEmail ? { ...rest, email } : rest;
}

export function slugifyHandle(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30) || 'pet-parent'
  );
}
