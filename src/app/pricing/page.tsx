"use client";

import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/auth";

/**
 * Pricing is a placeholder: tiers are stored on the user but never enforced, so every
 * account is currently unlimited. The cards exist so the plan structure is visible
 * before billing is wired up.
 */
const TIERS = [
  {
    name: "Free",
    price: "$0",
    profiles: "1 profile",
    features: ["Documentaries", "Viral Shorts", "Auto-pilot scheduling", "AI voiceover"],
  },
  {
    name: "Creator",
    price: "$19",
    profiles: "5 profiles",
    features: ["Everything in Free", "Priority rendering", "Custom intro & outro", "Advanced analytics"],
    highlight: true,
  },
  {
    name: "Studio",
    price: "$49",
    profiles: "Unlimited profiles",
    features: ["Everything in Creator", "Team access", "Analytics exports", "Priority support"],
  },
];

export default function Pricing() {
  const [tier, setTier] = useState<string>("free");

  useEffect(() => {
    fetchMe().then((me) => {
      if (me?.tier) setTier(me.tier);
    });
  }, []);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
          Plans
        </h1>
        <p className="text-gray-400">
          Subscriptions are coming soon. Every account is currently unlimited — nothing is
          restricted while billing is being built.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((t, i) => (
          <div
            key={t.name}
            className={`glass-card p-6 relative animate-fade-in-up ${
              t.highlight ? "border border-purple-500/30" : ""
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wide bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full">
              Coming soon
            </span>

            <h2 className="text-lg font-bold text-white">{t.name}</h2>
            <p className="text-3xl font-extrabold text-white mt-2">
              {t.price}
              <span className="text-sm text-gray-500 font-medium">/mo</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">{t.profiles}</p>

            <ul className="mt-5 space-y-2">
              {t.features.map((f) => (
                <li key={f} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-purple-400">•</span>
                  {f}
                </li>
              ))}
            </ul>

            {tier.toLowerCase() === t.name.toLowerCase() ? (
              <div className="mt-6 w-full py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-center text-sm">
                Your current plan
              </div>
            ) : (
              <button
                disabled
                className="mt-6 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold cursor-not-allowed"
              >
                Coming soon
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
