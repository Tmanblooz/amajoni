import { Eye, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShadowApp {
  id: string;
  name: string;
  riskLevel: "low" | "medium" | "high";
  user: string;
  permissions: string[];
}

const mockApps: ShadowApp[] = [
  {
    id: "1",
    name: "Sketchy PDF Converter",
    riskLevel: "high",
    user: "john.doe@company.co.za",
    permissions: ["Read emails", "Access files", "Send on behalf"],
  },
  {
    id: "2",
    name: "Candy Crush",
    riskLevel: "low",
    user: "sarah.smith@company.co.za",
    permissions: ["Basic profile"],
  },
  {
    id: "3",
    name: "Unknown File Sharing Tool",
    riskLevel: "high",
    user: "admin@company.co.za",
    permissions: ["Full access", "Admin rights"],
  },
  {
    id: "4",
    name: "Weather Widget",
    riskLevel: "low",
    user: "john.doe@company.co.za",
    permissions: ["Location"],
  },
];

export default function ShadowAccess() {
  const handleRevoke = (appName: string) => {
    toast.success(`Access revoked for ${appName}`);
  };

  const riskBadge = (level: ShadowApp["riskLevel"]) => {
    const styles = {
      low: "bg-status-safe/20 text-status-safe",
      medium: "bg-status-warning/20 text-status-warning",
      high: "bg-status-danger/20 text-status-danger",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${styles[level]}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Eye className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shadow Access</h1>
          <p className="text-muted-foreground">Connected third-party applications</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">App Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Risk Level</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Permissions</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockApps.map((app) => (
              <tr key={app.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-foreground">{app.name}</span>
                </td>
                <td className="px-6 py-4">{riskBadge(app.riskLevel)}</td>
                <td className="px-6 py-4 text-muted-foreground">{app.user}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {app.permissions.map((perm, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                        {perm}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(app.name)}
                    className="gap-2 border-status-danger/30 text-status-danger hover:bg-status-danger/10"
                  >
                    <Ban className="h-4 w-4" />
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
