// src/app/api/auth/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, toPublicProfile } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token || '');
    const newPassword = String(body.newPassword || '');

    if (!token || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'A valid reset link and a password of at least 8 characters are required.' },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.petParent.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = await prisma.petParent.update({
      where: { id: user.id },
      data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
      include: { verifications: { orderBy: { verifiedAt: 'desc' }, take: 10 } },
    });

    await createSession(updated.id);
    return NextResponse.json({ profile: toPublicProfile(updated, true) });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Password reset failed. Please try again.' }, { status: 500 });
  }
}
