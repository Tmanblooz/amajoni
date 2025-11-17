import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, TrendingDown } from "lucide-react";

const VendorRiskSection = () => {
  const vendors = [
    { name: "SupplierX Ltd", score: 58, status: "warning", issues: 2, lastScan: "2 days ago" },
    { name: "CloudHost SA", score: 85, status: "healthy", issues: 0, lastScan: "1 week ago" },
    { name: "DataProvider Inc", score: 42, status: "critical", issues: 5, lastScan: "3 days ago" },
    { name: "TechServices Co", score: 78, status: "healthy", issues: 1, lastScan: "5 days ago" },
  ];

  const getStatusColor = (status: string) => {
    if (status === "healthy") return "text-status-healthy";
    if (status === "warning") return "text-status-warning";
    return "text-status-critical";
  };

  const getStatusBg = (status: string) => {
    if (status === "healthy") return "bg-status-healthy/10";
    if (status === "warning") return "bg-status-warning/10";
    return "bg-status-critical/10";
  };

  const getStatusIcon = (status: string) => {
    if (status === "healthy") return <CheckCircle className="h-4 w-4" />;
    if (status === "warning") return <AlertCircle className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Risk Overview</CardTitle>
        <p className="text-sm text-muted-foreground">External security posture of your suppliers</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <div key={vendor.name} className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{vendor.name}</h4>
                  <div className={`flex items-center gap-1 ${getStatusColor(vendor.status)}`}>
                    {getStatusIcon(vendor.status)}
                    <span className="text-2xl font-bold">{vendor.score}</span>
                  </div>
                </div>
                <Progress 
                  value={vendor.score} 
                  className={`h-2 mb-2 ${vendor.score >= 81 ? "[&>div]:bg-status-healthy" : vendor.score >= 51 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-critical"}`}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last scan: {vendor.lastScan}</span>
                  <Badge variant="outline" className={getStatusBg(vendor.status)}>
                    {vendor.issues} {vendor.issues === 1 ? 'issue' : 'issues'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorRiskSection;
