import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import TasksClient from "./client";

export default async function TasksPage() {
  const supabase = createClient();
  const [{ data: tasks }, { data: companies }, { data: profile }] = await Promise.all([
    supabase.from("tasks").select("*, companies(name)").order("status", { ascending: true }).order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("companies").select("id,name").order("name"),
    supabase.from("user_profiles").select("workspace_id").single(),
  ]);

  return (
    <div>
      <PageHeader title="Tareas" subtitle="Lo que tienes que hacer para que ninguna oportunidad se enfríe." />
      <TasksClient initial={tasks ?? []} companies={companies ?? []} workspaceId={profile?.workspace_id ?? ""} />
    </div>
  );
}
