"use client";

import { API } from "@/lib/api";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function Topics() {
  const [discovering, setDiscovering] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  
  // State for manual topic addition
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { activeWorkspaceId } = useWorkspace();

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API}/topics?workspace_id=${activeWorkspaceId}&video_type=documentary`);
      const data = await res.json();
      setTopics(data.filter((t: any) => t.status === "pending"));
    } catch (err) {
      console.error("Failed to fetch topics", err);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [activeWorkspaceId]);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      await fetch(`${API}/topics/discover?workspace_id=${activeWorkspaceId}`, { method: "POST" });
      await fetchTopics();
    } catch (err) {
      console.error("Failed to discover topics", err);
    }
    setDiscovering(false);
  };

  const handleApprove = async (id: number) => {
    try {
      await fetch(`${API}/topics/${id}/approve`, { method: "POST" });
      await fetchTopics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await fetch(`${API}/topics/${id}/reject`, { method: "POST" });
      await fetchTopics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualAdd = async () => {
    try {
      await fetch(`${API}/topics?workspace_id=${activeWorkspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTitle, 
          description: newDesc,
          video_type: "documentary"
        })
      });
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      await fetchTopics();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Topic Queue</h1>
          <p className="text-gray-400">Review, approve, or manually add topics for production.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 glass-card hover:bg-white/10 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            + Add Topic
          </button>
          <button 
            onClick={handleDiscover}
            disabled={discovering}
            className="px-6 py-2.5 bg-white hover:bg-gray-200 text-black rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 relative overflow-hidden group"
          >
            {discovering && (
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            )}
            <span className="relative z-10">{discovering ? "Discovering..." : "Discover New Topics"}</span>
            {!discovering && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 blur-sm translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
            )}
          </button>
        </div>
      </header>

      {/* Modal with animation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={() => setShowAddModal(false)}></div>
          <div className="glass-card border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <h2 className="text-xl font-bold text-white mb-4">Add Manual Topic</h2>
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The Hidden Economics of Coffee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description / Hook</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-24 resize-none shadow-inner"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What makes this interesting? (Optional)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleManualAdd} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95">Add Topic</button>
            </div>
          </div>
        </div>
      )}

      {topics.length === 0 && !discovering ? (
        <div className="text-center py-24 glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <p className="text-xl font-medium text-white mb-2">The Queue is Empty</p>
          <p className="text-gray-400">Click 'Discover New Topics' to have the AI brainstorm ideas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic, idx) => (
            <div 
              key={topic.id} 
              className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group hover:border-purple-500/30 transition-all duration-300 animate-slide-in-left"
              style={{ animationDelay: `${100 + (idx * 50)}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{topic.title}</h3>
                  {topic.score > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5">
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36">
                          <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path className="text-purple-500 drop-shadow-[0_0_3px_rgba(168,85,247,0.8)] transition-all duration-1000 ease-out" strokeDasharray={`${topic.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-purple-400">{topic.score}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 line-clamp-2 leading-relaxed">{topic.description}</p>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={() => handleReject(topic.id)}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl font-medium transition-all active:scale-95"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleApprove(topic.id)}
                  className="flex-1 md:flex-none px-8 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                >
                  Approve & Build
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
