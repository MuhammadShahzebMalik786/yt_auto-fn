'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from './WorkspaceContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, createWorkspace } = useWorkspace();
  
  const handleWorkspaceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'create_new') {
      const name = prompt("Enter new workspace name:");
      if (name) {
        await createWorkspace(name);
      } else {
        e.target.value = activeWorkspaceId.toString();
      }
    } else {
      setActiveWorkspaceId(parseInt(val));
    }
  };

  return (
    <div className="w-64 h-screen bg-black/60 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-6 fixed z-50 overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] flex items-center justify-center animate-pulse-glow">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <h1 className="text-white font-bold text-xl tracking-wide">Atlas</h1>
      </div>

      <div className="flex flex-col gap-1 mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspace</label>
        <select 
          value={activeWorkspaceId}
          onChange={handleWorkspaceChange}
          className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 hover:bg-white/10 transition-colors"
        >
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id} className="bg-gray-900">{ws.name}</option>
          ))}
          <option value="create_new" className="bg-gray-900 text-purple-400 font-bold">+ Create New...</option>
        </select>
      </div>

      <nav className="flex flex-col gap-2">
        <SidebarLink href="/" label="Dashboard" icon="dashboard" active={pathname === "/"} />
        <SidebarLink href="/topics" label="Topic Queue" icon="queue" active={pathname === "/topics"} />
        <SidebarLink href="/shorts" label="Viral Shorts" icon="video" active={pathname === "/shorts"} />
        <SidebarLink href="/scheduler" label="Auto-Scheduler" icon="scheduler" active={pathname === "/scheduler"} />
        <SidebarLink href="/projects" label="Projects" icon="video" active={pathname === "/projects"} />
        <SidebarLink href="/bgm" label="BGM Library" icon="bgm" active={pathname === "/bgm"} />
        <SidebarLink href="/analytics" label="Analytics" icon="analytics" active={pathname === "/analytics"} />
      </nav>

      <div className="mt-auto">
        <SidebarLink href="/settings" label="Settings" icon="settings" active={pathname === "/settings"} />
      </div>
    </div>
  );
}

function SidebarLink({ href, label, icon, active = false }: { href: string; label: string; icon: string; active?: boolean }) {
  // Simple icons with SVG (omitted complex paths for brevity, using simple geometric shapes)
  const renderIcon = () => {
    switch (icon) {
      case 'dashboard':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
      case 'queue':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>;
      case 'scheduler':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'video':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
      case 'analytics':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'publish':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
      case 'bgm':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;
      case 'settings':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? "bg-purple-500/10 text-white shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <div className={`transition-all duration-300 group-hover:scale-110 ${active ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-gray-500 group-hover:text-purple-400"}`}>
        {renderIcon()}
      </div>
      <span className={`font-medium text-sm transition-colors duration-300 ${active ? "font-bold" : ""}`}>{label}</span>
      
      {/* Background hover effect */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
      )}
    </Link>
  );
}
