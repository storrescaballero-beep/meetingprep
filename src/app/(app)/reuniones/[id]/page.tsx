import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MeetingWorkspace from "./workspace";

export default async function MeetingDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: meeting } = await supabase
    .from("meetings")
    .select("*, companies(*), contacts(*)")
    .eq("id", params.id)
    .single();
  if (!meeting) notFound();

  return <MeetingWorkspace meeting={meeting} company={meeting.companies} contact={meeting.contacts} />;
}
