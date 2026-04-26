# Organization Settings — 화면 설계 명세

> **문서 상태**: v1.0 (구현 반영본)
> **최종 업데이트**: 2026-04-22
> **상위 문서**: PRD.md §8.2 (S-02 Organization Settings)
> **대상 독자**: 디자이너, 프론트엔드 개발자, QA

---

## 목차

1. [개요](#1-개요)
2. [진입 경로 및 URL](#2-진입-경로-및-url)
3. [공통 레이아웃](#3-공통-레이아웃)
4. [공통 컴포넌트](#4-공통-컴포넌트)
5. [하위 화면 명세](#5-하위-화면-명세)
   - 5.1 [General](#51-general)
   - 5.2 [Members](#52-members)
   - 5.3 [Roles](#53-roles)
   - 5.4 [Security](#54-security)
   - 5.5 [Billing](#55-billing)
   - 5.6 [Profile](#56-profile)
6. [목 데이터](#6-목-데이터)
7. [오픈 이슈](#7-오픈-이슈)

---

## 1. 개요

Organization 수준의 설정을 관리하는 화면군. 조직 전체에 영향을 미치는 정책·멤버·결제·보안을 한곳에서 관리한다.

### 1.1 하위 화면 목록

| 탭       | 경로                             |
| -------- | -------------------------------- |
| General  | `/org/{slug}/settings/general`   |
| Members  | `/org/{slug}/settings/members`   |
| Roles    | `/org/{slug}/settings/roles`     |
| Security | `/org/{slug}/settings/security`  |
| Billing  | `/org/{slug}/settings/billing`   |
| Profile  | `/org/{slug}/settings/profile`   |

기본 랜딩 탭: **General** (`/org/{slug}/settings`는 general로 리다이렉트)

---

## 2. 진입 경로 및 URL

```
A. Entry 화면 → [⚙ Org Settings] 버튼
B. 사이드바 하단 → Org Settings 링크
C. General > Subscription Plan → [Manage Billing] (billing 탭으로 이동)
D. 직접 URL 진입
```

---

## 3. 공통 레이아웃

### 3.1 페이지 셸

```
┌────────────────────────────────── max-w-7xl (1280px), 화면 중앙 정렬 ────────────────────────────────────┐
│                                                                                                           │
│  px-5 pt-14 pb-5                                                                                          │
│  Organization Settings                   ← text-[24px] font-semibold #171717, letterSpacing: -0.3px      │
│                                                                                                           │
│  ┌──────────────┬──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 220px 사이드바│  콘텐츠 영역 (flex-1)                                                               │  │
│  │ px-3 pt-5    │                                                                                      │  │
│  │ pb-8         │  각 탭 컴포넌트 렌더링                                                               │  │
│  │              │                                                                                      │  │
│  │  General     │                                                                                      │  │
│  │  Members     │                                                                                      │  │
│  │  Roles       │                                                                                      │  │
│  │  Security    │                                                                                      │  │
│  │  Billing     │                                                                                      │  │
│  │  Profile     │                                                                                      │  │
│  └──────────────┴──────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 사이드바 내비게이션

- 너비: `220px` 고정
- 패딩: `px-3 pt-5 pb-8`
- 하단 보더 없음
- 링크 스타일: `px-2 py-1.5 rounded-md text-[14px] font-medium`
  - 활성: `bg-[#f4f4f5] text-[#171717]`
  - 비활성: `text-[#666666] hover:bg-[#f4f4f5] hover:text-[#171717]`

### 3.3 콘텐츠 영역

- `flex-1 min-w-0 overflow-auto`
- 각 탭 내부는 `<div className="">` 루트, 패딩 없음 (섹션이 자체 관리)
- 탭 전환: Next.js App Router `/settings/[tab]` 동적 세그먼트

---

## 4. 공통 컴포넌트

모든 컴포넌트는 `src/components/settings/SettingsSection.tsx`에 정의.

### 4.1 SettingsSection

섹션 단위 레이아웃 블록.

```tsx
<SettingsSection
  title="섹션 제목"
  description="선택적 설명"
  headerAction={<button>우측 액션</button>}
  variant="default" | "danger"
>
  {/* 내용 */}
</SettingsSection>
```

**시각 사양**:

| 속성            | 값                                   |
| --------------- | ------------------------------------ |
| 래퍼 패딩       | `py-10`, 첫 번째 섹션은 `pt-0`       |
| 섹션 간 구분선  | `border-bottom: 1px solid #f4f4f5`   |
| 타이틀          | `text-[16px] font-semibold #171717`, `letterSpacing: -0.2px` |
| danger 타이틀   | `text-[#dc2626]`                     |
| danger 배경     | `#fef9f9`, 상단 border `rgba(220,38,38,0.15)` |
| `headerAction`  | 타이틀 우측 정렬                     |

**danger variant는 하단 구분선 없음.**

### 4.2 FieldRow

필드 레이블 + 인풋을 세로로 배치.

```tsx
<FieldRow label="필드명" hint="선택적 힌트 텍스트">
  <Input ... />
</FieldRow>
```

**시각 사양**:

| 속성       | 값                                              |
| ---------- | ----------------------------------------------- |
| 방향       | `flex-col gap-1.5` (세로 배치)                  |
| 패딩       | `pt-4 pb-3`                                     |
| 레이블     | `text-[14px] font-medium text-[#4d4d4d]`        |
| 힌트       | `text-[11px] text-[#a1a1aa] mt-0.5`             |

### 4.3 Input

```tsx
<Input value="..." placeholder="..." disabled={false} />
```

| 속성         | 값                                            |
| ------------ | --------------------------------------------- |
| 높이         | `42px`                                        |
| 폰트         | `text-[14px] text-[#171717]`                  |
| 패딩         | `px-3`                                        |
| 보더         | `box-shadow: rgba(0,0,0,0.08) 0px 0px 0px 1px` |
| focus 링     | `rgba(0,0,0,0.15) 0 0 0 1px, rgba(59,130,246,0.3) 0 0 0 3px` |
| disabled     | `bg-[#fafafa] text-[#a1a1aa]`                 |

### 4.4 Select

네이티브 `<select>` 위에 `appearance-none` + SVG 화살표를 씌운 커스텀 컴포넌트.

```tsx
<Select defaultValue="...">
  <option>옵션 1</option>
</Select>
```

| 속성       | 값                                                 |
| ---------- | -------------------------------------------------- |
| 화살표     | SVG chevron-down, `right-2.5`, 포인터 이벤트 없음  |
| 보더       | `box-shadow: rgba(0,0,0,0.08) 0px 0px 0px 1px`    |
| 폰트       | `text-[14px] text-[#171717]`                       |
| 패딩       | `pl-3 pr-8 py-1.5`                                 |

### 4.5 Toggle

보안/알림 등에서 사용하는 on/off 토글.

```tsx
<Toggle on={state} onChange={(v) => setState(v)} />
```

| 속성    | 값                                        |
| ------- | ----------------------------------------- |
| 크기    | `w-9 h-5` (`36px × 20px`)                |
| on 색   | `#171717`                                 |
| off 색  | `#e4e4e7`                                 |
| 노브    | `w-4 h-4`, 흰색, `top-0.5 left-0`        |
| 이동    | off: `translateX(2px)`, on: `translateX(18px)` |

### 4.6 ToggleRow

토글이 포함된 전체 행 (레이블 좌, 토글 우). SecurityTab에서 사용.

```tsx
<ToggleRow label="항목 이름" hint="설명">
  <Toggle ... />
</ToggleRow>
```

| 속성  | 값                                      |
| ----- | --------------------------------------- |
| 방향  | `flex items-center justify-between`     |
| 패딩  | `pt-4 pb-3`                             |
| 레이블 | `text-[14px] font-medium text-[#4d4d4d]` |
| 힌트  | `text-[11px] text-[#a1a1aa] mt-0.5`    |

---

## 5. 하위 화면 명세

### 5.1 General

**목적**: 조직의 기본 정보 관리

#### 섹션 구성

```
Organization Settings
│
├── [Organization Identity]
│     FieldRow: Organization Name → Input (value: "Operation")
│     FieldRow: Organization Logo → 아바타 + Upload/Remove 버튼
│
├── [Subscription Plan]
│     Enterprise 박스 (bg: #f9f9f9, px-4 py-3, rounded-lg)
│       - "Enterprise" text-[14px] font-semibold
│       - "$2,400/month · 연간 결제 · 다음 결제일 2026-05-15" text-[13px] #888888
│       - 기능 배지: Unlimited Agents / 10M conversations/mo / SSO/SAML / Priority Support
│       - [Manage Billing] 버튼 → Link → /org/{slug}/settings/billing
│
├── [Compliance & Region]
│     FieldRow: Data Residency → Select (Seoul / US East / EU West)
│     FieldRow: Compliance Standards → 체크박스 3개 (SOC 2, GDPR, HIPAA)
│
└── Delete Organization 버튼 (섹션 외부, py-10 래퍼)
      클릭 → DeleteOrgDialog 모달
```

#### Organization Logo

프로필 픽처와 동일한 UI 패턴:
- `w-12 h-12 rounded-lg` 아바타 (배경 `#171717`, 흰 이니셜 "O")
- Upload 버튼: 기본 스타일 (`box-shadow border`)
- Remove 버튼: 빨간 스타일 (`text-[#dc2626] hover:bg-[#fee2e2]`)

#### Subscription Plan 기능 배지

```tsx
{["Unlimited Agents", "10M conversations/mo", "SSO/SAML", "Priority Support"].map(f => (
  <span className="flex items-center gap-1 text-[11px] text-[#666666]">
    <svg> ✓ (stroke: #15803d) </svg>
    {f}
  </span>
))}
```

#### Delete Organization 모달

```
┌─ Delete Organization ──────────────────────────────┐
│                                                    │
│  Delete Organization                               │  ← text-[16px] font-semibold
│  조직을 영구 삭제합니다. 이 작업은 되돌릴 수 없으며 │
│  모든 워크스페이스와 에이전트가 삭제됩니다.          │
│                                                    │
│                        [Cancel]  [Delete Organization (red)] │
└────────────────────────────────────────────────────┘
```

- 외부 클릭(`bg-black/30` 오버레이) → 닫힘
- Cancel 버튼: `box-shadow border`, `text-[#666666]`
- Delete 버튼: `bg: #dc2626`, 흰 텍스트

---

### 5.2 Members

**목적**: 팀 멤버 관리, 초대

#### 섹션 구성

```
├── [All Users]                           headerAction: [+ Invite Members]
│     검색 인풋 (pl-8, 돋보기 아이콘)
│     rounded-lg overflow-hidden 테이블
│       헤더: Name / Email / Role / Workspaces / Last Active / (액션)
│       행: 아바타 이니셜 + 이름 / 이메일 / RoleBadge / WS 수 / 상대시간 / ⋮ 버튼
│     푸터: "Showing N of M members" + Prev/Next 버튼
│
└── [Pending Invitations]                 (MOCK_PENDING_INVITES.length > 0 시 표시)
      rounded-lg overflow-hidden 리스트
        행: 이메일 / RoleBadge / "Invited N days ago" / [Resend] [Cancel]
```

#### RoleBadge 색상

| Role   | 배경      | 텍스트    |
| ------ | --------- | --------- |
| owner  | `#f3e8ff` | `#7c3aed` |
| admin  | `#eff6ff` | `#1d4ed8` |
| editor | `#f0fdf4` | `#15803d` |
| viewer | `#f4f4f5` | `#71717a` |
| custom | `#fff7ed` | `#c2410c` |

#### Invite Members 버튼 스타일

```
bg: #171717, text-white, text-[13px] font-medium
flex items-center gap-1.5 px-3 py-1.5 rounded-md
```

#### ⋮ 메뉴 아이콘

```tsx
<svg width="16" height="16">
  <circle cx="8" cy="3" r="1.2" />   // 세로 점 3개
  <circle cx="8" cy="8" r="1.2" />
  <circle cx="8" cy="13" r="1.2" />
</svg>
```

---

### 5.3 Roles

**목적**: RBAC 역할 정의 및 권한 레퍼런스 확인

#### 섹션 구성

```
├── [System Roles]
│     rounded-lg 리스트 (box-shadow border)
│       행: RoleBadge (Owner/Admin/Editor/Viewer) / 설명 텍스트
│       (System 뱃지 없음, 우측 액션 없음)
│
├── [Custom Roles]                        headerAction: [+ New Role]
│     rounded-lg 리스트 (box-shadow border)
│       행: 커스텀 RoleBadge (amber) / 설명 / "{N} members" / ⋮ 버튼
│
└── [Permission Reference]
      grid table: Permission 컬럼 + Owner / Admin / Editor / Viewer 컬럼 (각 44px)
      그룹: Organization / Workspace / AI Agent
      셀: ✓ SVG (stroke: #15803d) 또는 "−" (text-[#e4e4e7])
```

#### Permission Reference 그리드

```
grid-cols-[1fr_repeat(4,_44px)] gap-4
헤더: text-[11px] font-semibold #a1a1aa uppercase tracking-wide
그룹 레이블: px-4 py-1.5 text-[11px] font-semibold #a1a1aa bg-[#fafafa]
항목 행: text-[14px] text-[#444444]
```

#### System Roles 정의

| Key    | 레이블  | 설명                               |
| ------ | ------- | ---------------------------------- |
| owner  | Owner   | 모든 권한 (결제 포함). 조직 최상위 |
| admin  | Admin   | 멤버·보안·WS 관리. 결제 제외       |
| editor | Editor  | Agent 생성·편집, Staging Promote   |
| viewer | Viewer  | 모든 화면 읽기 전용                |

---

### 5.4 Security

**목적**: 인증·접근 제어 정책 관리

#### 섹션 구성

```
├── [Authentication]
│     ToggleRow: 2FA 강제 적용 | 모든 멤버에게 2FA 요구
│     (require2FA === true 시)
│       FieldRow: Grace Period → Select (3 / 7 / 14 days)
│
├── [Single Sign-On (SSO)]
│     ToggleRow: SAML SSO | Okta, Azure AD, Google Workspace 지원
│       (!ssoEnabled 시 우측에 [Configure] 링크 표시)
│     ToggleRow: SCIM Provisioning | 자동 사용자 프로비저닝
│
├── [Login Restrictions]
│     ToggleRow: IP Allowlist | 특정 IP 대역에서만 로그인 허용
│     (ipRestrict === true 시)
│       FieldRow: IP Ranges → textarea (rows=3, placeholder: "192.168.1.0/24, 10.0.0.0/8")
│     FieldRow: Session Timeout → Select (8h / 24h / 7d / 30d)
│     FieldRow: Concurrent Sessions → Select (Unlimited / 1 / 3 / 5)
│
├── [Support Access]
│   description: "센드버드 지원팀이 조직 데이터에 접근할 수 있는 권한을 제어합니다."
│     ToggleRow: Allow Support Access (기본 on)
│     (supportAccess === true 시)
│       FieldRow: Expires → Select (7 / 30 / 90 days)
│
└── [Audit Logs]
    description: "모든 관리 작업 기록을 확인합니다. 보존 기간: Enterprise 2년 / 그 외 90일"
      버튼: [View Audit Logs] (기본 border 스타일)
```

#### ToggleRow vs FieldRow 구분 원칙

- **토글** → `ToggleRow`: `flex items-center justify-between`, 토글이 레이블과 같은 행
- **인풋/셀렉트** → `FieldRow`: 레이블 위, 인풋 아래 (세로 배치)

---

### 5.5 Billing

**목적**: 구독 플랜, 사용량, 결제 수단, 청구 정보, 인보이스 관리

#### 섹션 구성

```
├── [Subscription Plan]
│     flex 박스 (bg: #f9f9f9, px-4 py-3, rounded-lg)
│       좌: 플랜명 + Active 뱃지 / 가격 / 기능 배지 목록
│       우 (중앙 정렬): [Change Plan] 버튼
│
├── [Usage this month]              headerAction: [View detailed usage] 링크
│     UsageBar × 3: Conversations / API Calls / Storage
│       진행률 색상: ≥80% → #dc2626 / ≥60% → #f59e0b / 나머지 → #171717
│
├── [Payment Method]
│     flex: 카드 아이콘(VISA) + 카드 정보 / [Update] [Add backup] 버튼
│
├── [Billing Information]
│     flex: 회사명·Tax ID·주소 / [Edit] 버튼 (중앙 정렬)
│
└── [Invoices]                      headerAction: [View all] 링크
      table: Date / Amount / Status / Invoice
        Status: "Paid" 뱃지 (bg: #f0fdf4, text: #15803d)
        Invoice 컬럼: 📄 아이콘 + "PDF" 텍스트 버튼 (text-[#0068d6])
```

#### UsageBar 컴포넌트

```tsx
function UsageBar({ label, used, total, unit }) {
  const pct = Math.round((used / total) * 100);
  const color = pct >= 80 ? "#dc2626" : pct >= 60 ? "#f59e0b" : "#171717";
  // h-1.5 rounded-full bg-[#f4f4f5] 바 위에 color 진행 바
}
```

#### 인보이스 PDF 버튼

```tsx
<button className="flex items-center gap-1 text-[13px] text-[#0068d6] hover:underline">
  <svg> 📄 문서 아이콘 </svg>
  PDF
</button>
```

---

### 5.6 Profile

**목적**: 로그인한 본인의 개인 계정 관리

#### 섹션 구성

```
├── [Personal Information]
│     FieldRow: Profile Picture (hint: PNG, JPG · 최대 2MB · 정사각형 권장)
│       → w-12 h-12 rounded-full 아바타 + [Upload] [Remove] 버튼
│     FieldRow: Full Name → Input
│     FieldRow: Display Name → Input
│     FieldRow: Job Title → Input
│     FieldRow: Timezone → Select
│     FieldRow: Language → Select
│
├── [Email & Password]
│     FieldRow: Email Address
│       → 이메일 텍스트 + [Change Email] 링크 (같은 행, justify-between)
│     FieldRow: Password
│       → 마스킹 텍스트 + [Change Password] 링크 (같은 행)
│
├── [Two-Factor Authentication]
│     pt-4 flex items-start justify-between
│       좌: ✓ Enabled (green) + "(Authenticator App)" / [View Backup Codes] [Regenerate]
│       우: [Disable 2FA] 빨간 버튼
│
├── [Connected Accounts]
│     Google / GitHub / Slack 행
│       각 행: 서비스명 + 핸들 / [Disconnect 또는 Connect] 버튼
│       구분선: border-bottom #f4f4f5 (마지막 행 제외)
│
├── [Notifications]
│     pt-4 space-y-2.5
│       label 행: 항목명 (좌) + Toggle (우) — justify-between
│       4개 항목: Workspace invitations / Agent alerts / Weekly summary / Product updates
│
├── [Active Sessions]
│     세션 목록 (macOS/iOS/Windows)
│       현재 세션: "현재 세션" 파란 뱃지, Sign out 버튼 없음
│       타 세션: [Sign out] 빨간 링크
│     [Sign out all other sessions] 버튼
│
└── [Danger Zone] variant="danger"
      description: "계정을 영구 삭제합니다. 모든 조직에서 제외됩니다."
      [Delete Account] 빨간 버튼
```

---

## 6. 목 데이터

### 6.1 Organization

- 이름: **FC Barcelona** (고객사)
- 슬러그: `fcbarcelona`
- 플랜: Enterprise / $2,400/month / 연간 결제 / 다음 결제일 2026-05-15
- 결제 카드: Visa ending in 4242 / Exp 12/28

### 6.2 Members (`MOCK_MEMBERS`)

| 이름           | 이메일                        | Role   |
| -------------- | ----------------------------- | ------ |
| Joan Laporta   | laporta@fcbarcelona.com       | owner  |
| Deco           | deco@fcbarcelona.com          | admin  |
| Lamine Yamal   | yamal@fcbarcelona.com         | editor |
| Pedri González | pedri@fcbarcelona.com         | editor |
| Raphinha       | raphinha@fcbarcelona.com      | viewer |

### 6.3 Pending Invites (`MOCK_PENDING_INVITES`)

| 이메일                  | Role   |
| ----------------------- | ------ |
| gavi@fcbarcelona.com    | editor |
| flick@fcbarcelona.com   | viewer |

### 6.4 Custom Roles

| 이름       | 멤버 수 |
| ---------- | ------- |
| QA Lead    | 2       |
| Prompt Eng | 5       |

### 6.5 Invoices

| 날짜       | 금액       | 상태 |
| ---------- | ---------- | ---- |
| 2026-04-15 | $2,400.00  | Paid |
| 2026-03-15 | $2,400.00  | Paid |
| 2026-02-15 | $2,400.00  | Paid |
| 2026-01-15 | $2,400.00  | Paid |

---

## 7. 오픈 이슈

| ID    | 이슈                                                          | 상태      |
| ----- | ------------------------------------------------------------- | --------- |
| OS-01 | Profile을 Org Settings에서 분리해 별도 계정 레벨 화면으로 이동 | 🟡 논의   |
| OS-02 | Delete Organization 모달에 조직명 타이핑 확인 추가 필요       | 🔴 미구현 |
| OS-03 | Audit Logs를 별도 메뉴로 분리할지 Security 하위에 유지할지    | 🟡 논의   |
| OS-04 | Invite Members 모달 구현 (현재 버튼만 존재)                   | 🔴 미구현 |
| OS-05 | Members 테이블 ⋮ 메뉴 동작 구현                               | 🔴 미구현 |
| OS-06 | Roles Custom Role 생성/편집 화면 구현                         | 🔴 미구현 |
| OS-07 | Billing Change Plan 흐름 구현                                 | 🟢 향후   |

---

**END OF DOCUMENT**
