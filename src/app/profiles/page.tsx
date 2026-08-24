"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api";

type Profile = { id: number; name: string; youtube_connected: boolean };

/** Profiles are channels. Each has its own settings, videos and YouTube connection. */
export default function Profiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    const res = await fetch(`${API}/workspaces`);
    if (res.ok) setProfiles(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    await fetch(`${API}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName("");
    await load();
    setBusy(false);
  };

  const rename = async (id: number) => {
    if (!editName.trim()) return;
    await fetch(`${API}/workspaces/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditing(null);
    await load();
  };

  const remove = async (p: Profile) => {
    // Deleting a profile destroys its topics and settings, so make that explicit.
    if (!confirm(`Delete "${p.name}"?\n\nThis permanently removes its videos and settings.`)) return;
    await fetch(`${API}/workspaces/${p.id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <header className="mb-8 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
          Profiles
        </h1>
        <p className="text-gray-400">
          Each profile is one channel, with its own settings, videos and YouTube connection.
        </p>
      </header>

      <div className="glass-card p-6 mb-6 flex gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="New profile name"
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
        />
        <button
          onClick={create}
          disabled={busy || !name.trim()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create"}
        </button>
      </div>

      <div className="space-y-3">
        {profiles.length === 0 && (
          <p className="text-sm text-gray-600 text-center py-8">
            No profiles yet — create one above to get started.
          </p>
        )}

        {profiles.map((p, i) => (
          <div
            key={p.id}
            className="glass-card p-4 flex items-center justify-between animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {editing === p.id ? (
              <input
                value={editName}
                autoFocus
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") rename(p.id);
                  if (e.key === "Escape") setEditing(null);
                }}
                onBlur={() => rename(p.id)}
                className="flex-1 mr-4 bg-black/50 border border-purple-500/40 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            ) : (
              <div className="min-w-0">
                <p className="text-white font-bold truncate">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.youtube_connected ? "YouTube connected" : "No channel connected"}
                </p>
              </div>
            )}

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditing(p.id);
                  setEditName(p.name);
                }}
                className="text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => remove(p)}
                className="text-red-400 hover:bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
