import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeAggregatePawsitiveProfile } from '@/lib/scoring';
import crypto from 'crypto';

export async function GET(
 _req: NextRequest,
 context: { params: Promise<{ qrToken: string }> }
) {
 try {
 const { qrToken } = await context.params;
 const petParent = await prisma.petParent.findUnique({
 where: { qrToken },
 select: {
 id: true,
 name: true,
 handle: true,
 akcClubOrKennel: true,
 dogsSummary: true,
 customCardHeadline: true,
 customCardMessage: true,
 pawsitiveScore: true,
 tierBadge: true,
 verifiedStaysCount: true,
 cleanRoomStreak: true,
 },
 });

 if (!petParent) {
 return NextResponse.json({ error: 'Invalid QR Code Token' }, { status: 404 });
 }

 return NextResponse.json({ petParent });
 } catch (error) {
 console.error('Error fetching QR profile:', error);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}

export async function POST(
 req: NextRequest,
 context: { params: Promise<{ qrToken: string }> }
) {
 try {
 const { qrToken } = await context.params;
 const body = await req.json();

 const {
 hotelName,
 hotelChain,
 cityState,
 roomNumber,
 staffNameOrInitials,
 staffRole,
 // Simple questionnaire fields
 starRating,
 leftRoomTidy,
 hadMesses,
 hadPuddles,
 // Legacy fields (older clients)
 hadDoggyMesses,
 roomConditionRating,
 noiseAndRespect,
 cratesOrMatsUsed,
 wouldWelcomeBack,
 staffComments,
 } = body;

 if (!hotelName || !roomNumber || !staffNameOrInitials || !cityState) {
 return NextResponse.json(
 { error: 'Hotel name, city/state, room number, and staff initials are required.' },
 { status: 400 }
 );
 }

 const petParent = await prisma.petParent.findUnique({
 where: { qrToken },
 });

 if (!petParent) {
 return NextResponse.json({ error: 'Pet parent profile not found.' }, { status: 404 });
 }

 // Hash IP address for privacy-safe duplicate scan prevention
 const forwardedFor = req.headers.get('x-forwarded-for') || 'unknown-ip';
 const scannerIpHash = crypto.createHash('sha256').update(forwardedFor).digest('hex');

 // Map the simple questionnaire onto the scoring model (legacy clients supported):
 // paw rating drives both rating scales, tidy is the room-care bonus signal,
 // messes or puddles count as a doggy mess.
 const rating = Math.min(5, Math.max(1, Number(starRating ?? roomConditionRating) || 5));
 const tidy = leftRoomTidy !== undefined ? Boolean(leftRoomTidy) : cratesOrMatsUsed !== undefined ? Boolean(cratesOrMatsUsed) : true;
 const puddles = Boolean(hadPuddles);
 const messes = hadMesses !== undefined ? Boolean(hadMesses) || puddles : Boolean(hadDoggyMesses) || puddles;

 // Create the verification entry
 const verification = await prisma.staffVerification.create({
 data: {
 petParentId: petParent.id,
 hotelName: String(hotelName).trim(),
 hotelChain: hotelChain ? String(hotelChain).trim() : null,
 cityState: String(cityState).trim(),
 roomNumber: String(roomNumber).trim(),
 staffNameOrInitials: String(staffNameOrInitials).trim(),
 staffRole: staffRole ? String(staffRole).trim() : 'Housekeeping / Staff',
 hadDoggyMesses: messes,
 leftRoomTidy: tidy,
 hadPuddles: puddles,
 roomConditionRating: rating,
 noiseAndRespect: rating,
 cratesOrMatsUsed: tidy,
 wouldWelcomeBack: wouldWelcomeBack !== undefined ? Boolean(wouldWelcomeBack) : true,
 staffComments: staffComments ? String(staffComments).trim() : null,
 scannerIpHash,
 },
 });

 // Recalculate aggregate score across all verified stays
 const allVerifications = await prisma.staffVerification.findMany({
 where: { petParentId: petParent.id },
 orderBy: { verifiedAt: 'desc' },
 });

 const stats = computeAggregatePawsitiveProfile(allVerifications);

 const updatedParent = await prisma.petParent.update({
 where: { id: petParent.id },
 data: {
 pawsitiveScore: stats.pawsitiveScore,
 tierBadge: stats.tierBadge,
 verifiedStaysCount: stats.verifiedStaysCount,
 cleanRoomStreak: stats.cleanRoomStreak,
 },
 });

 return NextResponse.json({
 success: true,
 verification,
 updatedStats: {
 pawsitiveScore: updatedParent.pawsitiveScore,
 tierBadge: updatedParent.tierBadge,
 verifiedStaysCount: updatedParent.verifiedStaysCount,
 cleanRoomStreak: updatedParent.cleanRoomStreak,
 },
 });
 } catch (error) {
 console.error('Error submitting staff verification:', error);
 return NextResponse.json({ error: 'Failed to submit verification.' }, { status: 500 });
 }
}
