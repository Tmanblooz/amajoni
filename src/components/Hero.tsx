import { Button } from "@/components/ui/button";
import { Shield, Lock, Users, Activity } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-card py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMy4zMTQtMi42ODYgNi02IDZzLTYtMi42ODYtNi02IDIuNjg2LTYgNi02IDYgMi42ODYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-secondary/20 p-4 backdrop-blur-sm">
              <Shield className="h-16 w-16 text-secondary" />
            </div>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl">
            SME Cyber Command Center
          </h1>
          
          <p className="mx-auto mb-8 max-w-3xl text-lg text-primary-foreground/90 sm:text-xl">
            Unified cybersecurity dashboard for African SMEs. Monitor internal risks, vendor security, 
            and POPIA compliance from one simple platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button size="lg" variant="secondary" className="text-base font-semibold">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-base font-semibold border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              View Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mx-auto max-w-4xl">
            <div className="rounded-xl bg-card/10 backdrop-blur-sm p-6 border border-primary-foreground/10">
              <Lock className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Internal Security</h3>
              <p className="text-sm text-primary-foreground/80">Monitor devices, users, and access controls</p>
            </div>
            
            <div className="rounded-xl bg-card/10 backdrop-blur-sm p-6 border border-primary-foreground/10">
              <Users className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Vendor Risk</h3>
              <p className="text-sm text-primary-foreground/80">Automated security scorecards for suppliers</p>
            </div>
            
            <div className="rounded-xl bg-card/10 backdrop-blur-sm p-6 border border-primary-foreground/10">
              <Activity className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">POPIA Compliance</h3>
              <p className="text-sm text-primary-foreground/80">Track compliance documentation and gaps</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
