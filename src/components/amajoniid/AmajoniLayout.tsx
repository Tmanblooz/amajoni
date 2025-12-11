import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ShieldAlert, Bell, Wallet, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAmajoni } from "@/contexts/AmajoniContext";

interface AmajoniLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/amajoniid", label: "Dashboard", icon: LayoutDashboard },
  { path: "/amajoniid/shadow-access", label: "Access & Shadow IT", icon: ShieldAlert },
  { path: "/amajoniid/soc-alerts", label: "SOC Alerts", icon: Bell },
  { path: "/amajoniid/finance-shield", label: "FinanceShield", icon: Wallet },
];

export function AmajoniLayout({ children }: AmajoniLayoutProps) {
  const location = useLocation();
  const { simulateTheft, resetSystem, isUnderAttack } = useAmajoni();

  return (
    <div className="min-h-screen flex bg-background dark">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AmajoniID</h1>
              <p className="text-xs text-muted-foreground">Cyber Defense</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
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
      <main className="flex-1 ml-64 pb-20">
        <div className="p-8">{children}</div>
      </main>

      {/* Developer Controls Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 border-t p-4 z-50 transition-colors ${
        isUnderAttack ? "bg-status-danger/10 border-status-danger/50" : "bg-card border-border"
      }`}>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">
            {isUnderAttack ? "⚠️ THREAT ACTIVE" : "Developer Controls:"}
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
          <Button
            variant="outline"
            size="sm"
            onClick={simulateTheft}
            disabled={isUnderAttack}
            className="gap-2 border-status-danger/30 text-status-danger hover:bg-status-danger/10 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Simulate Theft (R20k)
          </Button>
        </div>
      </footer>
    </div>
  );
}
