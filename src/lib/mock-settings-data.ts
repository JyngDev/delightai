export interface Member {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  role: "owner" | "admin" | "editor" | "viewer";
  workspaceAccess: "all" | string[];
  status: "active" | "pending";
  lastActiveAt?: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  invitedAt: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
}

export const MOCK_MEMBERS: Member[] = [
  { id: "m1", name: "Joan Laporta", email: "laporta@fcbarcelona.com", avatarInitials: "JL", role: "owner", workspaceAccess: "all", status: "active", lastActiveAt: "2 min ago" },
  { id: "m2", name: "Deco", email: "deco@fcbarcelona.com", avatarInitials: "DC", role: "admin", workspaceAccess: "all", status: "active", lastActiveAt: "1 hour ago" },
  { id: "m3", name: "Lamine Yamal", email: "yamal@fcbarcelona.com", avatarInitials: "LY", role: "editor", workspaceAccess: ["ws_first_team", "ws_academy"], status: "active", lastActiveAt: "3 days ago" },
  { id: "m4", name: "Pedri González", email: "pedri@fcbarcelona.com", avatarInitials: "PG", role: "editor", workspaceAccess: ["ws_first_team"], status: "active", lastActiveAt: "1 week ago" },
  { id: "m5", name: "Raphinha", email: "raphinha@fcbarcelona.com", avatarInitials: "RA", role: "viewer", workspaceAccess: ["ws_first_team"], status: "active", lastActiveAt: "2 weeks ago" },
];

export const MOCK_PENDING_INVITES: PendingInvite[] = [
  { id: "i1", email: "gavi@fcbarcelona.com", role: "editor", invitedAt: "2 days ago" },
  { id: "i2", email: "flick@fcbarcelona.com", role: "viewer", invitedAt: "5 days ago" },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: "inv1", date: "2026-04-15", amount: "$2,400.00", status: "paid" },
  { id: "inv2", date: "2026-03-15", amount: "$2,400.00", status: "paid" },
  { id: "inv3", date: "2026-02-15", amount: "$2,400.00", status: "paid" },
  { id: "inv4", date: "2026-01-15", amount: "$2,400.00", status: "paid" },
];

export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  owner:  { bg: "#f3e8ff", text: "#7c3aed" },
  admin:  { bg: "#eff6ff", text: "#1d4ed8" },
  editor: { bg: "#f0fdf4", text: "#15803d" },
  viewer: { bg: "#f4f4f5", text: "#71717a" },
};
