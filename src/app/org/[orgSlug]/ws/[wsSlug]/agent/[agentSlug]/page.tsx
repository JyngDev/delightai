import { notFound } from "next/navigation";
import { MOCK_DATA } from "@/lib/mock-data";
import AgentHome from "@/components/workspace/AgentHome";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string; agentSlug: string }>;
}) {
  const { orgSlug, wsSlug, agentSlug } = await params;
  const workspace = MOCK_DATA.workspaces.find((w) => w.slug === wsSlug);
  if (!workspace) notFound();
  const agent = workspace.agents.find((a) => a.slug === agentSlug);
  if (!agent) notFound();
  return (
    <AgentHome
      agent={agent}
      orgSlug={orgSlug}
      orgName={MOCK_DATA.organization.name}
      wsSlug={wsSlug}
      wsName={workspace.name}
    />
  );
}
