"use client";

import { API } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Workspace = {
  id: number;
  name: string;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  activeWorkspaceId: number;
  /** True once ownership has been resolved against the signed-in user's real profiles. */
  workspacesLoaded: boolean;
  setActiveWorkspaceId: (id: number) => void;
  fetchWorkspaces: () => void;
  createWorkspace: (name: string) => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// 0 means "not yet resolved, or the signed-in user owns no profiles" -- workspace ids
// from the backend start at 1, so 0 can never collide with a real one.
const NO_WORKSPACE = 0;

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<number>(NO_WORKSPACE);
  const [workspacesLoaded, setWorkspacesLoaded] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`${API}/workspaces`);
      if (!res.ok) {
        // 401 while the session is still establishing, etc. Leave state as "not loaded"
        // so consumers keep waiting rather than fetching against workspace_id=0.
        return;
      }
      const data = await res.json();
      const list: Workspace[] = Array.isArray(data) ? data : [];
      setWorkspaces(list);

      // The previously active id can belong to a DIFFERENT signed-in user (a saved
      // localStorage value from another account on this browser, or the old
      // single-user default of "1") -- multi-tenancy means that id is not
      // automatically valid for whoever is signed in now. Only trust it if it is
      // actually in this user's own workspace list; otherwise fall back to the first
      // owned workspace, or to NO_WORKSPACE if they have none yet.
      const saved = localStorage.getItem('activeWorkspaceId');
      const savedId = saved ? parseInt(saved, 10) : NaN;
      const savedIsOwned = list.some(w => w.id === savedId);

      const resolved = savedIsOwned ? savedId : (list[0]?.id ?? NO_WORKSPACE);
      setActiveWorkspaceIdState(resolved);
      if (resolved !== NO_WORKSPACE) {
        localStorage.setItem('activeWorkspaceId', resolved.toString());
      } else {
        localStorage.removeItem('activeWorkspaceId');
      }
      setWorkspacesLoaded(true);
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const setActiveWorkspaceId = (id: number) => {
    setActiveWorkspaceIdState(id);
    localStorage.setItem('activeWorkspaceId', id.toString());
  };

  const createWorkspace = async (name: string) => {
    try {
      const res = await fetch(`${API}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newWs = await res.json();
        await fetchWorkspaces();
        setActiveWorkspaceId(newWs.id);
      }
    } catch (err) {
      console.error("Failed to create workspace", err);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspaceId, workspacesLoaded, setActiveWorkspaceId, fetchWorkspaces, createWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
