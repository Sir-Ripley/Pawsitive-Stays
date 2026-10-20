import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DepositType } from '@prisma/client';

export async function GET(req: NextRequest) {
 try {
 const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';
 const depositFilter = req.nextUrl.searchParams.get('depositType') || 'ALL';

 let reviews = await prisma.hotelReview.findMany({
 include: {
 author: {
 select: {
 name: true,
 handle: true,
 pawsitiveScore: true,
 tierBadge: true,
 },
 },
 },
 orderBy: { createdAt: 'desc' },
 });

 // Seed initial AKC show hotel intelligence if empty
 if (reviews.length === 0) {
 const defaultParent = await prisma.petParent.findFirst();
 if (defaultParent) {
 await prisma.hotelReview.createMany({
 data: [
 {
 authorId: defaultParent.id,
 hotelName: 'Days Inn by Wyndham Austintown',
 hotelChain: 'Days Inn',
 city: 'Austintown',
 state: 'OH',
 nearestShowSite: 'Canfield Fairgrounds (10 mins)',
 depositAmount: 25.0,
 depositType: DepositType.PER_NIGHT,
 maxDogsAllowed: 3,
 weightLimitLbs: null,
 acceptsShowSetup: true,
 overallRating: 4,
 pottyAreaRating: 5,
 reviewBody:
 'Great ground-floor access for rolling crates right in. Huge grassy area out back with waste stations. Mention you are showing at Canfield and show your Pawsitive Stays score at check-in!',
 helpfulCount: 14,
 },
 {
 authorId: defaultParent.id,
 hotelName: 'Red Roof Inn PLUS+',
 hotelChain: 'Red Roof Inn',
 city: 'Columbus',
 state: 'OH',
 nearestShowSite: 'Ohio Expo Center (8 mins)',
 depositAmount: 0.0,
 depositType: DepositType.WAIVED_NONE,
 maxDogsAllowed: 2,
 weightLimitLbs: 80,
 acceptsShowSetup: true,
 overallRating: 5,
 pottyAreaRating: 4,
 reviewBody:
 'First pet stays free, and front desk waived the second dog fee when we showed our clean room streak QR card! Hard LVP floors in every room—super easy to keep spotless.',
 helpfulCount: 29,
 },
 {
 authorId: defaultParent.id,
 hotelName: 'La Quinta Inn & Suites',
 hotelChain: 'La Quinta (Wyndham)',
 city: 'Kalamazoo',
 state: 'MI',
 nearestShowSite: 'Kalamazoo County Expo Center (12 mins)',
 depositAmount: 50.0,
 depositType: DepositType.REFUNDABLE,
 maxDogsAllowed: 2,
 weightLimitLbs: 75,
 acceptsShowSetup: true,
 overallRating: 4,
 pottyAreaRating: 5,
 reviewBody:
 '$50 refundable deposit returned immediately at checkout after housekeeping scanned our Pawsitive Stays card on my phone during a 60-second room walk-through.',
 helpfulCount: 19,
 },
 ],
 });

 reviews = await prisma.hotelReview.findMany({
 include: {
 author: {
 select: {
 name: true,
 handle: true,
 pawsitiveScore: true,
 tierBadge: true,
 },
 },
 },
 orderBy: { createdAt: 'desc' },
 });
 }
 }

 const filtered = reviews.filter((r) => {
 const matchesSearch =
 !search ||
 r.hotelName.toLowerCase().includes(search) ||
 r.city.toLowerCase().includes(search) ||
 r.state.toLowerCase().includes(search) ||
 (r.nearestShowSite && r.nearestShowSite.toLowerCase().includes(search));
 const matchesType = depositFilter === 'ALL' || r.depositType === depositFilter;
 return matchesSearch && matchesType;
 });

 return NextResponse.json({ reviews: filtered });
 } catch (error) {
 console.error('Hotels GET error:', error);
 return NextResponse.json({ error: 'Failed to load hotel discussions' }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const {
 authorId,
 hotelName,
 hotelChain,
 city,
 state,
 nearestShowSite,
 depositAmount,
 depositType,
 maxDogsAllowed,
 weightLimitLbs,
 acceptsShowSetup,
 overallRating,
 pottyAreaRating,
 reviewBody,
 } = body;

 if (!authorId || !hotelName || !city || !state || !reviewBody) {
 return NextResponse.json({ error: 'Missing required hotel review fields' }, { status: 400 });
 }

 const newReview = await prisma.hotelReview.create({
 data: {
 authorId,
 hotelName: String(hotelName).trim(),
 hotelChain: String(hotelChain || 'Independent').trim(),
 city: String(city).trim(),
 state: String(state).trim().toUpperCase(),
 nearestShowSite: nearestShowSite ? String(nearestShowSite).trim() : null,
 depositAmount: parseFloat(depositAmount) || 0,
 depositType: (depositType as DepositType) || DepositType.NON_REFUNDABLE,
 maxDogsAllowed: parseInt(maxDogsAllowed, 10) || 2,
 weightLimitLbs: weightLimitLbs ? parseInt(weightLimitLbs, 10) : null,
 acceptsShowSetup: Boolean(acceptsShowSetup),
 overallRating: parseInt(overallRating, 10) || 5,
 pottyAreaRating: parseInt(pottyAreaRating, 10) || 5,
 reviewBody: String(reviewBody).trim(),
 },
 include: {
 author: {
 select: {
 name: true,
 handle: true,
 pawsitiveScore: true,
 tierBadge: true,
 },
 },
 },
 });

 return NextResponse.json({ review: newReview });
 } catch (error) {
 console.error('Hotels POST error:', error);
 return NextResponse.json({ error: 'Failed to post hotel review' }, { status: 500 });
 }
}
