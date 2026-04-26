import { notFound } from "next/navigation";
import GeneralTab from "@/components/settings/tabs/GeneralTab";
import MembersTab from "@/components/settings/tabs/MembersTab";
import RolesTab from "@/components/settings/tabs/RolesTab";
import SecurityTab from "@/components/settings/tabs/SecurityTab";
import BillingTab from "@/components/settings/tabs/BillingTab";
import ProfileTab from "@/components/settings/tabs/ProfileTab";

const TABS: Record<string, React.ComponentType> = {
  general:  GeneralTab,
  members:  MembersTab,
  roles:    RolesTab,
  security: SecurityTab,
  billing:  BillingTab,
  profile:  ProfileTab,
};

const TITLES: Record<string, string> = {
  general:  "General",
  members:  "Members",
  roles:    "Roles",
  security: "Security",
  billing:  "Billing",
  profile:  "Profile",
};

export default async function SettingsTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  const Tab = TABS[tab];
  if (!Tab) notFound();
  return (
    <div className="px-10 py-10">
      <h1 className="text-[22px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>
        {TITLES[tab]}
      </h1>
      <Tab />
    </div>
  );
}
