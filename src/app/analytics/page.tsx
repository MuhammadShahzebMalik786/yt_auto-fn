"use client";

import { API } from "@/lib/api";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function Analytics() {
  const { activeWorkspaceId } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [channelStats, setChannelStats] = useState<any>(null);
  const [reportData, setReportData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch High-level stats
        const resStats = await fetch(`${API}/analytics?workspace_id=${activeWorkspaceId}`);
        const statsData = await resStats.json();
        
        if (statsData.error) {
          setError(statsData.error);
          setLoading(false);
          return;
        }
        
        setChannelStats(statsData);

        // Fetch 30-day report
        const resReport = await fetch(`${API}/analytics/reports?workspace_id=${activeWorkspaceId}`);
        const reportRaw = await resReport.json();
        
        if (reportRaw.rows) {
          // Format for Recharts
          const formattedData = reportRaw.rows.map((row: any[]) => {
            return {
              date: row[0],
              views: row[1],
              watchTime: row[2], // estimatedMinutesWatched
              avgDuration: row[3],
              subsGained: row[4]
            };
          });
          setReportData(formattedData);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeWorkspaceId]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-10 max-w-7xl mx-auto flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400 font-medium">Syncing with YouTube Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 max-w-7xl mx-auto">
        <div className="text-center py-24 glass-card border-red-500/20 bg-red-500/5 animate-fade-in-up">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <p className="text-xl font-medium text-white mb-2">Analytics Not Available</p>
          <p className="text-gray-400">{error}</p>
          <a href="/settings" className="mt-6 inline-block bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors">Connect YouTube Channel</a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto pb-20">
      <header className="mb-12 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-4 mb-2">
          {channelStats?.thumbnail && (
            <img src={channelStats.thumbnail} alt="Channel Avatar" className="w-12 h-12 rounded-full border border-white/20" />
          )}
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {channelStats?.channel_title || "Analytics"}
          </h1>
        </div>
        <p className="text-gray-400 mt-2">Live performance metrics and audience insights.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <p className="text-sm font-medium text-gray-400 mb-2">Total Views</p>
          <p className="text-3xl font-bold text-white">{parseInt(channelStats?.views || '0').toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm font-medium text-gray-400 mb-2">Total Subscribers</p>
          <p className="text-3xl font-bold text-white">{parseInt(channelStats?.subscribers || '0').toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <p className="text-sm font-medium text-gray-400 mb-2">Total Videos</p>
          <p className="text-3xl font-bold text-white">{parseInt(channelStats?.videos || '0').toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <p className="text-sm font-medium text-gray-400 mb-2">30-Day Growth (Est.)</p>
          <p className="text-3xl font-bold text-green-400">
            +{reportData.reduce((acc, curr) => acc + (curr.subsGained || 0), 0).toLocaleString()} Subs
          </p>
        </div>
      </div>

      {/* Main Charts */}
      {reportData.length > 0 ? (
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          {/* Views Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Views (Last 30 Days)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" name="Views" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Watch Time Chart */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-6">Watch Time (Minutes)</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="watchTime" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWatchTime)" name="Minutes Watched" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subs Gained Chart */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-6">Subscribers Gained</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="subsGained" fill="#10b981" radius={[4, 4, 0, 0]} name="Subs Gained" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <p className="text-gray-400 mb-2">No detailed report data available for the last 30 days.</p>
          <p className="text-sm text-gray-500">YouTube Analytics data might be delayed by 24-48 hours.</p>
        </div>
      )}
    </div>
  );
}
