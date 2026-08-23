"use client";

import { useState, useEffect } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import ThumbnailPreview from "@/components/ThumbnailPreview";
import ProgressBar from "@/components/ProgressBar";
import { getPipelineProgress } from "@/lib/pipelineProgress";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function Home() {
  const [stats, setStats] = useState({ pending: 0, generating: 0, completed: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeWorkspaceId } = useWorkspace();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:8000/topics?workspace_id=${activeWorkspaceId}`);
        const data = await res.json();
        
        let pending = 0;
        let generating = 0;
        let completed = 0;
        
        data.forEach((t: any) => {
          if (t.status === "pending") pending++;
          if (t.status === "generating") generating++;
          if (t.status === "completed") completed++;
        });
        
        setStats({ pending, generating, completed });
        setRecentProjects(data.filter((t: any) => t.status === "generating" || t.status === "completed").reverse().slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [activeWorkspaceId]);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <header className="mb-12 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to Project Atlas. Your autonomous documentary engine.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Pending Card */}
        <div className="glass-card p-6 flex items-center justify-between group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Topics in Queue</p>
            <div className="text-4xl font-bold text-white">
              {loading ? <span className="skeleton-shimmer w-12 h-10 inline-block rounded"></span> : <AnimatedCounter value={stats.pending} />}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        
        {/* Active Card */}
        <div className="glass-card p-6 flex items-center justify-between group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Active Pipelines</p>
            <div className="text-4xl font-bold text-white">
              {loading ? <span className="skeleton-shimmer w-12 h-10 inline-block rounded"></span> : <AnimatedCounter value={stats.generating} />}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors animate-pulse-glow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
        </div>

        {/* Completed Card */}
        <div className="glass-card p-6 flex items-center justify-between group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Videos Published</p>
            <div className="text-4xl font-bold text-white">
              {loading ? <span className="skeleton-shimmer w-12 h-10 inline-block rounded"></span> : <AnimatedCounter value={stats.completed} />}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <a href="/projects" className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">View All Projects &rarr;</a>
        </div>
        
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                 <div className="w-24 h-16 rounded-lg skeleton-shimmer"></div>
                 <div className="flex-1 space-y-2 py-1">
                   <div className="h-4 w-1/3 skeleton-shimmer rounded"></div>
                   <div className="h-3 w-1/4 skeleton-shimmer rounded"></div>
                 </div>
               </div>
             ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <p className="text-gray-400">No active or completed projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recentProjects.map((project, idx) => (
              <div 
                key={project.id} 
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${500 + (idx * 100)}ms` }}
              >
                <div className="w-full sm:w-32 h-20 rounded-lg overflow-hidden shrink-0 bg-black">
                  {project.status === 'completed' ? (
                    <ThumbnailPreview topicId={project.id} slug={project.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-900/20 text-blue-400">
                      <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium line-clamp-1">{project.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">Status: <span className={project.status === 'completed' ? 'text-green-400' : 'text-blue-400'}>{project.current_step}</span></p>
                    </div>
                  </div>
                  
                  {project.status === 'generating' && (
                    <div className="mt-auto">
                      <ProgressBar
                        current={getPipelineProgress(project.current_step, project.completed_scenes || 0, project.total_scenes || 0, project.status)}
                        total={100}
                        isGenerating={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
