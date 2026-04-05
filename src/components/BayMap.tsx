import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCollectionPoints, useCommunityReports } from "@/hooks/useSupabaseData";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function createColoredIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%; 
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const SCIENCE_ICON = createColoredIcon("#0891b2");

const REPORT_TYPE_LABELS: Record<string, string> = {
  floating_trash: "Lixo Flutuante",
  dead_fish: "Peixe Morto",
  pollution: "Poluição",
  other: "Outro",
};

const REPORT_TYPE_COLORS: Record<string, string> = {
  floating_trash: "#e67e22",
  dead_fish: "#e74c3c",
  pollution: "#8e44ad",
  other: "#95a5a6",
};

interface BayMapProps {
  showScience?: boolean;
  showCommunity?: boolean;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function BayMap({ 
  showScience = true, 
  showCommunity = true, 
  height = "500px",
  onMapClick 
}: BayMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { data: points = [] } = useCollectionPoints();
  const { data: reports = [] } = useCommunityReports();

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clean up existing map
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [-22.87, -43.14],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (showScience) {
      points.forEach(point => {
        L.marker([point.latitude, point.longitude], { icon: SCIENCE_ICON })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="color: #0891b2;">${point.name}</strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #666;">${point.description || ""}</p>
              <span style="display:inline-block; margin-top:4px; padding:2px 8px; border-radius:12px; background:#e0f7fa; color:#0891b2; font-size:11px;">Ponto Científico</span>
            </div>
          `);
      });
    }

    if (showCommunity) {
      reports.filter(r => r.status === 'approved').forEach(report => {
        const color = REPORT_TYPE_COLORS[report.type] || "#999";
        const icon = createColoredIcon(color);
        L.marker([report.latitude, report.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="color: ${color};">${REPORT_TYPE_LABELS[report.type] || report.type}</strong>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${report.description}</p>
              <p style="font-size: 11px; color: #999;">Por: ${report.reporter_name} — ${new Date(report.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          `);
      });
    }

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [showScience, showCommunity, onMapClick, points, reports]);

  return <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-xl shadow-ocean" />;
}
