import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_NAME = "amajoniid-api";

interface DashboardData {
  riskScore: number;
  grade: string;
  activeAlerts: number;
  shadowApps: number;
  devicesSecure: string;
  lastScan: string;
  isUnderAttack: boolean;
  threatType?: string;
  mfaPercentage?: number;
  totalUsers?: number;
  failedLogins?: number;
  inactiveAccounts?: number;
}

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  timestamp: Date;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic fetch with error handling using Supabase Edge Functions
async function apiFetch<T>(endpoint: string, options?: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; body?: any }): Promise<T> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    method: options?.method || 'POST',
    body: { path: endpoint, ...options?.body },
  });
  
  if (error) {
    throw new Error(error.message || 'API error');
  }
  
  return data as T;
}

// Dashboard data hook with polling
export function useDashboardData(pollInterval = 2000) {
  const [state, setState] = useState<ApiState<DashboardData>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const data = await apiFetch<DashboardData>("/dashboard");
      setState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard data";
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      // Only show toast on initial error, not on every poll
      if (state.data === null) {
        toast.error("Backend error", { 
          description: "Could not fetch dashboard data. Using fallback data.",
          duration: 5000,
        });
      }
    }
  }, [state.data]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return state;
}

// Alerts data hook with polling
export function useAlertsData(pollInterval = 2000) {
  const [state, setState] = useState<ApiState<Alert[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const data = await apiFetch<Alert[]>("/alerts");
      // Convert timestamp strings to Date objects
      const alerts = data.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }));
      setState({ data: alerts, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch alerts";
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return { ...state, refetch: fetchData };
}

// Simulate attack action
export async function simulateAttack(scenario: string): Promise<boolean> {
  try {
    await apiFetch("/simulate", {
      method: "POST",
      body: { scenario },
    });
    toast.success("Simulation triggered", { description: `Scenario: ${scenario}` });
    return true;
  } catch (error) {
    toast.error("Simulation failed", { 
      description: "Could not connect to backend.",
    });
    return false;
  }
}

// Reset system action
export async function resetSystem(): Promise<boolean> {
  try {
    await apiFetch("/reset", { method: "POST" });
    toast.success("System reset", { description: "All simulations cleared" });
    return true;
  } catch (error) {
    toast.error("Reset failed", { 
      description: "Could not connect to backend.",
    });
    return false;
  }
}
