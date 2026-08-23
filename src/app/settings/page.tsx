"use client";

import { API } from "@/lib/api";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function Settings() {
  const [model, setModel] = useState("gemini-1.5-pro");
  const [niche, setNiche] = useState("Dead Internet Theory, eerie mysteries, lost media");
  const [targetDuration, setTargetDuration] = useState("10");
  const [reviewMode, setReviewMode] = useState(false);
  const [docAutopilot, setDocAutopilot] = useState(false);
  const [docFreq, setDocFreq] = useState("48");
  const [shortsAutopilot, setShortsAutopilot] = useState(false);
  const [shortsFreq, setShortsFreq] = useState("12");
  const [availableModels, setAvailableModels] = useState<{id: string, display_name: string}[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [chromeProfiles, setChromeProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [ttsEngine, setTtsEngine] = useState("edge");
  const [ttsVoice, setTtsVoice] = useState("en-US-AndrewMultilingualNeural");
  const [ttsRate, setTtsRate] = useState("+0%");
  const [ttsVoices, setTtsVoices] = useState<{id: string, label: string, gender: string, locale: string}[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [bgmLevel, setBgmLevel] = useState("0.12");
  const { activeWorkspaceId } = useWorkspace();

  useEffect(() => {
    // Fetch settings from API
    fetch(`${API}/settings?workspace_id=${activeWorkspaceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.ai_model) setModel(data.ai_model);
        if (data.target_niche) setNiche(data.target_niche);
        if (data.target_duration) setTargetDuration(data.target_duration);
        if (data.review_mode !== undefined) setReviewMode(data.review_mode === "true");
        if (data.doc_autopilot !== undefined) setDocAutopilot(data.doc_autopilot === "true");
        if (data.doc_frequency) setDocFreq(data.doc_frequency);
        if (data.shorts_autopilot !== undefined) setShortsAutopilot(data.shorts_autopilot === "true");
        if (data.shorts_frequency) setShortsFreq(data.shorts_frequency);
        if (data.tts_engine) setTtsEngine(data.tts_engine);
        if (data.tts_voice) setTtsVoice(data.tts_voice);
        if (data.tts_rate) setTtsRate(data.tts_rate);
        if (data.bgm_level) setBgmLevel(data.bgm_level);
      })
      .catch(err => console.error("Failed to fetch settings:", err));
      
    // Fetch auth status
    fetch(`${API}/auth/status?workspace_id=${activeWorkspaceId}`)
      .then(res => res.json())
      .then(data => {
        setYoutubeConnected(data.connected);
      })
      .catch(err => console.error("Failed to fetch auth status:", err));
      
    // Fetch chrome profiles
    fetch(`${API}/chrome_profiles`)
      .then(res => res.json())
      .then(data => {
        if (data.profiles) setChromeProfiles(data.profiles);
        if (data.saved) setSelectedProfile(data.saved);
      })
      .catch(err => console.error("Failed to fetch chrome profiles:", err));
      
    // Fetch available models
    fetchModels();
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetch(`${API}/tts/voices?engine=${ttsEngine}`)
      .then(res => res.json())
      .then(data => { if (data.voices) setTtsVoices(data.voices); })
      .catch(err => console.error("Failed to fetch voices:", err));
  }, [ttsEngine]);

  const handleRateChange = (v: string) => {
    const n = parseInt(v, 10);
    setTtsRate(`${n >= 0 ? "+" : ""}${n}%`);
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const res = await fetch(`${API}/tts/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engine: ttsEngine, voice: ttsVoice, rate: ttsRate }),
      });
      const data = await res.json();
      if (data.url) {
        const audio = new Audio(`${API}${data.url}`);
        await audio.play();
      }
    } catch (err) {
      console.error("Preview failed:", err);
    }
    setPreviewing(false);
  };

  const fetchModels = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API}/models`);
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        setAvailableModels(data.models);
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
    }
    setRefreshing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/settings?workspace_id=${activeWorkspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai_model: model,
          target_niche: niche,
          target_duration: targetDuration,
          review_mode: reviewMode.toString(),
          doc_autopilot: docAutopilot.toString(),
          doc_frequency: docFreq,
          shorts_autopilot: shortsAutopilot.toString(),
          shorts_frequency: shortsFreq,
          tts_engine: ttsEngine,
          tts_voice: ttsVoice,
          tts_rate: ttsRate,
          bgm_level: bgmLevel
        })
      });
      
      const profileResponse = await fetch(`${API}/chrome_profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: selectedProfile })
      });
      
      if (res.ok && profileResponse.ok) {
        setMessage("success");
      } else {
        setMessage("error");
      }
    } catch (err) {
      setMessage("error");
      console.error(err);
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch(`${API}/auth/logout?workspace_id=${activeWorkspaceId}`, { method: "DELETE" });
      if (res.ok) setYoutubeConnected(false);
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <header className="mb-12 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Settings</h1>
        <p className="text-gray-400">Configure your AI models and generation preferences.</p>
      </header>

      <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        
        {/* AI Configuration Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            AI Configuration
          </h2>
          
          <div className="mb-8 group">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Primary AI Model</label>
              <button 
                onClick={fetchModels}
                disabled={refreshing}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-medium disabled:opacity-50"
              >
                <svg className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh Models
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Select the model that will be used for research, script writing, and evaluation.</p>
            
            <div className="relative">
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full md:w-1/2 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none transition-all shadow-inner relative z-10"
              >
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.display_name}</option>
                  ))
                ) : (
                  <>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Fallback)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fallback)</option>
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 md:right-[50%] flex items-center px-4 text-gray-400 z-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Niche</label>
            <p className="text-xs text-gray-500 mb-4">The exact niche the Trend Agent will hunt for viral topics in.</p>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. True Crime, Space Exploration, Finance"
              className="w-full md:w-1/2 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Auto-Pilot Section */}
        <div className="mb-8 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Global Auto-Pilot
          </h2>
          <p className="text-sm text-gray-400 mb-6">Let the AI autonomously research, build, and publish content while you sleep based on the Target Niche above.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 shadow-inner">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-white mb-1">Documentary Auto-Pilot</h3>
                  <p className="text-xs text-gray-500">Auto-brainstorms and builds long-form videos.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={docAutopilot} onChange={(e) => setDocAutopilot(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Frequency (Hours)</label>
              <input
                type="number"
                value={docFreq}
                onChange={(e) => setDocFreq(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div className="bg-black/30 p-6 rounded-xl border border-white/5 shadow-inner">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-white mb-1">Viral Shorts Auto-Pilot</h3>
                  <p className="text-xs text-gray-500">Auto-rips and remixes viral shorts in your niche.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={shortsAutopilot} onChange={(e) => setShortsAutopilot(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Frequency (Hours)</label>
              <input
                type="number"
                value={shortsFreq}
                onChange={(e) => setShortsFreq(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
          </div>
        </div>
        
        {/* Video Settings Section */}
        <div className="mb-8 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            Video Settings
          </h2>
          <label className="block text-sm font-medium text-gray-300 mb-2">Target Video Duration (Minutes)</label>
          <p className="text-xs text-gray-500 mb-4">The AI will adjust the script's word count to roughly match this length (assuming 140 words per minute).</p>
          <input
            type="number"
            value={targetDuration}
            onChange={(e) => setTargetDuration(e.target.value)}
            className="w-full md:w-1/3 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />

          <div className="mb-8 mt-8 flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
            <div>
              <label className="block text-sm font-bold text-white mb-1">Review Mode</label>
              <p className="text-xs text-gray-500">Pause the pipeline to manually approve scripts and thumbnails before rendering.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={reviewMode} onChange={(e) => setReviewMode(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        {/* Voice / Narration Section */}
        <div className="mb-8 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-14 0m7 7v3m0-3a4 4 0 004-4V5a4 4 0 00-8 0v6a4 4 0 004 4z"></path></svg>
            Narration Voice
          </h2>
          <p className="text-sm text-gray-400 mb-6">Choose the AI voice engine and voice for your videos. Preview before saving.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TTS Engine</label>
              <select value={ttsEngine} onChange={(e) => setTtsEngine(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all">
                <option value="edge">Edge Neural (recommended, stable)</option>
                <option value="xtts">XTTS Clone (custom voice .wav)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
              <select value={ttsVoice} onChange={(e) => setTtsVoice(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all">
                {ttsVoices.map(v => (<option key={v.id} value={v.id}>{v.label}</option>))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Speed ({ttsRate})</label>
            <input type="range" min={-50} max={50} step={5}
              value={parseInt(ttsRate.replace("%", "")) || 0}
              onChange={(e) => handleRateChange(e.target.value)}
              className="w-full md:w-1/2 accent-green-500" />
          </div>

          <button onClick={handlePreview} disabled={previewing}
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            {previewing ? "Generating…" : "Preview Voice"}
          </button>

          <div className="mt-8 pt-6 border-t border-white/5">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Music Volume ({Math.round(parseFloat(bgmLevel) * 100)}%)
            </label>
            <p className="text-xs text-gray-500 mb-4">
              How loud the music sits under the narration. Stock tracks are much louder than the
              voice, so low values are normal — 12% keeps music about 13&nbsp;dB below speech.
              The music is also automatically ducked whenever the narrator talks.
            </p>
            <input type="range" min={2} max={40} step={1}
              value={Math.round(parseFloat(bgmLevel) * 100)}
              onChange={(e) => setBgmLevel((parseInt(e.target.value, 10) / 100).toFixed(2))}
              className="w-full md:w-1/2 accent-green-500" />
            <div className="flex gap-4 text-xs text-gray-500 mt-2 md:w-1/2 justify-between">
              <span>2% — barely audible</span>
              <span>12% — recommended</span>
              <span>40% — loud</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Section */}
        <div className="mb-8 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Thumbnail Automation
          </h2>
          <p className="text-sm text-gray-400 mb-4">Select your primary Chrome Profile to allow the AI to automatically generate thumbnails via Gemini without encountering login captchas.</p>
          
          <div className="relative">
            <select 
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full md:w-1/2 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 appearance-none transition-all shadow-inner relative z-10"
            >
              <option value="Default">Default</option>
              {chromeProfiles.map(p => (
                <option key={p[0]} value={p[0]}>{p[1]} ({p[0]})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 md:right-[50%] flex items-center px-4 text-gray-400 z-20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* YouTube Auto-Publishing */}
        <div className="mb-8 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            YouTube Auto-Publishing
          </h2>
          <p className="text-sm text-gray-400 mb-6">Connect your Google Account to automatically upload generated documentaries to YouTube.</p>
          
          <div className="transition-all duration-500">
            {youtubeConnected ? (
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  YouTube Connected
                </div>
                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Disconnect
                </button>
              </div>
            ) : (
              <a 
                href={`${API}/auth/login?workspace_id=${activeWorkspaceId}`}
                className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-transform active:scale-95 hover:shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Login with Google
              </a>
            )}
          </div>
        </div>
        
        {/* Save Action */}
        <div className="pt-8 border-t border-white/10 flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-purple-500/25 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving...
              </>
            ) : 'Save Configuration'}
          </button>
          
          {/* Success Animation */}
          {message === "success" && (
            <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              Settings Saved!
            </div>
          )}
          
          {message === "error" && (
            <div className="flex items-center gap-2 text-red-400 font-bold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Failed to save
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
