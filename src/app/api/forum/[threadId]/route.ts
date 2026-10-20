// src/app/api/forum/[threadId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';

const authorSelect = {
  name: true,
  handle: true,
  tierBadge: true,
  pawsitiveScore: true,
} as const;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await context.params;
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        author: { select: authorSelect },
        posts: {
          include: { author: { select: authorSelect } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!thread) {
      return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 });
    }
    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Forum thread GET error:', error);
    return NextResponse.json({ error: 'Failed to load discussion.' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to join the discussion.' }, { status: 401 });
    }
    const { threadId } = await context.params;
    const body = await req.json();
    const text = String(body.body || '').trim();
    if (!text) {
      return NextResponse.json({ error: 'Write a reply first.' }, { status: 400 });
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: 'Reply is too long.' }, { status: 400 });
    }

    const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });
    if (!thread) {
      return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 });
    }

    const post = await prisma.forumPost.create({
      data: { threadId, authorId: userId, body: text },
      include: { author: { select: authorSelect } },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Forum reply POST error:', error);
    return NextResponse.json({ error: 'Failed to post reply.' }, { status: 500 });
  }
}
