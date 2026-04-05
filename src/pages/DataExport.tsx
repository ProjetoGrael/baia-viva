import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Globe } from "lucide-react";
import { useScientificRecords, useCommunityReports } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

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

function exportCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) { toast.error("Sem dados para exportar"); return; }
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} exportado!`);
}

function exportGeoJSON(data: { lat: number; lng: number; properties: Record<string, any> }[], filename: string) {
  if (data.length === 0) { toast.error("Sem dados para exportar"); return; }
  const geojson = {
    type: "FeatureCollection",
    crs: { type: "name", properties: { name: "urn:ogc:def:crs:EPSG::4326" } },
    features: data.map(d => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [d.lng, d.lat] },
      properties: d.properties,
    })),
  };
  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} exportado — compatível com ArcGIS!`);
}

export default function DataExport() {
  const { data: records = [] } = useScientificRecords();
  const { data: reports = [] } = useCommunityReports();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">Dados & Exportação</h1>
        <p className="text-muted-foreground mt-1">Visualize e exporte dados para análise em ferramentas externas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2"
          onClick={() => exportCSV(records.map(r => ({
            data: r.recorded_at, ponto: (r as any).collection_points?.name || "",
            turbidez: r.turbidity, ph: r.ph, temp: r.water_temp,
            lixo: r.trash_count, clima: r.weather, lat: r.latitude, lng: r.longitude,
          })), "coletas_cientificas.csv")}>
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <span className="text-xs">CSV Científico</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2"
          onClick={() => exportGeoJSON(
            records.map(r => ({
              lat: r.latitude, lng: r.longitude,
              properties: {
                point: (r as any).collection_points?.name || "",
                date: r.recorded_at, turbidity: r.turbidity, ph: r.ph,
                weather: r.weather, trash_count: r.trash_count,
              },
            })),
            "coletas_cientificas.geojson"
          )}>
          <Globe className="h-5 w-5 text-secondary" />
          <span className="text-xs">GeoJSON Científico</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2"
          onClick={() => exportCSV(reports.map(r => ({
            data: r.created_at, tipo: REPORT_TYPE_LABELS[r.type] || r.type,
            descricao: r.description, status: r.status,
            lat: r.latitude, lng: r.longitude, relator: r.reporter_name,
          })), "relatos_comunidade.csv")}>
          <FileSpreadsheet className="h-5 w-5 text-destructive" />
          <span className="text-xs">CSV Comunidade</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2"
          onClick={() => exportGeoJSON(
            reports.map(r => ({
              lat: r.latitude, lng: r.longitude,
              properties: {
                type: REPORT_TYPE_LABELS[r.type] || r.type,
                description: r.description, date: r.created_at, status: r.status,
              },
            })),
            "relatos_comunidade.geojson"
          )}>
          <Globe className="h-5 w-5 text-accent" />
          <span className="text-xs">GeoJSON Comunidade</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coletas Científicas</CardTitle>
          <CardDescription>{records.length} registros</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ponto</TableHead>
                <TableHead>Turbidez</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Lixo</TableHead>
                <TableHead>Clima</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro</TableCell></TableRow>
              )}
              {records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.recorded_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-xs font-medium">{(r as any).collection_points?.name || "—"}</TableCell>
                  <TableCell className="text-xs">{r.turbidity ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.ph ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.trash_count ?? 0}</TableCell>
                  <TableCell className="text-xs">{r.weather ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relatos da Comunidade</CardTitle>
          <CardDescription>{reports.length} relatos</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coordenadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum relato</TableCell></TableRow>
              )}
              {reports.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: REPORT_TYPE_COLORS[r.type], color: REPORT_TYPE_COLORS[r.type] }}>
                      {REPORT_TYPE_LABELS[r.type] || r.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{r.description}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                      {r.status === 'approved' ? 'Aprovado' : r.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
