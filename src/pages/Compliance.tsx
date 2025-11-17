import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle2, XCircle, AlertCircle, Upload, Download, Clock } from "lucide-react";

const Compliance = () => {
  const documents = [
    { 
      id: 1,
      name: "PAIA Manual", 
      status: "complete", 
      required: true,
      lastUpdated: "2024-01-15",
      nextReview: "2025-01-15",
      owner: "Legal Team"
    },
    { 
      id: 2,
      name: "Data Processing Agreement", 
      status: "missing", 
      required: true,
      lastUpdated: null,
      nextReview: "Overdue",
      owner: "Compliance Officer"
    },
    { 
      id: 3,
      name: "Security Policies", 
      status: "complete", 
      required: true,
      lastUpdated: "2024-02-20",
      nextReview: "2024-08-20",
      owner: "IT Security"
    },
    { 
      id: 4,
      name: "Incident Response Plan", 
      status: "partial", 
      required: true,
      lastUpdated: "2023-11-10",
      nextReview: "2024-05-10",
      owner: "IT Security"
    },
    { 
      id: 5,
      name: "Privacy Notice", 
      status: "complete", 
      required: false,
      lastUpdated: "2024-03-01",
      nextReview: "2025-03-01",
      owner: "Legal Team"
    },
    { 
      id: 6,
      name: "Vendor Contracts", 
      status: "partial", 
      required: false,
      lastUpdated: "2024-01-20",
      nextReview: "2024-07-20",
      owner: "Procurement"
    },
  ];

  const complianceAreas = [
    { name: "Data Protection", score: 75, requirements: 12, completed: 9 },
    { name: "Access Control", score: 82, requirements: 8, completed: 7 },
    { name: "Documentation", score: 58, requirements: 10, completed: 6 },
    { name: "Training", score: 45, requirements: 6, completed: 3 },
  ];

  const getStatusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle2 className="h-5 w-5 text-status-healthy" />;
    if (status === "partial") return <AlertCircle className="h-5 w-5 text-status-warning" />;
    return <XCircle className="h-5 w-5 text-status-critical" />;
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">POPIA Compliance</h1>
            <p className="text-muted-foreground mt-1">
              Track compliance documentation and regulatory requirements
            </p>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Overall Compliance Score */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Overall Compliance</h3>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-5xl font-bold">{complianceScore}%</span>
                    <span className="text-muted-foreground mb-2">compliant</span>
                  </div>
                  <Progress 
                    value={complianceScore} 
                    className={`h-3 ${complianceScore >= 81 ? "[&>div]:bg-status-healthy" : complianceScore >= 51 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-critical"}`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-status-healthy">{completeDocs}</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-status-warning">
                      {requiredDocs.filter(d => d.status === "partial").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Partial</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-status-critical">
                      {requiredDocs.filter(d => d.status === "missing").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Missing</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-3">Compliance Areas</h3>
                {complianceAreas.map((area) => (
                  <div key={area.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{area.name}</span>
                      <span className="text-muted-foreground">
                        {area.completed}/{area.requirements} requirements
                      </span>
                    </div>
                    <Progress 
                      value={area.score} 
                      className={`h-2 ${area.score >= 81 ? "[&>div]:bg-status-healthy" : area.score >= 51 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-critical"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{doc.name}</p>
                        {doc.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Owner: {doc.owner}
                        </span>
                        {doc.lastUpdated && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Updated: {doc.lastUpdated}
                          </span>
                        )}
                        <span className={doc.nextReview === "Overdue" ? "text-status-critical font-medium" : ""}>
                          Next review: {doc.nextReview}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    {doc.status !== "missing" && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant={doc.status === "missing" ? "default" : "outline"} size="sm">
                      {doc.status === "missing" ? "Upload" : "Update"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Compliance;
