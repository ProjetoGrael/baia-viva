/**
 * useSupabaseData.ts — Hooks de acesso ao banco de dados via Supabase
 * 
 * Cada hook encapsula uma operação CRUD usando React Query:
 * - useQuery: busca dados com cache automático
 * - useMutation: operações de escrita (insert/update/delete) com invalidação de cache
 * 
 * Convenção: hooks "use<Entidade>" para leitura, "useCreate/Update/Delete<Entidade>" para escrita
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

// ============================================================
// PONTOS DE COLETA — locais fixos onde as medições são feitas
// ============================================================
export function useCollectionPoints() {
  return useQuery({
    queryKey: ["collection_points"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collection_points").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// REGISTROS CIENTÍFICOS — medições de campo (pH, turbidez etc.)
// ============================================================

/** Busca todos os registros científicos com nome do ponto de coleta */
export function useScientificRecords() {
  return useQuery({
    queryKey: ["scientific_records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scientific_records")
        .select("*, collection_points(name)")
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Cria um novo registro científico */
export function useCreateScientificRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: Tables["scientific_records"]["Insert"]) => {
      const { data, error } = await supabase.from("scientific_records").insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scientific_records"] }),
  });
}

/** Atualiza um registro científico existente (admin/professor) */
export function useUpdateScientificRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Tables["scientific_records"]["Update"] & { id: string }) => {
      const { error } = await supabase
        .from("scientific_records")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scientific_records"] }),
  });
}

/** Exclui um registro científico (somente admin) */
export function useDeleteScientificRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scientific_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scientific_records"] }),
  });
}

// ============================================================
// RELATOS COMUNITÁRIOS — denúncias de lixo, poluição etc.
// ============================================================

/** Busca relatos comunitários (visibilidade controlada por RLS) */
export function useCommunityReports() {
  return useQuery({
    queryKey: ["community_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_reports")
        .select("id, type, description, latitude, longitude, photo_url, reporter_name, status, created_at, moderated_at, moderated_by")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Cria um novo relato comunitário */
export function useCreateCommunityReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: Tables["community_reports"]["Insert"]) => {
      const { data, error } = await supabase.from("community_reports").insert(report).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community_reports"] }),
  });
}

/** Atualiza um relato comunitário (admin pode editar qualquer campo) */
export function useUpdateCommunityReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Tables["community_reports"]["Update"] & { id: string }) => {
      const { error } = await supabase
        .from("community_reports")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community_reports"] }),
  });
}

/** Exclui um relato comunitário (somente admin) */
export function useDeleteCommunityReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community_reports"] }),
  });
}

// ============================================================
// MODERAÇÃO — aprovar/rejeitar relatos comunitários
// ============================================================
export function useModerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, moderatorId }: { id: string; status: "approved" | "rejected"; moderatorId: string }) => {
      const { error } = await supabase
        .from("community_reports")
        .update({ status, moderated_by: moderatorId, moderated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community_reports"] }),
  });
}

// ============================================================
// GESTÃO DE USUÁRIOS — perfis + papéis (somente admin via RLS)
// ============================================================

/** Busca todos os perfis com seus respectivos papéis */
export function useAllUsers() {
  return useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("*");
      if (rErr) throw rErr;

      // Junta perfis com papéis — cada perfil recebe seu role e role_id
      return (profiles || []).map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role || "community",
        role_id: roles?.find(r => r.user_id === p.user_id)?.id,
      }));
    },
  });
}

/** Atualiza o papel de um usuário (admin/professor/student/community) */
export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role, existingRoleId }: { userId: string; role: string; existingRoleId?: string }) => {
      if (existingRoleId) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: role as any })
          .eq("id", existingRoleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: role as any });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_users"] }),
  });
}
