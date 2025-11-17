import { Button } from "@/components/ui/button";
import { Shield, Bell, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">SME Cyber</span>
            <span className="text-xs text-muted-foreground">Command Center</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link 
            to="/vendors" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/vendors") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Vendors
          </Link>
          <Link 
            to="/compliance" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/compliance") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Compliance
          </Link>
          <Link 
            to="/reports" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/reports") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Reports
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-critical"></span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
