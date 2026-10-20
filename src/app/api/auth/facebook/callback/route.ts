// src/app/api/auth/facebook/callback/route.ts
// Facebook Login callback: exchange the code, read the FB profile, refresh
// the "friends who also use this app" list, find/link/create the pet parent,
// and start the normal 30-day session.
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { createSession, slugifyHandle } from '@/lib/auth';

const GRAPH = 'https://graph.facebook.com/v21.0';

async function graphJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Graph API ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const fail = (why: string) => NextResponse.redirect(`${origin}/?authError=${why}`);

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) return fail('facebook-not-configured');

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const cookieState = req.cookies.get('paws_fb_state')?.value;
  if (!code || !state || !cookieState || state !== cookieState) return fail('facebook-state');

  const redirectUri = `${origin}/api/auth/facebook/callback`;

  try {
    // 1) code -> short-lived user token
    const tokenData = await graphJson(
      `${GRAPH}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`
    );
    // 2) short-lived -> long-lived token (so the friend list stays fresh longer)
    let accessToken: string = tokenData.access_token;
    try {
      const longLived = await graphJson(
        `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}` +
          `&client_secret=${appSecret}&fb_exchange_token=${accessToken}`
      );
      if (longLived.access_token) accessToken = longLived.access_token;
    } catch {
      /* short-lived token still works for this login */
    }

    // 3) profile + friends who also use the app (user_friends permission)
    const me = await graphJson(
      `${GRAPH}/me?fields=id,name,email&access_token=${accessToken}`
    );
    let friendIds: string[] = [];
    try {
      const friends = await graphJson(`${GRAPH}/me/friends?access_token=${accessToken}`);
      friendIds = (friends.data || []).map((f: { id: string }) => f.id);
    } catch {
      /* user_friends not granted/approved yet — friends light up once approved */
    }

    const facebookId: string = me.id;
    const fbName: string = me.name || 'Pet Parent';
    const fbEmail: string | null = me.email ? String(me.email).toLowerCase() : null;

    // 4) find by facebookId, else link by email, else create a fresh profile
    let user =
      (await prisma.petParent.findUnique({ where: { facebookId } })) ||
      (fbEmail ? await prisma.petParent.findUnique({ where: { email: fbEmail } }) : null);

    if (user) {
      user = await prisma.petParent.update({
        where: { id: user.id },
        data: { facebookId, facebookFriendIds: friendIds },
      });
    } else {
      const email = fbEmail || `fb-${facebookId}@facebook.pawsitive-stays.app`;
      let handle = slugifyHandle(fbName);
      let suffix = 2;
      while (await prisma.petParent.findUnique({ where: { handle } })) {
        handle = `${slugifyHandle(fbName)}-${suffix++}`;
      }
      user = await prisma.petParent.create({
        data: {
          email,
          facebookId,
          facebookFriendIds: friendIds,
          name: fbName,
          handle,
          qrToken: `paws-${handle}-${crypto.randomBytes(3).toString('hex')}`,
          dogsSummary: '',
          customCardHeadline: 'Thank You for Having Us!',
          customCardMessage:
            'Thank you for having us! Please scan the QR code and tell us how we did as pet parents.',
          pawsitiveScore: 100,
          tierBadge: 'New Pet Parent (Unrated)',
          verifiedStaysCount: 0,
          cleanRoomStreak: 0,
        },
      });
    }

    await createSession(user.id);
    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.set('paws_fb_state', '', { path: '/', maxAge: 0 });
    return res;
  } catch (error) {
    console.error('Facebook callback error:', error);
    return fail('facebook-failed');
  }
}
