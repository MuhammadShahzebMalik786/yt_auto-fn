"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API, setToken, getToken } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (getToken()) router.replace("/");
    // Distinguishes "no password has been set on the server" from "wrong password".
    fetch(`${API}/session/status`)
      .then((r) => r.json())
      .then((d) => setConfigured(!!d.configured))
      .catch(() => setError("Cannot reach the backend. Is it running?"));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/session/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        router.replace("/");
      } else if (res.status === 401) {
        setError("Incorrect password");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || `Login failed (${res.status})`);
      }
    } catch {
      setError("Cannot reach the backend. Check the API URL.");
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen p-6">
      <div className="glass-card p-8 w-full max-w-sm animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500" />
          <div>
            <h1 className="text-xl font-bold text-white">Project Atlas</h1>
            <p className="text-xs text-gray-500">Enter your password to continue</p>
          </div>
        </div>

        {configured === false && (
          <div className="mb-4 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            No password is set on the server. Run{" "}
            <code className="text-yellow-300">python set_password.py</code> in the backend folder.
          </div>
        )}

        <form onSubmit={submit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all mb-3"
          />

          {error && (
            <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-[11px] text-gray-600 break-all">API: {API}</p>
      </div>
    </div>
  );
}
