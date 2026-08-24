"use client";

/**
 * Shown when the signed-in user owns no profiles yet, instead of firing a doomed
 * fetch against workspace_id=0 (or a stale id belonging to a different account).
 */
export default function NoProfile() {
  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="glass-card p-10 text-center animate-fade-in-up">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <h2 className="text-xl font-bold text-white mb-2">No profile yet</h2>
        <p className="text-gray-400 mb-6">
          Create a profile to start generating videos for a channel.
        </p>
        <a
          href="/profiles"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
        >
          Create a profile
        </a>
      </div>
    </div>
  );
}
