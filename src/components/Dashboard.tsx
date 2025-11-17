import RiskScoreCard from "./RiskScoreCard";
import PillarCard from "./PillarCard";
import ActionItem from "./ActionItem";
import { Shield, Users, Lock, FileText, Cloud, GraduationCap } from "lucide-react";

const Dashboard = () => {
  // Mock data based on the specifications
  const totalRiskScore = 68;
  const internalPostureScore = 72;
  const vendorRiskScore = 64;

  const pillars = [
    { title: "Identity + Access", score: 65, weight: 25, icon: Lock, issues: 3 },
    { title: "Devices", score: 78, weight: 25, icon: Shield, issues: 2 },
    { title: "Policies + Governance", score: 55, weight: 20, icon: FileText, issues: 4 },
    { title: "Network + Cloud", score: 82, weight: 15, icon: Cloud, issues: 1 },
    { title: "People + Awareness", score: 70, weight: 15, icon: GraduationCap, issues: 2 },
  ];

  const priorityActions = [
    {
      priority: 1,
      title: "Enable MFA for 12 Users",
      description: "3 admin accounts and 9 regular users lack multi-factor authentication",
      impact: "high" as const,
      effort: "low" as const
    },
    {
      priority: 2,
      title: "Upload PAIA Manual",
      description: "Required POPIA compliance document is missing",
      impact: "high" as const,
      effort: "low" as const
    },
    {
      priority: 3,
      title: "Patch 5 Non-Compliant Devices",
      description: "Critical security updates available for laptops and workstations",
      impact: "high" as const,
      effort: "medium" as const
    },
    {
      priority: 4,
      title: "Review Vendor: SupplierX Ltd",
      description: "External scan shows missing DMARC record and exposed port 3389",
      impact: "medium" as const,
      effort: "medium" as const
    },
    {
      priority: 5,
      title: "Schedule Security Training",
      description: "No training materials configured for staff awareness",
      impact: "medium" as const,
      effort: "low" as const
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Total Risk Score */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Your Security Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RiskScoreCard 
              score={totalRiskScore}
              title="Total Risk Score"
              description="Combined internal and external security posture"
            />
            <RiskScoreCard 
              score={internalPostureScore}
              title="Internal Posture"
              description="Your organization's internal security health"
            />
            <RiskScoreCard 
              score={vendorRiskScore}
              title="Vendor Risk"
              description="Third-party and supplier security assessment"
            />
          </div>
        </div>

        {/* 5 Pillars */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Security Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pillars.map((pillar) => (
              <PillarCard key={pillar.title} {...pillar} />
            ))}
          </div>
        </div>

        {/* Top 5 Priority Actions */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Top 5 Priority Actions</h2>
            <p className="text-muted-foreground">
              Automatically prioritized by impact and effort. Complete these to improve your score.
            </p>
          </div>
          <div className="space-y-4">
            {priorityActions.map((action) => (
              <ActionItem key={action.priority} {...action} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
