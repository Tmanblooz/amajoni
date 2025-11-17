import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface POPIAReportGeneratorProps {
  complianceData: {
    score: number;
    documents: Array<{ name: string; status: string; required: boolean }>;
  };
  securityData: {
    totalRiskScore: number;
    internalPostureScore: number;
    vendorRiskScore: number;
    pillars: Array<{ title: string; score: number }>;
  };
}

const POPIAReportGenerator = ({ complianceData, securityData }: POPIAReportGeneratorProps) => {
  const [report, setReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-popia-report', {
        body: { complianceData, securityData }
      });

      if (error) throw error;

      setReport(data.report);
      setShowReport(true);
      
      toast({
        title: "Report Generated",
        description: "Your POPIA compliance report is ready.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POPIA_Compliance_Report_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Report downloaded successfully.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            POPIA Compliance Report
          </CardTitle>
          <CardDescription>
            Generate comprehensive compliance report for stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateReport} 
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate POPIA Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>POPIA Compliance Report</DialogTitle>
            <DialogDescription>
              AI-generated comprehensive compliance assessment
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {report}
              </pre>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReport(false)}>
              Close
            </Button>
            <Button onClick={downloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default POPIAReportGenerator;
