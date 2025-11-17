import { Button } from "@/components/ui/button";
import { Shield, Bell, Settings, User } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">SME Cyber</span>
            <span className="text-xs text-muted-foreground">Command Center</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </a>
          <a href="#vendors" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Vendors
          </a>
          <a href="#compliance" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Compliance
          </a>
          <a href="#reports" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Reports
          </a>
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
