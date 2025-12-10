import { useState } from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Monitor, Smartphone, Tablet, Globe, CheckCircle, XCircle, 
  AlertTriangle, MapPin, Clock 
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { LoginEvent } from "@/hooks/useMockApi";

interface LoginTimelineProps {
  events: LoginEvent[];
}

// Country flags using emoji
const countryFlags: Record<string, string> = {
  ZA: '🇿🇦', NG: '🇳🇬', RU: '🇷🇺', CN: '🇨🇳', BR: '🇧🇷', US: '🇺🇸', 
  GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', IN: '🇮🇳', AU: '🇦🇺', JP: '🇯🇵',
};

const deviceIcons: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

export function LoginTimeline({ events }: LoginTimelineProps) {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const uniqueLocations = [...new Set(events.map(e => e.location))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.username.toLowerCase().includes(search.toLowerCase()) ||
      event.email.toLowerCase().includes(search.toLowerCase()) ||
      event.ipAddress.toLowerCase().includes(search.toLowerCase());
    
    const matchesResult = resultFilter === "all" || event.result === resultFilter;
    const matchesRisk = riskFilter === "all" || event.riskFlag === riskFilter;
    const matchesLocation = locationFilter === "all" || event.location === locationFilter;

    return matchesSearch && matchesResult && matchesRisk && matchesLocation;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="suspicious">Suspicious</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueLocations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => {
              const DeviceIcon = deviceIcons[event.deviceType] || Monitor;
              const flag = countryFlags[event.countryCode] || '🌍';
              
              return (
                <TableRow 
                  key={event.id} 
                  className={cn(event.riskFlag === 'suspicious' && "bg-status-critical/5")}
                >
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{format(new Date(event.timestamp), 'MMM d, HH:mm')}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {event.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{event.username}</p>
                        <p className="text-xs text-muted-foreground">{event.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{flag}</span>
                      <span>{event.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{event.deviceType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {event.ipAddress}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        event.result === 'success' 
                          ? "bg-status-healthy/10 text-status-healthy"
                          : "bg-status-critical/10 text-status-critical"
                      )}
                    >
                      {event.result === 'success' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {event.result}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          event.riskFlag === 'normal' 
                            ? "bg-status-healthy/10 text-status-healthy"
                            : "bg-status-critical/10 text-status-critical"
                        )}
                      >
                        {event.riskFlag === 'suspicious' && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {event.riskFlag}
                      </Badge>
                      {event.riskFactors.length > 0 && (
                        <span 
                          className="text-xs text-muted-foreground cursor-help"
                          title={event.riskFactors.join(', ')}
                        >
                          {event.riskFactors.length} factor{event.riskFactors.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredEvents.length} of {events.length} events
      </p>
    </div>
  );
}
