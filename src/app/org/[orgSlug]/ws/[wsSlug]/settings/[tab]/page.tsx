import { notFound } from "next/navigation";
import GeneralTab    from "@/components/workspace/settings/tabs/GeneralTab";
import UsersTab      from "@/components/workspace/settings/tabs/UsersTab";
import AssetsTab     from "@/components/workspace/settings/tabs/AssetsTab";
import IntegrationsTab from "@/components/workspace/settings/tabs/IntegrationsTab";
import ChannelsTab   from "@/components/workspace/settings/tabs/ChannelsTab";

const TABS: Record<string, React.ComponentType> = {
  general:      GeneralTab,
  users:        UsersTab,
  assets:       AssetsTab,
  integrations: IntegrationsTab,
  channels:     ChannelsTab,
};

const TITLES: Record<string, string> = {
  general:      "General",
  users:        "Users",
  assets:       "Shared Assets",
  integrations: "Integrations",
  channels:     "Channels",
};

export default async function WsSettingsTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  const Tab = TABS[tab];
  if (!Tab) notFound();
  return (
    <div className="px-10 py-10">
      <Tab />
    </div>
  );
}
