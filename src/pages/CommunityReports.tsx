import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Locate, Send, CheckCircle, ArrowLeft, ImagePlus, X } from "lucide-react";
import BayMap from "@/components/BayMap";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityReports, useCreateCommunityReport } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
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

interface ReportForm {
  type: string;
  lat: string;
  lng: string;
  description: string;
}

export default function CommunityReports() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  // Estado para preview e arquivo da foto
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, reset } = useForm<ReportForm>();
  const { user, profile } = useAuth();
  const { data: reports = [] } = useCommunityReports();
  const createReport = useCreateCommunityReport();

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setValue("lat", lat.toFixed(6));
    setValue("lng", lng.toFixed(6));
    toast.info("Localização selecionada no mapa!");
  }, [setValue]);

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

  // Seleciona e valida o arquivo de foto (max 5MB, apenas imagens)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Faz upload da foto para o Storage e retorna a URL pública
  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;
    const ext = photoFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("community-photos")
      .upload(path, photoFile, { upsert: false });
    if (error) throw new Error("Erro no upload da foto: " + error.message);
    const { data } = supabase.storage
      .from("community-photos")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const onSubmit = async (data: ReportForm) => {
    if (!user) return;
    try {
      setUploading(true);
      // Upload da foto (se houver) antes de salvar o relato
      const photoUrl = await uploadPhoto();
      await createReport.mutateAsync({
        reporter_id: user.id,
        reporter_name: profile?.full_name || "Anônimo",
        type: data.type as any,
        description: data.description,
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lng),
        photo_url: photoUrl,
      });
      setSubmitted(true);
      removePhoto();
      setTimeout(() => { setSubmitted(false); reset(); }, 3000);
      toast.success("Relato enviado! Será analisado pela equipe.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar relato");
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <CheckCircle className="h-16 w-16 text-secondary mb-4" />
        <h2 className="font-heading font-bold text-xl text-foreground">Relato Enviado!</h2>
        <p className="text-muted-foreground mt-2">Sua contribuição será analisada pela equipe científica.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">Participação Comunitária</h1>
          <p className="text-muted-foreground mt-1">Ajude a monitorar a Baía de Guanabara — clique no mapa ou use GPS</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Novo Relato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Ocorrência</Label>
                <Select onValueChange={v => setValue("type", v)}>
                  <SelectTrigger><SelectValue placeholder="O que você encontrou?" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Latitude</Label>
                  <Input {...register("lat", { required: true })} placeholder="Clique no mapa" />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input {...register("lng", { required: true })} placeholder="Clique no mapa" />
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={captureGPS} disabled={gpsLoading}>
                <Locate className="h-4 w-4 mr-2" />
                {gpsLoading ? "Capturando..." : "Usar meu GPS"}
              </Button>
              <div>
                <Label>Descrição</Label>
                <Textarea {...register("description", { required: true })} placeholder="Descreva o que você encontrou..." rows={3} />
              </div>
              {/* Upload de foto com preview */}
              <div>
                <Label>Foto</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                {photoPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={removePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    <p className="text-sm">Clique para adicionar uma foto</p>
                    <p className="text-xs mt-1">Máx. 5MB — JPG, PNG, WEBP</p>
                  </button>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={createReport.isPending || uploading}>
                <Send className="h-4 w-4 mr-2" /> {uploading ? "Enviando foto..." : createReport.isPending ? "Enviando..." : "Enviar Relato"}
              </Button>
            </CardContent>
          </Card>
        </form>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Clique no mapa para marcar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BayMap height="300px" showScience={false} onMapClick={handleMapClick} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Relatos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum relato ainda. Seja o primeiro!</p>
              )}
              {reports.slice(0, 5).map(report => (
                <div key={report.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <span
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ background: REPORT_TYPE_COLORS[report.type] || "#999" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {REPORT_TYPE_LABELS[report.type] || report.type}
                      </span>
                      <Badge variant={report.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                        {report.status === 'approved' ? 'Aprovado' : report.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                    {report.photo_url && (
                      <img src={report.photo_url} alt="Foto do relato" className="mt-2 rounded-md w-full h-24 object-cover" />
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {report.reporter_name} — {new Date(report.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
