"use client";

import { useState, useEffect } from "react";
import ThumbnailPreview from "@/components/ThumbnailPreview";
import ProgressBar from "@/components/ProgressBar";
import { getPipelineProgress } from "@/lib/pipelineProgress";
import SkeletonCard from "@/components/SkeletonCard";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { activeWorkspaceId } = useWorkspace();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:8000/topics?workspace_id=${activeWorkspaceId}`);
        const data = await res.json();
        setProjects(data.filter((t: any) => t.status === "generating" || t.status === "completed" || t.status === "failed").reverse());
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };

    fetchProjects();
    const interval = setInterval(fetchProjects, 3000);
    return () => clearInterval(interval);
  }, [activeWorkspaceId]);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-12 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Projects</h1>
        <p className="text-gray-400">Monitor active generation pipelines and published documentaries.</p>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-6 border-b border-white/10 mb-8 pb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <button 
          onClick={() => setFilter("all")}
          className={`font-medium pb-4 -mb-4 transition-colors ${filter === "all" ? "text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"}`}>
          All Projects
        </button>
        <button 
          onClick={() => setFilter("completed")}
          className={`font-medium pb-4 -mb-4 transition-colors ${filter === "completed" ? "text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"}`}>
          Completed
        </button>
        <button 
          onClick={() => setFilter("generating")}
          className={`font-medium pb-4 -mb-4 transition-colors ${filter === "generating" ? "text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"}`}>
          Generating
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 glass-card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <p className="text-xl font-medium text-white mb-2">No active projects</p>
          <p className="text-gray-400">Approve a topic from the Topic Queue to start generating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.filter(p => {
            if (filter === "completed") return p.status === "completed";
            if (filter === "generating") return p.status !== "completed" && p.status !== "failed";
            return true; // all
          }).map((project, idx) => {
            const isError = project.status === "failed";
            const isCompleted = project.status === "completed";
            const isReviewing = project.status.startsWith("reviewing_");
            
            return (
              <div 
                key={project.id} 
                className="glass-card overflow-hidden group flex flex-col relative animate-fade-in-up"
                style={{ animationDelay: `${200 + (idx * 50)}ms` }}
              >
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to permanently delete this project and its files?")) {
                      try {
                        await fetch(`http://localhost:8000/topics/${project.id}`, { method: "DELETE" });
                        setProjects(prev => prev.filter(p => p.id !== project.id));
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                >
                  ✕
                </button>
                
                <div className="aspect-video bg-gray-900 relative">
                  {isCompleted ? (
                    <ThumbnailPreview topicId={project.id} slug={project.title} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 overflow-hidden">
                      {isError ? (
                        <div className="absolute inset-0 bg-red-900/20"></div>
                      ) : (
                        <div className="absolute inset-0 skeleton-shimmer opacity-20"></div>
                      )}
                      <div className="relative z-10 text-center">
                        {isError ? (
                           <svg className="w-10 h-10 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ) : (
                           <svg className="w-10 h-10 text-blue-500 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        )}
                        <span className="text-gray-400 font-medium">
                          {isError ? "Pipeline Failed" : "Generating..."}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute bottom-3 left-3 z-20">
                    <span className={`px-2.5 py-1 rounded-md text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${isCompleted ? 'bg-green-500/80 border border-green-400/50' : isError ? 'bg-red-500/80 border border-red-400/50' : isReviewing ? 'bg-yellow-500/80 border border-yellow-400/50 text-black' : 'bg-blue-500/80 border border-blue-400/50'}`}>
                      {isReviewing ? "REVIEW REQUIRED" : project.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{project.title}</h3>
                  
                  {!isCompleted && !isError && !isReviewing && (
                    <div className="mb-4 mt-auto">
                      <p className="text-sm font-medium text-blue-400 mb-2 truncate">
                        Step: {project.current_step || "Initializing..."}
                      </p>
                      <ProgressBar
                        current={getPipelineProgress(project.current_step, project.completed_scenes || 0, project.total_scenes || 0, project.status)}
                        total={100}
                        isGenerating={true}
                      />
                    </div>
                  )}

                  {isReviewing && (
                    <div className="mb-4 mt-auto space-y-2">
                      <p className="text-sm font-medium text-yellow-400 mb-2">
                        {project.status === "reviewing_blueprint" ? "Review Blueprint.json" : "Review Master Video"}
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            await fetch(`http://localhost:8000/topics/${project.id}/approve_review`, { method: "POST" });
                            setProjects(prev => prev.map(p => p.id === project.id ? {...p, status: "generating"} : p));
                          }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={async () => {
                            const action = prompt("Reject Options: 'stop', 'retry_director', or 'retry_thumbnail'\nType your choice:");
                            if (action && ["stop", "retry_director", "retry_thumbnail"].includes(action)) {
                              await fetch(`http://localhost:8000/topics/${project.id}/reject_review`, { 
                                method: "POST", 
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action }) 
                              });
                              setProjects(prev => prev.map(p => p.id === project.id ? {...p, status: action === "stop" ? "rejected" : action} : p));
                            }
                          }}
                          className="flex-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isError && (
                    <div className="mb-4 mt-auto">
                      <p className="text-sm font-medium text-red-400 mb-2">
                        Failed at: {project.current_step}
                      </p>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              await fetch(`http://localhost:8000/topics/${project.id}/approve`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: project.id, title: project.title, score: project.score })
                              });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                        >
                          Retry Entire Pipeline
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await fetch(`http://localhost:8000/topics/${project.id}/thumbnail`, { method: "POST" });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-sm font-medium transition-colors border border-pink-500/30"
                        >
                          Retry Thumbnail Only
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="mt-auto pt-4 border-t border-white/10">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Published to YouTube</p>
                      <div className="flex gap-2">
                        <a 
                          href={project.video_url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          View Video
                        </a>
                        <button 
                          onClick={async () => {
                            try {
                              await fetch(`http://localhost:8000/topics/${project.id}/thumbnail`, { method: "POST" });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="flex-1 text-center py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-lg text-sm font-medium transition-colors"
                        >
                          Regen Thumbnail
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
