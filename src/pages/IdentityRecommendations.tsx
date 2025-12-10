import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, Smartphone, Key, Lock, Shield, FileCheck } from "lucide-react";
import { useRecommendations } from "@/hooks/useMockApi";
import { RecommendationCard } from "@/components/identity/RecommendationCard";
import { toast } from "sonner";

const categoryConfig = {
  mfa: { icon: Smartphone, label: 'MFA', color: 'text-primary' },
  password: { icon: Key, label: 'Password', color: 'text-status-warning' },
  access: { icon: Lock, label: 'Access Control', color: 'text-status-critical' },
  device: { icon: Shield, label: 'Device', color: 'text-status-info' },
  policy: { icon: FileCheck, label: 'Policy', color: 'text-grade-b' },
};

export default function IdentityRecommendations() {
  const { data: recommendations, loading, executeAction } = useRecommendations();

  const handleExecute = async (id: string) => {
    const success = await executeAction(id);
    if (success) {
      toast.success('Action executed successfully');
    }
    return success;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (!recommendations) return null;

  // Group by category
  const groupedByCategory = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, typeof recommendations>);

  // Group by impact
  const highImpact = recommendations.filter(r => r.impactLevel === 'high');
  const mediumImpact = recommendations.filter(r => r.impactLevel === 'medium');
  const lowImpact = recommendations.filter(r => r.impactLevel === 'low');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
        <p className="text-muted-foreground">
          Actionable security improvements for your organization
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">Available improvements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-critical">{highImpact.length}</div>
            <p className="text-xs text-muted-foreground">Priority actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{mediumImpact.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-info">{lowImpact.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* High Impact Section */}
      {highImpact.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-status-critical" />
            High Impact Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {highImpact.map(rec => (
              <RecommendationCard 
                key={rec.id} 
                recommendation={rec} 
                onExecute={handleExecute}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medium Impact Section */}
      {mediumImpact.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-status-warning" />
            Medium Impact Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mediumImpact.map(rec => (
              <RecommendationCard 
                key={rec.id} 
                recommendation={rec} 
                onExecute={handleExecute}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Impact Section */}
      {lowImpact.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-status-info" />
            Low Impact Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {lowImpact.map(rec => (
              <RecommendationCard 
                key={rec.id} 
                recommendation={rec} 
                onExecute={handleExecute}
              />
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-status-healthy mb-4" />
            <h3 className="text-lg font-semibold">All caught up!</h3>
            <p className="text-muted-foreground">No pending recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
