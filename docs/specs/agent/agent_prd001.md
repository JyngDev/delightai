# Agent 화면 — 설계 명세

> **문서 상태**: v0.1
> **작성일**: 2026-04-22
> **상위 문서**: PRD.md §8.4~8.8 (Agent 내부 화면)
> **관련 문서**: WORKSPACE_SPEC.md, ADR-001~004
> **대상 독자**: 디자이너, 프론트엔드 개발자, QA
> **선행 조건**: PRD §6 설계 원칙, ADR-002 복합 상태 라벨, ADR-004 단수 모델

---

## 목차

1. [개요](#1-개요)
2. [공통 레이아웃](#2-공통-레이아웃)
3. [Environment Bar (환경 전환 핵심 컴포넌트)](#3-environment-bar)
4. [탭별 화면 명세](#4-탭별-화면-명세)
   - 4.1 [Overview](#41-overview)
   - 4.2 [Build](#42-build)
   - 4.3 [Test](#43-test)
   - 4.4 [Evaluate](#44-evaluate)
5. [Promote 플로우 (핵심)](#5-promote-플로우-핵심)
6. [권한 및 편집 게이팅](#6-권한-및-편집-게이팅)
7. [데이터 모델](#7-데이터-모델)
8. [오픈 이슈](#8-오픈-이슈)

---

## 1. 개요

### 1.1 Agent 화면의 역할

Agent 화면은 **하나의 AI Agent를 구축·검증·운영하는 단일 작업 공간**이다. 사용자가 Workspace Home에서 Agent 카드를 클릭한 순간 진입하며, 해당 Agent의 모든 라이프사이클 작업이 이곳에서 이루어진다.

### 1.2 과제 필수 요구사항 대응

과제에서 명시한 두 가지 필수 요구사항 중 **두 번째**가 이 화면의 핵심이다.

> "각 Agent별 환경(Development, Staging, Production) 관리 구조를 포함해 주세요."

이 요구사항은 본 문서의 §3(Environment Bar)과 §5(Promote 플로우)에서 다룬다.

### 1.3 이 화면이 직면한 복잡성

Agent 화면은 **3개의 축이 교차하는 공간**이다 (PRD §6 원칙 1).

| 축       | 값                                 | UI 위치                    |
| -------- | ---------------------------------- | -------------------------- |
| 소속     | Org → Workspace → Agent            | 사이드바                   |
| **환경** | Dev / Staging / Prod               | **Environment Bar (상단)** |
| **작업** | Overview / Build / Test / Evaluate | **탭 바 (환경 바 아래)**   |

이 두 축(환경 × 작업)이 만들어내는 **12가지 조합**을 각각 의미있게 설계하는 것이 본 문서의 과제다.

### 1.4 핵심 설계 결정 요약

이 화면 설계에 적용되는 주요 ADR 결정:

- **ADR-001**: Production 중심 표시, Dev/Staging은 보조
- **ADR-002**: 복합 상태 라벨 (LIVE · IN REVIEW · IN DEVELOPMENT)
- **ADR-004**: 환경 인스턴스는 MVP에서 단수, 데이터 모델은 확장 가능

---

## 2. 공통 레이아웃

### 2.1 전체 구조

```
┌──────────┬──────────────────────────────────────────────┐
│          │ [Breadcrumb]                    [Profile]   │
│ Sidebar  ├──────────────────────────────────────────────┤
│          │ Agent Name + Composite State Labels         │
│ - Org    │ ────────────────────────────────────────    │
│ - WS     │ [Environment Bar]                           │
│ - Agent  │ ────────────────────────────────────────    │
│          │ [Tab Bar: Overview / Build / Test / Evaluate]│
│ - Menu   │ ────────────────────────────────────────    │
│          │                                              │
│          │ [Content Area — 환경 × 탭에 따라 변화]      │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 2.2 사이드바 (Agent 컨텍스트)

사이드바는 WORKSPACE_SPEC.md §3.2의 구조를 따르되, **Agent Switcher가 추가**된다.

```
┌──────────────────────────┐
│ 🏢 Organization ▼        │
├──────────────────────────┤
│ 📁 Workspace ▼           │
├──────────────────────────┤
│ 🤖 Agent ▼ (강조)        │  ← 현재 Agent, 클릭 시 WS 내 다른 Agent로 전환
├──────────────────────────┤
│ AGENT MENU               │
│  ▸ Overview              │
│    Build                 │
│    Test                  │
│    Evaluate              │
├──────────────────────────┤
│ ← Back to Workspace      │
└──────────────────────────┘
```

**주의**: Workspace Settings 그룹은 이 컨텍스트에서 **표시하지 않는다**. Agent 내부 작업에 집중시키기 위함. 필요 시 Workspace Switcher를 통해 되돌아감.

### 2.3 Agent 헤더 영역

탭 바 위, 브레드크럼 아래의 영역.

```
🤖 Support Bot                                  [⚙] [⋮]
🟢 LIVE · 🔵 IN DEVELOPMENT
```

**구성**:

- Agent 아이콘 + 이름
- **복합 상태 라벨** (ADR-002): Agent 이름 **아래** 배치
- 우측 액션: 설정 버튼 / 더보기 메뉴 (Rename, Archive, Delete)

---

## 3. Environment Bar

### 3.1 개요

**이 화면에서 가장 중요한 컴포넌트.** 과제의 필수 요구사항인 "환경 관리 구조"가 여기서 직접적으로 구현된다.

### 3.2 기본 구조

```
┌──────────────────────────────────────────────────────────────┐
│ Environment                                                   │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ </> DEV    │  │ 📦 STAGING │  │ 🚀 PROD   │              │
│  │ v0.42  🟢  │  │ v0.41  🟢  │  │ v0.38  🟠 │              │
│  │ 2h ago     │  │ 1d ago     │  │ 1w ago    │              │
│  └────────────┘  └────────────┘  └────────────┘              │
│                                                               │
│                              [⬆ Promote] [↶ Rollback] [📜 History]│
└──────────────────────────────────────────────────────────────┘
```

### 3.3 환경 카드 구성

각 환경 카드에 표시되는 정보 (참고자료 1 기반).

| 요소             | 설명                               | 예시                                  |
| ---------------- | ---------------------------------- | ------------------------------------- |
| **환경 아이콘**  | 환경별 고유 아이콘                 | Dev: `</>`, Staging: 박스, Prod: 로켓 |
| **환경 이름**    | Development / Staging / Production | "DEVELOPMENT"                         |
| **버전**         | 현재 이 환경에 배포된 버전         | "v0.42"                               |
| **건강 상태 점** | 색상 점으로 상태 표시              | 🟢 정상 / 🟠 주의 / 🔴 오류           |
| **배포 시각**    | 상대 시간 또는 절대 시각           | "2h ago" 또는 "Jan 7, 2026"           |
| **빈 상태 문구** | 배포 안 된 환경                    | "Available to deploy →"               |

### 3.4 환경 선택과 콘텐츠 동기화

- 활성 환경 카드는 **테두리 강조 + 배경색 변화**로 구분
- 환경 카드 클릭 → 선택된 환경으로 전환 → **탭 콘텐츠 영역이 해당 환경 데이터로 갱신**
- URL의 `?env=` 파라미터가 변경됨 (딥링크 공유 가능)
- 탭 전환 시에도 선택된 환경은 유지

### 3.5 빈 환경의 처리

ADR-004에 따라 MVP에서는 한 환경당 하나의 인스턴스만 존재하지만, **배포 여부는 다를 수 있음**.

```
Staging 환경이 비어있는 경우:
┌────────────┐
│ 📦 STAGING │
│ —          │
│            │
│ Available  │
│ to deploy →│  ← 클릭 시 Dev → Staging Promote 다이얼로그
└────────────┘
```

### 3.6 우측 액션 버튼 3개

#### [⬆ Promote]

현재 선택된 환경의 내용을 **다음 환경으로** 승격시킨다. 자세한 플로우는 §5 참조.

- Dev 선택 중 → "Promote to Staging"
- Staging 선택 중 → "Promote to Production"
- Prod 선택 중 → 비활성화 (더 상위 환경 없음)

#### [↶ Rollback]

현재 선택된 환경을 **이전 배포 버전으로 복구**한다 (참고자료 2).

- Prod에서 이상 지표 감지 시 즉시 실행 가능
- 클릭 시 버전 히스토리 다이얼로그 → 복구할 버전 선택

#### [📜 History]

이 환경의 **배포 이력 전체**를 표시한다 (참고자료 2: 버전 관리).

```
Production 배포 이력
─────────────────────────────────
v0.38 (현재)  · 2026-01-15 · Jiyong
v0.37         · 2026-01-08 · Sarah
v0.36         · 2025-12-20 · David
...
```

각 버전 항목 클릭 시 Rollback 대상으로 선택 가능.

### 3.7 Staging 건너뛰기 지원 (참고자료 1)

Workspace Settings에서 "Fast Track" 워크플로가 설정된 경우:

- Environment Bar에 Staging 카드가 **회색 처리 또는 축약 표시**
- Promote 경로가 자동으로 "Dev → Production" 으로 변경
- 필요시 Staging을 수동으로 사용 가능 (숨김 해제)

이 기능은 MVP에서는 **단순 안내 텍스트**로 대응하고, 실제 설정 토글은 향후 확장.

---

## 4. 탭별 화면 명세

### 4.0 환경 × 탭 조합의 주요도

각 조합의 **비중과 성격**이 다름을 설계에 반영한다.

| 환경 \ 탭   | Overview    | Build       | Test        | Evaluate    |
| ----------- | ----------- | ----------- | ----------- | ----------- |
| **Dev**     | 보조        | ⭐ **주요** | ⭐ **주요** | 보조        |
| **Staging** | 보조        | 읽기 전용   | ⭐ **주요** | 주요        |
| **Prod**    | ⭐ **주요** | 읽기 전용   | 보조        | ⭐ **주요** |

**기본 진입 탭은 환경에 따라 달라진다** (사용자 경험 최적화).

- Dev 진입 시 기본 탭 → Build
- Staging 진입 시 기본 탭 → Test
- Prod 진입 시 기본 탭 → Overview

---

### 4.1 Overview

**목적**: 해당 환경의 Agent 현황을 한눈에 요약.

#### 환경별 표시 내용 차이

**Production Overview (메인 사용처)**

실사용자 지표 대시보드.

```
[Environment: Prod 선택 상태]

┌─ 핵심 지표 4개 ────────────────────────┐
│ 💬 오늘 대화    │ 😊 CSAT    │ ⚡ 응답  │ ⚠ 알림 │
│ 1,248 (▲8%)    │ 4.6 (▲0.1) │ 1.2s    │ 2     │
└────────────────────────────────────────┘

┌─ 차트 2개 ────────────────────────────┐
│ 대화량 추이 (7일)    │ Top Intents      │
│ [라인 차트]          │ [바 차트]        │
└────────────────────────────────────────┘

┌─ 최근 대화 리스트 ────────────────────┐
│ [시각] [사용자] [인텐트] [해결 여부]   │
│ ... (클릭 시 Activity Log 진입)       │
└────────────────────────────────────────┘
```

**Dev Overview**

개발자용 작업 진행 상황.

- 최근 편집 이력 (누가 언제 무엇을)
- Test 탭에서 실행한 최근 시뮬레이션 결과
- "Staging으로 Promote할 준비가 되었습니다" 알림 (변경사항 있을 때)
- 빠른 진입 링크: [Build 계속 편집] [Test 실행]

**Staging Overview**

QA 검증 진행 상황.

- Staging 체류 기간 (예: "2 days in Staging")
- Dev와 Staging의 버전 Diff 요약
- QA 테스트 통과율 (Evaluate 데이터 기반)
- 빠른 진입: [Test에서 검증] [Prod로 Promote]

---

### 4.2 Build

**목적**: Agent를 **만들고 설정하는** 작업 공간. 과제 원문의 정의.

#### 레이아웃 구조

```
┌─ Build Sub-nav ──┬─ Editor Area ─────────────────────┐
│ ▸ Instructions   │                                    │
│   Knowledgebase  │  [선택한 서브섹션의 에디터]         │
│   Actionbooks    │                                    │
│   Tools          │                                    │
│   Safeguards     │                                    │
│   Model          │                                    │
│   Channels       │                                    │
└──────────────────┴────────────────────────────────────┘
```

#### Build 서브 네비게이션 구성

참고자료의 공식 제품 용어를 반영:

| 서브섹션          | 설명                                       | 출처                               |
| ----------------- | ------------------------------------------ | ---------------------------------- |
| Instructions      | System prompt, Welcome 메시지 등 기본 지침 | 범용                               |
| **Knowledgebase** | 참조할 지식 자료 (문서, URL, DB)           | 공식 용어                          |
| **Actionbooks**   | 업무 시나리오별 처리 절차                  | 참고자료 3, 공식 용어              |
| Tools             | 외부 API 호출 함수                         | 공식 용어                          |
| **Safeguards**    | 금지 주제, PII 규칙, 콘텐츠 필터           | 공식 용어 (Guardrails의 공식 표현) |
| Model             | LLM 선택, 온도, 토큰 제한                  | 범용                               |
| Channels          | 이 Agent가 배포될 채널 선택                | WS Channels 연계                   |

#### Workspace Shared Assets와의 연결

Knowledgebase, Actionbooks, Tools는 **Workspace Shared Assets에서 공유되는 자원**을 참조할 수 있다.

```
Knowledgebase 서브섹션 내부:

┌─ 연결된 지식 자료 ─────────────────────┐
│ 📄 Product FAQ (Workspace 공유)  [X] │
│ 🌐 Help Center (Workspace 공유)  [X] │
│ 📄 이 Agent 전용 지식            [X] │
│                                        │
│ [+ Workspace에서 추가] [+ 새로 만들기] │
└────────────────────────────────────────┘
```

**2가지 추가 경로**:

1. **Workspace에서 추가**: Shared Assets에 이미 있는 자산 참조 (재사용)
2. **새로 만들기**: 이 Agent 전용 자산 생성 (독립 관리)

#### 환경별 편집 권한

| 환경        | Build 탭 편집 가능성                  |
| ----------- | ------------------------------------- |
| **Dev**     | ✅ 자유 편집                          |
| **Staging** | 🔒 **읽기 전용** (수정하려면 Dev에서) |
| **Prod**    | 🔒 **읽기 전용** (Promote로만 반영)   |

**Staging/Prod에서의 UI**:

- 모든 입력 필드 비활성화
- 상단에 배너: "이 환경의 설정은 읽기 전용입니다. 수정하려면 Development 환경에서 작업 후 Promote 하세요."
- `Go to Development →` 빠른 링크

#### 하단 액션 바

**Dev에서**:

```
[Discard changes] [💾 Save to Dev] [⬆ Promote to Staging]
```

**Staging/Prod에서**:

```
[🔒 Read-only]  [📜 View Diff with lower env →]
```

---

### 4.3 Test

**목적**: Agent 응답을 **시뮬레이션**하고 검증. 과제 원문의 정의.

#### 환경별 Test 탭의 성격 차이

Dev Test와 Staging Test는 **같은 "Test" 탭이지만 역할이 다름**.

##### Dev Test — 개발자의 즉시 검증용

```
┌─ 채팅 시뮬레이터 (좌측 2/3) ─┬─ 상세 정보 (우측 1/3) ─┐
│                                │                         │
│  [사용자 메시지]               │ 이 응답에 사용된:      │
│  [Agent 응답]                  │  - Knowledgebase       │
│                                │  - Actionbook          │
│  [사용자 메시지]               │  - Tools 호출          │
│  [Agent 응답]                  │                         │
│                                │ 응답 시간: 1.2s        │
│  [메시지 입력창 _________ ]    │ 토큰 사용: 842         │
│                                │                         │
│                                │ [🔍 Explain response]  │
└────────────────────────────────┴─────────────────────────┘
```

- 1:1 대화형 시뮬레이션
- 빠른 이터레이션 (메시지 → 응답 → 프롬프트 수정 → 재시도)
- 각 응답 옆에 **"Explain response"** 버튼 (참고자료 3의 Activity Log 2.0)

##### Staging Test — QA의 시나리오 회귀 테스트용

```
┌─ 테스트 세트 목록 ──────────────────────┐
│ ☑ 주문 조회 시나리오 (12개 케이스)      │
│ ☑ 환불 요청 시나리오 (8개 케이스)       │
│ ☐ 배송 문의 시나리오 (15개 케이스)      │
│                          [▶ Run selected]│
└──────────────────────────────────────────┘

┌─ 실행 결과 ──────────────────────────────┐
│ 20/20 통과  ·  2개 실패                 │
│ [실패 케이스 상세 →]                    │
└──────────────────────────────────────────┘
```

- 여러 테스트 케이스 **배치 실행**
- 이전 실행 결과와 비교 (회귀 탐지)
- 실패 케이스 상세 분석

##### Prod Test

**제한적 제공**: 실서비스 중인 Agent에 대한 시뮬레이션은 읽기 전용 데이터로만 가능. 실제 사용자 트래픽에 영향 없음을 명시.

#### Explain AI Response (공통)

참고자료 3의 핵심 기능. 어떤 환경의 Test에서든 응답 옆에 "Explain" 버튼 제공.

클릭 시 **사이드 패널 또는 모달**로 다음 정보 표시:

```
How This Message Was Generated

1. [사용된 Knowledgebase 참조 내용]
2. [호출된 Actionbook과 단계]
3. [실행된 Tool 호출과 결과]
4. [적용된 Safeguard 규칙]
5. All information is grounded in provided sources ✓
```

**이 기능이 중요한 이유**: "왜 이런 응답이 나왔지?" 를 즉시 검증 가능 → Build 탭으로 돌아가 수정할 근거 제공.

---

### 4.4 Evaluate

**목적**: 실제 대화 데이터 기반으로 Agent의 **성능을 분석**. 과제 원문의 정의.

#### 환경별 Evaluate 탭의 성격 차이

##### Prod Evaluate — 메인 사용처

실사용자 대화 데이터 기반 분석.

```
┌─ 필터 ────────────────────────────────────────────────┐
│ 기간: [지난 7일 ▼]                                    │
│ 상태: [전체 / 해결 / 미해결 / ⚠ 낮은 신뢰도 ▼]        │
│ 검색: [대화 내용 검색 ...]                            │
└───────────────────────────────────────────────────────┘

┌─ 지표 대시보드 ────────────────────────────────────────┐
│ 해결률    │ 에스컬레이션률 │ 감정 분포  │ 실패 Intent  │
│ 87%       │ 13%           │ 긍정 74%   │ Top 5         │
└────────────────────────────────────────────────────────┘

┌─ 대화 리스트 ──────────────────────────────────────────┐
│ ⚠ [시각] [사용자] [인텐트] [CSAT] [신뢰도] [Status]  │
│   (클릭 시 대화 상세 + Activity Log로 진입)           │
│ ...                                                     │
└────────────────────────────────────────────────────────┘
```

**핵심 기능 (참고자료 3 반영)**:

- **낮은 신뢰도 응답 자동 플래깅** (⚠ 아이콘)
- 필터: "낮은 신뢰도만 보기" 옵션
- 개별 대화 클릭 → **Activity Log 2.0** 드릴다운 → **Explain AI Response** 확인 가능

##### Staging Evaluate

QA 테스트 세트 기반 평가.

- 테스트 케이스별 통과율
- 실패 케이스의 원인 분석
- Dev → Staging으로 Promote 후 성능 개선 측정

##### Dev Evaluate

제한적. Test 탭에서 실행한 시뮬레이션 세션 데이터만 분석 가능.

#### Evaluate → Build 피드백 루프

Evaluate에서 발견한 문제를 **바로 Build에서 수정**하러 갈 수 있어야 한다.

```
[대화 상세에서 발견한 문제]
  "이 응답이 잘못된 Knowledge를 참조했음"

  ↓ [Fix in Build ↗] 버튼 클릭

[자동으로 Dev 환경의 Build > Knowledgebase로 이동]
```

이 피드백 루프가 **Build-Test-Evaluate 사이클**의 핵심이다.

---

## 5. Promote 플로우 (핵심)

### 5.1 중요성

과제의 필수 요구사항인 "환경 관리 구조"의 실질적 구현. 본 화면에서 가장 신중히 설계해야 할 플로우.

### 5.2 트리거 지점

다음 4곳에서 Promote를 시작할 수 있다.

1. Environment Bar의 `⬆ Promote` 버튼
2. Build 탭 하단의 `Promote to Staging` 버튼
3. Overview 탭의 "Promote할 준비가 되었습니다" 알림 클릭
4. Environment Bar의 빈 환경 카드 `Available to deploy →` 클릭

### 5.3 다이얼로그 구성 (참고자료 2 기반: Selective Deployment 2.0)

단순히 "환경 이동"이 아니라, **변경사항을 선택적으로 배포**하는 정교한 플로우.

#### Step 1: 변경사항 자동 감지

다이얼로그가 열리자마자 시스템이 변경사항을 스캔.

```
┌─ Promote: Development → Staging ──────────────────────┐
│                                                        │
│ 변경사항 감지 중... ⏳                                │
│                                                        │
│ [완료]                                                 │
│ 7개 변경사항이 감지되었습니다.                         │
└────────────────────────────────────────────────────────┘
```

#### Step 2: 선택적 배포 체크리스트

감지된 변경사항을 항목별로 선택 (참고자료 2 핵심 기능).

```
┌─ Promote: Development (v0.42) → Staging (v0.41) ─────┐
│                                                        │
│ 배포할 변경사항을 선택하세요:                          │
│                                                        │
│ ☑ Instructions 수정                                    │
│   "공손한 어투" 지침 추가       [View diff →]         │
│                                                        │
│ ☑ Knowledgebase 추가                                  │
│   + 2026 요금제 FAQ              [View diff →]        │
│                                                        │
│ ☑ Actionbook 수정                                     │
│   "환불 처리" 단계 개선          [View diff →]        │
│                                                        │
│ ☐ Tool 제거                                           │
│   - legacy_lookup 제거           [View diff →]        │
│                                                        │
│ ☑ Safeguards 업데이트                                 │
│   PII 필터 강화                  [View diff →]        │
│                                                        │
│ ☐ Model 변경                                          │
│   gpt-4 → gpt-4-turbo            [View diff →]        │
│                                                        │
│ ☑ Workspace 설정 변경 (2개)                           │
│   → Profile, CSAT 기준          [View diff →]        │
│                                                        │
│                          [Cancel] [Continue (5/7) →] │
└────────────────────────────────────────────────────────┘
```

**핵심 포인트**:

- 모든 변경 항목이 기본 체크됨
- 특정 항목만 제외 가능 ("이번엔 Model 변경은 빼고 싶음")
- Agent 내부 변경 + **Workspace 설정 변경**까지 포함 (참고자료 2)

#### Step 3: Diff 확인 (읽기 전용 미리보기)

각 변경사항의 `[View diff →]` 클릭 시 Diff 뷰어 오픈.

```
┌─ Diff: Instructions ──────────────────────────────────┐
│                                                        │
│ [Side-by-side ▼]  [Inline]                           │
│                                                        │
│ Before (v0.41)          │ After (v0.42)              │
│ ────────────────────    │ ────────────────────       │
│ You are a helpful       │ You are a helpful          │
│ support assistant.      │ support assistant.         │
│                         │ + Always use polite tone.  │
│                         │ + Escalate when unsure.    │
│ ...                     │ ...                        │
│                                                        │
│                          [Back to list]              │
└────────────────────────────────────────────────────────┘
```

**참고자료 2의 핵심 원칙**: **읽기 전용 미리보기**. 이 화면에서는 실수로 수정할 위험 없음.

#### Step 4: 최종 확인

```
┌─ Confirm Promote ─────────────────────────────────────┐
│                                                        │
│ 다음 변경사항이 Staging에 반영됩니다:                  │
│  • Instructions 수정                                   │
│  • Knowledgebase 추가                                  │
│  • Actionbook 수정                                     │
│  • Safeguards 업데이트                                 │
│  • Workspace 설정 변경                                 │
│                                                        │
│ ⚠ Staging 반영 후 Test 탭에서 시나리오 검증을 권장    │
│   합니다.                                              │
│                                                        │
│                       [Back] [✓ Promote to Staging]  │
└────────────────────────────────────────────────────────┘
```

#### Prod로의 Promote는 추가 안전장치

Staging → Production Promote 시:

- 2단계 확인 (타이핑 확인 또는 2FA 재인증)
- Admin 이상 권한만 가능 (ADR-001 준거)
- 알림 발송 (이해관계자에게)

### 5.4 Rollback 플로우

Promote의 역방향. 참고자료 2에서 강조한 기능.

- Environment Bar의 `↶ Rollback` 클릭 → 배포 이력 다이얼로그
- 복구할 이전 버전 선택
- Diff 미리보기 (현재 vs 복구 대상)
- 2단계 확인 → 즉시 복구

### 5.5 모든 Promote/Rollback은 감사 로그에 기록

참고자료 2의 컴플라이언스 요구사항 반영.

- 누가 언제 어떤 환경으로 무엇을 Promote 했는지
- Rollback 발생 시 사유 입력 선택적 제공
- Org Settings > Audit Logs에서 조회

---

## 6. 권한 및 편집 게이팅

### 6.1 환경별 편집 권한 매트릭스

| 역할 / 환경 | Dev                         | Staging                     | Prod        |
| ----------- | --------------------------- | --------------------------- | ----------- |
| Viewer      | 읽기                        | 읽기                        | 읽기        |
| Editor      | ✅ 편집, Promote to Staging | 읽기 (Promote to Staging만) | 읽기        |
| Admin       | ✅ 편집                     | Promote to Prod 포함        | ✅ Rollback |
| Owner       | 전체                        | 전체                        | 전체        |

### 6.2 편집 금지 환경에서의 UI 원칙

**Staging/Prod의 Build 탭**:

- 입력 필드 자체를 비활성화
- 상단 배너로 명확히 상태 알림
- "Go to Development" 빠른 링크

이렇게 하는 이유: "편집 불가"를 단순 메시지가 아닌 **UI 구조로 차단** (PRD §6 원칙 3).

---

## 7. 데이터 모델

### 7.1 Agent 진입 시 필요한 데이터

```typescript
interface AgentScreenData {
  agent: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    workspaceId: string;
    // ADR-004 준거: 배열 구조 (MVP에서는 각 환경당 1개)
    instances: AgentEnvironmentInstance[];
    compositeState: CompositeState[]; // ADR-002
  };
  currentContext: {
    selectedEnv: "dev" | "staging" | "prod";
    selectedTab: "overview" | "build" | "test" | "evaluate";
  };
  permissions: {
    canEditDev: boolean;
    canPromoteToStaging: boolean;
    canPromoteToProd: boolean;
    canRollback: boolean;
  };
}

interface AgentEnvironmentInstance {
  id: string;
  environmentType: "development" | "staging" | "production";
  instanceName: string; // MVP: 항상 'default'
  version?: string;
  deployed: boolean;
  deployedAt?: string;
  deployedBy?: string;
  health: "healthy" | "warning" | "error" | "unknown";
}
```

### 7.2 Build 탭 편집 데이터

```typescript
interface AgentBuildConfig {
  instructions: {
    systemPrompt: string;
    welcomeMessage: string;
    examples: Example[];
  };
  knowledgebase: KnowledgebaseRef[]; // Shared Assets 또는 Agent 전용
  actionbooks: ActionbookRef[];
  tools: ToolRef[];
  safeguards: SafeguardConfig;
  model: ModelConfig;
  channels: ChannelRef[];
}

interface KnowledgebaseRef {
  source: "workspace_shared" | "agent_only";
  id: string;
  name: string;
}
// Actionbook, Tool도 동일 패턴
```

### 7.3 Promote 요청 데이터

참고자료 2의 Selective Deployment 반영.

```typescript
interface PromoteRequest {
  agentId: string;
  fromEnv: "development" | "staging";
  toEnv: "staging" | "production";
  selectedChanges: string[]; // 선택된 변경 항목 ID 배열
  note?: string;
}

interface ChangeItem {
  id: string;
  type:
    | "instructions"
    | "knowledgebase"
    | "actionbook"
    | "tool"
    | "safeguard"
    | "model"
    | "workspace_setting";
  summary: string;
  diffPreview: DiffContent;
}
```

---

## 8. 오픈 이슈

| ID    | 이슈                                     | 상태      | 비고                          |
| ----- | ---------------------------------------- | --------- | ----------------------------- |
| AG-01 | Evaluate에서 신뢰도 계산 알고리즘        | 🔴 미결정 | 제품팀 결정 필요              |
| AG-02 | Staging 건너뛰기 설정의 UI 배치          | 🟡 논의   | WS Settings? Agent Settings?  |
| AG-03 | Build 편집 중 네트워크 유실 시 로컬 저장 | 🟡 논의   | 자동 복구 vs 수동 재시도      |
| AG-04 | Rollback 시 사유 입력 필수 여부          | 🟡 논의   | 컴플라이언스 요구 사항과 연계 |
| AG-05 | Prod Test의 범위와 제약                  | 🔴 미결정 | 보안 정책 정의 필요           |

---

## 부록: 참고 사항

### A. 공식 제품 용어 사용

본 문서는 Delight.ai 공식 제품 문서의 용어를 반영했다.

| 본 문서 사용 용어    | 근거                                 |
| -------------------- | ------------------------------------ |
| Knowledgebase        | 공식 용어                            |
| Actionbook           | 참고자료 3                           |
| Safeguards           | 공식 용어 (일반적 "Guardrails" 대신) |
| Selective Deployment | 참고자료 2                           |
| Activity Log         | 참고자료 3                           |
| Explain AI Response  | 참고자료 3                           |

### B. Trust OS 철학과의 정합

본 Agent 화면 설계는 Delight.ai의 Trust OS 철학의 네 가지 축을 모두 반영한다.

1. **환경 분리** → §3 Environment Bar, §6 권한 게이팅
2. **선택적 배포** → §5 Promote 플로우 (Selective Deployment)
3. **투명성** → §4.3 Test + §4.4 Evaluate의 Activity Log 2.0
4. **버전 관리·롤백** → §3.6 History / Rollback

---

**END OF DOCUMENT**
