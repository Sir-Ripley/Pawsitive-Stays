import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, toPublicProfile } from '@/lib/auth';

export async function GET(req: NextRequest) {
 try {
 const handle = req.nextUrl.searchParams.get('handle');

 // No handle requested: return the signed-in user's own profile.
 if (!handle) {
 const me = await getCurrentUser();
 if (!me) {
 return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
 }
 return NextResponse.json({ profile: toPublicProfile(me, true) });
 }

 let profile = await prisma.petParent.findUnique({
 where: { handle },
 include: {
 verifications: {
 orderBy: { verifiedAt: 'desc' },
 take: 10,
 },
 },
 });

 // Auto-seed default demo profile if database is freshly initialized
 if (!profile && handle === 'sir-ripley') {
 profile = await prisma.petParent.create({
 data: {
 email: 'droiden.rr@gmail.com',
 name: 'Rodney Ripley',
 handle: 'sir-ripley',
 qrToken: 'paws-ripley-akc-01',
 akcClubOrKennel: 'AKC Exhibitor • Dachshunds (Vanya & Lila)',
 dogsSummary: '2 Champion-Line Dachshunds • Crated & Mat-Trained',
 customCardHeadline: 'Thank You for Having Us!',
 customCardMessage:
 'Thank you for Having Us! Please scan the QR code and tell us how we did as pet parents.',
 pawsitiveScore: 99,
 tierBadge: 'AKC Diamond Exhibitor',
 verifiedStaysCount: 2,
 cleanRoomStreak: 2,
 verifications: {
 create: [
 {
 hotelName: 'Days Inn & Suites Austintown',
 hotelChain: 'Wyndham / Days Inn',
 cityState: 'Austintown, OH',
 roomNumber: '114',
 staffNameOrInitials: 'M.R.',
 staffRole: 'Head Housekeeping',
 hadDoggyMesses: false,
 roomConditionRating: 5,
 noiseAndRespect: 5,
 cratesOrMatsUsed: true,
 wouldWelcomeBack: true,
 staffComments: 'Spotless room! Plastic sheeting used under crates, towels neatly stacked.',
 },
 {
 hotelName: 'Red Roof Inn',
 hotelChain: 'Red Roof',
 cityState: 'Austinburg, OH',
 roomNumber: '108',
 staffNameOrInitials: 'T.K.',
 staffRole: 'Front Desk / Checkout Inspector',
 hadDoggyMesses: false,
 roomConditionRating: 5,
 noiseAndRespect: 5,
 cratesOrMatsUsed: true,
 wouldWelcomeBack: true,
 staffComments: 'Zero dog hair or messes, quietest dogs on the floor.',
 },
 ],
 },
 },
 include: {
 verifications: {
 orderBy: { verifiedAt: 'desc' },
 },
 },
 });
 }

 return NextResponse.json({ profile: profile ? toPublicProfile(profile) : null });
 } catch (error) {
 console.error('Profile GET error:', error);
 return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
 }
}

export async function PATCH(req: NextRequest) {
 try {
 const me = await getCurrentUser();
 if (!me) {
 return NextResponse.json({ error: 'Sign in to edit your profile.' }, { status: 401 });
 }
 const body = await req.json();
 const {
 name,
 akcClubOrKennel,
 dogsSummary,
 customCardHeadline,
 customCardMessage,
 } = body;

 const updated = await prisma.petParent.update({
 where: { id: me.id },
 data: {
 name,
 akcClubOrKennel,
 dogsSummary,
 customCardHeadline,
 customCardMessage,
 },
 include: {
 verifications: {
 orderBy: { verifiedAt: 'desc' },
 take: 10,
 },
 },
 });

 return NextResponse.json({ profile: toPublicProfile(updated, true) });
 } catch (error) {
 console.error('Profile PATCH error:', error);
 return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
 }
}
