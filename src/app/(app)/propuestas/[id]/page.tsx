import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProposalEditor from "./editor";

export default async function ProposalDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("*, companies(id,name), meetings(id,title)")
    .eq("id", params.id)
    .single();
  if (!proposal) notFound();
  return <ProposalEditor proposal={proposal} />;
}
