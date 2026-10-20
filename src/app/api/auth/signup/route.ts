// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, slugifyHandle, toPublicProfile } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const dogBreed = String(body.dogBreed || '').trim();
    const dogNames = String(body.dogNames || '').trim();
    const akcClubOrKennel = String(body.akcClubOrKennel || '').trim();
    const homeCityState = String(body.homeCityState || '').trim();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (!dogNames || !dogBreed) {
      return NextResponse.json(
        { error: "Tell us your dog's name(s) and breed so we can build your card." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const dogsSummary = `${dogNames} • ${dogBreed}`;

    const existing = await prisma.petParent.findUnique({ where: { email } });
    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json(
          { error: 'An account with this email already exists — please log in.' },
          { status: 409 }
        );
      }
      // Claim a pre-auth profile (e.g., a seeded/imported one) for its owner.
      const claimed = await prisma.petParent.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name: existing.name || name,
          dogNames: existing.dogNames || dogNames,
          dogBreed: existing.dogBreed || dogBreed,
          homeCityState: existing.homeCityState || homeCityState || null,
          akcClubOrKennel: existing.akcClubOrKennel || akcClubOrKennel || null,
        },
        include: { verifications: { orderBy: { verifiedAt: 'desc' }, take: 10 } },
      });
      await createSession(claimed.id);
      return NextResponse.json({ profile: toPublicProfile(claimed, true), claimed: true });
    }

    // Unique handle from the name
    let handle = slugifyHandle(name);
    let suffix = 2;
    while (await prisma.petParent.findUnique({ where: { handle } })) {
      handle = `${slugifyHandle(name)}-${suffix++}`;
    }
    const qrToken = `paws-${handle}-${crypto.randomBytes(3).toString('hex')}`;

    const user = await prisma.petParent.create({
      data: {
        email,
        passwordHash,
        name,
        handle,
        qrToken,
        dogNames,
        dogBreed,
        homeCityState: homeCityState || null,
        akcClubOrKennel: akcClubOrKennel || null,
        dogsSummary,
        customCardHeadline: 'Thank You for Having Us!',
        customCardMessage:
          'Thank you for having us! Please scan the QR code and tell us how we did as pet parents.',
        pawsitiveScore: 100,
        tierBadge: 'New Pet Parent (Unrated)',
        verifiedStaysCount: 0,
        cleanRoomStreak: 0,
      },
      include: { verifications: { orderBy: { verifiedAt: 'desc' }, take: 10 } },
    });

    await createSession(user.id);
    return NextResponse.json({ profile: toPublicProfile(user, true) }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
