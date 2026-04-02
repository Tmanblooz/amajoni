import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ShieldAlert, Bell, Wallet, RotateCcw, Zap, ChevronDown, ChevronLeft, ChevronRight, Plane, Lock, Eye, Smartphone, Fish, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAmajoni } from "@/contexts/AmajoniContext";
import { simulateAttack, resetSystem as apiResetSystem } from "@/hooks/useAmajoniApi";
import { motion, AnimatePresence } from "framer-motion";
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
  const [collapsed, setCollapsed] = useState(false);
  const { 
    simulateTheft, simulateImpossibleTravel, simulateBruteForce, 
    simulateShadowApp, simulateSIMSwap, simulatePhishing,
    resetSystem, isUnderAttack, threatType 
  } = useAmajoni();

  const handleSimulate = async (scenario: string, fallbackAction: () => void) => {
    const success = await simulateAttack(scenario);
    if (!success) fallbackAction();
  };

  const handleReset = async () => {
    const success = await apiResetSystem();
    if (!success) resetSystem();
  };

  const scenarios = [
    { label: "💰 Financial Theft (R20k)", scenario: "financial_theft", fallback: simulateTheft, icon: Zap, description: "TymeBank unauthorized transaction" },
    { label: "✈️ Impossible Travel", scenario: "impossible_travel", fallback: simulateImpossibleTravel, icon: Plane, description: "Login from 2 countries in 15 min" },
    { label: "🔐 Brute Force Attack", scenario: "brute_force", fallback: simulateBruteForce, icon: Lock, description: "47 failed login attempts" },
    { label: "👁️ Malicious Shadow App", scenario: "shadow_app", fallback: simulateShadowApp, icon: Eye, description: "Risky OAuth app permissions" },
    { label: "📱 SIM Swap Attack", scenario: "sim_swap", fallback: simulateSIMSwap, icon: Smartphone, description: "CEO phone number hijacked" },
    { label: "🎣 Phishing Success", scenario: "phishing", fallback: simulatePhishing, icon: Fish, description: "Employee credentials stolen" },
  ];

  const sidebarWidth = collapsed ? "w-20" : "w-64";
  const mainMargin = collapsed ? "ml-20" : "ml-64";

  return (
    <div className="min-h-screen flex bg-background dark">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-card border-r border-border flex flex-col transition-all duration-300 z-40`}>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors shrink-0 ${isUnderAttack ? "bg-status-danger/20" : "bg-primary/10"}`}>
              <Shield className={`h-7 w-7 ${isUnderAttack ? "text-status-danger animate-pulse" : "text-primary"}`} />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-lg font-bold text-foreground">AmajoniID</h1>
                <p className={`text-xs ${isUnderAttack ? "text-status-danger" : "text-muted-foreground"}`}>
                  {isUnderAttack ? `⚠️ ${threatType}` : "Cyber Defense"}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* System Status */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isUnderAttack ? "bg-status-danger animate-pulse" : "bg-status-safe"}`} />
              <span className="text-xs text-muted-foreground">
                {isUnderAttack ? "Threat Active" : "All Systems Normal"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const hasAlert = isUnderAttack && item.path === "/amajoniid/soc-alerts";
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                } ${hasAlert ? "animate-pulse bg-status-danger/10 border-status-danger/30" : ""}`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${hasAlert ? "text-status-danger" : ""}`} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
                {hasAlert && !collapsed && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-status-danger animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-3 p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-sm">AD</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@company.co.za</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${mainMargin} pb-24 transition-all duration-300`}>
        <div className="p-8">{children}</div>
      </main>

      {/* Developer Controls Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 border-t p-3 z-50 transition-all duration-300 ${
        isUnderAttack ? "bg-status-danger/10 border-status-danger/50" : "bg-card border-border"
      }`}>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">
            {isUnderAttack ? `⚠️ THREAT: ${threatType}` : "Demo Controls:"}
          </span>
          
          <Button variant="outline" size="sm" onClick={handleReset}
            className="gap-2 border-status-safe/30 text-status-safe hover:bg-status-safe/10">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isUnderAttack}
                className="gap-2 border-status-danger/30 text-status-danger hover:bg-status-danger/10 disabled:opacity-50">
                <Zap className="h-4 w-4" /> Simulate
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Choose Attack Scenario</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {scenarios.map((s, index) => (
                <DropdownMenuItem key={index}
                  onClick={() => handleSimulate(s.scenario, s.fallback)}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>
    </div>
  );
}
