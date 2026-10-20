import React from 'react';

export const metadata = {
  title: 'Privacy Policy — Pawsitive Stays',
  description: 'How Pawsitive Stays collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white">Privacy Policy 🐾</h1>
          <p className="text-sm text-slate-400 mt-1">
            Pawsitive Stays · Operated by R&R Droids · Last updated October 20, 2026
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">What we collect</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            When you create an account we store your name, email address, a securely hashed
            password (never the plain password), your dog&apos;s name(s) and breed, and any
            kennel/AKC affiliation or home city you choose to share. When hotel staff scan your
            QR leave-behind card, we store their inspection answers (room tidy, messes, puddles,
            and a 1–5 paw rating) together with the hotel name, city, and room number they enter.
            Forum posts, replies, and hotel reviews you write are stored with your public
            profile name.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">Facebook login & friends</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            If you choose “Continue with Facebook,” we receive your Facebook name, email, and
            user ID. With your permission, Facebook also tells us which of your Facebook friends
            are Pawsitive Stays members — Facebook only ever shares friends who use this same
            app — so we can suggest people you may know. We never post to Facebook on your
            behalf, and we never see your Facebook password.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">How we use it</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your information is used to run the service: your profile and QR card, your
            Pawsitive Score and tier badge, the hotel deposit directory, the community forum,
            password reset emails, and friend suggestions. We do not sell your personal
            information, and we do not use it for advertising.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">What&apos;s public</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your profile name, handle, dog summary, score, tier badge, verified stay history,
            forum posts, and hotel reviews are visible to other visitors — that&apos;s the point
            of a reputation card you can show at check-in. Your email address and password are
            never displayed publicly. Hotel staff verification pages show only your card
            information, not your email.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">Your choices</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            You can edit your profile and card at any time from your dashboard. To delete your
            account and its data, or to ask any privacy question, contact us at{' '}
            <a href="mailto:droiden.rr@gmail.com" className="text-amber-300 font-semibold">
              droiden.rr@gmail.com
            </a>{' '}
            and we&apos;ll take care of it.
          </p>
        </section>

        <a href="/" className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm">
          Back to Pawsitive Stays
        </a>
      </div>
    </div>
  );
}
