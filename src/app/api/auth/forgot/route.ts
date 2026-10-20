// src/app/api/auth/forgot/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mailer';

const GENERIC = {
  success: true,
  message: 'If an account with that email exists, a reset link is on its way.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json(GENERIC);

    const user = await prisma.petParent.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await prisma.petParent.update({
        where: { id: user.id },
        data: {
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 60 minutes
        },
      });
      const origin = req.nextUrl.origin;
      await sendPasswordResetEmail(email, `${origin}/reset-password?token=${token}`);
    }

    // Never reveal whether the email exists.
    return NextResponse.json(GENERIC);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(GENERIC);
  }
}
