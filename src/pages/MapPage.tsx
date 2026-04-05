import { useState } from "react";
import BayMap from "@/components/BayMap";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { REPORT_TYPE_LABELS, REPORT_TYPE_COLORS } from "@/lib/mock-data";

export default function MapPage() {
  const [showScience, setShowScience] = useState(true);
  const [showCommunity, setShowCommunity] = useState(true);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">Mapa Interativo</h1>
        <p className="text-muted-foreground mt-1">Visualize todos os pontos de coleta e relatos comunitários</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Switch checked={showScience} onCheckedChange={setShowScience} />
          <Label className="text-sm">Pontos Científicos</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showCommunity} onCheckedChange={setShowCommunity} />
          <Label className="text-sm">Relatos Comunitários</Label>
        </div>
      </div>

      {showCommunity && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
            <Badge 
              key={key} 
              variant="outline"
              className="text-xs"
              style={{ borderColor: REPORT_TYPE_COLORS[key as keyof typeof REPORT_TYPE_COLORS], color: REPORT_TYPE_COLORS[key as keyof typeof REPORT_TYPE_COLORS] }}
            >
              <span className="w-2 h-2 rounded-full mr-1.5 inline-block" style={{ background: REPORT_TYPE_COLORS[key as keyof typeof REPORT_TYPE_COLORS] }} />
              {label}
            </Badge>
          ))}
        </div>
      )}

      <BayMap showScience={showScience} showCommunity={showCommunity} height="calc(100vh - 260px)" />
    </div>
  );
}
