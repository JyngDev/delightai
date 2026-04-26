# Workspace — 화면 설계 명세

> **문서 상태**: v0.1
> **작성일**: 2026-04-22
> **상위 문서**: PRD.md §8.3 (S-03 Workspace Home), §8.4 (S-04 Workspace Settings)
> **관련 문서**: ORG_SETTINGS_SPEC.md (Org Settings와 구분 참고)
> **대상 독자**: 디자이너, 프론트엔드 개발자, QA
> **선행 조건**: PRD.md §5 (IA), §7 (네비게이션), §10 (컴포넌트), §11 (권한)

---

## 목차

1. [개요](#1-개요)
2. [진입 경로 및 권한](#2-진입-경로-및-권한)
3. [공통 레이아웃](#3-공통-레이아웃)
4. [Workspace Home (S-03)](#4-workspace-home-s-03)
5. [Workspace Settings 하위 화면](#5-workspace-settings-하위-화면)
   - 5.1 [General](#51-general)
   - 5.2 [Users](#52-users)
   - 5.3 [Shared Assets](#53-shared-assets)
   - 5.4 [Integrations](#54-integrations)
   - 5.5 [Channels](#55-channels)
6. [공통 컴포넌트](#6-공통-컴포넌트)
7. [상태 및 에러 처리](#7-상태-및-에러-처리)
8. [데이터 모델](#8-데이터-모델)
9. [Agent 생성 플로우](#9-agent-생성-플로우)
10. [오픈 이슈](#10-오픈-이슈)

---

## 1. 개요

### 1.1 Workspace의 역할

Workspace는 **팀·부서·용도별 작업 공간**으로, Organization과 AI Agent 사이의 중간 계층이다. 하나의 Org 안에 여러 Workspace가 공존하며, 각 Workspace는 독립적인 Agent 그룹·자산·연동 설정을 가진다.

### 1.2 Org Settings vs Workspace Settings

이 구분은 사용자 혼동의 주요 원인이므로 명확히 분리한다.

| 구분          | Organization Settings          | Workspace Settings           |
| ------------- | ------------------------------ | ---------------------------- |
| **책임 범위** | 조직 전체 (모든 Workspace)     | 단일 Workspace               |
| **주 사용자** | Org Admin, Owner               | Workspace Admin              |
| **관리 대상** | 멤버·결제·보안 정책            | Agent 자산·연동·채널         |
| **멤버 관리** | 전체 Org 멤버 (초대·역할)      | Workspace 내 접근 권한만     |
| **진입 경로** | 사이드바 하단 `⚙ Org Settings` | Workspace 내부 사이드바 그룹 |

### 1.3 화면 목록

| ID     | 화면명                             | 경로                                        | 우선순위 |
| ------ | ---------------------------------- | ------------------------------------------- | -------- |
| S-03   | Workspace Home                     | `/org/{slug}/ws/{ws}`                       | P0       |
| S-04-1 | Workspace Settings - General       | `/org/{slug}/ws/{ws}/settings/general`      | P1       |
| S-04-2 | Workspace Settings - Users         | `/org/{slug}/ws/{ws}/settings/users`        | P1       |
| S-04-3 | Workspace Settings - Shared Assets | `/org/{slug}/ws/{ws}/settings/assets`       | P1       |
| S-04-4 | Workspace Settings - Integrations  | `/org/{slug}/ws/{ws}/settings/integrations` | P1       |
| S-04-5 | Workspace Settings - Channels      | `/org/{slug}/ws/{ws}/settings/channels`     | P1       |
| S-03-A | Agent 생성 모달                    | Modal overlay                               | P0       |

---

## 2. 진입 경로 및 권한

### 2.1 진입 경로

```
A. Entry 화면 → Workspace 카드 클릭 → Workspace Home
B. 사이드바 Workspace Switcher → 다른 Workspace 선택
C. 브레드크럼 → Workspace 이름 클릭
D. Agent 화면에서 뒤로가기 → 소속 Workspace Home
E. 직접 URL 진입
```

기본 랜딩: **Workspace Home** (Agent 목록)

### 2.2 권한별 가능한 작업

| Role   | Workspace Home | General | Users | Shared Assets | Integrations | Channels |
| ------ | -------------- | ------- | ----- | ------------- | ------------ | -------- |
| Owner  | ✅ 모두        | ✅      | ✅    | ✅            | ✅           | ✅       |
| Admin  | ✅ 모두        | ✅      | ✅    | ✅            | ✅           | ✅       |
| Editor | ✅ Agent 생성  | 👁      | 👁    | ✅            | 👁           | ✅       |
| Viewer | 👁 보기만      | 👁      | 👁    | 👁            | 👁           | 👁       |

**Workspace 자체 삭제 권한**: Admin 이상 (Owner는 당연히 포함)

### 2.3 Workspace 간 격리

- A Workspace의 멤버는 B Workspace의 데이터에 접근 불가 (Org Owner/Admin 제외)
- Shared Assets는 **Workspace 내부에서만** 공유됨 (Workspace 간 공유 불가)
- 연동 계정(Integrations)은 Workspace별로 독립

---

## 3. 공통 레이아웃

### 3.1 전체 앱 쉘

Workspace 내부의 모든 화면은 다음 구조를 따른다.

```
┌─────────────┬───────────────────────────────────────────┐
│ [Sidebar]   │ [Topbar]                                  │
│             ├───────────────────────────────────────────┤
│ 🏢 Org    ▼ │                                           │
│ 📁 WS     ▼ │         [Content Area]                    │
│             │                                           │
│ AI AGENTS   │                                           │
│  🤖 Agent 1 │                                           │
│  🤖 Agent 2 │                                           │
│  🤖 Agent 3 │                                           │
│  + New      │                                           │
│             │                                           │
│ WORKSPACE   │                                           │
│  ⚙ General  │                                           │
│  👥 Users   │                                           │
│  📦 Assets  │                                           │
│  🔗 Integr. │                                           │
│  💬 Channels│                                           │
└─────────────┴───────────────────────────────────────────┘
```

### 3.2 사이드바 구성 (Workspace 컨텍스트)

**너비**: 220px 고정

```
┌──────────────────────────┐
│ 🏢 Acme Corp        ▼    │  ← Org Switcher
├──────────────────────────┤
│ 📁 Customer Support ▼    │  ← Workspace Switcher (강조)
├──────────────────────────┤
│ AI AGENTS                │  ← 그룹 레이블
│  🤖 Support Bot          │  ← Agent 목록 (최대 50개 표시, 초과 시 검색)
│  🤖 FAQ Helper           │
│  🤖 Onboarding           │
│  + New Agent             │
├──────────────────────────┤
│ WORKSPACE SETTINGS       │
│  ⚙ General               │
│  👥 Users                │
│  📦 Shared Assets        │
│  🔗 Integrations         │
│  💬 Channels             │
├──────────────────────────┤
│ ← Back to Home           │  ← Entry 복귀
│ ⚙ Org Settings           │
│ 👤 Profile               │
└──────────────────────────┘
```

**동작 규칙**:

- Agent 목록이 많으면 사이드바 내 검색창 노출 (10개 초과 시)
- 현재 선택된 Agent/메뉴는 배경 어둡게 처리 (`#1a1a1a`, 흰 텍스트)
- Workspace Switcher 드롭다운에는 **접근 권한 있는 WS만** 표시

### 3.3 브레드크럼

| 화면           | 브레드크럼                                                 |
| -------------- | ---------------------------------------------------------- |
| Workspace Home | `🏢 Acme Corp / 📁 Customer Support`                       |
| Settings 하위  | `🏢 Acme Corp / 📁 Customer Support / ⚙ Settings / {menu}` |

---

## 4. Workspace Home (S-03)

**경로**: `/org/{slug}/ws/{wsSlug}`
**목적**: Workspace 내부 진입 직후 Agent 목록을 한눈에 보고 관리

### 4.1 레이아웃

```
📁 Customer Support                    [⚙] [+ Invite to WS] [+ New Agent]
3 Agents · 12 Users · Created 2024-08-15

─────────────────────────────────────────────────────────────

[🔍 Search agents...]     [Filter: All ▼] [Sort: Last edited ▼]  [▦ Grid] [☰ List]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🤖 Support   │ │ 🤖 FAQ       │ │ 🤖 Onboarding│
│    Bot       │ │    Helper    │ │              │
│              │ │              │ │              │
│ Last edit:   │ │ Last edit:   │ │ Last edit:   │
│ 2 hours ago  │ │ 1 day ago    │ │ 5 days ago   │
│              │ │              │ │              │
│ [D][S][P]    │ │ [D] [P]      │ │ [D]          │
│ 12.4K convs  │ │ 3.2K convs   │ │ Not deployed │
│ ⚠ 2 alerts   │ │ —            │ │ —            │
└──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐
│    + New     │
│   Agent      │
│              │
│ (점선 카드)   │
└──────────────┘
```

### 4.2 헤더 영역

**구성**:

- Workspace 아이콘 + 이름 (24px, 굵게)
- 메타 정보: Agent 수 · 멤버 수 · 생성일
- 우측 액션:
  - `⚙` 아이콘 → Workspace Settings General로 이동
  - `+ Invite to WS` → Users 관리 모달
  - `+ New Agent` → Agent 생성 모달 (메인 CTA)

### 4.3 필터·정렬·검색

**검색창**: Agent 이름, 설명으로 실시간 필터
**필터**:

- Environment Status: `All` / `Deployed to Prod` / `Dev Only` / `Not Deployed`
- Alerts: `All` / `Has Alerts` / `No Alerts`
- Created by: 멤버 선택

**정렬 옵션**:

- Last edited (기본)
- Name (A→Z)
- Created date
- Most conversations (Prod)

**뷰 전환**: Grid (기본) / List

### 4.4 AgentCard 컴포넌트

**Grid 뷰 기준 표시 요소**:

| 영역   | 내용                                 |
| ------ | ------------------------------------ |
| 상단   | Agent 아이콘 + 이름                  |
| 중간   | 최종 수정 시각 ("2 hours ago")       |
| 하단   | 환경 배포 뱃지 (Dev/Staging/Prod)    |
| 메트릭 | Prod 대화 수 (지난 7일)              |
| 알림   | Agent 수준 경고 (Error rate 증가 등) |

**환경 뱃지 규칙**:

- Dev/Staging/Prod 중 **배포된 환경만** 색상 뱃지 표시
- 미배포 환경은 뱃지 자체 생략
- 빨간 점(•)으로 이상 상태 표시 (Prod CSAT 급락 등)

**인터랙션**:

- 카드 전체 클릭 → Agent의 Production Overview로 이동 (Prod 미배포 시 Dev Overview)
- 환경 뱃지 클릭 → 해당 환경으로 직행
- 카드 우상단 ⋯ 메뉴: `Rename`, `Duplicate`, `Move to...`, `Archive`, `Delete`

### 4.5 List 뷰 구성

```
┌────────────────────────────────────────────────────────────┐
│ Name ↕      | Env          | Last Edit | Conversations | ⋯│
├────────────────────────────────────────────────────────────┤
│ 🤖 Support  | [D][S][P]    | 2h ago    | 12.4K         | ⋯│
│ 🤖 FAQ      | [D][P]       | 1d ago    | 3.2K          | ⋯│
│ 🤖 Onboard. | [D]          | 5d ago    | —             | ⋯│
└────────────────────────────────────────────────────────────┘
```

### 4.6 빈 상태

**Agent 0개인 경우**:

```
              ┌─────────────────┐
              │       🤖         │
              │                 │
              │ 첫 번째 Agent를  │
              │  만들어보세요    │
              │                 │
              │ AI 에이전트로    │
              │ 고객 경험을 향상. │
              │                 │
              │ [+ New Agent]   │
              │                 │
              │ [템플릿 둘러보기]│
              └─────────────────┘
```

### 4.7 데이터 요구사항

```typescript
interface WorkspaceHomeData {
  workspace: {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    createdAt: string;
    memberCount: number;
    userRole: "owner" | "admin" | "editor" | "viewer";
  };
  agents: Array<{
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    description?: string;
    lastEditedAt: string;
    lastEditedBy: string;
    environments: {
      development: EnvironmentStatus;
      staging: EnvironmentStatus;
      production: EnvironmentStatus;
    };
    metrics?: {
      conversationsLast7Days: number;
      alertCount: number;
    };
  }>;
}

interface EnvironmentStatus {
  deployed: boolean;
  version?: string;
  deployedAt?: string;
  health: "healthy" | "warning" | "error" | "unknown";
}
```

---

## 5. Workspace Settings 하위 화면

### 5.1 General

**경로**: `/org/{slug}/ws/{wsSlug}/settings/general`
**목적**: Workspace 기본 정보 관리

#### 5.1.1 구성 섹션

```
Workspace General
Workspace의 기본 정보를 관리합니다.

┌─ Workspace Identity ───────────────────────────┐
│  Workspace Name*    [Customer Support       ] │
│  Workspace Slug     [customer-support        ] │
│  Description        [고객 지원 관련 에이전트  ] │
│                     [전반을 운영합니다.       ] │
│  Icon / Color       [🎨] [🔵] (프리셋 컬러)   │
│                                                │
│                              [Discard] [Save]  │
└────────────────────────────────────────────────┘

┌─ Default Settings ─────────────────────────────┐
│  Default Environment on Agent Entry            │
│  ○ Development (개발자 기본)                   │
│  ● Production (운영자 기본)                    │
│                                                │
│  새 Agent 기본 모델                            │
│  [GPT-4 Turbo                              ▼] │
│                                                │
│                              [Discard] [Save]  │
└────────────────────────────────────────────────┘

┌─ Usage Quota ──────────────────────────────────┐
│  이 Workspace의 월간 사용 한도를 설정합니다.   │
│  (조직 전체 한도 내에서만 설정 가능)           │
│                                                │
│  Conversations/month  [1,000,000           ] │
│  현재 사용량: 420,000 (42%)                    │
│                                                │
│                              [Discard] [Save]  │
└────────────────────────────────────────────────┘

┌─ Archive & Delete (빨간 테두리) ───────────────┐
│  Archive Workspace                             │
│  아카이브 시 읽기 전용이 되며, Agent 실행 중지  │
│                              [📦 Archive]      │
│                                                │
│  Delete Workspace                              │
│  모든 Agent와 데이터가 영구 삭제됩니다.         │
│                              [🗑 Delete]        │
└────────────────────────────────────────────────┘
```

#### 5.1.2 동작 규칙

- **Workspace Slug 변경**: URL 변경 → 확인 모달, 기존 URL 30일 리다이렉트
- **Default Environment**: 팀 성격에 따라 기본 진입 환경 설정 (개발 중심 팀은 Dev, 운영 팀은 Prod)
- **Usage Quota**: Org 전체 한도 초과 불가, 여러 WS 합계가 Org 한도를 넘을 수 없음
- **Archive**: 데이터 보존하되 Agent 응답 정지. 복구 가능
- **Delete**: 타이핑 확인 ("Workspace 이름 입력") + 2FA 재인증

#### 5.1.3 검증 규칙

| 필드           | 규칙                                    |
| -------------- | --------------------------------------- |
| Workspace Name | 필수, 2~64자                            |
| Workspace Slug | 소문자+숫자+하이픈, 3~32자, Org 내 유일 |
| Description    | 최대 200자                              |

---

### 5.2 Users

**경로**: `/org/{slug}/ws/{wsSlug}/settings/users`
**목적**: 이 Workspace에 접근 가능한 사용자와 권한 관리

#### 5.2.1 Org Members와의 관계

**중요**: 여기서 "Users"는 Org Members 중 이 Workspace에 접근 권한이 있는 멤버를 말한다.

- Org Members에 없는 사람은 여기서 초대 불가 → 먼저 Org에 초대해야 함
- Workspace 단위 Role은 Org Role과 **별도로** 부여 가능
  (예: Org Editor이지만 특정 WS에서는 Viewer로 제한)

#### 5.2.2 레이아웃

```
Users & Access
이 Workspace에 접근 가능한 멤버를 관리합니다.

[🔍 Search users...]  [Filter: All ▼]    [+ Add Members from Org]

┌────────────────────────────────────────────────────────────┐
│ User          | Email           | WS Role  | Last Active|⋯│
├────────────────────────────────────────────────────────────┤
│ 👤 Jiyong Kim | jiyong@acme.com | Admin    | 2 min ago | ⋯│
│ 👤 Sarah Lee  | sarah@acme.com  | Editor   | 1 hour ago| ⋯│
│ 👤 David Park | david@acme.com  | Viewer   | 3 days ago| ⋯│
├────────────────────────────────────────────────────────────┤
│           Showing 1-20 of 12         [< Prev] [Next >]     │
└────────────────────────────────────────────────────────────┘
```

#### 5.2.3 [+ Add Members from Org] 모달

Org 전체 멤버 중 이 Workspace에 아직 없는 사람들 목록 표시.

```
┌─ Add Members to Workspace ────────────────────┐
│                                               │
│  [🔍 Search Org members...]                  │
│                                               │
│  ☐ 👤 Alex Chen    | alex@acme.com   (Org Editor)   │
│  ☐ 👤 Mina Cho     | mina@acme.com   (Org Viewer)   │
│  ☐ 👤 Kim Lee      | kim@acme.com    (Org Admin)    │
│  ...                                          │
│                                               │
│  Assign WS Role                               │
│  ● Inherit from Org  ○ Custom:               │
│    [Admin ▼]                                 │
│                                               │
│             [Cancel]  [Add Selected (0)]     │
└───────────────────────────────────────────────┘
```

#### 5.2.4 WS Role 체계

| WS Role             | 가능한 작업                                       |
| ------------------- | ------------------------------------------------- |
| **Workspace Admin** | WS Settings 편집, 멤버 관리, 모든 Agent 관리      |
| **Editor**          | Agent 생성·편집 (Dev/Staging), Promote to Staging |
| **Viewer**          | Agent 읽기 전용, 대화 로그 보기                   |

**상속 규칙**: 기본은 Org Role을 상속. "Custom"으로 설정 시 이 WS에서만 적용되는 권한 부여.

#### 5.2.5 행별 액션 (⋯)

- `Change Workspace Role`
- `View Org Profile` (Org Members로 이동)
- `Remove from Workspace` (Org 멤버 자격은 유지)

---

### 5.3 Shared Assets

**경로**: `/org/{slug}/ws/{wsSlug}/settings/assets`
**목적**: 여러 Agent가 공유하는 자산 관리

#### 5.3.1 Shared Assets의 종류

```
Shared Assets
이 Workspace의 여러 Agent가 공유하는 자산을 관리합니다.

[Tab]  📚 Knowledge  |  🛠 Tools  |  📝 Prompts  |  🎨 Brand

```

#### 5.3.2 Knowledge (지식베이스)

```
[📚 Knowledge]                               [+ Add Knowledge]

┌────────────────────────────────────────────────────────────┐
│ Name           | Type       | Size    | Used by      | ⋯ │
├────────────────────────────────────────────────────────────┤
│ 📄 Product FAQ | Document   | 2.4 MB  | 2 agents     | ⋯ │
│ 🌐 Help Center | Website    | Crawled | 3 agents     | ⋯ │
│ 💾 Support DB  | Database   | Live    | 1 agent      | ⋯ │
└────────────────────────────────────────────────────────────┘
```

**추가 가능한 Knowledge 타입**:

- **Document**: PDF, DOCX, TXT, Markdown 업로드 (최대 50MB/파일)
- **Website**: URL 크롤링 (sitemap 기반, 정기 재크롤 설정 가능)
- **Database**: SQL/NoSQL 읽기 전용 연결
- **API**: 커스텀 엔드포인트 연결

**동작 규칙**:

- Knowledge 삭제 시 사용 중인 Agent 자동 알림
- "Used by" 클릭 → 사용 중인 Agent 목록 팝오버
- 버전 관리: 업데이트 시 이전 버전 보관 (롤백 가능)

#### 5.3.3 Tools (공유 함수)

여러 Agent가 공유하는 외부 API 호출 함수.

```
[🛠 Tools]                                   [+ New Tool]

┌────────────────────────────────────────────────────────────┐
│ 🔧 get_order_status   | REST API  | Used by 3 agents  | ⋯ │
│ 🔧 create_ticket      | REST API  | Used by 2 agents  | ⋯ │
│ 🔧 check_inventory    | GraphQL   | Used by 1 agent   | ⋯ │
└────────────────────────────────────────────────────────────┘
```

**Tool 정의 필드**:

- Name (함수명)
- Description (AI가 언제 호출할지 판단하는 기준)
- Endpoint (URL, 메서드)
- Input schema (JSON Schema)
- Output schema
- Authentication (API Key, OAuth, None)

#### 5.3.4 Prompts (공유 프롬프트 스니펫)

```
[📝 Prompts]                                [+ New Snippet]

┌────────────────────────────────────────────────────────────┐
│ 🧩 Greeting    | "안녕하세요, 무엇을..." | 2 agents  | ⋯ │
│ 🧩 Escalation  | "인간 상담원에게..."    | 3 agents  | ⋯ │
│ 🧩 Farewell    | "도움이 되셨나요?..."   | 3 agents  | ⋯ │
└────────────────────────────────────────────────────────────┘
```

Agent Build에서 `{{snippet.greeting}}` 형태로 참조 가능.

#### 5.3.5 Brand (브랜드 자산)

- 로고, 컬러 팔레트, 폰트, 톤앤매너 가이드
- Agent의 챗 UI 테마에 자동 반영

---

### 5.4 Integrations

**경로**: `/org/{slug}/ws/{wsSlug}/settings/integrations`
**목적**: 외부 서비스 연동 관리

#### 5.4.1 레이아웃

```
Integrations
외부 서비스와 연동하여 Agent의 기능을 확장합니다.

[Tab]  Installed (5)  |  Browse All

[🔍 Search integrations...]

[Installed]
┌────────────────────────────────────────────────────────────┐
│ 🟣 Slack        | Connected to #cs-support     | [⚙][🔌]  │
│ 🔴 Zendesk      | API Key configured           | [⚙][🔌]  │
│ 🟢 HubSpot      | OAuth · Expires in 30 days   | [⚙][🔌]  │
│ 🔵 Salesforce   | ⚠ Reauthorization required   | [⚙][🔌]  │
│ ⚫ Custom Webhook| 3 endpoints                  | [⚙][🔌]  │
└────────────────────────────────────────────────────────────┘

[Browse All]
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Jira     │ │ Notion   │ │ Intercom │ │ GitHub   │
│[Install] │ │[Install] │ │[Install] │ │[Install] │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
... (카탈로그 그리드)
```

#### 5.4.2 카테고리

**Browse All 필터**:

- CRM (Salesforce, HubSpot, Pipedrive)
- Support (Zendesk, Intercom, Freshdesk)
- Communication (Slack, Teams, Discord)
- Productivity (Notion, Jira, Linear)
- Data (BigQuery, Snowflake, Postgres)
- Custom (Webhook, API)

#### 5.4.3 Integration 상세 화면

```
← Back to Integrations

🟣 Slack Integration
Slack과 연동하여 Agent를 채널에 배치합니다.

┌─ Connection ───────────────────────────────────┐
│  Status: ✓ Connected                           │
│  Workspace: acme-corp.slack.com                │
│  Connected by: Jiyong Kim (2024-08-20)         │
│                                                │
│                         [Reauthorize] [Disconnect]│
└────────────────────────────────────────────────┘

┌─ Configuration ────────────────────────────────┐
│  Allowed Channels                              │
│  ☑ #cs-support    ☑ #general    ☐ #random    │
│                                                │
│  Default Agent                                 │
│  [Support Bot                              ▼] │
│                                                │
│  Trigger                                       │
│  ● On @mention only                            │
│  ○ On all messages                             │
│                                                │
│                              [Discard] [Save]  │
└────────────────────────────────────────────────┘

┌─ Usage ────────────────────────────────────────┐
│  Messages this month: 12,483                   │
│  Active channels: 3                            │
└────────────────────────────────────────────────┘
```

#### 5.4.4 Agent와의 연계

- Integration 자체는 Workspace 수준에서 연결
- 각 Agent의 Build > Tools에서 이 Integration을 **선택적으로 활성화**
- Integration 제거 시 사용 중인 Agent에 경고

---

### 5.5 Channels

**경로**: `/org/{slug}/ws/{wsSlug}/settings/channels`
**목적**: Agent가 배포되는 채널 공통 설정

#### 5.5.1 Channel이란

고객이 Agent와 대화할 수 있는 접점. 채널마다 UI·동작 방식이 다르다.

#### 5.5.2 레이아웃

```
Channels
Agent가 배포되는 채널의 공통 설정을 관리합니다.

[Tab]  Active (4)  |  Available

[Active]
┌────────────────────────────────────────────────────────────┐
│ 📱 Web Chat        | 2 domains · 3 agents    | [⚙][🔌]   │
│ 💬 Mobile SDK      | iOS + Android · 2 apps  | [⚙][🔌]   │
│ 🟣 Slack           | via Integration         | [⚙][🔌]   │
│ 📧 Email           | support@acme.com        | [⚙][🔌]   │
└────────────────────────────────────────────────────────────┘

[Available]
┌──────────┐ ┌──────────┐ ┌──────────┐
│ WhatsApp │ │ SMS      │ │ Voice    │
│[Enable]  │ │[Enable]  │ │[Enable]  │
└──────────┘ └──────────┘ └──────────┘
```

#### 5.5.3 Web Chat 설정 예시

```
← Back to Channels

📱 Web Chat
웹사이트에 임베드되는 챗 위젯을 설정합니다.

┌─ Appearance ───────────────────────────────────┐
│  Primary Color     [🎨 #1565c0              ] │
│  Position          [● Bottom Right ○ Bottom Left]│
│  Avatar            [Upload]                    │
│  Welcome Message   [무엇을 도와드릴까요?]      │
│                                                │
│  [미리보기 ↗]                                  │
└────────────────────────────────────────────────┘

┌─ Installation ─────────────────────────────────┐
│  다음 스크립트를 <head>에 삽입:                │
│                                                │
│  <script src="https://cdn.delight.ai/embed.js"│
│          data-workspace="customer-support"     │
│          data-agent="support-bot"></script>    │
│                                                │
│  [📋 Copy]                                     │
└────────────────────────────────────────────────┘

┌─ Allowed Domains ──────────────────────────────┐
│  이 도메인에서만 위젯이 작동합니다.            │
│  - acme.com           [Remove]                 │
│  - help.acme.com      [Remove]                 │
│  [+ Add domain]                                │
└────────────────────────────────────────────────┘

┌─ Availability ─────────────────────────────────┐
│  Operating Hours                               │
│  [● 24/7 ○ Business Hours]                    │
│                                                │
│  Offline Message                               │
│  [영업시간 외에는 이메일로 문의 부탁드립니다.]│
└────────────────────────────────────────────────┘

┌─ Fallback ─────────────────────────────────────┐
│  Human Handoff                                 │
│  ☑ Agent가 처리할 수 없을 때 상담원 연결       │
│  Connect to: [Zendesk Chat ▼]                 │
└────────────────────────────────────────────────┘
```

#### 5.5.4 채널별 차이

| 채널       | 주요 설정                          |
| ---------- | ---------------------------------- |
| Web Chat   | 외관, 임베드 스크립트, 허용 도메인 |
| Mobile SDK | API Key, Bundle ID, 푸시 인증서    |
| Email      | 수신 이메일 주소, DNS 설정, 서명   |
| Slack      | Integration과 연계                 |
| WhatsApp   | Business API 계정, 전화번호 인증   |
| Voice      | 전화번호, 음성 모델, TTS 설정      |

#### 5.5.5 Agent 수준과의 관계

- Channel은 Workspace 수준에서 **활성화 및 공통 설정**
- 각 Agent가 어느 Channel에 배포될지는 **Agent Build > Channels**에서 개별 선택
- Channel 비활성화 시 사용 중인 Agent 경고

---

## 6. 공통 컴포넌트

### 6.1 WorkspaceSwitcher

사이드바 상단의 Workspace 전환기.

**Props**:

```typescript
interface WorkspaceSwitcherProps {
  current: Workspace;
  workspaces: Workspace[];
  onSwitch: (workspaceId: string) => void;
  onCreateNew: () => void;
}
```

**동작**:

- 클릭 시 드롭다운 열림
- 검색창 (5개 초과 시)
- 현재 Workspace는 체크 표시
- 하단 "+ New Workspace" 버튼

### 6.2 AgentCard

Workspace Home에서 사용.

**Props**:

```typescript
interface AgentCardProps {
  agent: Agent;
  view?: "grid" | "list";
  onClick: () => void;
  onEnvBadgeClick: (env: Environment) => void;
  actions: MenuAction[];
}
```

### 6.3 AssetTable

Shared Assets에서 자산 타입별로 재사용.

```typescript
interface AssetTableProps<T> {
  assetType: "knowledge" | "tools" | "prompts" | "brand";
  items: T[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

### 6.4 IntegrationCard

```typescript
interface IntegrationCardProps {
  integration: Integration;
  variant: "installed" | "available";
  onConfigure?: () => void;
  onDisconnect?: () => void;
  onInstall?: () => void;
}
```

### 6.5 ChannelCard

Channel 카드 (Active/Available 공용).

### 6.6 EmptyState

Agent 없음, 검색 결과 없음 등에 재사용.

```typescript
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "ghost";
  }>;
}
```

---

## 7. 상태 및 에러 처리

### 7.1 로딩 상태

- Workspace Home 초기: Agent 카드 Skeleton 6개 표시
- Settings 초기: 섹션별 Skeleton
- 테이블: 행 5개 Skeleton

### 7.2 에러 상태

| 상황                       | 처리                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Workspace 접근 권한 없음   | 403 화면 + "관리자에게 요청"                                                                         |
| Workspace 아카이브 상태    | 상단 노란 배너 "이 Workspace는 아카이브되었습니다. Agent 실행이 정지되어 있습니다." + Unarchive 버튼 |
| Workspace 사용량 한도 초과 | 빨간 배너 "이 Workspace의 월간 한도에 도달했습니다"                                                  |
| Integration 재인증 필요    | 해당 Integration에 ⚠ 뱃지 + 알림                                                                     |

### 7.3 확인이 필요한 작업

| 작업                        | 확인 수준                        |
| --------------------------- | -------------------------------- |
| Agent 생성                  | 없음 (직접 생성)                 |
| Agent Duplicate             | 없음                             |
| Agent Archive               | 1단계                            |
| Agent Delete                | 2단계 (타이핑 확인)              |
| Shared Asset 삭제 (사용 중) | 2단계 (영향받는 Agent 목록 표시) |
| Integration Disconnect      | 1단계                            |
| Channel Disable             | 1단계 (활성 대화 수 표시)        |
| Workspace Archive           | 2단계                            |
| Workspace Delete            | 3단계 (타이핑 + 2FA)             |

---

## 8. 데이터 모델

### 8.1 Workspace

```typescript
interface Workspace {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  status: "active" | "archived";
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  settings: {
    defaultEnvironment: "development" | "production";
    defaultModel: string;
    usageQuota?: {
      conversationsPerMonth: number;
    };
  };
  stats: {
    agentCount: number;
    userCount: number;
    conversationsLast30Days: number;
  };
}
```

### 8.2 Agent (간략)

```typescript
interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
  environments: {
    development: AgentEnvironment;
    staging: AgentEnvironment;
    production: AgentEnvironment;
  };
}

interface AgentEnvironment {
  deployed: boolean;
  version?: string;
  deployedAt?: string;
  deployedBy?: string;
  health: "healthy" | "warning" | "error" | "unknown";
  config: AgentConfig; // Build 탭 내용
}
```

### 8.3 WorkspaceMember

```typescript
interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  orgRole: "owner" | "admin" | "editor" | "viewer" | string;
  wsRole: "inherit" | "admin" | "editor" | "viewer";
  effectiveRole: "admin" | "editor" | "viewer"; // 계산된 최종 권한
  addedAt: string;
  addedBy: string;
}
```

### 8.4 SharedAsset

```typescript
type SharedAsset = KnowledgeAsset | ToolAsset | PromptSnippet | BrandAsset;

interface KnowledgeAsset {
  type: "knowledge";
  id: string;
  workspaceId: string;
  name: string;
  sourceType: "document" | "website" | "database" | "api";
  source: KnowledgeSource;
  sizeBytes?: number;
  usedByAgentIds: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface ToolAsset {
  type: "tool";
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  endpoint: {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
  };
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  auth: AuthConfig;
  usedByAgentIds: string[];
}
```

### 8.5 Integration

```typescript
interface Integration {
  id: string;
  workspaceId: string;
  provider: 'slack' | 'zendesk' | 'hubspot' | 'salesforce' | 'custom-webhook' | ...;
  status: 'connected' | 'requires_reauth' | 'error' | 'disconnected';
  connectedAt?: string;
  connectedBy?: string;
  config: Record<string, unknown>; // provider별 다름
  tokenExpiresAt?: string;
}
```

### 8.6 Channel

```typescript
interface Channel {
  id: string;
  workspaceId: string;
  type: "web" | "mobile" | "email" | "slack" | "whatsapp" | "sms" | "voice";
  enabled: boolean;
  config: ChannelConfig; // type에 따라 다름
  agentIds: string[]; // 이 채널에 배포된 Agent들
  stats: {
    messagesLast30Days: number;
  };
}
```

---

## 9. Agent 생성 플로우

### 9.1 진입 경로

- Workspace Home의 `+ New Agent` 버튼
- 사이드바 Agent 목록 하단 `+ New Agent`
- Entry 화면의 Workspace 카드 내부 (향후 추가 가능)

### 9.2 3단계 마법사

#### Step 1: 기본 정보

```
┌─ Create New Agent (1/3) ──────────────────────┐
│                                               │
│  Agent Name*                                  │
│  [Support Bot                             ]   │
│                                               │
│  Description                                  │
│  [고객의 주문·배송 문의를 처리하는 챗봇    ]   │
│  [                                         ]   │
│                                               │
│  Icon                                         │
│  [🤖 ▼] (이모지 또는 이미지 업로드)          │
│                                               │
│                          [Cancel]  [Next →]   │
└───────────────────────────────────────────────┘
```

#### Step 2: 템플릿 선택

```
┌─ Create New Agent (2/3) ──────────────────────┐
│                                               │
│  Start from a template                        │
│                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │   Blank  │ │ Customer │ │  Sales   │     │
│  │          │ │  Support │ │   Lead   │     │
│  │빈 상태    │ │FAQ+주문  │ │자격 검증  │     │
│  └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Onboard.│ │  HR      │ │ Custom   │     │
│  │  챗봇    │ │  챗봇    │ │  Import  │     │
│  └──────────┘ └──────────┘ └──────────┘     │
│                                               │
│                       [← Back]    [Next →]    │
└───────────────────────────────────────────────┘
```

#### Step 3: 초기 환경 설정

```
┌─ Create New Agent (3/3) ──────────────────────┐
│                                               │
│  초기 환경 구성                               │
│                                               │
│  ☑ Development (기본 활성)                    │
│  ☐ Staging                                   │
│  ☐ Production                                │
│                                               │
│  모델                                         │
│  [GPT-4 Turbo                         ▼]     │
│                                               │
│  언어                                         │
│  [한국어 (기본)                       ▼]     │
│                                               │
│                    [← Back]    [Create Agent] │
└───────────────────────────────────────────────┘
```

### 9.3 생성 후 동작

- 생성 성공 → 자동으로 Agent Build (Dev) 화면으로 이동
- 템플릿 선택 시 해당 프리셋이 Dev 환경에 로드됨
- Toast "Agent가 생성되었습니다" + "Test 탭에서 바로 시도해보세요" 링크

---

## 10. 오픈 이슈

| ID    | 이슈                                                     | 상태      | 비고                                          |
| ----- | -------------------------------------------------------- | --------- | --------------------------------------------- |
| WS-01 | Workspace 간 Agent 이동 지원 여부                        | 🔴 미결정 | 데이터 무결성·권한 복잡성                     |
| WS-02 | Shared Asset을 Workspace 간 공유 가능하게?               | 🟡 논의   | 현재는 WS 내부로 격리, 대기업 요구 시 재고    |
| WS-03 | Workspace Template (미리 설정된 구성 세트)               | 🟢 향후   | Agent + Integration + Channel 세트를 템플릿화 |
| WS-04 | Usage Quota 초과 시 자동 차단 vs 오버리지 청구           | 🟡 논의   | 플랜별 정책 결정 필요                         |
| WS-05 | Integration 인증 토큰 만료 자동 연장                     | 🔴 미결정 | 보안 vs 편의성 트레이드오프                   |
| WS-06 | Channel별 A/B 테스트 지원                                | 🟢 향후   | MVP 이후                                      |
| WS-07 | Workspace Archive 기간 제한 필요?                        | 🟡 논의   | 영구 보관 vs 1년 후 자동 삭제                 |
| WS-08 | Agent Duplicate 시 Shared Asset 참조를 복사할지 링크할지 | 🔴 미결정 | 기본은 링크(참조 유지) 권장                   |

---

## 부록 A: Org Settings와의 설계 일관성

공통 패턴 적용 확인:

| 패턴                         | Org Settings    | Workspace Settings     | 일치 |
| ---------------------------- | --------------- | ---------------------- | ---- |
| SettingsSection 블록 구조    | ✅              | ✅                     | ✅   |
| Danger Zone (빨간 테두리)    | ✅ (Delete Org) | ✅ (Archive/Delete WS) | ✅   |
| 확인 다이얼로그 3단계        | ✅              | ✅                     | ✅   |
| 권한별 표시 제어 (숨김)      | ✅              | ✅                     | ✅   |
| 검색+필터+정렬 테이블        | ✅ (Members)    | ✅ (Users, Assets)     | ✅   |
| Slug 변경 시 리다이렉트 안내 | ✅              | ✅                     | ✅   |

## 부록 B: 다음 설계 작업

이 문서 이후 작성이 필요한 설계 문서들:

1. **AGENT_SPEC.md** — Agent 내부 화면 (환경 바 × 4탭 조합)
2. **PROMOTE_FLOW_SPEC.md** — Dev → Staging → Prod 승격 플로우 상세
3. **BUILD_EDITOR_SPEC.md** — Agent Build 에디터 상세 (프롬프트, 지식, 도구)
4. **TEST_SIMULATOR_SPEC.md** — Test 탭의 대화 시뮬레이터
5. **EVALUATE_SPEC.md** — Evaluate 탭의 성능 분석 대시보드

---

**END OF DOCUMENT**
