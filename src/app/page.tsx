'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
 Dog,
 QrCode,
 Printer,
 Smartphone,
 ShieldCheck,
 Award,
 Building2,
 DollarSign,
 MapPin,
 Sparkles,
 CheckCircle2,
 PlusCircle,
 Search,
 ExternalLink,
 Edit3,
} from 'lucide-react';

interface Verification {
 id: string;
 hotelName: string;
 hotelChain?: string;
 cityState: string;
 roomNumber: string;
 staffNameOrInitials: string;
 staffRole: string;
 hadDoggyMesses: boolean;
 roomConditionRating: number;
 noiseAndRespect: number;
 cratesOrMatsUsed: boolean;
 wouldWelcomeBack: boolean;
 staffComments?: string;
 verifiedAt: string;
}

interface PetParentProfile {
 id: string;
 name: string;
 handle: string;
 qrToken: string;
 akcClubOrKennel: string;
 dogsSummary: string;
 customCardHeadline: string;
 customCardMessage: string;
 pawsitiveScore: number;
 tierBadge: string;
 verifiedStaysCount: number;
 cleanRoomStreak: number;
 verifications: Verification[];
}

interface HotelReview {
 id: string;
 hotelName: string;
 hotelChain: string;
 city: string;
 state: string;
 nearestShowSite?: string;
 depositAmount: number;
 depositType: 'REFUNDABLE' | 'NON_REFUNDABLE' | 'PER_NIGHT' | 'WAIVED_NONE';
 maxDogsAllowed: number;
 weightLimitLbs?: number | null;
 acceptsShowSetup: boolean;
 overallRating: number;
 pottyAreaRating: number;
 reviewBody: string;
 helpfulCount: number;
 createdAt: string;
 author: {
 name: string;
 handle: string;
 pawsitiveScore: number;
 tierBadge: string;
 };
}

