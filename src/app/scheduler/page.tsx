"use client";

import { API } from "@/lib/api";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function SchedulerSettings() {
  const [config, setConfig] = useState({
    default_status: "private",
    schedule_type: "immediate",
    schedule_gap_hours: 24,
    random_window_start: "18:00",
    random_window_end: "21:00",
    default_tags: "documentary, video essay, mini documentary, dead internet theory, lost media, internet mysteries, deep dive, internet rabbit hole, eerie mysteries, unsolved mysteries, growth documentary, tech mystery",
    title_strategy: "Standard"
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const { activeWorkspaceId } = useWorkspace();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API}/upload_config?workspace_id=${activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Failed to fetch upload config", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [activeWorkspaceId]);

  // Includes HTMLTextAreaElement: the Default Tags field is a <textarea>, and omitting it
  // made `next build` fail type checking (which would break the Vercel deployment).
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    setConfig(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`${API}/upload_config?workspace_id=${activeWorkspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveMessage("Configuration saved successfully.");
      } else {
        setSaveMessage("Error saving configuration.");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("Network error saving configuration.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-10 max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-1/3 bg-gray-800 rounded skeleton-shimmer"></div>
        <div className="h-64 bg-gray-800 rounded skeleton-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto pb-32">
      <header className="mb-12 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Auto-Scheduler</h1>
        <p className="text-gray-400">Configure global rules for timing, privacy, and metadata on automated YouTube uploads.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Timing & Privacy */}
        <div className="space-y-8">
          
          <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">YouTube Privacy & Status</h2>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-400 text-sm font-medium mb-2 block">Default Video Status</span>
                <select 
                  name="default_status" 
                  value={config.default_status} 
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="private">Private (Review manually before publishing)</option>
                  <option value="public">Public (Go live immediately)</option>
                  <option value="scheduled">Scheduled (Uses YouTube Premiere/Scheduled feature)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  * Note: If 'Scheduled' is selected, you must define a timing strategy below.
                </p>
              </label>
            </div>
          </div>

          <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Timing Strategy</h2>
            
            <div className="space-y-6">
              <label className="block">
                <span className="text-gray-400 text-sm font-medium mb-2 block">Auto-Upload Strategy</span>
                <div className="grid grid-cols-3 gap-3">
                  {['immediate', 'interval', 'window'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setConfig(prev => ({ ...prev, schedule_type: type }))}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${config.schedule_type === type ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-[#0a0a0c] border-white/10 text-gray-400 hover:border-white/30'}`}
                    >
                      {type === 'immediate' ? 'ASAP' : type === 'interval' ? 'Fixed Gap' : 'Random Window'}
                    </button>
                  ))}
                </div>
              </label>

              {config.schedule_type !== 'immediate' && (
                <div className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20 space-y-4">
                  <label className="block">
                    <span className="text-gray-400 text-sm font-medium mb-2 block">Wait Gap (Hours)</span>
                    <input 
                      type="number" 
                      name="schedule_gap_hours" 
                      value={config.schedule_gap_hours} 
                      onChange={handleChange}
                      min="0"
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-xs text-purple-400/60 mt-2">Base time to wait before publishing.</p>
                  </label>

                  {config.schedule_type === 'window' && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-500/10">
                      <label className="block">
                        <span className="text-gray-400 text-sm font-medium mb-2 block">Randomize Between</span>
                        <input 
                          type="time" 
                          name="random_window_start" 
                          value={config.random_window_start} 
                          onChange={handleChange}
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-400 text-sm font-medium mb-2 block">And</span>
                        <input 
                          type="time" 
                          name="random_window_end" 
                          value={config.random_window_end} 
                          onChange={handleChange}
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        />
                      </label>
                      <p className="text-xs text-purple-400/60 col-span-2">Video will be published at a random minute within this window, avoiding algorithmic detection of exact automated timings.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-8">
          <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Default Metadata</h2>
            
            <div className="space-y-6">
              <label className="block">
                <span className="text-gray-400 text-sm font-medium mb-2 block">Default YouTube Tags (Comma Separated)</span>
                <textarea 
                  name="default_tags" 
                  value={config.default_tags} 
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar"
                  placeholder="Documentary, History, AI..."
                />
              </label>

              <label className="block">
                <span className="text-gray-400 text-sm font-medium mb-2 block">Title & Packaging Strategy</span>
                <select 
                  name="title_strategy" 
                  value={config.title_strategy} 
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="Standard">Standard (Descriptive & Clear)</option>
                  <option value="Clickbait">Aggressive (High CTR, Curiosity Gap)</option>
                  <option value="Educational">Educational (Focus on keywords & learning)</option>
                  <option value="Storyteller">Storyteller (Intriguing, Narrative focus)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Controls how the Trend & Script agent package the final video title.
                </p>
              </label>
              
              <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-xs text-blue-200/70 leading-relaxed">
                  Watermarks have been disabled. Scripts and descriptions will no longer contain phrases like "Made with automated software" or "Project Atlas AI".
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {saveMessage}
              </span>
            )}
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {saving ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving...
                </>
              ) : "Save Configuration"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
