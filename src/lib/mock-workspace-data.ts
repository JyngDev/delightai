// Workspace Settings mock data — Fan Engagement workspace context

export const WS_MOCK_USERS = [
  { id: "u1", name: "Joan Laporta",   email: "laporta@fcbarcelona.com",  avatarInitials: "JL", wsRole: "Admin",  lastActive: "2 min ago" },
  { id: "u2", name: "Deco",           email: "deco@fcbarcelona.com",     avatarInitials: "DC", wsRole: "Admin",  lastActive: "1 hour ago" },
  { id: "u3", name: "Lamine Yamal",   email: "yamal@fcbarcelona.com",    avatarInitials: "LY", wsRole: "Editor", lastActive: "3 days ago" },
  { id: "u4", name: "Pedri González", email: "pedri@fcbarcelona.com",    avatarInitials: "PG", wsRole: "Editor", lastActive: "1 week ago" },
  { id: "u5", name: "Raphinha",       email: "raphinha@fcbarcelona.com", avatarInitials: "RA", wsRole: "Viewer", lastActive: "2 weeks ago" },
];

export const WS_MOCK_KNOWLEDGE = [
  { id: "k1", name: "Club FAQ",        type: "Document", size: "1.2 MB", usedBy: 2 },
  { id: "k2", name: "Official Website", type: "Website",  size: "Crawled", usedBy: 3 },
  { id: "k3", name: "Match Database",  type: "Database", size: "Live",    usedBy: 1 },
];

export const WS_MOCK_TOOLS = [
  { id: "t1", name: "get_ticket_status",  protocol: "REST API", usedBy: 1 },
  { id: "t2", name: "create_support_ticket", protocol: "REST API", usedBy: 2 },
  { id: "t3", name: "search_match_stats",  protocol: "GraphQL", usedBy: 1 },
];

export const WS_MOCK_PROMPTS = [
  { id: "p1", name: "Greeting",    preview: "안녕하세요! FC Barcelona 공식 챗봇입니다...", usedBy: 3 },
  { id: "p2", name: "Escalation",  preview: "더 나은 도움을 드리기 위해 상담원에게 연결...", usedBy: 2 },
  { id: "p3", name: "Farewell",    preview: "도움이 되셨나요? Visca el Barça! 🔵🔴",     usedBy: 3 },
];

export const WS_MOCK_INTEGRATIONS_INSTALLED = [
  { id: "i1", name: "Mailchimp", color: "#FFE01B", status: "connected",       detail: "Fan newsletter · 3 audiences 연동",  reauth: false },
  { id: "i2", name: "Zendesk",  color: "#03363D", status: "connected",       detail: "API Key configured",              reauth: false },
  { id: "i3", name: "HubSpot",  color: "#FF7A59", status: "connected",       detail: "OAuth · Expires in 30 days",      reauth: false },
  { id: "i4", name: "Airtable", color: "#18BFFF", status: "requires_reauth", detail: "Reauthorization required",        reauth: true  },
];

export const WS_MOCK_INTEGRATIONS_AVAILABLE = [
  { id: "a1", name: "Jira",      desc: "이슈 트래킹 및 프로젝트 관리" },
  { id: "a2", name: "Notion",    desc: "문서 · 위키 연동" },
  { id: "a3", name: "Intercom",  desc: "고객 메시지 플랫폼" },
  { id: "a4", name: "GitHub",    desc: "코드 저장소 연동" },
  { id: "a5", name: "Mixpanel",  desc: "제품 분석 및 사용자 행동 추적" },
  { id: "a6", name: "Discord",   desc: "커뮤니티 채팅 연동" },
];

export const WS_MOCK_CHANNELS_ACTIVE = [
  { id: "c1", name: "Web Chat",   icon: "💬", detail: "2 domains · 3 agents",   status: "active" },
  { id: "c2", name: "Mobile SDK", icon: "📱", detail: "iOS + Android · 2 apps",  status: "active" },
  { id: "c3", name: "Email",      icon: "📧", detail: "support@fcbarcelona.com", status: "active" },
];

export const WS_MOCK_CHANNELS_AVAILABLE = [
  { id: "v1", name: "WhatsApp",  icon: "💚", desc: "WhatsApp Business API 연동" },
  { id: "v2", name: "SMS",       icon: "💬", desc: "SMS 문자 채널" },
  { id: "v3", name: "Voice",     icon: "🎙️", desc: "음성 통화 AI 연결" },
  { id: "v4", name: "Slack",     icon: "🟣", desc: "Slack 봇으로 배포" },
];
