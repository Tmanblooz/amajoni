import { useState } from "react";
import { 
  Settings, Mail, Smartphone, Bell, Shield, Clock, 
  CheckCircle, AlertTriangle, XCircle, Save, TestTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NotificationChannel {
  enabled: boolean;
  address: string;
}

interface AlertType {
  id: string;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
  severity: "critical" | "high" | "medium" | "low";
}

export default function AlertSettings() {
  const [email, setEmail] = useState<NotificationChannel>({
    enabled: true,
    address: "admin@company.co.za"
  });
  
  const [sms, setSms] = useState<NotificationChannel>({
    enabled: true,
    address: "+27 82 555 1234"
  });

  const [alertTypes, setAlertTypes] = useState<AlertType[]>([
    { id: "unauthorized_transaction", label: "Unauthorized Transactions", description: "Banking fraud and suspicious payments", email: true, sms: true, severity: "critical" },
    { id: "impossible_travel", label: "Impossible Travel", description: "Logins from distant locations in short time", email: true, sms: true, severity: "critical" },
    { id: "brute_force", label: "Brute Force Attacks", description: "Multiple failed login attempts", email: true, sms: false, severity: "high" },
    { id: "shadow_app", label: "Risky OAuth Apps", description: "Unauthorized apps with dangerous permissions", email: true, sms: false, severity: "high" },
    { id: "sim_swap", label: "SIM Swap Detection", description: "Phone number transfer alerts", email: true, sms: true, severity: "critical" },
    { id: "phishing", label: "Phishing Attempts", description: "Credential theft via phishing", email: true, sms: true, severity: "critical" },
    { id: "new_device", label: "New Device Login", description: "First-time device access", email: true, sms: false, severity: "medium" },
    { id: "password_change", label: "Password Changes", description: "Account password modifications", email: true, sms: false, severity: "low" },
  ]);

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: "22:00",
    end: "07:00",
    bypassCritical: true
  });

  const toggleAlertChannel = (alertId: string, channel: "email" | "sms") => {
    setAlertTypes(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, [channel]: !alert[channel] }
        : alert
    ));
  };

  const handleSave = () => {
    toast.success("Settings saved", {
      description: "Your notification preferences have been updated."
    });
  };

  const handleTestNotification = (channel: "email" | "sms") => {
    toast.info(`Test ${channel.toUpperCase()} sent`, {
      description: `A test notification was sent to ${channel === "email" ? email.address : sms.address}`
    });
  };

  const severityIcon = (severity: string) => {
    switch(severity) {
      case "critical": return <XCircle className="h-4 w-4 text-status-danger" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case "medium": return <Bell className="h-4 w-4 text-primary" />;
      default: return <CheckCircle className="h-4 w-4 text-status-safe" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alert Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure how and when you receive security notifications
        </p>
      </div>

      {/* Notification Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${email.enabled ? "bg-status-safe/10" : "bg-secondary"}`}>
                <Mail className={`h-5 w-5 ${email.enabled ? "text-status-safe" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Email Notifications</h3>
                <p className="text-xs text-muted-foreground">Receive alerts via email</p>
              </div>
            </div>
            <Switch 
              checked={email.enabled} 
              onCheckedChange={(checked) => setEmail(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email Address</Label>
              <Input 
                id="email"
                type="email"
                value={email.address}
                onChange={(e) => setEmail(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1.5 bg-secondary border-border"
                disabled={!email.enabled}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleTestNotification("email")}
              disabled={!email.enabled}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Send Test Email
            </Button>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${sms.enabled ? "bg-status-safe/10" : "bg-secondary"}`}>
                <Smartphone className={`h-5 w-5 ${sms.enabled ? "text-status-safe" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">SMS Notifications</h3>
                <p className="text-xs text-muted-foreground">Receive critical alerts via SMS</p>
              </div>
            </div>
            <Switch 
              checked={sms.enabled} 
              onCheckedChange={(checked) => setSms(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone Number</Label>
              <Input 
                id="phone"
                type="tel"
                value={sms.address}
                onChange={(e) => setSms(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1.5 bg-secondary border-border"
                disabled={!sms.enabled}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleTestNotification("sms")}
              disabled={!sms.enabled}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Send Test SMS
            </Button>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${quietHours.enabled ? "bg-primary/10" : "bg-secondary"}`}>
              <Clock className={`h-5 w-5 ${quietHours.enabled ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Quiet Hours</h3>
              <p className="text-xs text-muted-foreground">Pause non-critical notifications during specified hours</p>
            </div>
          </div>
          <Switch 
            checked={quietHours.enabled} 
            onCheckedChange={(checked) => setQuietHours(prev => ({ ...prev, enabled: checked }))}
          />
        </div>
        
        {quietHours.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Start Time</Label>
              <Input 
                type="time"
                value={quietHours.start}
                onChange={(e) => setQuietHours(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">End Time</Label>
              <Input 
                type="time"
                value={quietHours.end}
                onChange={(e) => setQuietHours(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch 
                  checked={quietHours.bypassCritical}
                  onCheckedChange={(checked) => setQuietHours(prev => ({ ...prev, bypassCritical: checked }))}
                />
                <span className="text-sm text-muted-foreground">Always send critical alerts</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Alert Types Configuration */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Alert Types</h3>
            <p className="text-xs text-muted-foreground">Choose which alerts trigger notifications</p>
          </div>
        </div>

        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-muted-foreground font-medium">
            <div className="col-span-6">Alert Type</div>
            <div className="col-span-2 text-center">Severity</div>
            <div className="col-span-2 text-center">Email</div>
            <div className="col-span-2 text-center">SMS</div>
          </div>

          {/* Alert Rows */}
          {alertTypes.map((alert) => (
            <div 
              key={alert.id} 
              className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors items-center"
            >
              <div className="col-span-6">
                <p className="font-medium text-foreground text-sm">{alert.label}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
              <div className="col-span-2 flex justify-center">
                <div className="flex items-center gap-1.5">
                  {severityIcon(alert.severity)}
                  <span className={`text-xs capitalize ${
                    alert.severity === "critical" ? "text-status-danger" :
                    alert.severity === "high" ? "text-status-warning" :
                    alert.severity === "medium" ? "text-primary" : "text-status-safe"
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex justify-center">
                <Switch 
                  checked={alert.email && email.enabled}
                  onCheckedChange={() => toggleAlertChannel(alert.id, "email")}
                  disabled={!email.enabled}
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <Switch 
                  checked={alert.sms && sms.enabled}
                  onCheckedChange={() => toggleAlertChannel(alert.id, "sms")}
                  disabled={!sms.enabled}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
