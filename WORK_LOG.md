# ForOffenseCoach 개발 작업일지

> **프로젝트**: ForOffenseCoach - Football Playbook Builder & Concept Recommender
> **작성일**: 2026-01-20
> **버전**: 0.1.0

---

## 프로젝트 개요

ForOffenseCoach는 미식축구 코치를 위한 플레이북 빌더 및 컨셉 추천 SaaS입니다.

**핵심 가치 제안**: Formation → Concept 추천 → Auto-build → Export/Share → Install Focus (드릴 연결)

**기술 스택**:
- Framework: Next.js 16 (App Router) + TypeScript
- Editor: Konva.js (Canvas 2D) + react-konva
- State: Zustand + Immer
- Database: Supabase (PostgreSQL + Auth)
- Payment: Stripe
- Deployment: Vercel

---

## Phase 0: MVP 에디터 (완료 ✅)

### 완성된 기능
- Konva.js 캔버스 기반 플레이 에디터
- 플레이어/라인 그리기, 선택/편집
- 6개 포메이션 프리셋
  - I Formation
  - Shotgun
  - Spread
  - Single Back
  - Pro Set
  - Empty Set
- 에디터 모드: Select, Draw (직선/곡선), Text
- 플레이어 커스터마이징: 6가지 모양, 색상, 크기, 라벨
- 라인 스타일: 실선/점선/파선, 화살표/T블록/원 마커
- Undo/Redo 50단계
- 키보드 단축키
- 컨텍스트 메뉴
- PNG Export
- 컨셉 라이브러리 (Pass 43개 + Run 52개 = 95개)
- 추천 엔진 (Formation → Concept 8-12개)
- Auto-build (컨셉 클릭 → Route/Block 자동 생성)
- UndoToast (적용 후 5초 Undo 가능)
- ConceptPanel & ConceptCard UI

### 주요 파일
- `src/components/editor/PlayEditor.tsx` - 메인 에디터 컴포넌트
- `src/components/editor/FieldLayer.tsx` - 필드 렌더링
- `src/components/editor/PlayerLayer.tsx` - 플레이어 레이어
- `src/components/editor/ActionLayer.tsx` - 루트/블록 레이어
- `src/store/editorStore.ts` - Zustand 에디터 상태
- `src/lib/recommendation-engine.ts` - 컨셉 추천 엔진
- `src/data/concepts/` - 95개 컨셉 데이터

---

## Phase 1: Auth & Workspace (완료 ✅)

### 완성된 기능
- Supabase Auth 연동 (Email/Password + Google OAuth)
- 회원가입/로그인 페이지
- Personal Workspace 자동 생성
- TypeScript 타입 확장 (createdBy, workspaceId 등)

### 데이터베이스 테이블
```sql
- profiles (사용자 프로필)
- workspaces (개인/팀 워크스페이스)
- workspace_members (팀 멤버 관리)
- playbooks (플레이북)
- plays (플레이)
- shared_links (공유 링크)
- team_profiles (팀 프로필)
```

