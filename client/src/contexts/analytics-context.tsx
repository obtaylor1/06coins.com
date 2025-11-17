import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initGA as initGALib } from "@/lib/analytics";

interface AnalyticsContextType {
  isInitialized: boolean;
  isConfigured: boolean;
  measurementId: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  isInitialized: false,
  isConfigured: false,
  measurementId: null,
});

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID || null;
  const isConfigured = !!measurementId;

  useEffect(() => {
    const success = initGALib();
    setIsInitialized(success);
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        isInitialized,
        isConfigured,
        measurementId,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return context;
}
