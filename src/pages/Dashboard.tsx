import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { Droplets, AlertTriangle, MapPin, ClipboardCheck } from "lucide-react";
import StatCard from "@/components/StatCard";
import BayMap from "@/components/BayMap";
import { useCollectionPoints, useScientificRecords, useCommunityReports } from "@/hooks/useSupabaseData";

const PIE_COLORS = ["#0891b2", "#2dd4bf", "#f59e0b", "#ef4444", "#8b5cf6"];

const REPORT_TYPE_LABELS: Record<string, string> = {
  floating_trash: "Lixo Flutuante",
  dead_fish: "Peixe Morto",
  pollution: "Poluição",
  other: "Outro",
};

export default function Dashboard() {
  const { data: points = [] } = useCollectionPoints();
  const { data: records = [] } = useScientificRecords();
  const { data: reports = [] } = useCommunityReports();

  // Aggregate data
  const weatherCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.weather) weatherCounts[r.weather] = (weatherCounts[r.weather] || 0) + 1;
  });
  const weatherData = Object.entries(weatherCounts).map(([name, value]) => ({ name, value }));

  const reportCounts: Record<string, number> = {};
  reports.forEach(r => {
    const label = REPORT_TYPE_LABELS[r.type] || r.type;
    reportCounts[label] = (reportCounts[label] || 0) + 1;
  });
  const communityData = Object.entries(reportCounts).map(([name, value]) => ({ name, value }));

  // Turbidity by point
  const turbidityByPoint = points.map(p => {
    const pointRecords = records.filter(r => r.collection_point_id === p.id);
    const avg = pointRecords.length > 0
      ? pointRecords.reduce((sum, r) => sum + (r.turbidity || 0), 0) / pointRecords.length
      : 0;
    return { name: p.name.replace("Praia de ", ""), turbidity: Number(avg.toFixed(1)), records: pointRecords.length };
  }).filter(p => p.records > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
          Painel de Monitoramento
        </h1>
        <p className="text-muted-foreground mt-1">Baía de Guanabara — Dados em tempo real</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Coletas Científicas" value={records.length} subtitle="Total" icon={ClipboardCheck} />
        <StatCard title="Pontos Monitorados" value={points.length} subtitle="Ativos" icon={MapPin} />
        <StatCard title="Alertas Comunitários" value={reports.length} subtitle="Total" icon={AlertTriangle} />
        <StatCard title="Qualidade Média" value={records.length > 0 ? "Monitorada" : "Sem dados"} subtitle="Balneabilidade" icon={Droplets} />
      </div>

      <div className="glass-card rounded-xl p-4">
        <h2 className="font-heading font-semibold text-foreground mb-3">Mapa de Ocorrências</h2>
        <BayMap height="350px" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {turbidityByPoint.length > 0 && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4">Turbidez Média por Ponto (NTU)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={turbidityByPoint}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 20% 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="turbidity" name="Turbidez" fill="hsl(199, 89%, 36%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {weatherData.length > 0 && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4">Condições Climáticas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={weatherData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {weatherData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {communityData.length > 0 && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4">Relatos da Comunidade</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={communityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 20% 88%)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" name="Quantidade" fill="hsl(168, 60%, 40%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {records.length === 0 && reports.length === 0 && (
          <div className="glass-card rounded-xl p-8 col-span-full text-center">
            <p className="text-muted-foreground">Nenhum dado registrado ainda. Comece fazendo uma coleta científica ou enviando um relato comunitário!</p>
          </div>
        )}
      </div>
    </div>
  );
}