### 주요 파일
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/app/auth/login/page.tsx` - 로그인 페이지
- `src/app/auth/signup/page.tsx` - 회원가입 페이지
- `src/app/auth/callback/route.ts` - OAuth 콜백
- `src/store/authStore.ts` - 인증 상태 관리

---

## Phase 2: Playbook 관리 (완료 ✅)

### 완성된 기능
- Dashboard (Playbook 목록, 그리드 뷰)
- Play 저장/로드 (Supabase 연동)
- Playbook + Section 관리 (Run/Pass/RPO/Special)
- 플레이 검색/필터
- Auto-save (5초 debounce)

### 주요 파일
- `src/app/dashboard/page.tsx` - 대시보드
- `src/app/editor/[playId]/page.tsx` - 에디터 (동적 라우팅)
- `src/app/playbook/[playbookId]/page.tsx` - 플레이북 뷰
- `src/store/playbookStore.ts` - 플레이북 상태 관리

---

## Phase 3: Export & Share (완료 ✅)

### 완성된 기능
- PDF Export (Multi-page, jsPDF)
  - 페이지당 1-4 플레이
  - Coaching points 포함 옵션
  - 3가지 스타일: classic, modern, minimal
- 공유 링크 생성 (UUID token)
- View-only 페이지
- Fork 기능 (내 워크스페이스로 복사)
- 만료일 설정 옵션

### 주요 파일
- `src/lib/pdf-export.ts` - PDF 생성 로직
- `src/components/export/PDFExportModal.tsx` - 내보내기 모달
- `src/app/share/[token]/page.tsx` - 공유 페이지
- `src/components/share/ShareModal.tsx` - 공유 모달
- `src/lib/share.ts` - 공유 링크 관리

---

## Phase 4: Team Profile & Formation Recommendation (완료 ✅)

### 완성된 기능
- Team Profile 입력 UI (2분 내 완료 목표)
  - Roster Availability (포지션별 인원/퀄리티)
  - Unit Strength (1-5 등급)
  - Style Preferences (런/패스 밸런스, 템포 등)
- Formation Recommendation Engine
  - Feasibility Filter (불가능 제거)
  - Capability Scoring (0~100점)
  - Style Adjustment
- Top 5 Formation Packages + 3줄 Rationale

### 주요 파일
- `src/app/team-profile/page.tsx` - 팀 프로필 입력
- `src/lib/formation-recommendation.ts` - 추천 엔진
- `src/data/formation-library.ts` - 포메이션 메타 데이터
- `src/store/teamProfileStore.ts` - 팀 프로필 상태

---

## Phase 5: Install Focus (완료 ✅)

### 완성된 기능
- 95개 컨셉에 InstallFocus 데이터 추가
- Install Focus Panel UI
- Failure Point + Drill 정보
- Instagram 외부 링크 연결

### FailurePoint 구조
```typescript
interface FailurePoint {
  id: string;
  name: string;
  drill: {
    name: string;
    purpose: string;
    phase: 'indy' | 'group' | 'team';
  };
  videoRefs?: VideoRef[];
}
```

### 주요 파일
- `src/components/editor/InstallFocusPanel.tsx` - Install Focus 패널
- `src/components/editor/FailurePointCard.tsx` - Failure Point 카드
- `src/data/concepts/pass-concepts.ts` - Pass 컨셉 + installFocus
- `src/data/concepts/run-concepts.ts` - Run 컨셉 + installFocus

---

## Phase 6: 구독 & Feature Gating (완료 ✅)

### 완성된 기능
- Stripe 연동
- 3-Tier 구독 구조
  - Free: $0 (플레이 10개, PDF 워터마크)
  - Pro: $9/월 (무제한, 워터마크 없음)
  - Team: $79~149/시즌 (팀 협업)
- Feature Gating 적용
- 팀 초대/역할 관리 (Owner/Editor/Viewer)

### 주요 파일
- `src/lib/subscription.ts` - 구독 관리
- `src/components/subscription/UpgradeModal.tsx` - 업그레이드 모달
- `src/hooks/useFeatureAccess.ts` - 기능 접근 권한 훅
- `src/app/api/stripe/` - Stripe webhook 처리

---

## 개선 작업 (6가지 완료 ✅)

### 1. 버그 수정 / 폴리싱

**수정 내용**:
- ARIA 접근성 개선
  - `UndoToast.tsx`: `role="alert"`, `aria-live="polite"` 추가
  - `ContextMenu.tsx`: `role="menu"`, `role="menuitem"` 추가
- Null 체크 추가
  - `PlayerNode.tsx`: 라벨 null 체크
  - `ActionLayer.tsx`: points 배열 최소 길이 검증
- 에러 방지
  - `coordinates.ts`: 0으로 나누기 방지 (`Math.max(1, ...)`)

**수정 파일**:
- `src/components/editor/UndoToast.tsx`
- `src/components/editor/ContextMenu.tsx`
- `src/components/editor/PlayerNode.tsx`
- `src/components/editor/ActionLayer.tsx`
- `src/utils/coordinates.ts`

### 2. 새로운 기능 추가

**추가 기능**:
- 줌 컨트롤 (50% ~ 200%)
  - Ctrl++ / Ctrl+- / Ctrl+0 단축키
  - UI 버튼 (ZoomControls.tsx)
- 키보드 단축키 모달 ('?' 키로 열기)
- 그리드 스냅 토글

**생성 파일**:
- `src/components/editor/KeyboardShortcutsModal.tsx`
- `src/components/editor/ZoomControls.tsx`

**수정 파일**:
- `src/store/editorStore.ts` - zoom, gridSnapEnabled 상태 추가
- `src/components/editor/PlayEditor.tsx` - 통합

### 3. 테스트 / QA

**테스트 환경 설정**:
- Vitest 4.0.17 설치
- jsdom 환경 구성
- 테스트 설정 파일 생성

**테스트 파일**:
- `src/__tests__/setup.ts` - 테스트 셋업 (Konva mock 등)
- `src/__tests__/recommendation-engine.test.ts` - 추천 엔진 테스트 (18개)
- `src/__tests__/editorStore.test.ts` - 에디터 스토어 테스트 (30개)

**테스트 결과**: 48개 테스트 모두 통과 ✅

**구성 파일**:
- `vitest.config.ts`

### 4. 성능 최적화

**Next.js 16 최적화**:
- Turbopack 기본 사용 (turbopack: {})
- 이미지 최적화 (AVIF, WebP)
- 프로덕션 console.log 제거
- 패키지 임포트 최적화
  - lucide-react
  - date-fns
  - @radix-ui/react-*

**수정 파일**:
- `next.config.ts`

### 5. 프로덕션 배포 점검

**보안 헤더 추가**:
- X-Frame-Options: DENY (클릭재킹 방지)
- X-Content-Type-Options: nosniff (MIME 스니핑 방지)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Cache-Control: no-store (API 캐시 비활성화)

**수정 파일**:
- `vercel.json`

### 6. 컨셉/포메이션 데이터 확장

**현재 데이터**:
- Pass 컨셉: 43개
- Run 컨셉: 52개
- **총 95개 컨셉**

---

## Git 커밋 이력

```
3fd25a8 feat: Comprehensive improvements - bugs, features, tests, performance, security
1bf0b48 feat: UI/UX improvements and new features
71e94e5 fix: Lazy initialize Stripe to fix Vercel build
```

---

## 프로젝트 구조

```
editor/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 메인 페이지
│   │   ├── dashboard/page.tsx          # 대시보드
│   │   ├── editor/[playId]/page.tsx    # 에디터
│   │   ├── playbook/[playbookId]/page.tsx
│   │   ├── share/[token]/page.tsx
│   │   ├── team-profile/page.tsx
│   │   ├── workspace/settings/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts
│   │   └── api/
│   │       └── stripe/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── PlayEditor.tsx
│   │   │   ├── FieldLayer.tsx
│   │   │   ├── PlayerLayer.tsx
│   │   │   ├── PlayerNode.tsx
│   │   │   ├── ActionLayer.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   ├── ConceptPanel.tsx
│   │   │   ├── ConceptCard.tsx
│   │   │   ├── UndoToast.tsx
│   │   │   ├── ContextMenu.tsx
│   │   │   ├── InstallFocusPanel.tsx
│   │   │   ├── KeyboardShortcutsModal.tsx
│   │   │   └── ZoomControls.tsx
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── playbook/
│   │   ├── share/
│   │   ├── export/
│   │   ├── team-profile/
│   │   ├── recommendation/
│   │   └── subscription/
│   ├── store/
│   │   ├── editorStore.ts
│   │   ├── conceptStore.ts
│   │   ├── authStore.ts
│   │   ├── playbookStore.ts
│   │   └── teamProfileStore.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── recommendation-engine.ts
│   │   ├── formation-recommendation.ts
│   │   ├── pdf-export.ts
│   │   ├── share.ts
│   │   └── subscription.ts
│   ├── data/
│   │   ├── concepts/
│   │   │   ├── pass-concepts.ts
│   │   │   ├── run-concepts.ts
│   │   │   └── index.ts
│   │   └── formation-library.ts
│   ├── types/
│   │   ├── dsl.ts
│   │   ├── concept.ts
│   │   └── team-profile.ts
│   ├── utils/
│   │   └── coordinates.ts
│   ├── hooks/
│   │   └── useFeatureAccess.ts
│   └── __tests__/
│       ├── setup.ts
│       ├── recommendation-engine.test.ts
│       └── editorStore.test.ts
├── package.json
├── next.config.ts
├── vercel.json
├── vitest.config.ts
└── .env.example
```

---

## 환경 변수 (.env.example)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_TEAM_PRICE_ID=price_xxx
```

