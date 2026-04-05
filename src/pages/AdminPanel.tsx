/**
 * AdminPanel.tsx — Painel de Administração do BaíaViva
 * 
 * Funcionalidades:
 * - Moderação: aprovar/rejeitar/editar/excluir relatos comunitários
 * - Gestão de Usuários: alterar papéis (admin, professor, aluno, comunidade)
 * - Exportação: baixar dados em XLSX ou CSV
 * 
 * Acesso restrito: somente usuários com papel "admin" (verificado via RLS + ProtectedRoute)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  CheckCircle, XCircle, Download, Shield, Users, FileText,
  ArrowLeft, Pencil, Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCommunityReports, useModerateReport, useUpdateCommunityReport, useDeleteCommunityReport,
  useAllUsers, useUpdateUserRole,
  useScientificRecords, useUpdateScientificRecord, useDeleteScientificRecord,
} from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// Mapas de tradução para exibição em português
const REPORT_TYPE_LABELS: Record<string, string> = {
  floating_trash: "Lixo Flutuante",
  dead_fish: "Peixe Morto",
  pollution: "Poluição",
  other: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  professor: "Professor",
  student: "Aluno",
  community: "Comunidade",
};

/** Exporta array de objetos para arquivo XLSX ou CSV */
function exportToFile(data: Record<string, any>[], filename: string, format: "xlsx" | "csv") {
  if (data.length === 0) { toast.error("Sem dados para exportar"); return; }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  if (format === "xlsx") {
    XLSX.writeFile(wb, filename + ".xlsx");
  } else {
    XLSX.writeFile(wb, filename + ".csv", { bookType: "csv" });
  }
  toast.success(`${filename}.${format} exportado!`);
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: reports = [], isLoading: reportsLoading } = useCommunityReports();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: records = [] } = useScientificRecords();

  // Mutations
  const moderateReport = useModerateReport();
  const updateReport = useUpdateCommunityReport();
  const deleteReport = useDeleteCommunityReport();
  const updateRecord = useUpdateScientificRecord();
  const deleteRecord = useDeleteScientificRecord();
  const updateRole = useUpdateUserRole();

  // Estado local para filtros e modais de edição
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingReport, setEditingReport] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const filteredReports = statusFilter === "all"
    ? reports
    : reports.filter(r => r.status === statusFilter);

  // === Handlers ===

  const handleModerate = (id: string, status: "approved" | "rejected") => {
    if (!user) return;
    moderateReport.mutate(
      { id, status, moderatorId: user.id },
      {
        onSuccess: () => toast.success(status === "approved" ? "Relato aprovado!" : "Relato rejeitado."),
        onError: () => toast.error("Erro ao moderar relato"),
      }
    );
  };

  const handleSaveReport = () => {
    if (!editingReport) return;
    updateReport.mutate(
      {
        id: editingReport.id,
        type: editingReport.type,
        description: editingReport.description,
        latitude: editingReport.latitude,
        longitude: editingReport.longitude,
      },
      {
        onSuccess: () => { toast.success("Relato atualizado!"); setEditingReport(null); },
        onError: () => toast.error("Erro ao atualizar relato"),
      }
    );
  };

  const handleDeleteReport = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este relato?")) return;
    deleteReport.mutate(id, {
      onSuccess: () => toast.success("Relato excluído!"),
      onError: () => toast.error("Erro ao excluir relato"),
    });
  };

  const handleSaveRecord = () => {
    if (!editingRecord) return;
    updateRecord.mutate(
      {
        id: editingRecord.id,
        turbidity: editingRecord.turbidity ? parseFloat(editingRecord.turbidity) : null,
        ph: editingRecord.ph ? parseFloat(editingRecord.ph) : null,
        water_temp: editingRecord.water_temp ? parseFloat(editingRecord.water_temp) : null,
        trash_count: editingRecord.trash_count ? parseInt(editingRecord.trash_count) : 0,
        water_appearance: editingRecord.water_appearance || null,
        notes: editingRecord.notes || null,
      },
      {
        onSuccess: () => { toast.success("Registro atualizado!"); setEditingRecord(null); },
        onError: () => toast.error("Erro ao atualizar registro"),
      }
    );
  };

  const handleDeleteRecord = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    deleteRecord.mutate(id, {
      onSuccess: () => toast.success("Registro excluído!"),
      onError: () => toast.error("Erro ao excluir registro"),
    });
  };

  const handleRoleChange = (userId: string, newRole: string, existingRoleId?: string) => {
    updateRole.mutate(
      { userId, role: newRole, existingRoleId },
      {
        onSuccess: () => toast.success("Papel atualizado!"),
        onError: () => toast.error("Erro ao atualizar papel"),
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho com botão de voltar */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" /> Painel de Administração
          </h1>
          <p className="text-muted-foreground mt-1">Moderação de relatos, gestão de usuários e exportação de dados</p>
        </div>
      </div>

      <Tabs defaultValue="moderation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Moderação
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Coletas
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Exportar
          </TabsTrigger>
        </TabsList>

        {/* ====== ABA: MODERAÇÃO DE RELATOS ====== */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">Relatos Comunitários</CardTitle>
                  <CardDescription>
                    {reports.filter(r => r.status === "pending").length} pendente(s) de moderação
                  </CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {reportsLoading ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : filteredReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum relato encontrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Relator</TableHead>
                      <TableHead className="max-w-[200px]">Descrição</TableHead>
                      <TableHead>Coordenadas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(report.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                            {REPORT_TYPE_LABELS[report.type] || report.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{report.reporter_name}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{report.description}</TableCell>
                        <TableCell className="text-xs font-mono whitespace-nowrap">
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={report.status === "approved" ? "default" : report.status === "rejected" ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            {STATUS_LABELS[report.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {/* Aprovar/Rejeitar só para pendentes */}
                            {report.status === "pending" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => handleModerate(report.id, "approved")} title="Aprovar">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => handleModerate(report.id, "rejected")} title="Rejeitar">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {/* Editar — abre modal com dados do relato */}
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary" onClick={() => setEditingReport({ ...report })} title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {/* Excluir — pede confirmação */}
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteReport(report.id)} title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== ABA: COLETAS CIENTÍFICAS (edição/exclusão) ====== */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registros Científicos</CardTitle>
              <CardDescription>{records.length} registro(s)</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {records.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum registro encontrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ponto</TableHead>
                      <TableHead>pH</TableHead>
                      <TableHead>Turbidez</TableHead>
                      <TableHead>Temp</TableHead>
                      <TableHead>Lixo</TableHead>
                      <TableHead>Aspecto</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(record.recorded_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-xs">{(record as any).collection_points?.name || "—"}</TableCell>
                        <TableCell className="text-xs">{record.ph ?? "—"}</TableCell>
                        <TableCell className="text-xs">{record.turbidity ?? "—"}</TableCell>
                        <TableCell className="text-xs">{record.water_temp ? `${record.water_temp}°C` : "—"}</TableCell>
                        <TableCell className="text-xs">{record.trash_count ?? 0}</TableCell>
                        <TableCell className="text-xs">{record.water_appearance || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary" onClick={() => setEditingRecord({ ...record })} title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteRecord(record.id)} title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== ABA: GESTÃO DE USUÁRIOS ====== */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gestão de Usuários</CardTitle>
              <CardDescription>{users.length} usuário(s) registrado(s)</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {usersLoading ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Instituição</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Papel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="text-sm font-medium">{u.full_name || "—"}</TableCell>
                        <TableCell className="text-xs">{u.email || "—"}</TableCell>
                        <TableCell className="text-xs">{u.institution || "—"}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Select value={u.role} onValueChange={(val) => handleRoleChange(u.user_id, val, u.role_id)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== ABA: EXPORTAÇÃO DE DADOS ====== */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coletas Científicas</CardTitle>
                <CardDescription>{records.length} registros</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => exportToFile(
                  records.map(r => ({
                    Data: new Date(r.recorded_at).toLocaleDateString("pt-BR"),
                    Ponto: (r as any).collection_points?.name || "",
                    "Turbidez (NTU)": r.turbidity, pH: r.ph,
                    "Temp (°C)": r.water_temp, Lixo: r.trash_count,
                    Clima: r.weather, Vento: r.wind_direction,
                    "Vel. Vento": r.wind_speed, Aspecto: r.water_appearance,
                    Latitude: r.latitude, Longitude: r.longitude,
                    Observações: r.notes,
                  })), "coletas_cientificas", "xlsx"
                )}>
                  <Download className="h-4 w-4 mr-2" /> XLSX
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => exportToFile(
                  records.map(r => ({
                    Data: new Date(r.recorded_at).toLocaleDateString("pt-BR"),
                    Ponto: (r as any).collection_points?.name || "",
                    Turbidez: r.turbidity, pH: r.ph, Temp: r.water_temp,
                    Lixo: r.trash_count, Clima: r.weather,
                    Latitude: r.latitude, Longitude: r.longitude,
                  })), "coletas_cientificas", "csv"
                )}>
                  <Download className="h-4 w-4 mr-2" /> CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relatos da Comunidade</CardTitle>
                <CardDescription>{reports.length} relatos</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => exportToFile(
                  reports.map(r => ({
                    Data: new Date(r.created_at).toLocaleDateString("pt-BR"),
                    Tipo: REPORT_TYPE_LABELS[r.type] || r.type,
                    Descrição: r.description, Status: STATUS_LABELS[r.status],
                    Relator: r.reporter_name,
                    Latitude: r.latitude, Longitude: r.longitude,
                  })), "relatos_comunidade", "xlsx"
                )}>
                  <Download className="h-4 w-4 mr-2" /> XLSX
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => exportToFile(
                  reports.map(r => ({
                    Data: new Date(r.created_at).toLocaleDateString("pt-BR"),
                    Tipo: REPORT_TYPE_LABELS[r.type] || r.type,
                    Descrição: r.description, Status: STATUS_LABELS[r.status],
                    Relator: r.reporter_name,
                    Latitude: r.latitude, Longitude: r.longitude,
                  })), "relatos_comunidade", "csv"
                )}>
                  <Download className="h-4 w-4 mr-2" /> CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usuários</CardTitle>
                <CardDescription>{users.length} usuários</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => exportToFile(
                  users.map(u => ({
                    Nome: u.full_name, Email: u.email,
                    Instituição: u.institution, Papel: ROLE_LABELS[u.role] || u.role,
                    Cadastro: new Date(u.created_at).toLocaleDateString("pt-BR"),
                  })), "usuarios", "xlsx"
                )}>
                  <Download className="h-4 w-4 mr-2" /> XLSX
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => exportToFile(
                  users.map(u => ({
                    Nome: u.full_name, Email: u.email,
                    Instituição: u.institution, Papel: ROLE_LABELS[u.role] || u.role,
                    Cadastro: new Date(u.created_at).toLocaleDateString("pt-BR"),
                  })), "usuarios", "csv"
                )}>
                  <Download className="h-4 w-4 mr-2" /> CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ====== MODAL: EDITAR RELATO COMUNITÁRIO ====== */}
      <Dialog open={!!editingReport} onOpenChange={(open) => !open && setEditingReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Relato</DialogTitle>
          </DialogHeader>
          {editingReport && (
            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={editingReport.type} onValueChange={v => setEditingReport({ ...editingReport, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_TYPE_LABELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingReport.description}
                  onChange={e => setEditingReport({ ...editingReport, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number" step="0.000001"
                    value={editingReport.latitude}
                    onChange={e => setEditingReport({ ...editingReport, latitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number" step="0.000001"
                    value={editingReport.longitude}
                    onChange={e => setEditingReport({ ...editingReport, longitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReport(null)}>Cancelar</Button>
            <Button onClick={handleSaveReport} disabled={updateReport.isPending}>
              {updateReport.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== MODAL: EDITAR REGISTRO CIENTÍFICO ====== */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro Científico</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>pH</Label>
                  <Input
                    type="number" step="0.01"
                    value={editingRecord.ph ?? ""}
                    onChange={e => setEditingRecord({ ...editingRecord, ph: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Turbidez (NTU)</Label>
                  <Input
                    type="number" step="0.01"
                    value={editingRecord.turbidity ?? ""}
                    onChange={e => setEditingRecord({ ...editingRecord, turbidity: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Temp. Água (°C)</Label>
                  <Input
                    type="number" step="0.1"
                    value={editingRecord.water_temp ?? ""}
                    onChange={e => setEditingRecord({ ...editingRecord, water_temp: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contagem de Lixo</Label>
                  <Input
                    type="number"
                    value={editingRecord.trash_count ?? 0}
                    onChange={e => setEditingRecord({ ...editingRecord, trash_count: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Aspecto da Água</Label>
                <Select
                  value={editingRecord.water_appearance || ""}
                  onValueChange={v => setEditingRecord({ ...editingRecord, water_appearance: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {["Transparente", "Verde-claro", "Verde", "Verde-escuro", "Marrom", "Cinza"].map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={editingRecord.notes ?? ""}
                  onChange={e => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecord(null)}>Cancelar</Button>
            <Button onClick={handleSaveRecord} disabled={updateRecord.isPending}>
              {updateRecord.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