export default function PawsitiveStaysApp() {
 const [activeTab, setActiveTab] = useState<'profile-qr' | 'community-hotels'>('profile-qr');
 const [profile, setProfile] = useState<PetParentProfile | null>(null);
 const [loading, setLoading] = useState(true);
 const [inPersonPhoneMode, setInPersonPhoneMode] = useState(false);
 const [savingCard, setSavingCard] = useState(false);

 // Editable Card & Profile States
 const [editName, setEditName] = useState('');
 const [editKennel, setEditKennel] = useState('');
 const [editDogs, setEditDogs] = useState('');
 const [editHeadline, setEditHeadline] = useState('');
 const [editMessage, setEditMessage] = useState('');

 // Tab 2: Community Hotel States
 const [hotelReviews, setHotelReviews] = useState<HotelReview[]>([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [depositFilter, setDepositFilter] = useState('ALL');
 const [showNewReviewModal, setShowNewReviewModal] = useState(false);

 // New Hotel Review Form State
 const [newHotel, setNewHotel] = useState({
 hotelName: '',
 hotelChain: '',
 city: '',
 state: 'OH',
 nearestShowSite: '',
 depositAmount: '50',
 depositType: 'REFUNDABLE',
 maxDogsAllowed: '2',
 weightLimitLbs: '',
 acceptsShowSetup: true,
 overallRating: '5',
 pottyAreaRating: '5',
 reviewBody: '',
 });

 const origin =
 typeof window !== 'undefined' ? window.location.origin : 'https://pawsitive-stays.vercel.app';

 useEffect(() => {
 async function initData() {
 try {
 const [profRes, hotRes] = await Promise.all([
 fetch('/api/profile?handle=sir-ripley'),
 fetch('/api/hotels'),
 ]);
 const profData = await profRes.json();
 const hotData = await hotRes.json();

 if (profData.profile) {
 const p = profData.profile;
 setProfile(p);
 setEditName(p.name);
 setEditKennel(p.akcClubOrKennel || '');
 setEditDogs(p.dogsSummary || '');
 setEditHeadline(p.customCardHeadline || 'Thank You for Having Us!');
 setEditMessage(
 p.customCardMessage ||
 'Thank you for Having Us! Please scan the QR code and tell us how we did as pet parents.'
 );
 }
 if (hotData.reviews) {
 setHotelReviews(hotData.reviews);
 }
 } catch (err) {
 console.error('Initialization error:', err);
 } finally {
 setLoading(false);
 }
 }
 initData();
 }, []);

 async function handleSaveCardCustomization(e: React.FormEvent) {
 e.preventDefault();
 if (!profile) return;
 setSavingCard(true);
 try {
 const res = await fetch('/api/profile', {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 id: profile.id,
 name: editName,
 akcClubOrKennel: editKennel,
 dogsSummary: editDogs,
 customCardHeadline: editHeadline,
 customCardMessage: editMessage,
 }),
 });
 const data = await res.json();
 if (data.profile) setProfile(data.profile);
 } finally {
 setSavingCard(false);
 }
 }

 async function handleCreateHotelReview(e: React.FormEvent) {
 e.preventDefault();
 if (!profile) return;
 const res = await fetch('/api/hotels', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 authorId: profile.id,
 ...newHotel,
 }),
 });
 const data = await res.json();
 if (data.review) {
 setHotelReviews([data.review, ...hotelReviews]);
 setShowNewReviewModal(false);
 setNewHotel({
 hotelName: '',
 hotelChain: '',
 city: '',
 state: 'OH',
 nearestShowSite: '',
 depositAmount: '50',
 depositType: 'REFUNDABLE',
 maxDogsAllowed: '2',
 weightLimitLbs: '',
 acceptsShowSetup: true,
 overallRating: '5',
 pottyAreaRating: '5',
 reviewBody: '',
 });
 }
 }

 const filteredHotels = hotelReviews.filter((h) => {
 const q = searchQuery.toLowerCase();
 const matchText =
 !q ||
 h.hotelName.toLowerCase().includes(q) ||
 h.city.toLowerCase().includes(q) ||
 h.state.toLowerCase().includes(q) ||
 (h.nearestShowSite && h.nearestShowSite.toLowerCase().includes(q));
 const matchType = depositFilter === 'ALL' || h.depositType === depositFilter;
 return matchText && matchType;
 });

 if (loading || !profile) {
 return (
 <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
 <div className="animate-pulse flex items-center gap-3 text-amber-400 font-semibold text-lg">
 <Dog className="w-7 h-7 animate-bounce" />
 Loading Pawsitive Stays Reputation Engine...
 </div>
 </div>
 );
 }

 const scanUrl = `${origin}/verify/${profile.qrToken}`;

 return (
 <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
 {/* Top Navigation Header (Hidden when printing) */}
 <header className="no-print border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
 <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
 <Dog className="w-7 h-7 stroke-[2.2]" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h1 className="text-xl font-bold tracking-tight text-white">Pawsitive Stays</h1>
 <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
 AKC & Pet Parent Network
 </span>
 </div>
 <p className="text-xs text-slate-400">
 Verified Room Leave-Behind QR System & Hotel Deposit Intelligence
 </p>
 </div>
 </div>

 {/* Primary 2-Tab Switcher */}
 <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
 <button
 onClick={() => setActiveTab('profile-qr')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
 activeTab === 'profile-qr'
 ? 'bg-amber-500 text-slate-950 shadow'
 : 'text-slate-400 hover:text-white'
 }`}
 >
 <QrCode className="w-4 h-4" />
 My Profile & Leave-Behind QR
 </button>
 <button
 onClick={() => setActiveTab('community-hotels')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
 activeTab === 'community-hotels'
 ? 'bg-amber-500 text-slate-950 shadow'
 : 'text-slate-400 hover:text-white'
 }`}
 >
 <Building2 className="w-4 h-4" />
 Hotel Deposit Community ({hotelReviews.length})
 </button>
 </div>
 </div>
 </header>

 {/* Main Content Container */}
 <main className="max-w-6xl mx-auto px-4 pt-8">
 {activeTab === 'profile-qr' ? (
 <div className="space-y-8">
 {/* Reputation Banner (Hidden on Print) */}
 <section className="no-print grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/60 border border-amber-500/30 rounded-2xl p-6 flex items-center justify-between">
 <div>
 <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full mb-2">
 <Award className="w-3.5 h-3.5" /> {profile.tierBadge}
 </span>
 <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
 <p className="text-sm text-slate-400 mt-0.5">{profile.akcClubOrKennel}</p>
 <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5 font-medium">
 <ShieldCheck className="w-4 h-4" /> Eligible for Partner Hotel Pet Deposit Waivers
 </p>
 </div>
 <div className="text-center bg-slate-950 border border-slate-800 px-5 py-4 rounded-2xl">
 <div className="text-4xl font-black text-amber-400">{profile.pawsitiveScore}</div>
 <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-1">
 Pawsitive Score
 </div>
 </div>
 </div>

 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
 <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
 Zero Doggy Mess Streak
 </div>
 <div className="text-3xl font-extrabold text-emerald-400 my-2">
 {profile.cleanRoomStreak} Stays
 </div>
 <div className="text-xs text-slate-400">
 100% verified by hotel housekeeping & checkout staff
 </div>
 </div>

 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
 <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
 Test Scan Portal
 </div>
 <p className="text-xs text-slate-300 my-2">
 Preview what the hotel staff member sees when scanning your QR code:
 </p>
 <a
 href={`/verify/${profile.qrToken}`}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 py-2.5 px-3 rounded-xl border border-slate-700 transition"
 >
 Open Staff Scan Window <ExternalLink className="w-3.5 h-3.5" />
 </a>
 </div>
 </section>

 {/* Printable & Phone-Display Leave-Behind Card + Customizer */}
 <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Left Column: Customizer Form (Hidden on Print) */}
 <div className="no-print lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
 <div className="flex items-center gap-2 mb-4">
 <Edit3 className="w-5 h-5 text-amber-400" />
 <h3 className="text-lg font-bold text-white">
 Customize Your Leave-Behind Card
 </h3>
 </div>
 <form onSubmit={handleSaveCardCustomization} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
 Pet Parent / Handler Name
 </label>
 <input
 type="text"
 value={editName}
 onChange={(e) => setEditName(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
 Kennel / AKC Affiliation
 </label>
 <input
 type="text"
 value={editKennel}
 onChange={(e) => setEditKennel(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
 Dogs Staying With Us
 </label>
 <input
 type="text"
 value={editDogs}
 onChange={(e) => setEditDogs(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
 Card Headline
 </label>
 <input
 type="text"
 value={editHeadline}
 onChange={(e) => setEditHeadline(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
 Note to Hotel Housekeeping / Staff
 </label>
 <textarea
 rows={3}
 value={editMessage}
 onChange={(e) => setEditMessage(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 </div>

 <div className="pt-2 flex flex-wrap gap-3">
 <button
 type="submit"
 disabled={savingCard}
 className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-sm transition"
 >
 {savingCard ? 'Saving...' : 'Save Changes'}
 </button>
 <button
 type="button"
 onClick={() => window.print()}
 className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm border border-slate-700 transition"
 >
 <Printer className="w-4 h-4 text-amber-400" />
 Print Leave-Behind
 </button>
 <button
 type="button"
 onClick={() => setInPersonPhoneMode(!inPersonPhoneMode)}
 className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold py-2.5 px-4 rounded-xl text-sm transition"
 >
 <Smartphone className="w-4 h-4" />
 {inPersonPhoneMode
 ? 'Exit Full-Contrast Phone Scan Mode'
 : 'Show on Phone to Worker (In-Person Mode)'}
 </button>
 </div>
 </form>
 </div>

 {/* Right Column: The Printable / Show-on-Phone Leave-Behind Card */}
 <div className="lg:col-span-7">
 <div
 className={`print-only-card bg-white text-slate-900 rounded-3xl p-8 border-4 border-amber-400 shadow-2xl transition-all ${
 inPersonPhoneMode ? 'ring-8 ring-emerald-500/40 scale-[1.01]' : ''
 }`}
 >
 <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black">
 <Dog className="w-7 h-7" />
 </div>
 <div>
 <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 block">
 Pawsitive Stays • Verified Pet Guest
 </span>
 <h2 className="text-2xl font-black text-slate-900">{editHeadline}</h2>
 </div>
 </div>
 <div className="text-right">
 <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
 Score: {profile.pawsitiveScore}/100
 </span>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
 <div className="sm:col-span-7 space-y-4">
 <p className="text-base font-medium text-slate-700 leading-relaxed bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
 “{editMessage}”
 </p>

 <div className="space-y-1.5 text-sm text-slate-600">
 <div>
 <span className="font-bold text-slate-900">Pet Parent:</span> {editName}
 </div>
 <div>
 <span className="font-bold text-slate-900">Affiliation:</span>{' '}
 {editKennel}
 </div>
 <div>
 <span className="font-bold text-slate-900">Dogs in Room:</span>{' '}
 {editDogs}
 </div>
 </div>

 <div className="pt-2">
 <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
 Housekeeping & Checkout Staff:
 </div>
 <p className="text-xs text-slate-500 mt-0.5">
 Open your phone camera and point it at the QR code. Takes 15 seconds—no
 app download or login required!
 </p>
 </div>
 </div>

 <div className="sm:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-slate-300">
 <QRCodeSVG
 value={scanUrl}
 size={176}
 level="H"
 includeMargin={true}
 />
 <span className="text-[11px] font-mono font-bold text-slate-500 mt-2">
 ID: {profile.qrToken}
 </span>
 <span className="text-[10px] text-amber-700 font-semibold mt-0.5">
 Scan to Rate Room Condition
 </span>
 </div>
 </div>

 {/* Write-in Room Info Strip for Physical Printouts */}
 <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
 <div>
 <span className="font-bold text-slate-700">Room #:</span> ____________
 </div>
 <div>
 <span className="font-bold text-slate-700">Check-Out Date:</span> ____/____/2026
 </div>
 <div>
 <span className="font-bold text-slate-700">Verify URL:</span>{' '}
 <span className="font-mono">{scanUrl}</span>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Verified Hotel Staff Inspection Log (Hidden on Print) */}
 <section className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-lg font-bold text-white flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-amber-400" />
 Verified Hotel Staff Room Inspections ({profile.verifications.length})
 </h3>
 <p className="text-xs text-slate-400">
 Show this verified ledger at hotel check-in to request pet fee waivers or
 discounts.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {profile.verifications.map((v) => (
 <div
 key={v.id}
 className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
 >
 <div className="flex items-start justify-between">
 <div>
 <h4 className="font-bold text-white text-sm">
 {v.hotelName} ({v.cityState})
 </h4>
 <p className="text-xs text-slate-400">
 Room #{v.roomNumber} • Verified by {v.staffNameOrInitials} ({v.staffRole})
 </p>
 </div>
 <span
 className={`text-xs font-bold px-2.5 py-1 rounded-full ${
 !v.hadDoggyMesses
 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
 : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
 }`}
 >
 {!v.hadDoggyMesses ? 'Zero Doggy Messes' : 'Mess Reported'}
 </span>
 </div>
 <div className="flex items-center gap-4 text-xs text-amber-300 font-semibold">
 <span>Room Condition: {v.roomConditionRating}/5 Paws</span>
 <span>•</span>
 <span>Noise & Respect: {v.noiseAndRespect}/5 Paws</span>
 </div>
 {v.staffComments && (
 <p className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800">
 “{v.staffComments}”
 </p>
 )}
 </div>
 ))}
 </div>
 </section>
 </div>
 ) : (
 /* TAB 2: COMMUNITY HOTEL DEPOSIT & EXPERIENCE HUB */
 <div className="space-y-6">
 <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold text-white">
 Pet Parent & AKC Exhibitor Hotel Deposit Exchange
 </h2>
 <p className="text-sm text-slate-300 mt-1 max-w-2xl">
 Compare real pet deposit prices (refundable vs. non-refundable), crate setup access,
 and grassy potty areas near dog show fairgrounds—and see which hotels honor
 high Pawsitive Stays scores!
 </p>
 </div>
 <button
 onClick={() => setShowNewReviewModal(true)}
 className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm shadow-lg transition shrink-0"
 >
 <PlusCircle className="w-4 h-4" />
 Share Hotel Deposit & Review
 </button>
 </div>

 {/* Search & Deposit Filter Bar */}
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
 <input
 type="text"
 placeholder="Search by hotel name, city, state, or fairgrounds (e.g., Canfield, Columbus, Kalamazoo)..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 </div>
 <select
 value={depositFilter}
 onChange={(e) => setDepositFilter(e.target.value)}
 className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 >
 <option value="ALL">All Deposit Types</option>
 <option value="WAIVED_NONE">$0 / Waived Pet Fee</option>
 <option value="REFUNDABLE">Refundable Deposit</option>
 <option value="NON_REFUNDABLE">Non-Refundable Fee</option>
 <option value="PER_NIGHT">Per-Night Pet Fee</option>
 </select>
 </div>

 {/* Hotel Discussion Cards */}
 <div className="grid grid-cols-1 gap-4">
 {filteredHotels.map((hotel) => (
 <div
 key={hotel.id}
 className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition"
 >
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-300">
 {hotel.hotelChain}
 </span>
 <h3 className="text-lg font-bold text-white">{hotel.hotelName}</h3>
 </div>
 <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
 <span className="flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5 text-amber-400" />
 {hotel.city}, {hotel.state}
 </span>
 {hotel.nearestShowSite && (
 <span className="text-emerald-400 font-medium">
 Show Site: {hotel.nearestShowSite}
 </span>
 )}
 </div>
 </div>

 {/* Deposit Price Badge */}
 <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl">
 <DollarSign className="w-5 h-5 text-amber-400" />
 <div>
 <div className="text-lg font-black text-white">
 ${hotel.depositAmount.toFixed(2)}{' '}
 <span className="text-xs font-normal text-slate-400">
 ({hotel.depositType.replace('_', ' ')})
 </span>
 </div>
 <div className="text-[11px] text-slate-400">
 Max {hotel.maxDogsAllowed} dogs •{' '}
 {hotel.weightLimitLbs ? `${hotel.weightLimitLbs} lb limit` : 'No weight limit'}
 </div>
 </div>
 </div>
 </div>

 <p className="text-sm text-slate-200 my-4 leading-relaxed">{hotel.reviewBody}</p>

 <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2">
 <div className="flex flex-wrap items-center gap-4">
 <span className="text-amber-400 font-semibold">
 Overall Stay: {hotel.overallRating}/5 Paws
 </span>
 <span className="text-emerald-400 font-semibold">
 Grassy Potty Area: {hotel.pottyAreaRating}/5 Paws
 </span>
 {hotel.acceptsShowSetup && (
 <span className="inline-flex items-center gap-1 text-sky-400 font-medium">
 <CheckCircle2 className="w-3.5 h-3.5" /> Easy Crate / Ex-Pen Unloading
 </span>
 )}
 </div>
 <div>
 Posted by <span className="text-white font-semibold">{hotel.author.name}</span>{' '}
 (Score: {hotel.author.pawsitiveScore})
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Modal for Adding a Hotel Deposit Report */}
 {showNewReviewModal && (
 <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
 <h3 className="text-xl font-bold text-white mb-4">
 Share Hotel Pet Deposit & Stay Intel
 </h3>
 <form onSubmit={handleCreateHotelReview} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-xs text-slate-400 font-semibold">Hotel Name *</label>
 <input
 required
 type="text"
 placeholder="e.g., Red Roof Inn"
 value={newHotel.hotelName}
 onChange={(e) => setNewHotel({ ...newHotel, hotelName: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">Hotel Chain</label>
 <input
 type="text"
 placeholder="e.g., Wyndham / Hilton / Red Roof"
 value={newHotel.hotelChain}
 onChange={(e) => setNewHotel({ ...newHotel, hotelChain: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="text-xs text-slate-400 font-semibold">City *</label>
 <input
 required
 type="text"
 placeholder="Canfield"
 value={newHotel.city}
 onChange={(e) => setNewHotel({ ...newHotel, city: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">State *</label>
 <input
 required
 type="text"
 maxLength={2}
 value={newHotel.state}
 onChange={(e) => setNewHotel({ ...newHotel, state: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">
 Nearest Show Site
 </label>
 <input
 type="text"
 placeholder="Canfield Fairgrounds"
 value={newHotel.nearestShowSite}
 onChange={(e) =>
 setNewHotel({ ...newHotel, nearestShowSite: e.target.value })
 }
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="text-xs text-slate-400 font-semibold">
 Deposit Price ($) *
 </label>
 <input
 required
 type="number"
 step="0.01"
 value={newHotel.depositAmount}
 onChange={(e) =>
 setNewHotel({ ...newHotel, depositAmount: e.target.value })
 }
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">Deposit Type</label>
 <select
 value={newHotel.depositType}
 onChange={(e) =>
 setNewHotel({ ...newHotel, depositType: e.target.value })
 }
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 >
 <option value="REFUNDABLE">Refundable Deposit</option>
 <option value="NON_REFUNDABLE">Non-Refundable Fee</option>
 <option value="PER_NIGHT">Per-Night Charge</option>
 <option value="WAIVED_NONE">$0 / Waived</option>
 </select>
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">
 Max Dogs Allowed
 </label>
 <input
 type="number"
 value={newHotel.maxDogsAllowed}
 onChange={(e) =>
 setNewHotel({ ...newHotel, maxDogsAllowed: e.target.value })
 }
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 </div>

 <div>
 <label className="text-xs text-slate-400 font-semibold">
 Experience Notes (Potty areas, deposit refund speed, crate space) *
 </label>
 <textarea
 required
 rows={3}
 value={newHotel.reviewBody}
 onChange={(e) => setNewHotel({ ...newHotel, reviewBody: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>

 <div className="flex justify-end gap-3 pt-2">
 <button
 type="button"
 onClick={() => setShowNewReviewModal(false)}
 className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold"
 >
 Post Hotel Intel
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 )}
 </main>
 </div>
 );
}
