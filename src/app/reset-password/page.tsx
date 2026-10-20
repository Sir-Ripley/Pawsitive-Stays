'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dog, ShieldCheck, CheckCircle2 } from 'lucide-react';

function ResetForm() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed. Please request a new link.');
        return;
      }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
        <h1 className="text-xl font-bold text-rose-400">Reset link missing</h1>
        <p className="text-sm text-slate-400 mt-2">
          This page needs the link from your password reset email. Head back home and tap
          “Forgot password?” to get a fresh one.
        </p>
        <a href="/" className="inline-block mt-5 bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm">
          Back to Pawsitive Stays
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black">Password updated!</h1>
        <p className="text-sm text-slate-300">
          You&apos;re signed in with your new password. Welcome back to the pack. 🐾
        </p>
        <a href="/" className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm">
          Go to My Profile
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950">
          <Dog className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-white">Choose a New Password</h1>
      </div>
      <p className="text-xs text-slate-400 mb-5">At least 8 characters. You&apos;ll be signed in right after.</p>
      {error && (
        <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 mb-3">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 font-semibold">New Password</label>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-semibold">Confirm New Password</label>
          <input
            required
            type="password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-sm transition"
        >
          <ShieldCheck className="w-4 h-4" />
          {busy ? 'Updating...' : 'Set New Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Suspense fallback={<div className="text-center text-amber-400 font-semibold animate-pulse">Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
