import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Locate, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCollectionPoints, useCreateScientificRecord } from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type WeatherCondition = Database["public"]["Enums"]["weather_condition"];

const WEATHER_MAP: Record<string, WeatherCondition> = {
  "Ensolarado": "sunny",
  "Nublado": "cloudy",
  "Chuvoso": "rainy",
  "Tempestade": "stormy",
  "Nevoeiro": "foggy",
};

interface FormData {
  pointId: string;
  date: string;
  waterAppearance: string;
  turbidity: string;
  ph: string;
  waterTemp: string;
  trashCount: string;
  windDirection: string;
  windSpeed: string;
  weather: string;
  lat: string;
  lng: string;
  notes: string;
}

export default function ScientificCollection() {
  const navigate = useNavigate();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, setValue, reset } = useForm<FormData>({
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  });
  const { user } = useAuth();
  const { data: points = [] } = useCollectionPoints();
  const createRecord = useCreateScientificRecord();

  const captureGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("lat", pos.coords.latitude.toFixed(6));
        setValue("lng", pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
        toast.success("Coordenadas capturadas!");
      },
      () => { setGpsLoading(false); toast.error("Não foi possível obter a localização"); }
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      await createRecord.mutateAsync({
        collection_point_id: data.pointId,
        user_id: user.id,
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lng),
        turbidity: data.turbidity ? parseFloat(data.turbidity) : null,
        ph: data.ph ? parseFloat(data.ph) : null,
        water_temp: data.waterTemp ? parseFloat(data.waterTemp) : null,
        trash_count: data.trashCount ? parseInt(data.trashCount) : 0,
        weather: WEATHER_MAP[data.weather] || null,
        wind_speed: data.windSpeed ? parseFloat(data.windSpeed) : null,
        wind_direction: data.windDirection || null,
        water_appearance: data.waterAppearance || null,
        notes: data.notes || null,
        recorded_at: new Date(data.date).toISOString(),
      });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); reset(); }, 3000);
      toast.success("Coleta registrada com sucesso!");
    } catch {
      toast.error("Erro ao registrar coleta");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <CheckCircle className="h-16 w-16 text-secondary mb-4" />
        <h2 className="font-heading font-bold text-xl text-foreground">Coleta Registrada!</h2>
        <p className="text-muted-foreground mt-2">Os dados foram salvos com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">Coleta Científica</h1>
          <p className="text-muted-foreground mt-1">Registre os dados de monitoramento ambiental</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ponto de Coleta</Label>
              <Select onValueChange={v => setValue("pointId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o ponto" /></SelectTrigger>
                <SelectContent>
                  {points.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude</Label>
                <Input {...register("lat", { required: true })} placeholder="-22.9494" />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input {...register("lng", { required: true })} placeholder="-43.1822" />
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={captureGPS} disabled={gpsLoading}>
              <Locate className="h-4 w-4 mr-2" />
              {gpsLoading ? "Capturando..." : "Capturar GPS"}
            </Button>
            <div>
              <Label>Data</Label>
              <Input type="date" {...register("date", { required: true })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">💧 Condições da Água</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Aspecto da Água</Label>
                <Select onValueChange={v => setValue("waterAppearance", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {["Transparente", "Verde-claro", "Verde", "Verde-escuro", "Marrom", "Cinza"].map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Turbidez (NTU)</Label>
                <Input type="number" step="0.01" {...register("turbidity")} placeholder="Ex: 15.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>pH</Label>
                <Input type="number" step="0.01" {...register("ph")} placeholder="Ex: 7.2" />
              </div>
              <div>
                <Label>Temperatura (°C)</Label>
                <Input type="number" step="0.1" {...register("waterTemp")} placeholder="Ex: 24.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🌤️ Lixo & Clima</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contagem de Lixo</Label>
                <Input type="number" {...register("trashCount")} placeholder="0" />
              </div>
              <div>
                <Label>Clima</Label>
                <Select onValueChange={v => setValue("weather", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(WEATHER_MAP).map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Direção do Vento</Label>
                <Select onValueChange={v => setValue("windDirection", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {["Norte", "Nordeste", "Leste", "Sudeste", "Sul", "Sudoeste", "Oeste", "Noroeste"].map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Velocidade do Vento (km/h)</Label>
                <Input type="number" step="0.1" {...register("windSpeed")} placeholder="Ex: 12.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <Label>Observações</Label>
          <Textarea {...register("notes")} placeholder="Observações adicionais sobre a coleta..." rows={3} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={createRecord.isPending}>
          {createRecord.isPending ? "Salvando..." : "Registrar Coleta"}
        </Button>
      </form>
    </div>
  );
}
