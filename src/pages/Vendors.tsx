import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, AlertCircle, CheckCircle, TrendingDown, ExternalLink } from "lucide-react";

const Vendors = () => {
  const vendors = [
    {
      id: 1,
      name: "SupplierX Ltd",
      domain: "supplierx.co.za",
      score: 58,
      status: "warning",
      issues: 2,
      lastScan: "2 days ago",
      findings: ["Missing DMARC record", "Exposed port 3389"],
      contact: "security@supplierx.co.za"
    },
    {
      id: 2,
      name: "CloudHost SA",
      domain: "cloudhost.co.za",
      score: 85,
      status: "healthy",
      issues: 0,
      lastScan: "1 week ago",
      findings: [],
      contact: "admin@cloudhost.co.za"
    },
    {
      id: 3,
      name: "DataProvider Inc",
      domain: "dataprovider.com",
      score: 42,
      status: "critical",
      issues: 5,
      lastScan: "3 days ago",
      findings: ["No SSL certificate", "Missing SPF record", "Open ports detected", "No security headers", "Outdated TLS version"],
      contact: "info@dataprovider.com"
    },
    {
      id: 4,
      name: "TechServices Co",
      domain: "techservices.co.za",
      score: 78,
      status: "healthy",
      issues: 1,
      lastScan: "5 days ago",
      findings: ["Weak cipher suite"],
      contact: "support@techservices.co.za"
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === "healthy") return "text-status-healthy";
    if (status === "warning") return "text-status-warning";
    return "text-status-critical";
  };

  const getStatusBg = (status: string) => {
    if (status === "healthy") return "bg-status-healthy/10 text-status-healthy";
    if (status === "warning") return "bg-status-warning/10 text-status-warning";
    return "bg-status-critical/10 text-status-critical";
  };

  const getStatusIcon = (status: string) => {
    if (status === "healthy") return <CheckCircle className="h-4 w-4" />;
    if (status === "warning") return <AlertCircle className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Vendor Risk Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and assess third-party security posture
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name or domain..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Vendor List */}
        <div className="grid gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{vendor.name}</CardTitle>
                      <Badge variant="outline" className={getStatusBg(vendor.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(vendor.status)}
                          {vendor.status.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span>{vendor.domain}</span>
                      <span>•</span>
                      <span>{vendor.contact}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getStatusColor(vendor.status)}`}>
                      {vendor.score}
                    </div>
                    <p className="text-xs text-muted-foreground">Security Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className="font-medium">{vendor.issues} {vendor.issues === 1 ? 'issue' : 'issues'} found</span>
                  </div>
                  <Progress 
                    value={vendor.score} 
                    className={`h-2 ${vendor.score >= 81 ? "[&>div]:bg-status-healthy" : vendor.score >= 51 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-critical"}`}
                  />
                </div>

                {vendor.findings.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Key Findings:</h4>
                    <ul className="space-y-1">
                      {vendor.findings.map((finding, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-status-critical flex-shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Last scanned: {vendor.lastScan}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Rescan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Vendors;
