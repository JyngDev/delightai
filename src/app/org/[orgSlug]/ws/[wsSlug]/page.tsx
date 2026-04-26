import { notFound } from "next/navigation";
import { MOCK_DATA } from "@/lib/mock-data";
import WorkspaceHome from "@/components/workspace/WorkspaceHome";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const workspace = MOCK_DATA.workspaces.find((w) => w.slug === wsSlug);
  if (!workspace) notFound();
  return <WorkspaceHome workspace={workspace} orgSlug={orgSlug} orgName={MOCK_DATA.organization.name} />;
}
