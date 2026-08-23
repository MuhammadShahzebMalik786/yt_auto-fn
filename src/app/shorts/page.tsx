"use client";

import { API } from "@/lib/api";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function Shorts() {
  const [shorts, setShorts] = useState<any[]>([]);
  
  // State for manual topic addition
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const { activeWorkspaceId } = useWorkspace();

  const fetchShorts = async () => {
    try {
      const res = await fetch(`${API}/topics?workspace_id=${activeWorkspaceId}&video_type=short`);
      const data = await res.json();
      setShorts(data);
    } catch (err) {
      console.error("Failed to fetch shorts", err);
    }
  };

  useEffect(() => {
    fetchShorts();
    // Poll every 10 seconds to catch Auto-Pilot updates
    const interval = setInterval(fetchShorts, 10000);
    return () => clearInterval(interval);
  }, [activeWorkspaceId]);

  const handleManualAdd = async () => {
    try {
      await fetch(`${API}/topics?workspace_id=${activeWorkspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTitle || "Manual Short", 
          description: "Generating content...",
          video_type: "short",
          source_url: sourceUrl
        })
      });
      setShowAddModal(false);
      setNewTitle("");
      setSourceUrl("");
      await fetchShorts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 mb-2">Viral Shorts</h1>
          <p className="text-gray-400">Track Auto-Pilot shorts or manually rip a viral video.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 glass-card hover:bg-white/10 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            + Manual Rip
          </button>
        </div>
      </header>

      {/* Modal with animation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={() => setShowAddModal(false)}></div>
          <div className="glass-card border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <h2 className="text-xl font-bold text-white mb-4">Manual Viral Rip</h2>
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title (Optional)</label>
                <input 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-all shadow-inner"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Crazy Finance Fact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Source Viral Video URL</label>
                <input 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-all shadow-inner"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://youtube.com/shorts/..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleManualAdd} className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg font-medium shadow-lg hover:shadow-red-500/25 transition-all active:scale-95">Rip Video</button>
            </div>
          </div>
        </div>
      )}

      {shorts.length === 0 ? (
        <div className="text-center py-24 glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <p className="text-xl font-medium text-white mb-2">No Shorts Generated</p>
          <p className="text-gray-400">Turn on Auto-Pilot in settings or manually rip a video.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {shorts.map((short, idx) => (
            <div 
              key={short.id} 
              className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group hover:border-red-500/30 transition-all duration-300 animate-slide-in-left"
              style={{ animationDelay: `${100 + (idx * 50)}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">{short.title}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${short.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : short.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                    {short.status.toUpperCase()}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{short.current_step}</p>
                {short.source_url && (
                  <p className="text-gray-500 text-xs">Source: <a href={short.source_url} target="_blank" className="text-blue-400 hover:underline">{short.source_url}</a></p>
                )}
                {short.video_url && (
                  <p className="text-green-500 text-xs mt-1">Published: <a href={short.video_url} target="_blank" className="hover:underline">{short.video_url}</a></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
