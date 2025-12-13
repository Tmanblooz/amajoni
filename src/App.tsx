import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AmajoniLayout } from "@/components/amajoniid/AmajoniLayout";
import { AmajoniProvider } from "@/contexts/AmajoniContext";

// AmajoniID Pages
import Dashboard from "./pages/amajoniid/Dashboard";
import ShadowAccess from "./pages/amajoniid/ShadowAccess";
import SOCAlerts from "./pages/amajoniid/SOCAlerts";
import FinanceShield from "./pages/amajoniid/FinanceShield";
import AlertSettings from "./pages/amajoniid/AlertSettings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AmajoniProvider>
          <Routes>
            {/* Redirect root to AmajoniID dashboard */}
            <Route path="/" element={<Navigate to="/amajoniid" replace />} />
            
            {/* AmajoniID Routes */}
            <Route
              path="/amajoniid"
              element={
                <AmajoniLayout>
                  <Dashboard />
                </AmajoniLayout>
              }
            />
            <Route
              path="/amajoniid/shadow-access"
              element={
                <AmajoniLayout>
                  <ShadowAccess />
                </AmajoniLayout>
              }
            />
            <Route
              path="/amajoniid/soc-alerts"
              element={
                <AmajoniLayout>
                  <SOCAlerts />
                </AmajoniLayout>
              }
            />
            <Route
              path="/amajoniid/finance-shield"
              element={
                <AmajoniLayout>
                  <FinanceShield />
                </AmajoniLayout>
              }
            />
            <Route
              path="/amajoniid/settings"
              element={
                <AmajoniLayout>
                  <AlertSettings />
                </AmajoniLayout>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AmajoniProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
