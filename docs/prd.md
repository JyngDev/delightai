# Delight.ai Dashboard — Product Requirements Document

> **문서 상태**: v0.3 (구현 반영 업데이트)
> **최초 작성일**: 2026-04-22
> **최종 업데이트**: 2026-04-25
> **소유자**: UX Design
> **대상 독자**: 프로덕트, 디자인, 엔지니어링, QA
> **관련 문서**: `DESIGN.md`, `CLAUDE.md`, `AGENTS.md`

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [배경 및 문제 정의](#2-배경-및-문제-정의)
3. [페르소나 및 사용 시나리오](#3-페르소나-및-사용-시나리오)
4. [용어 정의](#4-용어-정의)
5. [정보 구조 (IA)](#5-정보-구조-ia)
6. [핵심 설계 원칙](#6-핵심-설계-원칙)
7. [네비게이션 시스템](#7-네비게이션-시스템)
8. [화면 명세](#8-화면-명세)
9. [핵심 플로우](#9-핵심-플로우)
10. [컴포넌트 라이브러리](#10-컴포넌트-라이브러리)
11. [권한 및 상태](#11-권한-및-상태)
12. [기술 요구사항](#12-기술-요구사항)
13. [Out of Scope](#13-out-of-scope)
14. [오픈 이슈](#14-오픈-이슈)

---

## 1. 제품 개요

### 1.1 제품 정의

**Delight.ai**는 AI 에이전트 제작·관리 SaaS 플랫폼이다. 사용자는 Delight.ai 대시보드에서 여러 AI Agent를 만들고, 개발·검증·배포 라이프사이클을 관리하며, 운영 성능을 모니터링한다.

### 1.2 본 문서의 범위

**Organization → Workspace → AI Agent → Environment**로 이어지는 다계층 구조를 효율적으로 관리할 수 있는 웹 대시보드의 구조와 사용자 경험을 정의한다.

### 1.3 성공 지표

| 지표 | 목표 |
|------|------|
| 신규 사용자의 첫 Agent 생성까지 걸리는 시간 | 10분 이내 |
| 환경 간 승격(Promote) 시 사용자 오류율 | 2% 미만 |
| 계층 전환(Workspace/Agent 전환) 시 평균 클릭 수 | 2회 이하 |
| Production 환경에서의 실수 편집 건수 | 0건 (읽기 전용 강제) |

---

## 2. 배경 및 문제 정의

### 2.1 현재 상황

- 하나의 조직이 **여러 Workspace**(팀·부서·용도별)를 운영
- 각 Workspace 안에 **여러 Agent**가 공존
- 각 Agent마다 **Development / Staging / Production** 3개 환경을 독립적으로 관리
- Agent별로 **Overview / Build / Test / Evaluate** 4가지 작업 맥락이 필요

### 2.2 해결해야 할 UX 문제

| 우선순위 | 문제 | 설명 |
|----------|------|------|
| P0 | 계층 파악 어려움 | 복수 Workspace/Agent 존재 시 현재 위치 파악 어려움 |
| P0 | 환경 혼동 | 어느 환경(Dev/Staging/Prod)에 있는지 혼동하여 실수 편집 발생 가능 |
| P1 | 버전 표기 불일치 | 배포 히스토리와 실제 인스턴스 버전이 다를 수 있음 |
| P1 | 알림 배치 혼동 | 경고/정보 알림 위치가 일관되지 않으면 놓칠 수 있음 |
| P2 | 계층 전환 depth | 다른 Workspace/Agent로 이동이 깊은 네비게이션을 요구 |

### 2.3 필수 요구사항 (Non-negotiable)

1. 복수의 Workspace와 AI Agent 선택이 가능한 **초기 진입 경로**
2. 각 Agent별 **환경(Development, Staging, Production) 관리 구조**
3. **Production/Staging 환경 Build는 읽기 전용** — 변경은 Dev에서만
4. **버전은 항상 `formatVersion()` 경유** — raw `vX.X` 직접 노출 금지
5. **경고/정보 알림은 항상 탭 콘텐츠 최상단** 배치

---

## 3. 페르소나 및 사용 시나리오

### 3.1 주요 페르소나

#### P1. AI Agent 개발자 (Builder)
- **역할**: Agent의 프롬프트, 지식베이스, 도구를 설정하고 테스트
- **주 사용 환경**: Development
- **주 사용 메뉴**: Build, Test
- **핵심 니즈**: 빠른 이터레이션, 실수 없는 환경 전환

#### P2. QA / 프로덕트 오너 (Validator)
- **역할**: Staging에서 검증, Evaluate로 성능 측정
- **주 사용 환경**: Staging
- **주 사용 메뉴**: Test, Evaluate
- **핵심 니즈**: Dev vs Staging 차이 파악, 성능 지표

#### P3. 운영자 (Operator)
- **역할**: Production 모니터링, 이슈 대응
- **주 사용 환경**: Production
- **주 사용 메뉴**: Overview, Evaluate
- **핵심 니즈**: 실사용자 지표 관찰, 이상 징후 빠른 발견

#### P4. 조직 관리자 (Admin)
- **역할**: 멤버·권한·결제 관리
- **주 사용 환경**: 환경 무관 (Settings 중심)
- **핵심 니즈**: 보안 정책 적용, 팀 온보딩

### 3.2 핵심 사용 시나리오

#### 시나리오 A: 기능 개선 릴리즈

1. Builder가 로그인 → Entry 화면 → Agent 선택 (사이드바 자동 접힘)
2. Development 환경 선택 → Build 탭 → 시스템 프롬프트 수정
3. Save to Dev → Test 탭에서 채팅 시뮬레이션
4. `Promote to Staging` 클릭 → Diff 확인 → 승격
5. Validator가 Staging Test 탭에서 시나리오 반복 실행
6. `Promote to Production` 클릭 → 최종 확인 → 배포
7. Operator가 Production Overview에서 실사용자 KPI 모니터링

#### 시나리오 B: 긴급 롤백

1. Operator가 Production Overview에서 CSAT 급락 감지 (알림 최상단 노출)
2. Deployment History에서 안정 버전 확인 (formatVersion으로 일관된 버전 표기)
3. Rollback 버튼 → 확인 → Production 즉시 복구

---

## 4. 용어 정의

| 용어 | 정의 | 예시 |
|------|------|------|
| Organization | 최상위 계약 단위. 결제·멤버·보안 정책이 귀속됨 | "Operation Div" |
| Workspace | 팀·부서·용도별 작업 공간. Agent와 자산을 그룹핑 | "Fan Engagement" |
| AI Agent | 하나의 목적을 가진 봇의 정체성 단위 | "Fan Q&A Bot" |
| Environment | Agent의 배포 스테이지. Dev/Staging/Prod로 고정 | "Production Version 1.9" |
| Version | `formatVersion()` 처리된 버전 표기 | `v1.9` → `Version 1.9` |
| Promote | 하위 환경의 변경사항을 상위 환경으로 반영하는 행위 | Dev → Staging |
| versionNote | 각 환경 인스턴스의 변경사항 요약 (최대 2줄) | "패스 네트워크 시각화 및 안정성 패치" |
| Suspended | 배포는 되어 있으나 서비스 중단 상태인 인스턴스 | 시즌 종료 후 중단된 Newsletter Bot |

---

## 5. 정보 구조 (IA)

### 5.1 계층 트리

```
Organization
├── Organization Settings
│   ├── General / Members / Roles / Security / Billing / Profile
│
├── Workspace A (Fan Engagement)
│   ├── Workspace Settings
│   │   ├── General / Users / Shared Assets / Integrations / Channels
│   │
│   ├── AI Agent 1 (Fan Q&A Bot)
│   │   ├── Environments
│   │   │   ├── Development (Version 1.4)
│   │   │   └── Production (Version 1.2)
│   │   └── Console (Overview / Build / Test / Evaluate)
│   │       ※ 탭은 Segmented Control UI
│   │       ※ Build 내 섹션은 상단 탭 네비게이션
│   │
│   └── AI Agent 2 (Ticket Assistant) ...
│
└── Workspace B (Football Operations) ...
```

### 5.2 URL 구조

```
/org/{orgSlug}                                    → Entry 화면 (Org Home)
/org/{orgSlug}/settings/{tab}                     → Org Settings
/org/{orgSlug}/ws/{wsSlug}                        → Workspace Home
/org/{orgSlug}/ws/{wsSlug}/settings/{tab}         → Workspace Settings
/org/{orgSlug}/ws/{wsSlug}/agent/{agentSlug}      → Agent Home
```

**설계 의도**: URL만 봐도 현재 위치(Org/WS/Agent)를 알 수 있어야 한다. 환경(env)과 탭(tab)은 URL 파라미터가 아닌 UI 상태로 관리한다.

---

## 6. 핵심 설계 원칙

### 원칙 1. 세 개의 직교하는 축을 UI에서 분리한다

| 축 | 질문 | UI 위치 |
|----|------|---------|
| 소속 | "나는 어느 Org/WS/Agent에 있는가?" | 좌측 사이드바 (브레드크럼) |
| 환경 | "나는 어느 환경을 보고 있는가?" | 좌측 파이프라인 패널 |
| 작업 | "나는 어떤 작업을 하는가?" | 우측 Console (Segmented Control 탭) |

### 원칙 2. 환경은 "컨텍스트", 작업은 "탭"이다

- **환경 변경**: 같은 Agent의 다른 판본을 본다. 색상·경고·메타데이터가 함께 바뀐다.
- **탭 변경**: 같은 판본에서 다른 측면을 본다. 맥락은 유지된다.

### 원칙 3. Production/Staging은 "읽기 전용 공간"이다

- Build 탭에서 직접 편집 **불가** — 읽기 전용 배너 표시
- 변경은 Dev에서만 → Promote 흐름을 통해서만 상위 환경 반영
- 파괴적 작업(삭제, 롤백)은 별도 확인 다이얼로그

### 원칙 4. 알림은 항상 최상단

- warning/info 알림 카드는 KPI, Agent Information 등 모든 블록보다 위에 배치
- 알림이 없는 경우 자동으로 숨김 (null return)
- 알림은 `alertEnv` 필드로 해당 환경에서만 노출

### 원칙 5. 버전은 항상 일관되게 표시한다

- `formatVersion()` 경유 필수: `v1.9` → `Version 1.9`
- Deployment History의 current 버전은 실제 인스턴스 버전과 항상 일치
- `buildDeployHistory(instance)`, `buildStagingHistory(instance)`로 동적 생성

### 원칙 6. 사이드바는 컨텍스트에 따라 자동 조정된다

- Agent 페이지 진입 시 자동 접힘 (작업 공간 확보)
- Settings 페이지 진입 시 자동 접힘
- 애니메이션: fade out → width 축소 (자연스러운 전환)

---

## 7. 네비게이션 시스템

### 7.1 좌측 사이드바

**기본 너비**: 280px (드래그 리사이즈, min 220px, max 400px)
**접힌 너비**: 56px (아이콘만)

**구성** (위에서 아래로):

```
┌──────────────────────────────┐
│ [로고]              [접기 ▶] │  ← h-12, border-bottom
├──────────────────────────────┤
│ [Org Switcher]               │
│ 🏠 Home                      │
│ + New Workspace              │
│ ─────                        │
│ 📣 Fan Engagement            │
│ ⚽ Football Operations        │
│ 🏟️ Academy                   │
│ ─────                        │
│ [User Profile]               │
└──────────────────────────────┘
```

**Nav 아이템 규칙**:
- 간격: `space-y-3` (12px)
- 아이콘 박스: `w-5 h-5 rounded-md` (배경색 없음)
- 텍스트: `text-[14px] font-medium`
- 활성: `bg-[#f4f4f5] text-[#171717]`
- 비활성: `text-[#444444] hover:bg-[#f4f4f5]`

### 7.2 브레드크럼 행

- 위치: 메인 콘텐츠 영역 최상단
- 높이: `h-12` (사이드바 로고 행과 동일)
- Border: `borderBottom: "1px solid #f4f4f5"`

**Workspace Home**:
```
{OrgName} / {WorkspaceName}
```

**Agent Home**:
```
{OrgName} / {WorkspaceName} / {AgentName}
```

### 7.3 파이프라인 패널 (Agent Home 내부)

좌측 320px 고정 패널. 환경별 인스턴스를 카드로 선택.

```
Pipeline
┌────────────────────────┐
│ ● Development          │
│   Version 1.4          │
│   다국어 지원 추가...   │  ← versionNote (최대 2줄)
└────────────────────────┘
┌────────────────────────┐  ← 선택됨: 1px solid #171717
│ ● Production           │
│   Version 1.2          │
│   응답 속도 최적화...   │
└────────────────────────┘
```

**선택 카드**: `box-shadow: 0 0 0 1px #171717`, 배경색 변경 없음
**호버 카드**: `rgba(0,0,0,0.20) 0px 0px 0px 1px`

### 7.4 Console (우측 탭 영역)

환경 선택 후 우측에 표시되는 작업 영역.

```
Console
┌────────────────────────────────────────────┐
│    [Overview] [Build] [Test] [Evaluate]    │  ← Segmented Control (중앙 배치)
│                                            │
│              [Content Area]                │
│                                            │
│  [Promote to Staging ↑]                    │  ← 하단 좌측 (탭 내부)
└────────────────────────────────────────────┘
```

**탭 UI**: iOS-style Segmented Control
- 컨테이너: `background: #f4f4f5`, `p-1 rounded-lg`
- 활성: `background: #ffffff`, `box-shadow: rgba(0,0,0,0.08) 0px 1px 3px`
- 비활성: `transparent`, `color: #888888`

---

## 8. 화면 명세

### 8.1 화면 목록

| ID | 화면명 | 경로 | 우선순위 |
|----|--------|------|----------|
| S-01 | Entry (Org Home) | `/org/{slug}` | P0 |
| S-02 | Organization Settings | `/org/{slug}/settings/*` | P1 |
| S-03 | Workspace Home | `/org/{slug}/ws/{ws}` | P0 |
| S-04 | Workspace Settings | `/org/{slug}/ws/{ws}/settings/*` | P1 |
| S-05 | Agent Overview | Agent Home, overview 탭 | P0 |
| S-06 | Agent Build | Agent Home, build 탭 | P0 |
| S-07 | Agent Test | Agent Home, test 탭 | P0 |
| S-08 | Agent Evaluate | Agent Home, evaluate 탭 | P1 |
| S-09 | Promote Dialog | 모달 오버레이 | P0 |

---

### 8.2 S-01: Entry (Organization Home)

**목적**: 로그인 직후 첫 화면. 복수 Workspace와 Agent 선택이 가능한 초기 진입 경로.

**뷰 전환**: Grid(카드) / List(테이블) 전환 가능

#### AgentCard (Grid 뷰)

```
┌─────────────────────────────────┐
│ Agent Name          [alert dot] │
│ description (max 2 lines)       │
│ ─────────────────────────────── │
│ ● Development     Version X.X   │
│ ● Staging         —             │
│ ● Production      Version X.X   │  ← Suspended 시 회색 + "Suspended" 뱃지
│ ─────────────────────────────── │
│ [avatars]              2d ago   │
└─────────────────────────────────┘
```

- 환경 dot 크기: `w-1.5 h-1.5` (모든 곳 통일)
- 버전: `formatVersion()` 처리 후 표시
- 배포 없음: `—` 표시

#### List 뷰 (Kanban 형태)

- 열: Agent | Development | Staging | Production
- 각 환경 셀: 배포된 버전 + 알림 뱃지
- 알림 뱃지는 해당 환경 열에만 표시 (`alertEnv` 기반)

---

### 8.3 S-03: Workspace Home

**목적**: Workspace 내부 Agent 목록 관리. 팀 메트릭 요약 포함.

**브레드크럼**: `{OrgName} / {WorkspaceName}` (h-12, border-bottom)

**상단 Team Metrics** (production 배포 Agent가 있는 Workspace만):
- Conversations Today (변화율 포함)
- Avg CSAT
- Active Agents / Total
- Alerts (critical/warning/info)

**Agent 그리드**: 3열, AgentCard 컴포넌트 공통 사용

---

### 8.4 S-05: Agent Overview

**환경별 표시 내용**:

| 환경 | 알림 | 주요 블록 |
|------|------|-----------|
| Production | 최상단 | KPI 4개 → Agent Info → Top Intents → Recent Conversations → Deployment History |
| Staging | 최상단 | Agent Info → Changes in This Version → Readiness Checklist → Verification History |
| Development | 최상단 | Agent Info (+ Changes 수, + Ready to Promote 배너) → Changes vs Production → Test 세션 → Edit History |

**공통 규칙**:
- 알림(warning/info)은 **항상 최상단** (KPI보다 위)
- 버전 표시: `formatVersion()` 필수
- Deployment History: `buildDeployHistory(instance)` 동적 생성
- Verification History: `buildStagingHistory(instance)` 동적 생성

---

### 8.5 S-06: Agent Build

**섹션 네비게이션**: 상단 탭 (언더라인 방식, 좌측 사이드 네비 금지)

```
Instructions | Knowledge | Guardrails | Variables | Model | Actionbook
```

**환경별 편집 권한**:

| 환경 | 편집 | 표시 |
|------|------|------|
| Development | ✅ 자유 편집 | Save to Dev 버튼 |
| Staging | 🔒 읽기 전용 | "Staging build — Edit in Development" 배너 |
| Production | 🔒 읽기 전용 | "Production build — Edit in Development" 배너 |

**Model 섹션**:
- `<select>` 드롭다운 금지
- 2×2 그리드 카드 UI 사용
- 각 카드: 모델명 + 제공사 + 설명 + 라디오 인디케이터

**액션 버튼**: 탭 콘텐츠 하단 좌측 배치
- Dev: `Save to Dev`
- Dev/Staging: `Promote to {target}` (Promote Dialog 트리거)

---

### 8.6 S-07: Agent Test

**환경별 UI**:

| 환경 | 레이아웃 |
|------|---------|
| Development | 채팅 시뮬레이터(좌) + 응답 상세 패널(우, 240px) |
| Staging | Test Suite 목록 + 통과율 요약 |
| Production | Shadow Replay 로그 |

**Development 채팅 패널**:
- 높이: 640px
- 우측 상세 패널 gap: `gap-10` (40px → 32px)
- 하단: `Promote to {target}` 버튼 (콘텐츠 영역 하단 좌측)

**Staging/Development 공통**:
- `Promote to {target}` 버튼은 탭 콘텐츠 하단 좌측

---

### 8.7 S-08: Agent Evaluate

**환경별 데이터**:

| 환경 | 분석 기반 | 주요 지표 |
|------|-----------|-----------|
| Development | 시뮬레이션 세션 | Simulations Run, Avg Confidence, Low Confidence |
| Staging | QA 테스트 세트 | Test Cases Run, Pass Rate, Failed |
| Production | 실사용자 대화 | 해결률, CSAT, 에스컬레이션률, 실패 Intent |

**레이아웃 규칙**:
- KPI 카드 그리드 먼저, 설명 텍스트는 그리드 아래에 배치
- 섹션 레이블: `text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide`

---

### 8.8 S-09: Promote Dialog

**트리거**: Build/Test/Overview 탭 하단의 `Promote to {target}` 버튼

**구성**:
1. 환경 플로우 다이어그램 (현재 → 대상 → 그 다음)
2. 변경사항 체크리스트 (선택 가능)
3. `Cancel` / `✓ {target}으로 승격`

---

## 9. 핵심 플로우

### 9.1 플로우 1: 로그인 → Agent 작업 시작

```
Entry (Org Home)
  ↓ Workspace 카드 클릭
Workspace Home
  ↓ Agent 카드 클릭
Agent Home (Production 기본, 사이드바 자동 접힘)
  ↓ 파이프라인 패널에서 Development 선택
Agent Home (Development)
  ↓ Console > Build 탭 클릭
Build > Instructions 섹션 → 작업 시작
```

### 9.2 플로우 2: Dev → Staging → Production Promote

```
Build (Dev) — 편집 완료
  ↓ [Save to Dev] 클릭
  ↓ Test 탭 > 시뮬레이션 검증
  ↓ [Promote to Staging] (탭 하단 좌측)
Promote Dialog → Diff 확인 → 승격
Staging 환경 자동 전환
  ↓ Test 탭 > Test Suite 실행
  ↓ Evaluate 탭 > 성능 체크
  ↓ [Promote to Production]
Promote Dialog (2단계 확인)
Production 배포 완료 → Overview에서 KPI 모니터링
```

### 9.3 플로우 3: 긴급 롤백

```
Production Overview
  ↓ 알림 배너 확인 (최상단 자동 노출)
  ↓ Deployment History에서 안정 버전 확인
  ↓ [Rollback] 버튼 클릭
롤백 확인 다이얼로그
  ↓ 확인
Production 이전 버전으로 복구
```

---

## 10. 컴포넌트 라이브러리

### 10.1 핵심 컴포넌트

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `Sidebar` | `layout/Sidebar.tsx` | 좌측 네비. 에이전트/Settings 진입 시 자동 접힘 |
| `AgentCard` | `workspace/AgentCard.tsx` | Workspace Home의 에이전트 카드. 환경 파이프라인 포함 |
| `AddAgentCard` | `workspace/AgentCard.tsx` | 점선 "+ New Agent" 카드 |
| `WorkspaceHome` | `workspace/WorkspaceHome.tsx` | Workspace 홈 (Grid/List 뷰) |
| `AgentHome` | `workspace/AgentHome.tsx` | Agent 상세. 파이프라인 패널 + Console 구조 |

### 10.2 AgentHome 내부 구조

```
AgentHome
├── PipelinePanel (320px, 좌측)
│   ├── EnvCard (× 최대 3개)
│   └── RollbackButton
└── Console (flex-1, 우측)
    ├── SegmentedControl (Overview/Build/Test/Evaluate)
    ├── OverviewTab
    │   ├── AlertSection (최상단)
    │   ├── KPIGrid
    │   ├── AgentInformation
    │   └── ...
    ├── BuildTab
    │   ├── BuildNav (상단 탭)
    │   ├── BuildEditor
    │   └── ActionBar (하단 좌측)
    ├── TestTab
    │   ├── ChatSimulator (640px)
    │   └── ActionBar (하단 좌측)
    └── EvaluateTab
        ├── KPIGrid
        ├── DescriptionText
        └── DataTable
```

### 10.3 환경별 시각 시스템

| 환경 | Dot | Text | Banner BG | Ring |
|------|-----|------|-----------|------|
| Development | `#eab308` | `#a16207` | `#fefce8` | `rgba(234,179,8,0.2)` |
| Staging | `#f97316` | `#c2410c` | `#fff7ed` | `rgba(249,115,22,0.2)` |
| Production | `#16a34a` | `#15803d` | `#f0fdf4` | `rgba(22,163,74,0.2)` |

---

## 11. 권한 및 상태

### 11.1 Role 정의 (RBAC)

| Role | Org | Workspace | Agent |
|------|-----|-----------|-------|
| **Owner** | 모든 권한 (결제 포함) | 모든 WS 자동 접근 | 모든 작업 |
| **Admin** | 멤버/보안 관리 | 할당된 WS 관리 | 모든 작업 + Prod Promote |
| **Editor** | — | Agent 생성/삭제 | Dev/Staging Build, Promote to Staging |
| **Viewer** | — | 읽기 전용 | 읽기 전용 |

### 11.2 화면별 권한 게이팅

| 화면/액션 | 최소 Role |
|-----------|----------|
| Entry 접근 | Viewer |
| Organization Settings | Admin |
| Billing | Owner |
| Agent Build (Dev) 편집 | Editor |
| Promote to Staging | Editor |
| Promote to Production | Admin |
| Rollback Production | Admin |

### 11.3 빈 상태

| 상태 | 처리 |
|------|------|
| Workspace 0개 | Entry 화면에 온보딩 카드 |
| Workspace 내 Agent 0개 | "+ New Agent" 중앙 배치 |
| 환경 미활성 | 파이프라인 카드에서 비활성(회색) 표시 |
| 접근 권한 없음 | 403 화면 + "관리자에게 권한 요청" |

---

## 12. 기술 요구사항

### 12.1 기술 스택

- **Framework**: Next.js (App Router) — `AGENTS.md` 참조
- **Styling**: Tailwind CSS + 인라인 style (shadow-as-border 패턴)
- **State**: React `useState` / `useEffect` (현재 mock 데이터 기반)
- **Data**: `src/lib/mock-data.ts` (타입 정의 포함)
- **Type**: TypeScript strict mode

### 12.2 성능 요구사항

| 지표 | 목표 |
|------|------|
| Entry 화면 TTI | < 1.5초 |
| 환경 전환 시 콘텐츠 갱신 | < 300ms |
| 사이드바 접힘 애니메이션 | 220ms (jank 없음) |

### 12.3 접근성

- 모든 인터랙션 키보드 조작 가능
- 환경 구분은 색상에만 의존하지 않음 (텍스트 라벨 병기)

### 12.4 데이터 모델 (현재 구현 기준)

```typescript
interface AgentEnvironmentInstance {
  id: string;
  environmentType: "development" | "staging" | "production";
  instanceName: string;
  version: string;          // raw "v1.9" — UI 표시 시 formatVersion() 필수
  deployedAt?: string;
  deployedBy?: string;
  health: "healthy" | "warning" | "error" | "unknown";
  suspended?: boolean;
  versionNote?: string;     // 각 버전 주요 변경사항 (최대 2줄 표시)
}

interface Agent {
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
    alertEnv?: "development" | "staging" | "production";  // 알림이 속한 환경
    csat?: number;
    resolutionRate?: number;
  };
}
```

---

## 13. Out of Scope

- 🚫 Agent 제작 에디터 내부의 상세 UX (Knowledge 업로드 플로우, 실제 API 연동 등)
- 🚫 멤버 온보딩/초대 이메일 플로우
- 🚫 결제/구독 플로우
- 🚫 모바일 전용 네이티브 앱
- 🚫 Agent 간 협업(에이전트 체이닝)
- 🚫 실제 백엔드 API 연동 (현재 mock-data.ts 기반)

---

## 14. 오픈 이슈

| ID | 이슈 | 상태 | 비고 |
|----|------|------|------|
| Q-01 | 환경이 3개로 고정인가, 커스텀 가능해야 하나? | 🟡 논의 중 | 엔터프라이즈 고객은 QA, Pre-prod 추가 가능성 |
| Q-02 | Workspace 간 Agent 이동 가능해야 하나? | 🔴 미결정 | 기술적으로 복잡 |
| Q-03 | 환경별 멤버 권한을 다르게 줄 수 있어야 하나? | 🟡 논의 중 | Dev는 모두 편집, Prod는 Admin만 |
| Q-04 | 버전 히스토리 보존 기간은? | 🔴 미결정 | 감사 로그 요구사항과 연계 |
| Q-05 | Agent 템플릿/프리셋 제공 여부 | 🟢 향후 버전 | MVP 이후 |
| Q-06 | Promote Dialog에서 Diff 표시 방식 | 🟡 논의 중 | 현재 체크리스트, 텍스트 Diff로 고도화 가능 |

---

## 부록 A: 변경 이력

| 버전 | 일자 | 변경 내용 |
|------|------|-----------|
| v0.1 | 2026-04-22 | 초안 작성 |
| v0.2 | 2026-04-23 | 환경 시스템, 파이프라인 패널, Alert 위치 규칙 추가 |
| v0.3 | 2026-04-25 | 구현 반영: formatVersion 규칙, 사이드바 자동 접힘, Build 탭 구조, Promote 버튼 위치, Segmented Control, 동적 Deployment History, 금지 사항 목록 추가 |

---

**END OF DOCUMENT**
