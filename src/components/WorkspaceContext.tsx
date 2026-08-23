"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Workspace = {
  id: number;
  name: string;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  activeWorkspaceId: number;
  setActiveWorkspaceId: (id: number) => void;
  fetchWorkspaces: () => void;
  createWorkspace: (name: string) => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<number>(1);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('http://localhost:8000/workspaces');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    const savedId = localStorage.getItem('activeWorkspaceId');
    if (savedId) {
      setActiveWorkspaceIdState(parseInt(savedId));
    }
  }, []);

  const setActiveWorkspaceId = (id: number) => {
    setActiveWorkspaceIdState(id);
    localStorage.setItem('activeWorkspaceId', id.toString());
    // Dispatch a custom event so non-react scopes could potentially listen, or just force reload if preferred
    // For now, state updates will trigger re-renders for consumers of the context
  };

  const createWorkspace = async (name: string) => {
    try {
      const res = await fetch('http://localhost:8000/workspaces', {
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
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspaceId, setActiveWorkspaceId, fetchWorkspaces, createWorkspace }}>
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
