"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Organization, User, Workspace } from "@/lib/mock-data";
import NewWorkspaceDialog from "@/components/workspace/NewWorkspaceDialog";

const MIN_WIDTH = 220;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 280;

const OTHER_ORGS = [
  { id: "org_tech", name: "Tech Div", slug: "tech-org" },
  { id: "org_design", name: "Design Div", slug: "design-org" },
  { id: "org_marketing", name: "Marketing Div", slug: "marketing-org" },
];

const ORG_SETTINGS_NAV = [
  { key: "general",  label: "General" },
  { key: "members",  label: "Members" },
  { key: "roles",    label: "Roles" },
  { key: "security", label: "Security" },
  { key: "billing",  label: "Billing" },
  { key: "profile",  label: "Profile" },
];

const WS_SETTINGS_NAV = [
  { key: "general",      label: "General" },
  { key: "users",        label: "Users" },
  { key: "assets",       label: "Shared Assets" },
  { key: "integrations", label: "Integrations" },
  { key: "channels",     label: "Channels" },
];

interface SidebarProps {
  organization: Organization;
  user: User;
  workspaces: Workspace[];
}

export default function Sidebar({ organization, user, workspaces }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isSettings = pathname.includes("/settings");
  const isWsSettings = isSettings && /\/ws\/[^/]+\/settings/.test(pathname);
  const isOrgSettings = isSettings && !isWsSettings;

  const wsSlugMatch = pathname.match(/\/ws\/([^/]+)/);
  const wsSlug = wsSlugMatch?.[1] ?? "";

  const activeTab = pathname.match(/\/settings\/([^/]+)/)?.[1] ?? "general";

  const settingsNav = isWsSettings ? WS_SETTINGS_NAV : ORG_SETTINGS_NAV;
  const settingsTitle = isWsSettings ? "Workspace Settings" : "Organization Settings";
  const backHref = isWsSettings
    ? `/org/${organization.slug}/ws/${wsSlug}`
    : `/org/${organization.slug}`;

  const settingsBasePath = isWsSettings
    ? `/org/${organization.slug}/ws/${wsSlug}/settings`
    : `/org/${organization.slug}/settings`;

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuPos, setProfileMenuPos] = useState<{ top: number; left: number } | null>(null);

  const isAgentPage = /\/agent\/[^/]+/.test(pathname);

  const collapse = useCallback(() => {
    setContentVisible(false);
    setTimeout(() => setCollapsed(true), 120);
  }, []);

  const expand = useCallback(() => {
    setCollapsed(false);
    setTimeout(() => setContentVisible(true), 180);
  }, []);

  useEffect(() => {
    if (isSettings || isAgentPage) collapse();
  }, [isSettings, isAgentPage, collapse]);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [flyout, setFlyout] = useState<{ ws: typeof workspaces[0]; top: number; left: number } | null>(null);
  const flyoutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - startX.current;
    setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false);
      }

    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function onDragHandleMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function isAgentActive(wsSlug: string, agentSlug: string) {
    return pathname.includes(`/ws/${wsSlug}/agent/${agentSlug}`);
  }

  function isWorkspaceActive(wsSlug: string) {
    return pathname.includes(`/ws/${wsSlug}`) && !pathname.includes("/agent/");
  }

  return (
    <>
    {showNewWorkspace && <NewWorkspaceDialog onClose={() => setShowNewWorkspace(false)} />}
    <aside
      className="flex shrink-0 h-full bg-white"
      style={{ boxShadow: "rgba(0,0,0,0.06) 1px 0px 0px 0px", zIndex: 40, position: "relative" }}
    >
      {/* Main sidebar column */}
      <div
        className="flex flex-col relative"
        style={{
          width: collapsed ? 56 : width,
          transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Logo row */}
        <div className="px-4 h-12 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid #f4f4f5" }}>
          <div className="relative group shrink-0">
            <Link href={`/org/${organization.slug}`} className="block hover:opacity-70 transition-opacity cursor-pointer">
              <Image src="/images/logo.svg" alt="delight.ai" width={24} height={24} priority className={collapsed ? "group-hover:opacity-0 transition-opacity duration-150" : ""} />
            </Link>
            {collapsed && (
              <button
                onClick={expand}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[#a1a1aa] hover:text-[#171717]"
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                  <rect x="1" y="1" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 1v12" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={collapse}
              className="flex items-center justify-center w-6 h-6 rounded-md text-[#a1a1aa] hover:text-[#171717] hover:bg-[#f4f4f5] transition-colors"
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <rect x="1" y="1" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 1v12" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapsed: icon-only nav */}
        {collapsed && (
          <>
            <div className="px-3 pt-3 pb-1 shrink-0 relative" ref={dropdownRef}>
              <button
                onClick={() => setOrgDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-center py-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                title={organization.name}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: "#171717" }}
                >
                  {organization.name[0]}
                </div>
              </button>
              {orgDropdownOpen && (
                <div
                  className="absolute left-full top-0 ml-2 rounded-lg bg-white py-1 z-50"
                  style={{ boxShadow: "rgba(0,0,0,0.1) 0px 4px 16px, rgba(0,0,0,0.08) 0px 0px 0px 1px", minWidth: "160px" }}
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#f4f4f5]">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: "#171717" }}
                    >
                      {organization.name[0]}
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] truncate flex-1">{organization.name}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-[#171717]">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {OTHER_ORGS.map((org) => (
                    <Link
                      key={org.id}
                      href={`/org/${org.slug}`}
                      onClick={() => setOrgDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#f4f4f5] transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: "#525252" }}
                      >
                        {org.name[0]}
                      </div>
                      <span className="text-[14px] font-medium text-[#171717] truncate">{org.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
              <Link
                href={`/org/${organization.slug}`}
                className={`w-full flex items-center justify-center py-1.5 rounded-md transition-colors ${
                  pathname === `/org/${organization.slug}` ? "bg-[#f4f4f5] text-[#171717]" : "text-[#444444] hover:bg-[#f4f4f5]"
                }`}
                title="Home"
              >
                <svg width="16" height="16" viewBox="0 0 13 13" fill="none">
                  <path d="M1.5 6L6.5 1.5L11.5 6V11.5H1.5V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </Link>
              <button onClick={() => setShowNewWorkspace(true)} className="w-full flex items-center justify-center py-1.5 rounded-md text-[#444444] hover:bg-[#f4f4f5] transition-colors cursor-pointer" title="New Workspace">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="relative"
                  onMouseEnter={(e) => {
                    if (flyoutTimeout.current) clearTimeout(flyoutTimeout.current);
                    if (ws.agents.length === 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setFlyout({ ws, top: rect.top, left: rect.right + 8 });
                  }}
                  onMouseLeave={() => {
                    flyoutTimeout.current = setTimeout(() => setFlyout(null), 120);
                  }}
                >
                  <Link
                    href={`/org/${organization.slug}/ws/${ws.slug}`}
                    className="flex items-center justify-center py-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors"
                    title={ws.name}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden"
                      style={{ background: ws.color ?? "#525252" }}
                    >
                      {ws.coverImage
                        ? <img src={ws.coverImage} alt={ws.name} className="w-full h-full object-cover" />
                        : ws.letter ?? ws.name[0]
                      }
                    </div>
                  </Link>
                </div>
              ))}
            </nav>
          </>
        )}

        {/* Org Switcher + Nav + Bottom — hidden when collapsed */}
        {!collapsed && (
          <div
            className="flex flex-col flex-1 min-h-0"
            style={{
              opacity: contentVisible ? 1 : 0,
              transition: "opacity 120ms ease",
            }}
          >
            <div className="px-3 pt-3 pb-3 shrink-0 relative" ref={dropdownRef}>
              <button
                onClick={() => setOrgDropdownOpen((v) => !v)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-[#f4f4f5] transition-colors cursor-pointer"
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: "#171717" }}
                >
                  {organization.name[0]}
                </div>
                <span className="flex-1 text-[14px] font-medium text-[#171717] truncate">
                  {organization.name}
                </span>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className="text-[#a1a1aa] shrink-0 transition-transform duration-150"
                  style={{ transform: orgDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {orgDropdownOpen && (
                <div
                  className="absolute left-3 right-3 top-full mt-1 rounded-lg bg-white py-1 z-50"
                  style={{ boxShadow: "rgba(0,0,0,0.1) 0px 4px 16px, rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#f4f4f5]">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: "#171717" }}
                    >
                      {organization.name[0]}
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] truncate flex-1">{organization.name}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-[#171717]">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {OTHER_ORGS.map((org) => (
                    <Link
                      key={org.id}
                      href={`/org/${org.slug}`}
                      onClick={() => setOrgDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#f4f4f5] transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: "#525252" }}
                      >
                        {org.name[0]}
                      </div>
                      <span className="text-[14px] font-medium text-[#171717] truncate">{org.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pt-0 pb-2 space-y-3">
              <Link
                href={`/org/${organization.slug}`}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[14px] font-medium transition-colors ${
                  pathname === `/org/${organization.slug}` ? "bg-[#f4f4f5] text-[#171717]" : "text-[#444444] hover:bg-[#f4f4f5]"
                }`}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                    <path d="M1.5 6L6.5 1.5L11.5 6V11.5H1.5V6Z" stroke="#444444" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </div>
                Home
              </Link>
              <button onClick={() => setShowNewWorkspace(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[14px] font-medium text-[#444444] hover:bg-[#f4f4f5] transition-colors">
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="#444444" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                New Workspace
              </button>
              {workspaces.map((ws) => {
                const wsActive = isWorkspaceActive(ws.slug);
                return (
                  <div key={ws.id}>
                    <Link
                      href={`/org/${organization.slug}/ws/${ws.slug}`}
                      className={`nav-item flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors min-w-0 w-full ${
                        wsActive ? "bg-[#f4f4f5] text-[#171717]" : "text-[#444444] hover:bg-[#f4f4f5]"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden"
                        style={{ background: ws.color ?? "#525252" }}
                      >
                        {ws.coverImage
                          ? <img src={ws.coverImage} alt={ws.name} className="w-full h-full object-cover" />
                          : ws.letter ?? ws.name[0]
                        }
                      </div>
                      <span className="text-[14px] font-medium truncate flex-1">{ws.name}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="nav-item-arrow shrink-0 text-[#a1a1aa]">
                        <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>

                    <div className="mt-0.5 space-y-0.5">
                      {ws.agents.length === 0 ? (
                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[#888888] hover:text-[#666666] hover:bg-[#f4f4f5] transition-colors w-full">
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
                            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          <span className="text-[14px]">New Agent</span>
                        </button>
                      ) : (
                        ws.agents.map((agent) => {
                          const active = isAgentActive(ws.slug, agent.slug);
                          return (
                            <Link
                              key={agent.id}
                              href={`/org/${organization.slug}/ws/${ws.slug}/agent/${agent.slug}`}
                              className={`nav-item flex items-center px-2 py-1.5 rounded-md transition-colors min-w-0 w-full ${
                                active ? "bg-[#f4f4f5] text-[#171717]" : "text-[#888888] hover:bg-[#f4f4f5] hover:text-[#171717]"
                              }`}
                            >
                              <span className="text-[14px] font-normal truncate flex-1">{agent.name}</span>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="nav-item-arrow shrink-0 text-[#a1a1aa]">
                                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </nav>

          </div>
        )}

        {/* Bottom: user profile — always visible */}
        <div className="px-3 pb-3 pt-3 shrink-0 relative" style={{ borderTop: "1px solid #f4f4f5" }}>
          <button
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setProfileMenuPos({ top: window.innerHeight - rect.top + 4, left: rect.left });
              setProfileMenuOpen((v) => !v);
            }}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left hover:bg-[#f4f4f5] transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: "#525252" }}>
              {user.avatarInitials}
            </div>
            {!collapsed && (
              <span className="text-[14px] font-medium text-[#666666] truncate">{user.name}</span>
            )}
          </button>

          {profileMenuOpen && profileMenuPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
              <div
                className="fixed rounded-lg bg-white py-1 z-50"
                style={{ bottom: profileMenuPos.top, left: profileMenuPos.left, boxShadow: "rgba(0,0,0,0.1) 0px 4px 16px, rgba(0,0,0,0.08) 0px 0px 0px 1px", minWidth: "180px" }}
              >
                <button
                  onClick={() => { sessionStorage.removeItem("onboarding_shown"); sessionStorage.removeItem("onboarding_done"); setProfileMenuOpen(false); router.push("/login"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#888888] shrink-0">
                    <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9.5 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[14px] font-medium text-[#171717]">Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Drag handle — only when expanded */}
        {!collapsed && (
          <div
            onMouseDown={onDragHandleMouseDown}
            className="absolute top-0 right-0 h-full w-1 cursor-col-resize group"
          >
            <div className="absolute right-0 top-0 h-full w-px bg-transparent group-hover:bg-[#e4e4e7] transition-colors duration-150" />
          </div>
        )}
      </div>

      {/* Collapsed workspace flyout */}
      {flyout && (
        <div
          className="fixed rounded-lg bg-white py-1"
          style={{
            top: flyout.top,
            left: flyout.left,
            zIndex: 9999,
            boxShadow: "rgba(0,0,0,0.1) 0px 4px 16px, rgba(0,0,0,0.08) 0px 0px 0px 1px",
            minWidth: "180px",
          }}
          onMouseEnter={() => {
            if (flyoutTimeout.current) clearTimeout(flyoutTimeout.current);
          }}
          onMouseLeave={() => setFlyout(null)}
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide">{flyout.ws.name}</p>
          {flyout.ws.agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/org/${organization.slug}/ws/${flyout.ws.slug}/agent/${agent.slug}`}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#f4f4f5] transition-colors"
              onClick={() => setFlyout(null)}
            >
              <span className="text-[13px] text-[#171717] font-medium truncate">{agent.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Settings sub-nav panel */}
      {isSettings && (
        <div
          className="flex flex-col"
          style={{ borderLeft: "1px solid #f4f4f5", width: "220px" }}
        >
          {/* Header: back arrow + title */}
          <div className="h-12 flex items-center gap-2 px-3 shrink-0">
            <Link
              href={backHref}
              className="flex items-center justify-center w-6 h-6 rounded-md text-[#a1a1aa] hover:text-[#171717] hover:bg-[#f4f4f5] transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className="text-[13px] font-semibold text-[#171717] truncate">{settingsTitle}</span>
          </div>

          {/* Nav items */}
          <nav className="px-3 pt-3 space-y-0.5">
            {settingsNav.map(({ key, label }) => {
              const active = activeTab === key;
              return (
                <Link
                  key={key}
                  href={`${settingsBasePath}/${key}`}
                  className={`block px-2 py-1.5 rounded-md text-[14px] font-medium transition-colors ${
                    active ? "bg-[#f4f4f5] text-[#171717]" : "text-[#666666] hover:bg-[#f4f4f5] hover:text-[#171717]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
    </>
  );
}
