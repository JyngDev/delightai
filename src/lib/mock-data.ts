export type EnvironmentType = "development" | "staging" | "production";

export interface AgentEnvironmentInstance {
  id: string;
  environmentType: EnvironmentType;
  instanceName: string;
  version: string;
  deployedAt?: string;
  deployedBy?: string;
  health: "healthy" | "warning" | "error" | "unknown";
  suspended?: boolean;
  versionNote?: string;
}

export interface WorkspaceMember {
  name: string;
  avatarUrl?: string;
  color?: string;
  role?: string;
}

export interface Agent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instances: AgentEnvironmentInstance[];
  lastEditedAt: string;
  lastEditedBy?: string;
  health?: "healthy" | "warning" | "error" | "unknown";
  metrics?: {
    conversationsLast7Days: number;
    alertCount: number;
    alertSeverity?: { critical: number; warning: number; info: number };
    alertEnv?: EnvironmentType;
    alertMessage?: string;
    csat?: number;
    resolutionRate?: number;
  };
}

export function getEnvInstance(
  agent: Agent,
  env: EnvironmentType
): AgentEnvironmentInstance | null {
  return agent.instances.find((i) => i.environmentType === env) ?? null;
}

export interface TeamMetrics {
  conversationsToday: { value: number; changePercent: number };
  avgCsat: { value: number; change: number };
  activeAgents: { active: number; total: number };
  alerts: { critical: number; warning: number; info: number };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  iconEmoji: string;
  letter?: string;
  color?: string;
  coverImage?: string;
  description?: string;
  memberCount: number;
  members?: WorkspaceMember[];
  createdAt: string;
  agents: Agent[];
  teamMetrics?: TeamMetrics;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  name: string;
  avatarInitials: string;
}

export interface EntryPageData {
  organization: Organization;
  user: User;
  workspaces: Workspace[];
}

