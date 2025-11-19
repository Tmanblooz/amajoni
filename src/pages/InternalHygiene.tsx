import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, XCircle, Clock } from "lucide-react";

interface PolicyChecklistItem {
  id: string;
  policy_name: string;
  policy_description: string | null;
  status: 'yes' | 'no' | 'pending' | 'uploaded';
  document_url: string | null;
  notes: string | null;
  attested_at: string | null;
}

const InternalHygiene = () => {
  const [policies, setPolicies] = useState<PolicyChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        setOrganizationId(profile.organization_id);
      }

      const { data, error } = await supabase
        .from('policy_checklist')
        .select('*')
        .order('policy_name');

      if (error) throw error;
      setPolicies((data || []) as PolicyChecklistItem[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading policies",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePolicyStatus = async (
    policyId: string,
    status: 'yes' | 'no' | 'pending' | 'uploaded',
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('policy_checklist')
        .update({
          status,
          notes,
          attested_by: user.id,
          attested_at: new Date().toISOString(),
        })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Policy updated",
        description: "Policy status has been saved",
      });

      fetchPolicies();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  };

  const handleFileUpload = async (policyId: string, file: File) => {
    if (!organizationId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Organization ID not found",
      });
      return;
    }

    setUploadingFile(policyId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${policyId}-${Date.now()}.${fileExt}`;
      const filePath = `${organizationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('policy-documents')
        .getPublicUrl(filePath);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('policy_checklist')
        .update({
          document_url: publicUrl,
          status: 'uploaded',
          attested_by: user.id,
          attested_at: new Date().toISOString(),
        })
        .eq('id', policyId);

      if (updateError) throw updateError;

      toast({
        title: "Document uploaded",
        description: "Policy document has been uploaded successfully",
      });

      fetchPolicies();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploadingFile(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'yes':
      case 'uploaded':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'no':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Internal Hygiene & Policy Checklist</h1>
        <p className="text-muted-foreground mt-2">
          Complete your POPIA compliance checklist by attesting to policies or uploading documents
        </p>
      </div>

      <div className="grid gap-6">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(policy.status)}
                    {policy.policy_name}
                  </CardTitle>
                  {policy.policy_description && (
                    <CardDescription className="mt-2">
                      {policy.policy_description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <RadioGroup
                  value={policy.status}
                  onValueChange={(value) =>
                    updatePolicyStatus(policy.id, value as any)
                  }
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${policy.id}-yes`} />
                    <Label htmlFor={`${policy.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${policy.id}-no`} />
                    <Label htmlFor={`${policy.id}-no`}>No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id={`${policy.id}-pending`} />
                    <Label htmlFor={`${policy.id}-pending`}>Pending</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor={`notes-${policy.id}`}>Notes (Optional)</Label>
                <Textarea
                  id={`notes-${policy.id}`}
                  placeholder="Add any additional notes..."
                  defaultValue={policy.notes || ''}
                  onBlur={(e) =>
                    e.target.value !== policy.notes &&
                    updatePolicyStatus(policy.id, policy.status, e.target.value)
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Upload Document</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="file"
                    id={`file-${policy.id}`}
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(policy.id, file);
                    }}
                    disabled={uploadingFile === policy.id}
                    className="flex-1"
                  />
                  {uploadingFile === policy.id && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                </div>
                {policy.document_url && (
                  <Button
                    variant="link"
                    className="mt-2 p-0 h-auto"
                    onClick={() => window.open(policy.document_url!, '_blank')}
                  >
                    View uploaded document
                  </Button>
                )}
              </div>

              {policy.attested_at && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(policy.attested_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InternalHygiene;