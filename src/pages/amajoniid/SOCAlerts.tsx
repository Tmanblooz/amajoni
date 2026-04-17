import { useState, useMemo } from "react";
import { useAmajoni } from "@/contexts/AmajoniContext";
import { useAlertsData, Alert } from "@/hooks/useAmajoniApi";
import { AlertDetailDrawer } from "@/components/amajoniid/AlertDetailDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, AlertTriangle, RefreshCw, Loader2, WifiOff, Search, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SevFilter = "all" | "critical" | "high" | "medium" | "low";

const sevDot: Record<string, string> = {
  critical: "bg-status-danger",
  high: "bg-status-danger/70",
  medium: "bg-status-warning",
  low: "bg-status-safe",
};

const sevLabel: Record<string, "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export default function SOCAlerts() {
  const { isUnderAttack } = useAmajoni();
  const { data: apiAlerts, loading, error, refetch } = useAlertsData(2000);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SevFilter>("all");
  const [selected, setSelected] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const alerts = apiAlerts ?? [];

  const counts = useMemo(() => ({
    all: alerts.length,
    critical: alerts.filter(a => a.severity === "critical").length,
    high: alerts.filter(a => a.severity === "high").length,
    medium: alerts.filter(a => a.severity === "medium").length,
    low: alerts.filter(a => a.severity === "low").length,
  }), [alerts]);

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (filter !== "all" && a.severity !== filter) return false;
      if (search && !`${a.title} ${a.message} ${a.user ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [alerts, filter, search]);

  const openAlert = (a: Alert) => { setSelected(a); setDrawerOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SOC Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Security Operations Center — real-time triage queue
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {loading && !apiAlerts ? (
            <><Loader2 className="h-4 w-4 animate-spin" /><span>Connecting…</span></>
          ) : error ? (
            <><WifiOff className="h-4 w-4 text-status-warning" /><span className="text-status-warning">Offline mode</span></>
          ) : (
            <><RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: "2s" }} /><span>Live</span></>
          )}
        </div>
      </div>

      {isUnderAttack && (
        <div className="bg-status-danger/10 border border-status-danger/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
          <AlertTriangle className="h-6 w-6 text-status-danger" />
          <div>
            <p className="font-semibold text-status-danger">Active Threat Detected</p>
            <p className="text-sm text-muted-foreground">Triage critical alerts below.</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, message, or user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as SevFilter)}>
          <TabsList>
            <TabsTrigger value="all">All <Badge variant="outline" className="ml-2">{counts.all}</Badge></TabsTrigger>
            <TabsTrigger value="critical">Critical <Badge variant="destructive" className="ml-2">{counts.critical}</Badge></TabsTrigger>
            <TabsTrigger value="high">High <Badge variant="destructive" className="ml-2">{counts.high}</Badge></TabsTrigger>
            <TabsTrigger value="medium">Medium <Badge variant="secondary" className="ml-2">{counts.medium}</Badge></TabsTrigger>
            <TabsTrigger value="low">Low <Badge variant="outline" className="ml-2">{counts.low}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ShieldCheck className="h-16 w-16 text-status-safe mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">
            {alerts.length === 0 ? "All Clear" : "No matching alerts"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {alerts.length === 0 ? "No active security alerts." : "Try a different filter or search term."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((a) => (
              <motion.button
                key={a.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => openAlert(a)}
                className="w-full text-left bg-card border border-border hover:border-primary/40 hover:bg-secondary/30 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className={`h-2.5 w-2.5 rounded-full mt-2 shrink-0 ${sevDot[a.severity]} ${a.severity === "critical" ? "animate-pulse" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={sevLabel[a.severity]} className="uppercase text-[10px]">{a.severity}</Badge>
                      {a.acknowledged && <Badge variant="outline" className="text-[10px]">Ack</Badge>}
                      <p className="font-semibold text-foreground truncate">{a.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span>{a.timestamp.toLocaleTimeString()}</span>
                      {a.user && <span>· {a.user}</span>}
                      {a.category && <span>· {a.category.replace("_", " ")}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AlertDetailDrawer
        alert={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAction={refetch}
      />
    </div>
  );
}
