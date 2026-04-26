import { redirect } from "next/navigation";

export default async function WsSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  redirect(`/org/${orgSlug}/ws/${wsSlug}/settings/general`);
}
