import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const ComplianceSection = () => {
  const documents = [
    { name: "PAIA Manual", status: "complete", required: true },
    { name: "Data Processing Agreement", status: "missing", required: true },
    { name: "Security Policies", status: "complete", required: true },
    { name: "Incident Response Plan", status: "partial", required: true },
    { name: "Privacy Notice", status: "complete", required: false },
    { name: "Vendor Contracts", status: "partial", required: false },
  ];

  const getStatusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle2 className="h-4 w-4 text-status-healthy" />;
    if (status === "partial") return <AlertCircle className="h-4 w-4 text-status-warning" />;
    return <XCircle className="h-4 w-4 text-status-critical" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "complete") return <Badge className="bg-status-healthy/20 text-status-healthy">Complete</Badge>;
    if (status === "partial") return <Badge className="bg-status-warning/20 text-status-warning">Partial</Badge>;
    return <Badge className="bg-status-critical/20 text-status-critical">Missing</Badge>;
  };

  const requiredDocs = documents.filter(d => d.required);
  const completeDocs = requiredDocs.filter(d => d.status === "complete").length;
  const complianceScore = Math.round((completeDocs / requiredDocs.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>POPIA Compliance</CardTitle>
            <p className="text-sm text-muted-foreground">Required documentation status</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{complianceScore}%</div>
            <p className="text-xs text-muted-foreground">Compliance</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  {doc.required && (
                    <p className="text-xs text-muted-foreground">Required</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(doc.status)}
                {getStatusBadge(doc.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceSection;
