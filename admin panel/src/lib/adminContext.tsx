"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Centre } from "./types";
import { MOCK_CENTRES } from "./mockAdminData";
import { api } from "./api";

interface AdminContextType {
  centres: Centre[];
  currentCentre: Centre;
  selectedCentreId: string;
  setSelectedCentreId: (id: string) => void;
  backendOnline: boolean | null;
  refreshCentres: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [centres, setCentres] = useState<Centre[]>(MOCK_CENTRES);
  const [selectedCentreId, setSelectedCentreIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_centre_id") || MOCK_CENTRES[0].id;
    }
    return MOCK_CENTRES[0].id;
  });
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const refreshCentres = async () => {
    try {
      const data = await api.getCentres();
      if (data && data.length > 0) {
        setCentres(data);
        if (!data.some((c) => c.id === selectedCentreId)) {
          setSelectedCentreIdState(data[0].id);
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_centre_id", data[0].id);
          }
        }
      }
    } catch {
      // Keep fallback
    }
  };

  const setSelectedCentreId = (id: string) => {
    setSelectedCentreIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_centre_id", id);
    }
  };

  useEffect(() => {
    refreshCentres();

    // Check backend health
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    fetch(`${backendUrl}/health`)
      .then((res) => setBackendOnline(res.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  const currentCentre = centres.find((c) => c.id === selectedCentreId) || centres[0] || MOCK_CENTRES[0];

  return (
    <AdminContext.Provider
      value={{
        centres,
        currentCentre,
        selectedCentreId,
        setSelectedCentreId,
        backendOnline,
        refreshCentres,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
