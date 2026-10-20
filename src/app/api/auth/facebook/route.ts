// src/app/api/auth/facebook/route.ts
// Starts the Facebook Login flow. Requires env FACEBOOK_APP_ID (+ secret on
// the callback). Configure the OAuth redirect URI in the Meta app:
//   <origin>/api/auth/facebook/callback
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  const origin = req.nextUrl.origin;
  if (!appId) {
    return NextResponse.redirect(`${origin}/?authError=facebook-not-configured`);
  }

  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${origin}/api/auth/facebook/callback`;
  const dialog = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  dialog.searchParams.set('client_id', appId);
  dialog.searchParams.set('redirect_uri', redirectUri);
  dialog.searchParams.set('state', state);
  dialog.searchParams.set('scope', 'email,public_profile,user_friends');
  dialog.searchParams.set('response_type', 'code');

  const res = NextResponse.redirect(dialog.toString());
  res.cookies.set('paws_fb_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
