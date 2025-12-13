import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ShieldAlert, Bell, Wallet, RotateCcw, Zap, ChevronDown, Plane, Lock, Eye, Smartphone, Fish, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAmajoni } from "@/contexts/AmajoniContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface AmajoniLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/amajoniid", label: "Dashboard", icon: LayoutDashboard },
  { path: "/amajoniid/shadow-access", label: "Access & Shadow IT", icon: ShieldAlert },
  { path: "/amajoniid/soc-alerts", label: "SOC Alerts", icon: Bell },
  { path: "/amajoniid/finance-shield", label: "FinanceShield", icon: Wallet },
  { path: "/amajoniid/settings", label: "Alert Settings", icon: Settings },
];

export function AmajoniLayout({ children }: AmajoniLayoutProps) {
  const location = useLocation();
  const { 
    simulateTheft, 
    simulateImpossibleTravel, 
    simulateBruteForce, 
    simulateShadowApp, 
    simulateSIMSwap, 
    simulatePhishing,
    resetSystem, 
    isUnderAttack,
    threatType 
  } = useAmajoni();

  const scenarios = [
    { label: "💰 Financial Theft (R20k)", action: simulateTheft, icon: Zap, description: "TymeBank unauthorized transaction" },
    { label: "✈️ Impossible Travel", action: simulateImpossibleTravel, icon: Plane, description: "Login from 2 countries in 15 min" },
    { label: "🔐 Brute Force Attack", action: simulateBruteForce, icon: Lock, description: "47 failed login attempts" },
    { label: "👁️ Malicious Shadow App", action: simulateShadowApp, icon: Eye, description: "Risky OAuth app permissions" },
    { label: "📱 SIM Swap Attack", action: simulateSIMSwap, icon: Smartphone, description: "CEO phone number hijacked" },
    { label: "🎣 Phishing Success", action: simulatePhishing, icon: Fish, description: "Employee credentials stolen" },
  ];

  return (
    <div className="min-h-screen flex bg-background dark">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isUnderAttack ? "bg-status-danger/20" : "bg-primary/10"}`}>
              <Shield className={`h-8 w-8 ${isUnderAttack ? "text-status-danger animate-pulse" : "text-primary"}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AmajoniID</h1>
              <p className={`text-xs ${isUnderAttack ? "text-status-danger" : "text-muted-foreground"}`}>
                {isUnderAttack ? `⚠️ ${threatType}` : "Cyber Defense"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const hasAlert = isUnderAttack && item.path === "/amajoniid/soc-alerts";
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                } ${hasAlert ? "animate-pulse bg-status-danger/10 border-status-danger/30" : ""}`}
              >
                <item.icon className={`h-5 w-5 ${hasAlert ? "text-status-danger" : ""}`} />
                <span className="font-medium">{item.label}</span>
                {hasAlert && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-status-danger animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">AD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@company.co.za</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 pb-24">
        <div className="p-8">{children}</div>
      </main>

      {/* Developer Controls Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 border-t p-4 z-50 transition-all duration-300 ${
        isUnderAttack ? "bg-status-danger/10 border-status-danger/50" : "bg-card border-border"
      }`}>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">
            {isUnderAttack ? `⚠️ THREAT: ${threatType}` : "Demo Controls:"}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetSystem}
            className="gap-2 border-status-safe/30 text-status-safe hover:bg-status-safe/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset System
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isUnderAttack}
                className="gap-2 border-status-danger/30 text-status-danger hover:bg-status-danger/10 disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                Simulate Attack
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Choose Attack Scenario</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {scenarios.map((scenario, index) => (
                <DropdownMenuItem 
                  key={index}
                  onClick={scenario.action}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                >
                  <span className="font-medium">{scenario.label}</span>
                  <span className="text-xs text-muted-foreground">{scenario.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>
    </div>
  );
}
