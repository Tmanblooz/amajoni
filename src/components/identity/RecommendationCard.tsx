import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, Key, Lock, Smartphone, FileCheck, 
  ArrowRight, Loader2, CheckCircle, Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Recommendation } from "@/hooks/useMockApi";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onExecute: (id: string) => Promise<boolean>;
}

const categoryConfig = {
  mfa: { icon: Smartphone, color: 'text-primary', bgColor: 'bg-primary/10' },
  password: { icon: Key, color: 'text-status-warning', bgColor: 'bg-status-warning/10' },
  access: { icon: Lock, color: 'text-status-critical', bgColor: 'bg-status-critical/10' },
  device: { icon: Shield, color: 'text-status-info', bgColor: 'bg-status-info/10' },
  policy: { icon: FileCheck, color: 'text-grade-b', bgColor: 'bg-grade-b/10' },
};

const impactConfig = {
  low: { color: 'text-status-info', bgColor: 'bg-status-info/10' },
  medium: { color: 'text-status-warning', bgColor: 'bg-status-warning/10' },
  high: { color: 'text-status-critical', bgColor: 'bg-status-critical/10' },
};

export function RecommendationCard({ recommendation, onExecute }: RecommendationCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const category = categoryConfig[recommendation.category];
  const impact = impactConfig[recommendation.impactLevel];
  const CategoryIcon = category.icon;

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const success = await onExecute(recommendation.id);
      if (success) {
        setIsComplete(true);
        setTimeout(() => {
          setIsDialogOpen(false);
        }, 1500);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="border-status-healthy/30 bg-status-healthy/5">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-status-healthy">
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium">Action completed successfully</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", category.bgColor)}>
                <CategoryIcon className={cn("h-5 w-5", category.color)} />
              </div>
              <div>
                <CardTitle className="text-base">{recommendation.title}</CardTitle>
                <Badge variant="outline" className={cn("mt-1", impact.bgColor, impact.color)}>
                  {recommendation.impactLevel} impact
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{recommendation.description}</p>
          
          {recommendation.affectedUsers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>
                Affects: {recommendation.affectedUsers.slice(0, 2).join(', ')}
                {recommendation.affectedUsers.length > 2 && ` +${recommendation.affectedUsers.length - 2} more`}
              </span>
            </div>
          )}

          <Button 
            className="w-full group"
            onClick={() => setIsDialogOpen(true)}
          >
            Take Action
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to execute this security action?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className={cn("p-4 rounded-lg", category.bgColor)}>
              <div className="flex items-center gap-3 mb-2">
                <CategoryIcon className={cn("h-5 w-5", category.color)} />
                <span className="font-medium">{recommendation.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
            
            {recommendation.affectedUsers.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Affected Users:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {recommendation.affectedUsers.map(user => (
                    <li key={user}>• {user}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isExecuting}>
              Cancel
            </Button>
            <Button onClick={handleExecute} disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                'Confirm Action'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
