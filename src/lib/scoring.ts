
export interface VerificationInput {
 hadDoggyMesses: boolean;
 roomConditionRating: number; // 1 - 5
 noiseAndRespect: number; // 1 - 5
 cratesOrMatsUsed: boolean;
 wouldWelcomeBack: boolean;
}

export function calculateSingleStayScore(input: VerificationInput): number {
 // Base score starts from room condition (max 50 pts) + noise/respect (max 30 pts)
 const conditionPts = (Math.min(Math.max(input.roomConditionRating, 1), 5) / 5) * 50;
 const respectPts = (Math.min(Math.max(input.noiseAndRespect, 1), 5) / 5) * 30;

 // Bonus points for zero doggy messes (+15) and crate/mat protection (+5)
 const cleanBonus = input.hadDoggyMesses ? -35 : 15;
 const crateBonus = input.cratesOrMatsUsed ? 5 : 0;
 const welcomePenalty = input.wouldWelcomeBack ? 0 : -25;

 const raw = conditionPts + respectPts + cleanBonus + crateBonus + welcomePenalty;
 return Math.max(0, Math.min(100, Math.round(raw)));
}

export function computeAggregatePawsitiveProfile(verifications: VerificationInput[]) {
 if (verifications.length === 0) {
 return {
 pawsitiveScore: 100,
 tierBadge: 'New Pet Parent (Unrated)',
 cleanRoomStreak: 0,
 verifiedStaysCount: 0,
 discountEligible: false,
 };
 }

 const scores = verifications.map(calculateSingleStayScore);
 const averageScore = Math.round(scores.reduce((acc, s) => acc + s, 0) / scores.length);

 // Calculate consecutive clean room streak (assuming ordered newest first)
 let cleanRoomStreak = 0;
 for (const v of verifications) {
 if (!v.hadDoggyMesses && v.roomConditionRating >= 4) {
 cleanRoomStreak++;
 } else {
 break;
 }
 }

 let tierBadge = 'Bronze Paw';
 if (averageScore >= 95 && verifications.length >= 5) {
 tierBadge = 'AKC Diamond Exhibitor';
 } else if (averageScore >= 90 && verifications.length >= 2) {
 tierBadge = 'Gold Standard Pet Parent';
 } else if (averageScore >= 80) {
 tierBadge = 'Silver Verified Guest';
 }

 return {
 pawsitiveScore: averageScore,
 tierBadge,
 cleanRoomStreak,
 verifiedStaysCount: verifications.length,
 discountEligible: averageScore >= 90 && verifications.length >= 2,
 };
}
