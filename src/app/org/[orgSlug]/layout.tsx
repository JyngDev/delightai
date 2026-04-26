import { MOCK_DATA } from "@/lib/mock-data";
import Sidebar from "@/components/layout/Sidebar";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { organization, user, workspaces } = MOCK_DATA;

  return (
    <div className="flex h-screen overflow-hidden bg-white" style={{ animation: "fadeIn 300ms ease" }}>
      <Sidebar organization={organization} user={user} workspaces={workspaces} />
      <div className="flex-1 min-w-0 overflow-auto bg-white">
        {children}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
