// src/app/api/forum/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';

const authorSelect = {
  name: true,
  handle: true,
  tierBadge: true,
  pawsitiveScore: true,
} as const;

export async function GET() {
  try {
    let threads = await prisma.forumThread.findMany({
      include: {
        author: { select: authorSelect },
        _count: { select: { posts: true } },
        posts: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Seed starter discussions on a fresh install
    if (threads.length === 0) {
      const founder = await prisma.petParent.findFirst({ orderBy: { createdAt: 'asc' } });
      if (founder) {
        await prisma.forumThread.createMany({
          data: [
            {
              authorId: founder.id,
              title: 'Welcome to the Pawsitive Stays community! 🐾',
              category: 'Introductions',
              body: "Say hello and introduce yourself and your dogs — names, breed, and your home show circuit. This is our corner to swap hotel intel, deposit wins, and road stories. Glad you're here!",
            },
            {
              authorId: founder.id,
              title: 'Which hotels have waived your pet deposit?',
              category: 'Hotel Talk',
              body: 'Has a hotel ever waived or discounted your pet deposit after seeing your Pawsitive Score or verified stay history? Share the hotel, city, and what you showed them — your intel helps every exhibitor on the road.',
            },
            {
              authorId: founder.id,
              title: 'Best grassy potty areas near show grounds?',
              category: 'Tips & Tricks',
              body: 'Late-night potty walks matter. Drop your favorite well-lit, safe grassy relief areas near the fairgrounds and show sites you travel to.',
            },
          ],
        });
        threads = await prisma.forumThread.findMany({
          include: {
            author: { select: authorSelect },
            _count: { select: { posts: true } },
            posts: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      }
    }

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Forum GET error:', error);
    return NextResponse.json({ error: 'Failed to load forum' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to start a discussion.' }, { status: 401 });
    }
    const body = await req.json();
    const title = String(body.title || '').trim();
    const category = String(body.category || 'Hotel Talk').trim();
    const text = String(body.body || '').trim();

    if (!title || !text) {
      return NextResponse.json({ error: 'A title and a message are required.' }, { status: 400 });
    }
    if (title.length > 140 || text.length > 4000) {
      return NextResponse.json({ error: 'Title or message is too long.' }, { status: 400 });
    }

    const thread = await prisma.forumThread.create({
      data: { authorId: userId, title, category, body: text },
      include: {
        author: { select: authorSelect },
        _count: { select: { posts: true } },
        posts: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error('Forum POST error:', error);
    return NextResponse.json({ error: 'Failed to start discussion.' }, { status: 500 });
  }
}
