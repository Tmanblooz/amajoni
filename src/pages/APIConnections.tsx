import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface APIConnection {
  id: string;
  provider: 'microsoft' | 'google' | 'jumpcloud';
  enabled: boolean;
  last_sync: string | null;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  error_message: string | null;
  config: Record<string, any>;
}

const APIConnections = () => {
  const [connections, setConnections] = useState<APIConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('api_connections')
        .select('*')
        .order('provider');

      if (error) throw error;

      // Initialize connections if they don't exist
      const providers = ['microsoft', 'google', 'jumpcloud'];
      const existingProviders = (data || []).map(c => c.provider);
      const missingProviders = providers.filter(p => !existingProviders.includes(p));

      if (missingProviders.length > 0) {
        const { data: profile } = await supabase.auth.getUser().then(async ({ data: { user } }) => {
          if (!user) return { data: null };
          return await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();
        });

        if (profile?.organization_id) {
          await supabase.from('api_connections').insert(
            missingProviders.map(provider => ({
              organization_id: profile.organization_id,
              provider,
              enabled: false,
            }))
          );
          fetchConnections();
          return;
        }
      }

      setConnections((data || []).map(item => ({
        ...item,
        provider: item.provider as 'microsoft' | 'google' | 'jumpcloud',
        sync_status: item.sync_status as 'pending' | 'syncing' | 'success' | 'error',
        config: item.config as Record<string, any>
      })));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading connections",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConnection = async (
    connectionId: string,
    updates: Partial<APIConnection>
  ) => {
    try {
      const { error } = await supabase
        .from('api_connections')
        .update(updates)
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection updated",
        description: "API connection has been updated successfully",
      });

      fetchConnections();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  };

  const triggerSync = async (connection: APIConnection, syncType: 'iam' | 'devices') => {
    setSyncing(`${connection.provider}-${syncType}`);

    try {
      const functionName = `sync-${connection.provider}-${syncType}`;

      const { data, error } = await supabase.functions.invoke(functionName);

      if (error) throw error;

      toast({
        title: "Sync completed",
        description: `${connection.provider} ${syncType} sync completed successfully`,
      });

      fetchConnections();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: error.message,
      });
    } finally {
      setSyncing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'syncing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'microsoft':
        return 'Microsoft (Azure AD / Intune)';
      case 'google':
        return 'Google Workspace';
      case 'jumpcloud':
        return 'JumpCloud';
      default:
        return provider;
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
        <h1 className="text-3xl font-bold">API Connections</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage API connections for IAM and device data synchronization
        </p>
      </div>

      <div className="grid gap-6">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(connection.sync_status)}
                    {getProviderName(connection.provider)}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {connection.last_sync
                      ? `Last synced: ${new Date(connection.last_sync).toLocaleString()}`
                      : 'Never synced'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`enabled-${connection.id}`}>Enabled</Label>
                  <Switch
                    id={`enabled-${connection.id}`}
                    checked={connection.enabled}
                    onCheckedChange={(checked) =>
                      updateConnection(connection.id, { enabled: checked })
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {connection.error_message && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {connection.error_message}
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Configure Credentials
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure {getProviderName(connection.provider)}</DialogTitle>
                    <DialogDescription>
                      Enter your API credentials for {connection.provider}
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const config: Record<string, any> = {};
                      
                      if (connection.provider === 'microsoft') {
                        config.client_id = formData.get('client_id');
                        config.client_secret = formData.get('client_secret');
                        config.tenant_id = formData.get('tenant_id');
                        config.access_token = formData.get('access_token');
                      } else if (connection.provider === 'google') {
                        config.client_id = formData.get('client_id');
                        config.client_secret = formData.get('client_secret');
                        config.access_token = formData.get('access_token');
                        config.domain = formData.get('domain');
                        config.customer_id = formData.get('customer_id');
                      } else if (connection.provider === 'jumpcloud') {
                        config.api_key = formData.get('api_key');
                        config.org_id = formData.get('org_id');
                      }

                      updateConnection(connection.id, { config });
                    }}
                    className="space-y-4"
                  >
                    {connection.provider === 'microsoft' && (
                      <>
                        <div>
                          <Label htmlFor="tenant_id">Tenant ID</Label>
                          <Input
                            id="tenant_id"
                            name="tenant_id"
                            defaultValue={connection.config?.tenant_id}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client_id">Client ID</Label>
                          <Input
                            id="client_id"
                            name="client_id"
                            defaultValue={connection.config?.client_id}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client_secret">Client Secret</Label>
                          <Input
                            id="client_secret"
                            name="client_secret"
                            type="password"
                            defaultValue={connection.config?.client_secret}
                            placeholder="Enter client secret"
                          />
                        </div>
                        <div>
                          <Label htmlFor="access_token">Access Token</Label>
                          <Input
                            id="access_token"
                            name="access_token"
                            type="password"
                            defaultValue={connection.config?.access_token}
                            placeholder="Bearer token for Graph API"
                          />
                        </div>
                      </>
                    )}

                    {connection.provider === 'google' && (
                      <>
                        <div>
                          <Label htmlFor="domain">Domain</Label>
                          <Input
                            id="domain"
                            name="domain"
                            defaultValue={connection.config?.domain}
                            placeholder="example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer_id">Customer ID</Label>
                          <Input
                            id="customer_id"
                            name="customer_id"
                            defaultValue={connection.config?.customer_id}
                            placeholder="my_customer or C01234567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client_id">Client ID</Label>
                          <Input
                            id="client_id"
                            name="client_id"
                            defaultValue={connection.config?.client_id}
                            placeholder="OAuth 2.0 Client ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client_secret">Client Secret</Label>
                          <Input
                            id="client_secret"
                            name="client_secret"
                            type="password"
                            defaultValue={connection.config?.client_secret}
                            placeholder="OAuth 2.0 Client Secret"
                          />
                        </div>
                        <div>
                          <Label htmlFor="access_token">Access Token</Label>
                          <Input
                            id="access_token"
                            name="access_token"
                            type="password"
                            defaultValue={connection.config?.access_token}
                            placeholder="OAuth access token"
                          />
                        </div>
                      </>
                    )}

                    {connection.provider === 'jumpcloud' && (
                      <>
                        <div>
                          <Label htmlFor="org_id">Organization ID</Label>
                          <Input
                            id="org_id"
                            name="org_id"
                            defaultValue={connection.config?.org_id}
                            placeholder="Your JumpCloud org ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor="api_key">API Key</Label>
                          <Input
                            id="api_key"
                            name="api_key"
                            type="password"
                            defaultValue={connection.config?.api_key}
                            placeholder="Your JumpCloud API key"
                          />
                        </div>
                      </>
                    )}

                    <DialogFooter>
                      <Button type="submit">Save Credentials</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {connection.enabled && connection.config && Object.keys(connection.config).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => triggerSync(connection, 'iam')}
                    disabled={syncing === `${connection.provider}-iam`}
                    variant="outline"
                  >
                    {syncing === `${connection.provider}-iam` && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {syncing === `${connection.provider}-iam` ? 'Syncing...' : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync IAM Users
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => triggerSync(connection, 'devices')}
                    disabled={syncing === `${connection.provider}-devices`}
                    variant="outline"
                  >
                    {syncing === `${connection.provider}-devices` && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {syncing === `${connection.provider}-devices` ? 'Syncing...' : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Devices
                      </>
                    )}
                  </Button>

                  {connection.provider !== 'jumpcloud' && (
                    <Button
                      onClick={() => triggerSync(connection, 'sign-in-logs' as 'iam')}
                      disabled={syncing === `${connection.provider}-sign-in-logs`}
                      variant="outline"
                    >
                      {syncing === `${connection.provider}-sign-in-logs` && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {syncing === `${connection.provider}-sign-in-logs` ? 'Syncing...' : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Sign-in Logs
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {connection.enabled && (!connection.config || Object.keys(connection.config).length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Configure credentials to enable syncing
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default APIConnections;