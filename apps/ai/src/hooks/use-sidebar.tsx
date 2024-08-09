// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2023-2024 Vercel, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const LOCAL_STORAGE_KEY = "sidebar";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SidebarContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const SidebarContext = createContext<SidebarContext | undefined>(undefined);

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const value = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (value) {
      setSidebarOpen(JSON.parse(value));
    }
    setLoading(false);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((value) => {
      const newState = !value;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, isLoading }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
