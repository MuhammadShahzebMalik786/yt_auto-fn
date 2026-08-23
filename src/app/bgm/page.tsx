"use client";

import { useState, useEffect, useRef } from "react";

export default function BGMLibrary() {
  const [moods, setMoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMood, setSelectedMood] = useState("suspense");
  const [newMood, setNewMood] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMoods = async () => {
    try {
      const res = await fetch("http://localhost:8000/bgm/moods");
      const data = await res.json();
      setMoods(data.moods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.name.endsWith(".mp3")) {
      alert("Only MP3 files are supported.");
      return;
    }

    const finalMood = newMood.trim() !== "" ? newMood.trim().toLowerCase() : selectedMood;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mood", finalMood);

    setUploading(true);
    try {
      const res = await fetch("http://localhost:8000/bgm/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setNewMood(""); // reset custom mood input
        fetchMoods(); // refresh
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to upload.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto pb-20">
      <header className="mb-12 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">BGM Library</h1>
        <p className="text-gray-400">Manage the background music pool that the Director assigns by mood.</p>
      </header>

      {/* Upload Section */}
      <div className="glass-card p-8 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          Upload New Track
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Mood Category</label>
            <select 
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
            >
              <option value="suspense">Suspense</option>
              <option value="sad">Sad</option>
              <option value="happy">Happy</option>
              <option value="amazed">Amazed</option>
              <option value="epic">Epic</option>
              <option value="mysterious">Mysterious</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">Or Create Custom Mood</label>
            <input 
              type="text"
              placeholder="e.g. action"
              value={newMood}
              onChange={(e) => setNewMood(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="flex-1 w-full">
            <input 
              type="file" 
              accept=".mp3" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Uploading...
                </>
              ) : (
                "Select MP3 File"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Library Grid */}
      {loading ? (
        <div className="text-center py-20">
          <svg className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {moods.map((moodData, idx) => (
            <div 
              key={moodData.mood} 
              className="glass-card p-6 animate-fade-in-up flex flex-col h-full"
              style={{ animationDelay: `${200 + (idx * 50)}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white capitalize">{moodData.mood}</h3>
                <span className="bg-white/10 text-xs text-gray-300 px-3 py-1 rounded-full font-medium">
                  {moodData.track_count} Tracks
                </span>
              </div>
              
              <div className="flex-1 bg-black/40 rounded-lg p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                {moodData.tracks.length === 0 ? (
                  <p className="text-gray-500 text-sm italic text-center mt-4">No tracks uploaded yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {moodData.tracks.map((track: string) => (
                      <li key={track} className="flex flex-col gap-2 p-2 bg-white/5 rounded-lg text-sm text-gray-300 hover:text-white transition-colors group">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-purple-500 opacity-50 group-hover:opacity-100 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.28l8-1.6v5.434A4.369 4.369 0 0015 11c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" /></svg>
                          <span className="truncate">{track}</span>
                        </div>
                        <audio controls controlsList="nodownload" className="w-full h-8 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <source src={`http://localhost:8000/static/assets/bgm/${moodData.mood}/${track}`} type="audio/mpeg" />
                        </audio>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
