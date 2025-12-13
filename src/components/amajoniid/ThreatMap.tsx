import { useAmajoni } from "@/contexts/AmajoniContext";
import { Globe, MapPin } from "lucide-react";

const threatLocations = [
  { country: "Nigeria", city: "Lagos", attacks: 12, lat: 30, left: 55 },
  { country: "South Africa", city: "Johannesburg", attacks: 3, lat: 75, left: 58 },
  { country: "Kenya", city: "Nairobi", attacks: 5, lat: 55, left: 62 },
  { country: "Ghana", city: "Accra", attacks: 2, lat: 45, left: 48 },
];

export function ThreatMap() {
  const { isUnderAttack } = useAmajoni();

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Threat Geography</h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 24 hours</span>
      </div>
      
      <div className="relative h-48 bg-secondary/30 rounded-lg overflow-hidden">
        {/* Simplified Africa map outline */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-32 h-40 border-2 border-primary/50 rounded-[40%_40%_50%_50%]" />
        </div>
        
        {/* Threat points */}
        {threatLocations.map((loc, i) => (
          <div
            key={i}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ top: `${loc.lat}%`, left: `${loc.left}%` }}
          >
            <div className={`relative ${isUnderAttack && i === 0 ? "animate-ping" : ""}`}>
              <MapPin 
                className={`h-4 w-4 ${
                  loc.attacks > 10 
                    ? "text-status-danger" 
                    : loc.attacks > 5 
                    ? "text-status-warning" 
                    : "text-status-safe"
                }`} 
              />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                <span className="font-medium">{loc.city}</span>
                <span className="text-muted-foreground"> • {loc.attacks} attempts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-danger" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-warning" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-safe" /> Low
          </span>
        </div>
        <span className="text-muted-foreground">22 total attempts</span>
      </div>
    </div>
  );
}
