import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIRecommendationsProps {
  securityData: {
    totalRiskScore: number;
    internalPostureScore: number;
    vendorRiskScore: number;
    pillars: Array<{ title: string; score: number; issues: number }>;
    currentActions: Array<{ title: string; description: string }>;
  };
}

interface Recommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  reasoning: string;
}

const AIRecommendations = ({ securityData }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { securityData }
      });

      if (error) throw error;

      // Parse the recommendations from the AI response
      const parsedRecommendations = JSON.parse(data.recommendations);
      setRecommendations(parsedRecommendations);
      
      toast({
        title: "Recommendations Generated",
        description: "AI has analyzed your security posture and provided recommendations.",
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-status-critical/10 text-status-critical';
      case 'medium': return 'bg-status-warning/10 text-status-warning';
      case 'low': return 'bg-status-healthy/10 text-status-healthy';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-status-healthy/10 text-status-healthy';
      case 'medium': return 'bg-status-warning/10 text-status-warning';
      case 'high': return 'bg-status-critical/10 text-status-critical';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription>
              Get intelligent, context-aware security recommendations
            </CardDescription>
          </div>
          <Button 
            onClick={generateRecommendations} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Click "Generate" to get AI-powered security recommendations tailored to your organization
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <div className="flex gap-2 shrink-0">
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                      <Badge className={getEffortColor(rec.effort)}>
                        {rec.effort} effort
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{rec.description}</p>
                  <p className="text-sm text-muted-foreground italic">
                    {rec.reasoning}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
