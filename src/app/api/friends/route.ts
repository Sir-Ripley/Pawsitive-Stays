// src/app/api/friends/route.ts
// "Pet parents you may know": Facebook friends of the signed-in user who are
// also Pawsitive Stays members (matched on the friend IDs Facebook shared at
// login — it only ever shares friends who use this same app).
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  if (!me.facebookId || me.facebookFriendIds.length === 0) {
    return NextResponse.json({ friends: [], facebookConnected: Boolean(me.facebookId) });
  }
  const friends = await prisma.petParent.findMany({
    where: { facebookId: { in: me.facebookFriendIds } },
    select: {
      name: true,
      handle: true,
      dogsSummary: true,
      pawsitiveScore: true,
      tierBadge: true,
      verifiedStaysCount: true,
    },
    take: 20,
  });
  return NextResponse.json({ friends, facebookConnected: true });
}
