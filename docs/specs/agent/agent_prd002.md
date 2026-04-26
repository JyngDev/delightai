# Agent 화면 — 설계 명세

> **문서 상태**: v0.2
> **작성일**: 2026-04-22 (v0.1), 2026-04-22 업데이트 (v0.2)
> **상위 문서**: PRD.md §8.4~8.8 (Agent 내부 화면)
> **관련 문서**: WORKSPACE_SPEC.md, ADR-001~004
> **대상 독자**: 디자이너, 프론트엔드 개발자, QA
> **선행 조건**: PRD §6 설계 원칙, ADR-002 복합 상태 라벨, ADR-004 단수 모델
> **v0.2 변경사항**: Overview 섹션 완전판 재작성 (환경별 세부 블록, History 블록 통합, 데이터 모델 확장)

---

## 목차

1. [개요](#1-개요)
2. [공통 레이아웃](#2-공통-레이아웃)
3. [Environment Bar (환경 전환 핵심 컴포넌트)](#3-environment-bar)
4. [탭별 화면 명세](#4-탭별-화면-명세)
   - 4.1 [Overview (History 블록 포함)](#41-overview)
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

**목적**: 해당 환경의 Agent 현황을 한눈에 요약 + "다음에 뭘 할지" 허브 역할.

과제 원문 정의: "에이전트의 전반적인 현황 요약"

#### 4.1.1 Overview의 본질

Overview는 **"보는 화면"** 이자 **"다음 행동을 결정하는 허브"** 다.

- **현황**: 지금 이 순간의 상태를 5초 안에 파악
- **요약**: 깊이 파지 않는 얕은 스캔 수준
- **허브**: 여기서 상세 분석(Evaluate), 편집(Build), 검증(Test)으로 분기

"상세 분석은 Evaluate가, 편집은 Build가, 테스트는 Test가 담당한다"는 원칙을 지킨다. Overview는 복잡한 분석 도구가 아니라 **다음 행동을 결정하기 위한 대시보드**다.

#### 4.1.2 공통 설계 원칙

모든 환경의 Overview가 따르는 4가지 원칙.

**원칙 1: 정보 밀도는 환경별로 다르다**

- Prod Overview가 가장 밀도 높음 (실사용자 지표 풍부)
- Dev Overview가 가장 낮음 (주로 진행 상황)
- Staging Overview는 중간 (검증 중심)

**원칙 2: "다음 행동"을 항상 제시**

- Overview는 "보기만 하는" 화면이 아니라 "다음에 뭘 할지 결정하는" 화면
- 모든 환경에서 명확한 CTA 존재

**원칙 3: 드릴다운 가능성 항상 확보**

- 모든 블록은 "더 자세히 보기"로 다른 탭이나 상세 화면 연결
- 지표 → Evaluate, 최근 대화 → Activity Log, 변경 요약 → Build Diff, 알림 → 관련 이슈

**원칙 4: "요약"을 지키기**

- 다음은 Overview에 넣지 않음:
  - 개별 대화의 전체 내용 (Activity Log로)
  - 프롬프트 편집 인터페이스 (Build로)
  - 복잡한 필터와 쿼리 (Evaluate로)

---

#### 4.1.3 Production Overview (메인 사용처)

운영자(Operator) 페르소나가 하루에도 여러 번 들어오는 화면. 실사용자 데이터 기반의 가장 풍부한 Overview.

##### 블록 A: 건강 상태 헤더

한눈에 "괜찮은가?"를 답하는 최상단.

| 정보             | 예시                                  |
| ---------------- | ------------------------------------- |
| 전반 건강 상태   | 🟢 Healthy / 🟡 Warning / 🔴 Critical |
| 현재 배포 버전   | "Production · v0.38"                  |
| 마지막 배포 시각 | "Deployed 3 days ago by Jiyong"       |
| 업타임           | "99.98% last 7 days"                  |

**왜 중요한가**: 이 블록만 보고 "평상시처럼 돌아가는구나"를 즉시 판단 가능.

##### 블록 B: 핵심 KPI 4개

실사용자 대화 데이터 기반의 운영 4대 축.

| 지표               | 설명                         | 비교값                     |
| ------------------ | ---------------------------- | -------------------------- |
| **대화 수**        | 오늘 또는 최근 기간          | 전일/전주 대비 변화율 (±%) |
| **CSAT**           | 평균 사용자 만족도 (0~5)     | 이전 기간 대비 변화 (±0.1) |
| **해결률**         | Agent가 자체 해결한 비율 (%) | 이전 기간 대비 변화        |
| **평균 응답 시간** | 사용자 메시지 → 첫 응답      | 이전 기간 대비 변화        |

**왜 정확히 4개인가**: 더 많으면 스캔 속도 저하. 이 4개가 운영의 4대 축 (양·품질·능력·속도).

##### 블록 C: 알림·경고

즉시 조치가 필요한 이슈 목록.

| 알림 유형 | 예시                                       |
| --------- | ------------------------------------------ |
| Critical  | "에러율 5% 초과 (15분 전부터)"             |
| Warning   | "CSAT 어제 대비 0.4 하락"                  |
| Info      | "신규 인텐트 패턴 감지 (요금제 문의 급증)" |

각 알림 클릭 시 해당 Evaluate 또는 Activity Log로 드릴다운.

##### 블록 D: 시각화 2개

추세 파악용 요약 차트. 상세 분석이 아닌 스캔용.

| 차트            | 내용                             |
| --------------- | -------------------------------- |
| **대화량 추이** | 지난 7일 시간대별 라인 차트      |
| **Top Intents** | 가장 많이 발생한 사용자 의도 5개 |

##### 블록 E: 최근 대화 샘플

운영 상태 체감용.

| 표시 요소   | 설명                                     |
| ----------- | ---------------------------------------- |
| 시각        | "2 min ago" 등 상대 시간                 |
| 사용자 식별 | 익명화된 ID                              |
| 인텐트      | 자동 분류된 사용자 의도                  |
| 해결 여부   | ✓ Resolved / ⚠ Escalated                 |
| 신뢰도      | 낮은 경우 ⚠ 표시 (Activity Log 2.0 기반) |

상세 클릭 시 → Activity Log 2.0 확인 (참고자료 3 기반).

##### 블록 F: Deployment History ⭐

이 환경에 배포된 이력의 최근 3~5개 요약. **Overview의 일부로 편입된 핵심 정보**.

```
Deployment History (Production)
─────────────────────────────────────────
● v0.38 (current · LIVE)
  2026-01-15 · Jiyong
  "공손한 어투 규칙 추가"

○ v0.37
  2026-01-08 · Sarah
  "환불 프로세스 개선"

○ v0.36
  2025-12-20 · David
  ↶ Rolled back from v0.35
  "이슈로 인한 복구"

                            [📜 View all →]
```

**포함 정보**:

- 버전 번호 (current 표시)
- 배포 일시
- 배포자
- 배포 노트 (커밋 메시지 같은 요약)
- 롤백 이력 명시 (있는 경우)

**항목 클릭 시 동작**:

- 해당 버전의 전체 설정 스냅샷 보기
- 이전 버전과의 Diff
- Rollback 이 버전으로 (권한 있는 경우)

**Environment Bar의 History 버튼과의 관계**: 중복이 아닌 접근성 레이어. Overview의 History 블록은 **스캔용 요약 3~5개**, Environment Bar의 `📜 History`는 **전체 이력 상세 탐색**.

##### 블록 G: 빠른 이동 링크

Overview는 허브이므로 다음 행동 동선을 명시.

- `📊 Deep dive in Evaluate →` (성능 상세 분석)
- `↶ Rollback` (문제 발생 시)
- `📜 View deployment history` (전체 이력)

---

#### 4.1.4 Development Overview

개발자(Builder) 페르소나의 작업 허브. Prod Overview와 성격이 완전히 다름.

##### 블록 A: 작업 진행 상황

| 정보                | 예시                                      |
| ------------------- | ----------------------------------------- |
| 현재 Dev 버전       | "Dev · v0.42"                             |
| 마지막 편집         | "Last edited 2h ago by Jiyong"            |
| 저장 상태           | "All changes saved" / "⚠ Unsaved changes" |
| Prod 대비 앞선 정도 | "4 versions ahead of Production"          |

##### 블록 B: 변경 요약 (Prod 대비)

Dev에서 뭘 바꿨는지 한눈에 파악.

```
Production v0.38 대비 변경된 항목:
  • Instructions (3 edits)
  • Knowledgebase (2 items added)
  • Actionbook (1 modified)

  [View full diff →]
```

##### 블록 C: Test 세션 요약

Dev에서 실행한 시뮬레이션 결과.

| 정보                  | 설명                 |
| --------------------- | -------------------- |
| 오늘 실행한 테스트 수 | "12 test sessions"   |
| 최근 세션 상태        | 통과/실패            |
| 마지막 실패 케이스    | 클릭 시 Test 탭 상세 |

##### 블록 D: Edit History ⭐

Dev 환경은 배포 이력보다 **세밀한 편집 이력**이 더 유용. Git의 커밋 히스토리와 유사한 성격.

```
Edit History (Development)
─────────────────────────────────────────
● Currently editing (v0.42 draft)
  Jiyong · 2h ago
  Instructions modified

○ v0.42 saved (4h ago)
  Jiyong
  Knowledgebase updated

○ v0.41 promoted to Staging (1d ago)
  Jiyong
  4 changes included

○ v0.41 saved (1d ago)
  Sarah
  Actionbook "Refund flow" added

                            [📜 View all →]
```

**특징**: 저장·편집·Promote 이벤트가 혼합된 타임라인. Prod의 Deployment History와 달리 더 세밀한 입자의 이력.

##### 블록 E: 다음 단계 안내

현재 작업 상태에 따라 동적으로 바뀌는 CTA 카드.

| 시나리오                   | 안내                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| 변경사항 있고 Test 안 해봄 | "변경사항을 Test로 검증해보세요" + `[Run Test →]`                    |
| Test 통과함                | "Staging으로 Promote할 준비가 되었습니다" + `[⬆ Promote to Staging]` |
| 변경사항 없음              | "현재 Staging과 동일합니다"                                          |
| 미저장 변경 있음           | "⚠ 저장되지 않은 변경사항이 있습니다" + `[💾 Save]`                  |

##### 블록 F: 협업 컨텍스트

멀티 에디터 환경에서 필요한 정보.

- "Sarah is editing Instructions now"
- "Comments: 2 unresolved"
- "David left a review 1h ago"

---

#### 4.1.5 Staging Overview

QA(Validator) 페르소나의 검증 허브.

##### 블록 A: 검증 상태 요약

| 정보               | 예시                           |
| ------------------ | ------------------------------ |
| Staging 버전       | "Staging · v0.41"              |
| Staging 체류 기간  | "2 days in Staging"            |
| Dev와의 버전 차이  | "1 version behind Dev (v0.42)" |
| Prod와의 버전 차이 | "3 versions ahead of Prod"     |

##### 블록 B: QA 테스트 통과 현황

테스트 세트 기반 지표.

| 지표             | 예시                                |
| ---------------- | ----------------------------------- |
| 통과율           | "45/50 cases passed (90%)"          |
| 실패 케이스 수   | "5 failed" (클릭 시 Test 탭 상세로) |
| 마지막 회귀 실행 | "Last run 1h ago"                   |
| 커버리지         | "15 intents, 2 uncovered"           |

##### 블록 C: Dev와의 변경 요약

이번 Staging에 어떤 변경이 반영됐는지.

```
Dev v0.40 → Staging v0.41에서 반영된 것:
  • Knowledgebase: 2026 요금제 FAQ 추가
  • Instructions: 공손한 어투 규칙 추가

  [View detailed diff →]
```

##### 블록 D: Verification History ⭐

Staging은 **검증을 거쳐간 버전들의 이력**이 의미 있음.

```
Verification History (Staging)
─────────────────────────────────────────
● v0.41 (current · 2d in staging)
  ✓ 45/50 QA cases passed
  Promoted from Dev by Jiyong

○ v0.40 (1w ago · promoted to Prod)
  ✓ 48/50 QA cases passed
  Verified by Sarah

○ v0.39 (2w ago · promoted to Prod)
  ✓ 50/50 QA cases passed
  Verified by Sarah

                            [📜 View all →]
```

**특징**: QA 결과와 함께 표시되는 "검증의 흔적". 각 버전이 얼마나 철저히 검증됐는지 한눈에.

##### 블록 E: Promote 준비도

Staging → Production으로 넘어갈 준비가 됐는지 체크리스트.

```
Promote to Production 준비도
─────────────────────────────────────────
✓ QA 테스트 통과율 90% 이상
✓ 검증 세트 모든 인텐트 커버
⚠ 승인자 리뷰 대기 중 (Sarah)
✗ Load test 미실행

                [⬆ Promote to Production]
```

체크리스트가 모두 통과되어야 Promote 버튼 활성화 (또는 경고와 함께 강행 옵션).

##### 블록 F: 빠른 이동

- `🧪 Run tests now →` (Test 탭)
- `📊 View evaluation →` (Evaluate 탭)
- `⬆ Promote to Production` (조건 충족 시 활성화)

---

#### 4.1.6 환경별 Overview 비교표

세 환경의 Overview가 어떻게 다른지 한눈에.

| 블록             | Dev Overview        | Staging Overview         | Prod Overview          |
| ---------------- | ------------------- | ------------------------ | ---------------------- |
| 헤더             | 작업 진행 상황      | 검증 상태                | 건강 상태              |
| 지표 블록        | 편집 빈도·Test 횟수 | QA 통과율                | 실사용자 KPI 4개       |
| 비교 블록        | Prod 대비 Diff      | Dev·Prod 대비 Diff       | 기간 대비 변화         |
| 알림             | 충돌·미저장         | 실패 케이스              | Critical/Warning/Info  |
| 차트             | 없음                | 테스트 통과 추이 (선택)  | 대화량·Top Intents     |
| 최근 활동        | 최근 편집           | QA 실행 이력             | 최근 대화 샘플         |
| **History 블록** | **Edit History**    | **Verification History** | **Deployment History** |
| CTA              | Test·Promote        | Test·Evaluate·Promote    | Evaluate·Rollback      |

**핵심 포인트**: History 블록이 세 환경 모두에 존재하되, **성격이 다르다**. Dev는 편집 이력, Staging은 검증 이력, Prod는 배포 이력.

---

#### 4.1.7 History 블록 공통 규칙

세 환경의 History 블록이 공통으로 따르는 규칙.

##### 길이 정책

- Overview에서는 **최근 3~5개**만 표시
- 더 많은 이력은 `View all →`로 전체 History 화면 이동
- 전체 History 화면은 Environment Bar의 `📜 History` 버튼과 같은 목적지

##### 이력 보존 기간

| 플랜       | Prod Deployment History | Dev/Staging History |
| ---------- | ----------------------- | ------------------- |
| Free / Pro | 90일                    | 30일                |
| Enterprise | 2년                     | 1년                 |

감사 로그(Audit Logs) 요구사항과 연계하여 Settings에서 설정 가능.

##### 항목 클릭 시 동작

| 동작               | 설명                          |
| ------------------ | ----------------------------- |
| 항목 본체 클릭     | 해당 버전의 설정 스냅샷 보기  |
| `Compare` 버튼     | 이전 버전과 side-by-side Diff |
| `Rollback to this` | 이 버전으로 복구 (권한 필요)  |

##### 필터와 정렬

Overview의 History 블록은 단순 최신순. 필터는 **전체 History 화면**에서만 제공:

- 기간 필터 (지난 7일, 30일, 90일)
- 작성자 필터
- 변경 유형 필터 (배포 / 롤백 / 편집)
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

### 7.4 History 데이터 (Overview History 블록용)

환경별 History는 다른 타입의 이벤트를 보여주므로 유니온 타입으로 정의.

```typescript
// 공통 베이스
interface HistoryEventBase {
  id: string;
  agentId: string;
  environmentType: "development" | "staging" | "production";
  timestamp: string;
  actor: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

// Prod: 배포 이벤트
interface DeploymentEvent extends HistoryEventBase {
  type: "deployment";
  version: string;
  note?: string;
  isRollback?: boolean;
  rolledBackFrom?: string; // 롤백인 경우 이전 버전
  promotedFrom?: "staging" | "development";
}

// Staging: 검증 이벤트
interface VerificationEvent extends HistoryEventBase {
  type: "verification";
  version: string;
  qaResults: {
    passed: number;
    total: number;
    passRate: number;
  };
  promotedToProdAt?: string; // Prod로 승격된 경우
}

// Dev: 편집 이벤트
interface EditEvent extends HistoryEventBase {
  type: "edit" | "save" | "promote_to_staging";
  version?: string;
  changedAreas?: string[]; // ['instructions', 'knowledgebase'] 등
  summary?: string;
}

type HistoryEvent = DeploymentEvent | VerificationEvent | EditEvent;

// Overview용 요약 쿼리 결과
interface HistoryBlockData {
  environment: "development" | "staging" | "production";
  events: HistoryEvent[]; // 최근 3~5개
  totalCount: number; // "View all" 버튼 활성화 여부용
  retentionDays: number; // 보존 기간 (Free/Pro/Enterprise 플랜별)
}
```

### 7.5 Overview 블록 데이터 (환경별)

Overview 화면이 필요로 하는 전체 데이터 구조.

```typescript
interface OverviewPageData {
  environment: "development" | "staging" | "production";

  // 공통
  healthStatus: "healthy" | "warning" | "error" | "unknown";
  currentVersion?: string;
  history: HistoryBlockData;

  // Prod 전용
  prodData?: {
    kpis: {
      conversationsToday: { value: number; changePercent: number };
      csat: { value: number; change: number };
      resolutionRate: { value: number; change: number };
      avgResponseTime: { value: number; change: number };
    };
    alerts: Alert[];
    charts: {
      conversationTrend: TimeSeriesData;
      topIntents: IntentDistribution;
    };
    recentConversations: ConversationSample[];
  };

  // Dev 전용
  devData?: {
    unsavedChanges: boolean;
    versionsAheadOfProd: number;
    changeSummary: ChangeSummary;
    testSessions: {
      todayCount: number;
      lastSessionStatus: "passed" | "failed";
    };
    collaborators: Collaborator[];
    nextStepGuidance: {
      type: "run_test" | "promote" | "save" | "no_changes";
      message: string;
    };
  };

  // Staging 전용
  stagingData?: {
    daysInStaging: number;
    versionsBehindDev: number;
    versionsAheadOfProd: number;
    qaResults: {
      passed: number;
      total: number;
      passRate: number;
      lastRunAt: string;
    };
    promoteReadiness: {
      checks: Array<{ label: string; status: "passed" | "warning" | "failed" }>;
      canPromote: boolean;
    };
  };
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