---

## 실행 명령어

```bash
# 개발 서버
cd editor && npm run dev

# 프로덕션 빌드
cd editor && npm run build
cd editor && npm run start

# 테스트
cd editor && npm run test        # Watch 모드
cd editor && npm run test:run    # 단일 실행
cd editor && npm run test:coverage  # 커버리지

# 린트
cd editor && npm run lint
```

---

## KPI 목표

| 지표 | 목표 |
|------|------|
| Activation (첫 플레이 완성) | 3분 이내 |
| 추천 사용률 | ≥ 40% |
| Auto-build 적용률 | ≥ 60% |
| Install Focus 조회율 | ≥ 30% |
| PDF Export 사용률 | ≥ 25% |
| 공유 링크 생성률 | ≥ 15% |
| Fork 전환율 | ≥ 10% |
| D7 리텐션 | ≥ 30% |
| Free → Pro 전환율 | ≥ 5% |

---

## MVP Non-Goals (구현하지 않음)

- ❌ 플레이 성공률 예측 (AI)
- ❌ 수비 자동 생성/반응
- ❌ 애니메이션 재생
- ❌ 실시간 공동 편집
- ❌ 드릴 에디터/스케줄러
- ❌ 영상/필름 통합

---

## 다음 단계 (선택적)

1. **E2E 테스트** - Playwright/Cypress
2. **모바일 반응형** - 터치 제스처 지원
3. **다국어 지원** - i18n (한국어/영어)
4. **오프라인 모드** - Service Worker
5. **추가 포메이션** - 더 많은 프리셋
6. **애널리틱스** - 사용자 행동 추적

---

*작성자: Claude Code*
*최종 업데이트: 2026-01-20*