export const MOCK_DATA: EntryPageData = {
  organization: {
    id: "org_fcb",
    name: "Operation Div",
    slug: "fcbarcelona",
  },
  user: {
    name: "Joan Laporta",
    avatarInitials: "JL",
  },
  workspaces: [
    {
      id: "ws_fan",
      name: "Fan Engagement",
      slug: "fan-engagement",
      iconEmoji: "📣",
      letter: "F",
      color: "#6366f1",
      coverImage: "https://images.unsplash.com/photo-1641520592277-5d81a1284a16?w=80&h=80&fit=crop&q=80",
      description: "팬들과의 소통을 자동화하고 팬 경험을 개선합니다.",
      memberCount: 8,
      members: [
        { name: "Raphinha",       avatarUrl: "https://i.pravatar.cc/48?img=15", role: "Head of Fan Experience"  },
        { name: "Lamine Yamal",   avatarUrl: "https://i.pravatar.cc/48?img=8",  role: "Content & Growth Lead"   },
        { name: "Pedri González", avatarUrl: "https://i.pravatar.cc/48?img=12", role: "Data Analyst"             },
        { name: "Deco",           avatarUrl: "https://i.pravatar.cc/48?img=3",  role: "Technical Director"       },
        { name: "Ferran Torres",  avatarUrl: "https://i.pravatar.cc/48?img=25", role: "Community Manager"        },
        { name: "Frenkie de Jong",avatarUrl: "https://i.pravatar.cc/48?img=32", role: "Platform Engineer"        },
        { name: "Marc Casadó",    avatarUrl: "https://i.pravatar.cc/48?img=40", role: "Product Coordinator"      },
        { name: "Fermín López",   avatarUrl: "https://i.pravatar.cc/48?img=60", role: "Youth Programs Lead"      },
      ],
      createdAt: "2024-08-15",
      teamMetrics: {
        conversationsToday: { value: 3842, changePercent: 12.4 },
        avgCsat: { value: 4.3, change: 0.2 },
        activeAgents: { active: 2, total: 5 },
        alerts: { critical: 0, warning: 2, info: 1 },
      },
      agents: [
        {
          id: "agent_faq",
          name: "Fan Q&A Bot",
          slug: "fan-qa-bot",
          description: "팬들의 클럽 · 선수 · 경기 관련 질문에 답변합니다.",
          instances: [
            { id: "inst_faq_dev", environmentType: "development", instanceName: "default", version: "v1.4", health: "healthy", deployedBy: "Lamine Yamal", deployedAt: "2026-04-22T08:00:00Z", versionNote: "다국어 지원 추가, 답변 정확도 개선" },
            { id: "inst_faq_prod", environmentType: "production", instanceName: "default", version: "v1.2", health: "healthy", deployedBy: "Deco", deployedAt: "2026-04-20T10:00:00Z", versionNote: "응답 속도 최적화, 선수 정보 업데이트" },
          ],
          lastEditedAt: "2026-04-22T09:15:00Z",
          lastEditedBy: "Raphinha",
          health: "healthy",
          metrics: { conversationsLast7Days: 42000, alertCount: 0, csat: 4.5, resolutionRate: 91 },
        },
        {
          id: "agent_ticket",
          name: "Ticket Assistant",
          slug: "ticket-assistant",
          description: "홈경기 티켓 구매 · 환불 · 좌석 변경을 지원합니다.",
          instances: [
            { id: "inst_ticket_prod", environmentType: "production", instanceName: "default", version: "v0.7", health: "warning", deployedBy: "Pedri González", deployedAt: "2026-04-18T09:00:00Z", versionNote: "환불 플로우 개선, 결제 오류 핫픽스 포함" },
          ],
          lastEditedAt: "2026-04-21T14:30:00Z",
          lastEditedBy: "Raphinha",
          health: "warning",
          metrics: { conversationsLast7Days: 18500, alertCount: 1, alertSeverity: { critical: 0, warning: 1, info: 0 }, alertEnv: "production", alertMessage: "결제 실패율 8% 임계치 초과 — 환불 플로우 점검 필요", csat: 3.8, resolutionRate: 74 },
        },
        {
          id: "agent_merch",
          name: "Merch Recommender",
          slug: "merch-recommender",
          description: "팬 구매 이력을 분석해 굿즈 · 유니폼 개인 맞춤 추천.",
          instances: [
            { id: "inst_merch_stg", environmentType: "staging", instanceName: "default", version: "v1.0", health: "healthy", deployedBy: "Raphinha", deployedAt: "2026-04-22T15:00:00Z", versionNote: "첫 번째 공식 릴리스, 협업 필터링 모델 적용" },
          ],
          lastEditedAt: "2026-04-23T07:20:00Z",
          lastEditedBy: "Raphinha",
          health: "healthy",
          metrics: { conversationsLast7Days: 0, alertCount: 0 },
        },
        {
          id: "agent_live",
          name: "Live Match Companion",
          slug: "live-match-companion",
          description: "경기 중 실시간 통계 · 하이라이트 · 선수 정보를 팬에게 제공.",
          instances: [
            { id: "inst_live_dev", environmentType: "development", instanceName: "default", version: "v0.7", health: "healthy", deployedBy: "Lamine Yamal", deployedAt: "2026-04-22T22:00:00Z", versionNote: "실시간 하이라이트 클립 링크 삽입 기능 추가" },
            { id: "inst_live_stg", environmentType: "staging", instanceName: "default", version: "v0.6", health: "warning", deployedBy: "Pedri González", deployedAt: "2026-04-21T20:00:00Z", versionNote: "경기 통계 API 연동, 지연 응답 이슈 조사 중" },
          ],
          lastEditedAt: "2026-04-22T23:55:00Z",
          lastEditedBy: "Deco",
          health: "warning",
          metrics: { conversationsLast7Days: 0, alertCount: 1, alertSeverity: { critical: 0, warning: 0, info: 1 }, alertEnv: "staging", alertMessage: "응답 지연 P95 > 3s 감지 — 경기 통계 API 연동 확인 권장" },
        },
        {
          id: "agent_social",
          name: "Social Monitor",
          slug: "social-monitor",
          description: "SNS 언급 모니터링 및 초기 응답 자동화.",
          instances: [
            { id: "inst_social_dev", environmentType: "development", instanceName: "default", version: "v0.3", health: "healthy", deployedBy: "Lamine Yamal", deployedAt: "2026-04-19T11:00:00Z", versionNote: "Twitter·Instagram 모니터링 초기 구현" },
          ],
          lastEditedAt: "2026-04-19T11:00:00Z",
          lastEditedBy: "Lamine Yamal",
          health: "unknown",
          metrics: { conversationsLast7Days: 0, alertCount: 0 },
        },
        {
          id: "agent_newsletter",
          name: "Fan Newsletter Bot",
          slug: "fan-newsletter-bot",
          description: "주간 팬 뉴스레터 자동 생성 및 발송.",
          instances: [
            { id: "inst_newsletter_prod", environmentType: "production", instanceName: "default", version: "v1.1", health: "healthy", deployedBy: "Deco", deployedAt: "2026-02-10T09:00:00Z", suspended: true, versionNote: "템플릿 개선 및 발송 스케줄 자동화 완료" },
          ],
          lastEditedAt: "2026-03-15T11:00:00Z",
          lastEditedBy: "Raphinha",
          health: "warning",
          metrics: { conversationsLast7Days: 0, alertCount: 1, alertSeverity: { critical: 0, warning: 1, info: 0 }, alertEnv: "production", alertMessage: "발송 대기열 미처리 — Suspended 해제 후 확인 필요" },
        },
      ],
    },
    {
      id: "ws_ops",
      name: "Football Operations",
      slug: "football-ops",
      iconEmoji: "⚽",
      letter: "F",
      color: "#0284c7",
      coverImage: "https://images.unsplash.com/photo-1660304755794-a4c94ca4cceb?w=80&h=80&fit=crop&q=80",
      description: "경기 데이터 분석 · 스카우팅 · 전술 인사이트를 제공합니다.",
      memberCount: 5,
      members: [
        { name: "Deco",           avatarUrl: "https://i.pravatar.cc/48?img=3",  role: "Technical Director"  },
        { name: "Pedri González", avatarUrl: "https://i.pravatar.cc/48?img=12", role: "Data Analyst"         },
        { name: "Pau Cubarsí",    avatarUrl: "https://i.pravatar.cc/48?img=20", role: "Performance Analyst"  },
        { name: "Alejandro Balde",avatarUrl: "https://i.pravatar.cc/48?img=48", role: "Operations Lead"      },
        { name: "Iñigo Martínez", avatarUrl: "https://i.pravatar.cc/48?img=35", role: "Scouting Analyst"     },
      ],
      createdAt: "2024-09-01",
      teamMetrics: {
        conversationsToday: { value: 1284, changePercent: 8.2 },
        avgCsat: { value: 4.1, change: 0.1 },
        activeAgents: { active: 1, total: 2 },
        alerts: { critical: 0, warning: 1, info: 0 },
      },
      agents: [
        {
          id: "agent_match",
          name: "Match Analysis",
          slug: "match-analysis",
          description: "경기 데이터를 분석해 전술 인사이트를 제공합니다.",
          instances: [
            { id: "inst_match_dev", environmentType: "development", instanceName: "default", version: "v2.1", health: "healthy", deployedBy: "Deco", deployedAt: "2026-04-22T07:00:00Z", versionNote: "xG 모델 v3 교체, 압박 강도 지표 신규 추가" },
            { id: "inst_match_stg", environmentType: "staging", instanceName: "default", version: "v2.0", health: "healthy", deployedBy: "Pedri González", deployedAt: "2026-04-21T12:00:00Z", versionNote: "세트피스 분석 모듈 통합, UI 리포트 개선" },
            { id: "inst_match_prod", environmentType: "production", instanceName: "default", version: "v1.9", health: "healthy", deployedBy: "Raphinha", deployedAt: "2026-04-15T09:00:00Z", versionNote: "패스 네트워크 시각화 및 안정성 패치" },
          ],
          lastEditedAt: "2026-04-22T08:00:00Z",
          lastEditedBy: "Deco",
          health: "healthy",
          metrics: { conversationsLast7Days: 3200, alertCount: 1, alertSeverity: { critical: 0, warning: 1, info: 0 }, alertEnv: "production", alertMessage: "데이터 파이프라인 지연으로 xG 계산 누락 발생" },
        },
        {
          id: "agent_scout",
          name: "Scouting Assistant",
          slug: "scouting-assistant",
          description: "선수 프로필 조회 · 스카우팅 보고서 자동 생성.",
          instances: [
            { id: "inst_scout_dev", environmentType: "development", instanceName: "default", version: "v0.5", health: "healthy", deployedBy: "Deco", deployedAt: "2026-04-18T16:00:00Z", versionNote: "Transfermarkt 데이터 파이프라인 연결 완료" },
          ],
          lastEditedAt: "2026-04-18T16:45:00Z",
          lastEditedBy: "Deco",
          health: "unknown",
          metrics: { conversationsLast7Days: 0, alertCount: 0 },
        },
        {
          id: "agent_injury",
          name: "Injury Tracker",
          slug: "injury-tracker",
          description: "선수 부상 현황 추적 및 복귀 일정 예측.",
          instances: [
            { id: "inst_injury_prod", environmentType: "production", instanceName: "default", version: "v2.3", health: "healthy", deployedBy: "Pedri González", deployedAt: "2025-11-20T10:00:00Z", suspended: true, versionNote: "복귀 예측 모델 정확도 향상, 의료팀 연동" },
          ],
          lastEditedAt: "2026-01-08T14:00:00Z",
          lastEditedBy: "Deco",
          health: "healthy",
          metrics: { conversationsLast7Days: 0, alertCount: 0 },
        },
      ],
    },
    {
      id: "ws_academy",
      name: "Academy",
      slug: "academy",
      iconEmoji: "🏟️",
      letter: "A",
      color: "#059669",
      coverImage: "https://images.unsplash.com/photo-1544366981-53db834f982a?w=80&h=80&fit=crop&q=80",
      description: "유스 아카데미 선수 성장 및 교육 프로그램을 지원합니다.",
      memberCount: 3,
      members: [
        { name: "Marc Casadó",  avatarUrl: "https://i.pravatar.cc/48?img=40", role: "Product Coordinator"   },
        { name: "Fermín López", avatarUrl: "https://i.pravatar.cc/48?img=60", role: "Youth Programs Lead"    },
        { name: "Pau Cubarsí",  avatarUrl: "https://i.pravatar.cc/48?img=20", role: "Performance Analyst"   },
      ],
      createdAt: "2025-01-10",
      agents: [],
    },
  ],
};
