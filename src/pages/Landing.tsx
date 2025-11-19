import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, BarChart3, Users, FileCheck } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">SecureWatch</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="default">
            Get Started
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Unified Cybersecurity Dashboard for African SMEs
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Monitor internal risks, vendor security, and POPIA compliance from one powerful platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card">
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Risk Scoring</h3>
            <p className="text-muted-foreground">
              Real-time risk assessment with color-coded scores for quick decision making
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Vendor Management</h3>
            <p className="text-muted-foreground">
              Track supplier security posture and manage third-party risks effectively
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <FileCheck className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">POPIA Compliance</h3>
            <p className="text-muted-foreground">
              Automated compliance reporting and documentation management
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
