import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Calendar, TrendingUp, TrendingDown, FileText, Share2 } from "lucide-react";

const Reports = () => {
  const reports = [
    {
      id: 1,
      title: "Monthly Security Summary",
      type: "Executive",
      date: "2024-03-01",
      status: "ready",
      trend: "up",
      highlights: "3 critical issues resolved, overall score +8 points"
    },
    {
      id: 2,
      title: "Vendor Risk Assessment",
      type: "Detailed",
      date: "2024-03-05",
      status: "ready",
      trend: "down",
      highlights: "2 new vendors with critical findings"
    },
    {
      id: 3,
      title: "POPIA Compliance Audit",
      type: "Compliance",
      date: "2024-02-28",
      status: "ready",
      trend: "up",
      highlights: "Compliance score improved to 68%"
    },
    {
      id: 4,
      title: "Q1 2024 Security Review",
      type: "Quarterly",
      date: "2024-03-31",
      status: "pending",
      trend: null,
      highlights: "Will be available after quarter end"
    },
  ];

  const quickStats = [
    { label: "Total Reports", value: "24", change: "+4 this month" },
    { label: "Critical Findings", value: "7", change: "-3 from last month" },
    { label: "Compliance Score", value: "68%", change: "+5% improvement" },
    { label: "Vendor Assessments", value: "12", change: "All up to date" },
  ];

  const scheduledReports = [
    { name: "Weekly Security Digest", frequency: "Weekly", nextRun: "Monday 9:00 AM" },
    { name: "Monthly Executive Summary", frequency: "Monthly", nextRun: "1st of month" },
    { name: "Vendor Risk Updates", frequency: "Bi-weekly", nextRun: "Every 2nd Friday" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Generate and download security and compliance reports
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Custom Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{report.title}</h3>
                        <Badge variant="outline">{report.type}</Badge>
                        {report.status === "ready" ? (
                          <Badge className="bg-status-healthy/20 text-status-healthy">Ready</Badge>
                        ) : (
                          <Badge className="bg-muted/50 text-muted-foreground">Pending</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {report.date}
                        </span>
                        {report.trend && (
                          <span className={`flex items-center gap-1 ${report.trend === 'up' ? 'text-status-healthy' : 'text-status-critical'}`}>
                            {report.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {report.highlights}
                          </span>
                        )}
                        {!report.trend && (
                          <span>{report.highlights}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" disabled={report.status !== "ready"}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={report.status !== "ready"}>
                      View
                    </Button>
                    <Button size="sm" disabled={report.status !== "ready"}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scheduled Reports</CardTitle>
              <Button variant="outline" size="sm">Manage Schedule</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map((schedule) => (
                <div key={schedule.name} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{schedule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Frequency: {schedule.frequency} • Next run: {schedule.nextRun}
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
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

export default Reports;
