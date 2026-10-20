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
 MessagesSquare,
 LogOut,
 MessageCircle,
 ArrowLeft,
 Send,
 X,
 Facebook,
 Users,
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
 leftRoomTidy?: boolean;
 hadPuddles?: boolean;
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

interface ForumAuthor {
 name: string;
 handle: string;
 pawsitiveScore: number;
 tierBadge: string;
}

interface ForumPostItem {
 id: string;
 body: string;
 createdAt: string;
 author: ForumAuthor;
}

interface FriendSuggestion {
 name: string;
 handle: string;
 dogsSummary: string;
 pawsitiveScore: number;
 tierBadge: string;
 verifiedStaysCount: number;
}

interface ForumThreadItem {
 id: string;
 title: string;
 category: string;
 body: string;
 createdAt: string;
 author: ForumAuthor;
 _count?: { posts: number };
 posts?: { createdAt: string }[] | ForumPostItem[];
}

export default function PawsitiveStaysApp() {
 const [activeTab, setActiveTab] = useState<'profile-qr' | 'community-hotels' | 'forum'>('profile-qr');
 const [user, setUser] = useState<PetParentProfile | null>(null);
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

 // Auth (login / signup) States
 const [showAuth, setShowAuth] = useState(false);
 const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
 const [authError, setAuthError] = useState('');
 const [authBusy, setAuthBusy] = useState(false);
 const [authForm, setAuthForm] = useState({
 name: '',
 email: '',
 password: '',
 dogNames: '',
 dogBreed: '',
 akcClubOrKennel: '',
 homeCityState: '',
 });

 // Friends (Facebook-connected members you may know)
 const [friends, setFriends] = useState<FriendSuggestion[]>([]);
 const [facebookConnected, setFacebookConnected] = useState(false);
 const [forgotSent, setForgotSent] = useState(false);

 // Forum States
 const [forumThreads, setForumThreads] = useState<ForumThreadItem[]>([]);
 const [openThread, setOpenThread] = useState<(ForumThreadItem & { posts: ForumPostItem[] }) | null>(null);
 const [forumLoading, setForumLoading] = useState(false);
 const [newThread, setNewThread] = useState({ title: '', category: 'Hotel Talk', body: '' });
 const [replyBody, setReplyBody] = useState('');

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

 function applyProfile(p: PetParentProfile) {
 setUser(p);
 setProfile(p);
 loadFriends();
 setEditName(p.name);
 setEditKennel(p.akcClubOrKennel || '');
 setEditDogs(p.dogsSummary || '');
 setEditHeadline(p.customCardHeadline || 'Thank You for Having Us!');
 setEditMessage(
 p.customCardMessage ||
 'Thank you for Having Us! Please scan the QR code and tell us how we did as pet parents.'
 );
 }

 useEffect(() => {
 async function initData() {
 try {
 const [meRes, hotRes, forumRes] = await Promise.all([
 fetch('/api/auth/me'),
 fetch('/api/hotels'),
 fetch('/api/forum'),
 ]);
 if (meRes.ok) {
 const meData = await meRes.json();
 if (meData.profile) applyProfile(meData.profile);
 }
 const hotData = await hotRes.json();
 if (hotData.reviews) {
 setHotelReviews(hotData.reviews);
 }
 const forumData = await forumRes.json();
 if (forumData.threads) {
 setForumThreads(forumData.threads);
 }
 } catch (err) {
 console.error('Initialization error:', err);
 } finally {
 setLoading(false);
 }
 const urlParams = new URLSearchParams(window.location.search);
 if (urlParams.get('authError')) {
 setAuthMode('login');
 setAuthError("Facebook sign-in didn't complete — try again, or use your email below.");
 setShowAuth(true);
 }
 }
 initData();
 }, []);

 async function handleAuthSubmit(e: React.FormEvent) {
 e.preventDefault();
 setAuthBusy(true);
 setAuthError('');
 try {
 const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
 const payload =
 authMode === 'signup'
 ? authForm
 : { email: authForm.email, password: authForm.password };
 const res = await fetch(endpoint, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });
 const data = await res.json();
 if (!res.ok) {
 setAuthError(data.error || 'Something went wrong. Please try again.');
 return;
 }
 if (data.profile) {
 applyProfile(data.profile);
 setShowAuth(false);
 setActiveTab('profile-qr');
 }
 } catch {
 setAuthError('Network error. Please try again.');
 } finally {
 setAuthBusy(false);
 }
 }

 async function loadFriends() {
 try {
 const res = await fetch('/api/friends');
 if (!res.ok) return;
 const data = await res.json();
 if (data.friends) setFriends(data.friends);
 setFacebookConnected(Boolean(data.facebookConnected));
 } catch {
 /* friends are a bonus — never block the app */
 }
 }

 async function handleForgotPassword() {
 if (!authForm.email) {
 setAuthError('Enter your email above first, then tap Forgot Password.');
 return;
 }
 const res = await fetch('/api/auth/forgot', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: authForm.email }),
 });
 if (res.ok) setForgotSent(true);
 }

 async function handleLogout() {
 await fetch('/api/auth/logout', { method: 'POST' });
 setUser(null);
 setProfile(null);
 setFriends([]);
 setFacebookConnected(false);
 setActiveTab('community-hotels');
 }

 async function refreshThreads() {
 const res = await fetch('/api/forum');
 const data = await res.json();
 if (data.threads) setForumThreads(data.threads);
 }

 async function handleOpenThread(threadId: string) {
 setForumLoading(true);
 try {
 const res = await fetch(`/api/forum/${threadId}`);
 const data = await res.json();
 if (data.thread) setOpenThread(data.thread);
 } finally {
 setForumLoading(false);
 }
 }

 async function handleCreateThread(e: React.FormEvent) {
 e.preventDefault();
 if (!user) return;
 const res = await fetch('/api/forum', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(newThread),
 });
 const data = await res.json();
 if (data.thread) {
 setNewThread({ title: '', category: 'Hotel Talk', body: '' });
 await refreshThreads();
 handleOpenThread(data.thread.id);
 }
 }

 async function handleReply(e: React.FormEvent) {
 e.preventDefault();
 if (!user || !openThread || !replyBody.trim()) return;
 const res = await fetch(`/api/forum/${openThread.id}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ body: replyBody }),
 });
 const data = await res.json();
 if (data.post) {
 setOpenThread({ ...openThread, posts: [...openThread.posts, data.post] });
 setReplyBody('');
 refreshThreads();
 }
 }

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
 if (data.profile) {
 setProfile(data.profile);
 setUser(data.profile);
 }
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

 if (loading) {
 return (
 <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
 <div className="animate-pulse flex items-center gap-3 text-amber-400 font-semibold text-lg">
 <Dog className="w-7 h-7 animate-bounce" />
 Loading Pawsitive Stays Reputation Engine...
 </div>
 </div>
 );
 }

 const scanUrl = profile ? `${origin}/verify/${profile.qrToken}` : '';

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

 {/* Primary Tab Switcher + Account */}
 <div className="flex flex-wrap items-center gap-3">
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
 My Profile & QR
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
 Hotels ({hotelReviews.length})
 </button>
 <button
 onClick={() => { setActiveTab('forum'); setOpenThread(null); }}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
 activeTab === 'forum'
 ? 'bg-amber-500 text-slate-950 shadow'
 : 'text-slate-400 hover:text-white'
 }`}
 >
 <MessagesSquare className="w-4 h-4" />
 Forum
 </button>
 </div>

 {user ? (
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-slate-300 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
 🐾 {user.name} · {user.pawsitiveScore}/100
 </span>
 <button
 onClick={handleLogout}
 className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition"
 >
 <LogOut className="w-3.5 h-3.5" /> Sign Out
 </button>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <button
 onClick={() => { setAuthMode('login'); setAuthError(''); setShowAuth(true); }}
 className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-slate-700 transition"
 >
 Sign In
 </button>
 <button
 onClick={() => { setAuthMode('signup'); setAuthError(''); setShowAuth(true); }}
 className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl transition"
 >
 Join Free
 </button>
 </div>
 )}
 </div>
 </div>
 </header>

 {/* Main Content Container */}
 <main className="max-w-6xl mx-auto px-4 pt-8">
 {activeTab === 'profile-qr' ? (
 user && profile ? (
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
 <span>Pet Parent Rating: {v.roomConditionRating}/5 Paws</span>
 <span>•</span>
 <span>Room tidy: {v.leftRoomTidy === false ? 'No' : 'Yes'}</span>
 <span>•</span>
 <span>Puddles: {v.hadPuddles ? 'Yes' : 'None'}</span>
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
 /* GUEST WELCOME (profile tab when signed out) */
 <div className="space-y-6">
 <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
 <Dog className="w-9 h-9 stroke-[2.2]" />
 </div>
 <h2 className="text-3xl font-black text-white mt-4">
 Your pet&apos;s good name — verified by hotel staff
 </h2>
 <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
 Create your free pet parent profile, print your QR leave-behind card, and let
 housekeeping verify how tidy you left the room. Great stays build your Pawsitive
 Score — and help you earn lower pet deposits on the road.
 </p>
 <div className="flex flex-wrap justify-center gap-3 mt-6">
 <button
 onClick={() => { setAuthMode('signup'); setAuthError(''); setShowAuth(true); }}
 className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition"
 >
 Create My Free Profile
 </button>
 <button
 onClick={() => { setAuthMode('login'); setAuthError(''); setShowAuth(true); }}
 className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm border border-slate-700 transition"
 >
 Sign In
 </button>
 </div>
 <p className="text-xs text-slate-500 mt-4">
 You stay signed in on this device — and you can always sign back in with your email & password.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
 <QrCode className="w-6 h-6 text-amber-400 mb-2" />
 <h3 className="font-bold text-white text-sm">QR Leave-Behind Card</h3>
 <p className="text-xs text-slate-400 mt-1 leading-relaxed">
 Print it or show it on your phone. Staff scan it after checkout — no login needed for them — and answer 4 quick questions.
 </p>
 </div>
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
 <Award className="w-6 h-6 text-amber-400 mb-2" />
 <h3 className="font-bold text-white text-sm">Score & Tier Badges</h3>
 <p className="text-xs text-slate-400 mt-1 leading-relaxed">
 Verified stays build your score from Bronze Paw up to AKC Diamond Exhibitor, with a clean-room streak hotels can trust.
 </p>
 </div>
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
 <MessagesSquare className="w-6 h-6 text-amber-400 mb-2" />
 <h3 className="font-bold text-white text-sm">Hotel Intel & Community Forum</h3>
 <p className="text-xs text-slate-400 mt-1 leading-relaxed">
 Real pet fees and deposit policies from fellow exhibitors — browse the Hotels and Forum tabs right now, no account needed.
 </p>
 </div>
 </div>
 </div>
 )
 ) : activeTab === 'forum' ? (
 /* FORUM TAB */
 <div className="space-y-6">
 {openThread ? (
 <div className="space-y-4">
 <button
 onClick={() => setOpenThread(null)}
 className="inline-flex items-center gap-2 text-sm font-bold text-amber-300 hover:text-amber-200"
 >
 <ArrowLeft className="w-4 h-4" /> Back to all discussions
 </button>
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
 <div className="flex flex-wrap items-center gap-2 mb-2">
 <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
 {openThread.category}
 </span>
 <span className="text-xs text-slate-500">
 {new Date(openThread.createdAt).toLocaleDateString()}
 </span>
 </div>
 <h2 className="text-2xl font-black text-white">{openThread.title}</h2>
 <p className="text-xs text-slate-400 mt-1">
 Started by <span className="text-white font-semibold">{openThread.author.name}</span>{' '}
 (@{openThread.author.handle}) · {openThread.author.tierBadge} · Score {openThread.author.pawsitiveScore}
 </p>
 <p className="text-sm text-slate-200 leading-relaxed mt-4 whitespace-pre-wrap">{openThread.body}</p>
 </div>

 <div className="space-y-3">
 {openThread.posts.map((post) => (
 <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 ml-0 sm:ml-8">
 <p className="text-xs text-slate-400">
 <span className="text-white font-semibold">{post.author.name}</span>{' '}
 (@{post.author.handle}) · {new Date(post.createdAt).toLocaleDateString()}
 </p>
 <p className="text-sm text-slate-200 leading-relaxed mt-1.5 whitespace-pre-wrap">{post.body}</p>
 </div>
 ))}
 {openThread.posts.length === 0 && (
 <p className="text-sm text-slate-500 ml-0 sm:ml-8">No replies yet — be the first to chime in!</p>
 )}
 </div>

 {user ? (
 <form onSubmit={handleReply} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:ml-8">
 <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
 Reply as {user.name}
 </label>
 <textarea
 rows={3}
 required
 value={replyBody}
 onChange={(e) => setReplyBody(e.target.value)}
 placeholder="Share your experience, hotel tip, or show story..."
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-2 focus:border-amber-400 focus:outline-none"
 />
 <button
 type="submit"
 className="mt-3 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
 >
 <Send className="w-4 h-4" /> Post Reply
 </button>
 </form>
 ) : (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:ml-8 text-sm text-slate-300">
 <button
 onClick={() => { setAuthMode('signup'); setAuthError(''); setShowAuth(true); }}
 className="text-amber-300 font-bold hover:text-amber-200"
 >
 Join free
 </button>{' '}
 or{' '}
 <button
 onClick={() => { setAuthMode('login'); setAuthError(''); setShowAuth(true); }}
 className="text-amber-300 font-bold hover:text-amber-200"
 >
 sign in
 </button>{' '}
 to join the discussion.
 </div>
 )}
 </div>
 ) : (
 <>
 <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6">
 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
 <MessagesSquare className="w-6 h-6 text-amber-400" /> Community Forum
 </h2>
 <p className="text-sm text-slate-300 mt-1 max-w-2xl">
 Pet parents and AKC exhibitors swapping hotel intel, deposit wins, and road stories. Pull up a chair!
 </p>
 </div>

 {user ? (
 <form onSubmit={handleCreateThread} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
 <h3 className="font-bold text-white text-sm">Start a new discussion</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <input
 required
 type="text"
 maxLength={140}
 placeholder="Discussion title..."
 value={newThread.title}
 onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
 className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 <select
 value={newThread.category}
 onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
 className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 >
 <option>Hotel Talk</option>
 <option>Show Circuit</option>
 <option>Tips & Tricks</option>
 <option>Introductions</option>
 </select>
 </div>
 <textarea
 rows={3}
 required
 placeholder="What's on your mind? A hotel that treated you right, a deposit tip, a show weekend story..."
 value={newThread.body}
 onChange={(e) => setNewThread({ ...newThread, body: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
 />
 <button
 type="submit"
 className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
 >
 <MessageCircle className="w-4 h-4" /> Post Discussion
 </button>
 </form>
 ) : (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300">
 <button
 onClick={() => { setAuthMode('signup'); setAuthError(''); setShowAuth(true); }}
 className="text-amber-300 font-bold hover:text-amber-200"
 >
 Join free
 </button>{' '}
 to start a discussion — browsing is open to everyone.
 </div>
 )}

 {user && (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
 <h3 className="font-bold text-white text-sm flex items-center gap-2">
 <Users className="w-4 h-4 text-amber-400" /> Pet Parents You May Know
 </h3>
 {friends.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
 {friends.map((f) => (
 <div key={f.handle} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
 <div>
 <div className="text-sm font-bold text-white">{f.name}</div>
 <div className="text-xs text-slate-400">
 @{f.handle} · {f.dogsSummary || 'Dog parent'}
 </div>
 <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
 {f.tierBadge} · {f.verifiedStaysCount} verified stays
 </div>
 </div>
 <span className="text-lg font-black text-amber-400">{f.pawsitiveScore}</span>
 </div>
 ))}
 </div>
 ) : facebookConnected ? (
 <p className="text-xs text-slate-400 mt-2">
 None of your Facebook friends are on Pawsitive Stays yet — invite them to join and they&apos;ll show up here!
 </p>
 ) : (
 <p className="text-xs text-slate-400 mt-2">
 <a href="/api/auth/facebook" className="text-[#4d9fff] font-bold hover:underline">
 Connect Facebook
 </a>{' '}
 to instantly find friends who are already members here.
 </p>
 )}
 </div>
 )}

 <div className="space-y-3">
 {forumLoading && <p className="text-sm text-slate-500">Loading discussion...</p>}
 {forumThreads.map((thread) => (
 <button
 key={thread.id}
 onClick={() => handleOpenThread(thread.id)}
 className="w-full text-left bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition"
 >
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
 {thread.category}
 </span>
 <span className="text-xs text-slate-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
 </div>
 <h3 className="text-base font-bold text-white mt-1.5">{thread.title}</h3>
 <p className="text-xs text-slate-400 mt-1 line-clamp-2">{thread.body}</p>
 <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
 <span>
 by <span className="text-slate-300 font-semibold">{thread.author.name}</span> (@{thread.author.handle})
 </span>
 <span className="inline-flex items-center gap-1">
 <MessageCircle className="w-3.5 h-3.5" /> {thread._count?.posts ?? 0} replies
 </span>
 </div>
 </button>
 ))}
 {forumThreads.length === 0 && (
 <p className="text-sm text-slate-500">No discussions yet — start the first one!</p>
 )}
 </div>
 </>
 )}
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
 onClick={() => {
 if (user) {
 setShowNewReviewModal(true);
 } else {
 setAuthMode('signup');
 setAuthError('');
 setShowAuth(true);
 }
 }}
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

 {/* Auth Modal (Login / Signup with pet-parent intake) */}
 {showAuth && (
 <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto relative">
 <button
 onClick={() => setShowAuth(false)}
 className="absolute top-4 right-4 text-slate-400 hover:text-white"
 aria-label="Close"
 >
 <X className="w-5 h-5" />
 </button>
 <div className="flex items-center gap-2 mb-1">
 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950">
 <Dog className="w-5 h-5" />
 </div>
 <h3 className="text-xl font-bold text-white">
 {authMode === 'signup' ? 'Join Pawsitive Stays' : 'Welcome Back'}
 </h3>
 </div>
 <p className="text-xs text-slate-400 mb-4">
 {authMode === 'signup'
 ? 'A few quick questions and we auto-build your profile, QR card, and forum identity.'
 : 'Sign in with your email and password — you stay signed in on this device.'}
 </p>

 <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
 <button
 onClick={() => { setAuthMode('login'); setAuthError(''); }}
 className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
 >
 Sign In
 </button>
 <button
 onClick={() => { setAuthMode('signup'); setAuthError(''); }}
 className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode === 'signup' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
 >
 Join Free
 </button>
 </div>

 <a
 href="/api/auth/facebook"
 className="flex items-center justify-center gap-2 w-full bg-[#1877F2] hover:bg-[#1667d6] text-white font-bold py-2.5 rounded-xl text-sm transition mb-3"
 >
 <Facebook className="w-4 h-4" />
 Continue with Facebook
 </a>
 <div className="flex items-center gap-3 mb-4">
 <div className="flex-1 h-px bg-slate-800" />
 <span className="text-[11px] text-slate-500 font-semibold">or with email</span>
 <div className="flex-1 h-px bg-slate-800" />
 </div>

 {authError && (
 <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 mb-3">
 {authError}
 </div>
 )}

 <form onSubmit={handleAuthSubmit} className="space-y-3">
 {authMode === 'signup' && (
 <div>
 <label className="text-xs text-slate-400 font-semibold">Your Name *</label>
 <input
 required
 type="text"
 placeholder="e.g., Jane Handler"
 value={authForm.name}
 onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 )}
 <div>
 <label className="text-xs text-slate-400 font-semibold">Email *</label>
 <input
 required
 type="email"
 placeholder="you@example.com"
 value={authForm.email}
 onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">Password *</label>
 <input
 required
 type="password"
 minLength={8}
 placeholder={authMode === 'signup' ? 'At least 8 characters' : 'Your password'}
 value={authForm.password}
 onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>

 {authMode === 'signup' && (
 <>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-xs text-slate-400 font-semibold">Dog&apos;s Name(s) *</label>
 <input
 required
 type="text"
 placeholder="e.g., Biscuit & Gravy"
 value={authForm.dogNames}
 onChange={(e) => setAuthForm({ ...authForm, dogNames: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">Breed *</label>
 <input
 required
 type="text"
 placeholder="e.g., Dachshund"
 value={authForm.dogBreed}
 onChange={(e) => setAuthForm({ ...authForm, dogBreed: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">Kennel / AKC Affiliation (optional)</label>
 <input
 type="text"
 placeholder="e.g., AKC Exhibitor • Sunshine Dachshund Club"
 value={authForm.akcClubOrKennel}
 onChange={(e) => setAuthForm({ ...authForm, akcClubOrKennel: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 font-semibold">Home City & State (optional)</label>
 <input
 type="text"
 placeholder="e.g., Salineville, OH"
 value={authForm.homeCityState}
 onChange={(e) => setAuthForm({ ...authForm, homeCityState: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white mt-1"
 />
 </div>
 <p className="text-[11px] text-slate-500 leading-relaxed">
 We auto-fill the rest: your QR card, dog summary line, score (starts at 100), and forum identity all come from these answers.
 </p>
 </>
 )}

 <button
 type="submit"
 disabled={authBusy}
 className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-sm transition"
 >
 {authBusy
 ? 'One moment...'
 : authMode === 'signup'
 ? 'Create My Profile'
 : 'Sign In'}
 </button>
 </form>

 {authMode === 'login' &&
 (forgotSent ? (
 <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 mt-3">
 If an account with that email exists, a reset link is on its way. Check your inbox (and spam folder). 🐾
 </p>
 ) : (
 <button
 onClick={handleForgotPassword}
 className="w-full text-center text-xs font-semibold text-amber-300 hover:text-amber-200 mt-3"
 >
 Forgot your password?
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
