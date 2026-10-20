'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Dog, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

interface ScannedPetParent {
 id: string;
 name: string;
 handle: string;
 akcClubOrKennel: string;
 dogsSummary: string;
 customCardHeadline: string;
 customCardMessage: string;
 pawsitiveScore: number;
 tierBadge: string;
}

export default function StaffScanVerifyPage() {
 const params = useParams<{ qrToken: string }>();
 const qrToken = params?.qrToken;

 const [petParent, setPetParent] = useState<ScannedPetParent | null>(null);
 const [loading, setLoading] = useState(true);
 const [submitted, setSubmitted] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [newScore, setNewScore] = useState<number | null>(null);

 // Staff Form State
 const [hotelName, setHotelName] = useState('');
 const [cityState, setCityState] = useState('');
 const [roomNumber, setRoomNumber] = useState('');
 const [staffNameOrInitials, setStaffNameOrInitials] = useState('');
 const [staffRole, setStaffRole] = useState('Housekeeping / Room Attendant');
 const [hadDoggyMesses, setHadDoggyMesses] = useState(false);
 const [roomConditionRating, setRoomConditionRating] = useState(5);
 const [noiseAndRespect, setNoiseAndRespect] = useState(5);
 const [cratesOrMatsUsed, setCratesOrMatsUsed] = useState(true);
 const [wouldWelcomeBack, setWouldWelcomeBack] = useState(true);
 const [staffComments, setStaffComments] = useState('');

 useEffect(() => {
 async function loadQrOwner() {
 if (!qrToken) return;
 try {
 const res = await fetch(`/api/verify/${qrToken}`);
 const data = await res.json();
 if (data.petParent) {
 setPetParent(data.petParent);
 }
 } catch (err) {
 console.error('Failed to load QR token owner:', err);
 } finally {
 setLoading(false);
 }
 }
 loadQrOwner();
 }, [qrToken]);

 async function handleSubmitInspection(e: React.FormEvent) {
 e.preventDefault();
 setSubmitting(true);
 try {
 const res = await fetch(`/api/verify/${qrToken}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 hotelName,
 cityState,
 roomNumber,
 staffNameOrInitials,
 staffRole,
 hadDoggyMesses,
 roomConditionRating,
 noiseAndRespect,
 cratesOrMatsUsed,
 wouldWelcomeBack,
 staffComments,
 }),
 });
 const data = await res.json();
 if (data.success) {
 setNewScore(data.updatedStats?.pawsitiveScore ?? null);
 setSubmitted(true);
 }
 } finally {
 setSubmitting(false);
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
 <div className="animate-pulse text-amber-400 font-bold">
 Loading Pet Parent Room Check-Out Card...
 </div>
 </div>
 );
 }

 if (!petParent) {
 return (
 <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
 <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl">
 <h1 className="text-xl font-bold text-rose-400">QR Code Not Found</h1>
 <p className="text-sm text-slate-400 mt-2">
 Please check the QR code on the pet parent leave-behind card and try again.
 </p>
 </div>
 </div>
 );
 }

 if (submitted) {
 return (
 <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
 <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
 <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
 <CheckCircle2 className="w-10 h-10" />
 </div>
 <h1 className="text-2xl font-black">Thank You, Hotel Team!</h1>
 <p className="text-sm text-slate-300">
 Your room condition report for <span className="font-bold text-white">{petParent.name}</span>{' '}
 (Room #{roomNumber}) has been recorded.
 </p>
 {newScore !== null && (
 <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
 <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
 Updated Pet Parent Score
 </div>
 <div className="text-3xl font-black text-amber-400 mt-1">{newScore} / 100</div>
 </div>
 )}
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4">
 <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
 {/* Top Pet Parent Greeting Banner */}
 <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 p-6">
 <div className="flex items-center justify-between">
 <span className="text-xs font-black uppercase tracking-wider bg-slate-950/15 px-3 py-1 rounded-full">
 Hotel Staff Quick Inspection
 </span>
 <span className="text-xs font-extrabold bg-white/90 px-2.5 py-1 rounded-full">
 Current Score: {petParent.pawsitiveScore}/100
 </span>
 </div>
 <h1 className="text-2xl font-black mt-3">{petParent.customCardHeadline}</h1>
 <p className="text-sm font-medium mt-1 opacity-90">“{petParent.customCardMessage}”</p>
 <div className="mt-4 pt-3 border-t border-slate-950/15 text-xs font-bold flex flex-wrap justify-between gap-2">
 <span>Guest: {petParent.name}</span>
 <span>{petParent.dogsSummary}</span>
 </div>
 </div>

 {/* 20-Second Room Condition Form */}
 <form onSubmit={handleSubmitInspection} className="p-6 space-y-5">
 {/* Question 1: Any Doggy Messes? */}
 <div>
 <label className="block text-sm font-bold text-white mb-2">
 1. Were there any doggy messes left in the room? *
 </label>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 onClick={() => setHadDoggyMesses(false)}
 className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
 !hadDoggyMesses
 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
 : 'bg-slate-950 border-slate-800 text-slate-400'
 }`}
 >
 <Sparkles className="w-5 h-5 shrink-0" />
 <div>
 <div className="text-sm">No Messes!</div>
 <div className="text-[11px] opacity-80">Clean & well-kept</div>
 </div>
 </button>

 <button
 type="button"
 onClick={() => setHadDoggyMesses(true)}
 className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
 hadDoggyMesses
 ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
 : 'bg-slate-950 border-slate-800 text-slate-400'
 }`}
 >
 <AlertTriangle className="w-5 h-5 shrink-0" />
 <div>
 <div className="text-sm">Yes, Mess Found</div>
 <div className="text-[11px] opacity-80">Required extra cleanup</div>
 </div>
 </button>
 </div>
 </div>

 {/* Question 2: Overall Room Condition (1-5 Paws) */}
 <div>
 <label className="block text-sm font-bold text-white mb-2">
 2. How did the pet parent leave the overall condition of the room?
 </label>
 <div className="grid grid-cols-5 gap-2">
 {[1, 2, 3, 4, 5].map((rating) => (
 <button
 key={rating}
 type="button"
 onClick={() => setRoomConditionRating(rating)}
 className={`py-3 rounded-xl font-black text-sm border transition flex flex-col items-center gap-1 ${
 roomConditionRating >= rating
 ? 'bg-amber-500 text-slate-950 border-amber-400'
 : 'bg-slate-950 text-slate-500 border-slate-800'
 }`}
 >
 <Dog className="w-4 h-4" />
 {rating}
 </button>
 ))}
 </div>
 </div>

 {/* Question 3: Crates / Furniture Respect */}
 <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
 <div>
 <div className="text-sm font-bold text-white">
 Furniture, Towels & Carpets Respected?
 </div>
 <div className="text-xs text-slate-400">
 Crates/mats used or room left free of damage
 </div>
 </div>
 <input
 type="checkbox"
 checked={cratesOrMatsUsed}
 onChange={(e) => setCratesOrMatsUsed(e.target.checked)}
 className="w-5 h-5 accent-amber-500 rounded"
 />
 </div>

 {/* Hotel & Room Verification Details */}
 <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
 <div className="col-span-2">
 <label className="text-xs font-semibold text-slate-400">Hotel Name *</label>
 <input
 required
 type="text"
 placeholder="e.g., Days Inn / Red Roof Inn / La Quinta"
 value={hotelName}
 onChange={(e) => setHotelName(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1"
 />
 </div>

 <div>
 <label className="text-xs font-semibold text-slate-400">City & State *</label>
 <input
 required
 type="text"
 placeholder="e.g., Canfield, OH"
 value={cityState}
 onChange={(e) => setCityState(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1"
 />
 </div>

 <div>
 <label className="text-xs font-semibold text-slate-400">Room Number *</label>
 <input
 required
 type="text"
 placeholder="e.g., 114"
 value={roomNumber}
 onChange={(e) => setRoomNumber(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1"
 />
 </div>

 <div>
 <label className="text-xs font-semibold text-slate-400">Your Name or Initials *</label>
 <input
 required
 type="text"
 placeholder="e.g., J.D."
 value={staffNameOrInitials}
 onChange={(e) => setStaffNameOrInitials(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1"
 />
 </div>

 <div>
 <label className="text-xs font-semibold text-slate-400">Staff Role</label>
 <select
 value={staffRole}
 onChange={(e) => setStaffRole(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white mt-1"
 >
 <option value="Housekeeping / Room Attendant">Housekeeping</option>
 <option value="Front Desk / Checkout">Front Desk</option>
 <option value="Hotel Manager">Manager</option>
 </select>
 </div>
 </div>

 <div>
 <label className="text-xs font-semibold text-slate-400">
 Optional Note for this Pet Parent
 </label>
 <textarea
 rows={2}
 placeholder="e.g., Thank you for leaving the room so clean! Welcome back anytime."
 value={staffComments}
 onChange={(e) => setStaffComments(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1"
 />
 </div>

 <button
 type="submit"
 disabled={submitting}
 className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl text-sm shadow-lg transition flex items-center justify-center gap-2"
 >
 <ShieldCheck className="w-5 h-5" />
 {submitting ? 'Submitting Room Report...' : 'Submit Verified Room Rating'}
 </button>
 </form>
 </div>
 </div>
 );
}
