import { ProjectsView, type ProjectRow } from "@/components/projects/projects-view";
import { requireMembership } from "@/lib/auth/server";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  if (!hasSupabaseEnv()) return <ProjectsView rows={[]} />;
  const { membership, supabase } = await requireMembership();
  const { data, error } = await supabase.from("projects").select("*").eq("organization_id", membership.organization_id).order("source_updated_at", { ascending: false, nullsFirst: false });
  if (error) return <ProjectsView rows={[]} missingTable />;
  return <ProjectsView rows={(data || []) as ProjectRow[]} />;
}
