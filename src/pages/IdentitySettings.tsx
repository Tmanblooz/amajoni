import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, Link2, Key, Building2, CheckCircle, XCircle, 
  Loader2, ExternalLink, Shield 
} from "lucide-react";
import { toast } from "sonner";

export default function IdentitySettings() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connections, setConnections] = useState({
    microsoft: false,
    google: false,
  });

  const handleConnect = async (provider: 'microsoft' | 'google') => {
    setConnecting(provider);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnections(prev => ({ ...prev, [provider]: true }));
    setConnecting(null);
    toast.success(`Connected to ${provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'}`);
  };

  const handleDisconnect = (provider: 'microsoft' | 'google') => {
    setConnections(prev => ({ ...prev, [provider]: false }));
    toast.info(`Disconnected from ${provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure integrations and company settings
        </p>
      </div>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle>Identity Provider Integrations</CardTitle>
          </div>
          <CardDescription>
            Connect your identity providers to monitor login activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Microsoft 365 */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#00a4ef]/10 flex items-center justify-center">
                <svg viewBox="0 0 23 23" className="h-6 w-6">
                  <path fill="#f25022" d="M0 0h11v11H0z"/>
                  <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                  <path fill="#7fba00" d="M0 12h11v11H0z"/>
                  <path fill="#ffb900" d="M12 12h11v11H12z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Microsoft 365 / Azure AD</p>
                <p className="text-sm text-muted-foreground">
                  Monitor Azure AD sign-ins and user activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {connections.microsoft ? (
                <>
                  <Badge variant="outline" className="bg-status-healthy/10 text-status-healthy">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisconnect('microsoft')}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => handleConnect('microsoft')}
                  disabled={connecting === 'microsoft'}
                >
                  {connecting === 'microsoft' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Google Workspace */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#4285f4]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Google Workspace</p>
                <p className="text-sm text-muted-foreground">
                  Monitor Google Workspace sign-ins and 2SV status
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {connections.google ? (
                <>
                  <Badge variant="outline" className="bg-status-healthy/10 text-status-healthy">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisconnect('google')}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => handleConnect('google')}
                  disabled={connecting === 'google'}
                >
                  {connecting === 'google' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>API Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure API keys for backend integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input 
                id="api-key" 
                type="password" 
                placeholder="Enter your API key"
                className="font-mono"
              />
              <Button variant="outline">Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Used to authenticate with the Amajoni backend API
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input 
                id="webhook-url" 
                placeholder="https://your-backend.com/webhook"
              />
              <Button variant="outline">Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Receive real-time alerts via webhook
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Company Profile</CardTitle>
          </div>
          <CardDescription>
            Your organization details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="Technology" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="South Africa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-count">Employee Count</Label>
              <Input id="employee-count" type="number" placeholder="50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin Email</Label>
            <Input id="admin-email" type="email" placeholder="admin@company.com" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>
            Configure security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">High-Risk Country Blocking</p>
                <p className="text-sm text-muted-foreground">
                  Block login attempts from high-risk countries
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alert Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Email and SMS notification settings
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Risk Scoring Rules</p>
                <p className="text-sm text-muted-foreground">
                  Customize risk scoring thresholds
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
