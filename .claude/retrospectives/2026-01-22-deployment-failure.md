# 반성회 기록 - 2026-01-22 배포 실패

## 발생한 문제

### 문제 1: Git 배포 20회 이상 연속 실패
- **증상**: Vercel Git 트리거 배포가 TypeScript 타입 에러로 실패
- **영향**: 배포 지연, 사용자 시간 낭비
- **근본 원인**:
  - 로컬에 수정된 파일이 있었으나 커밋되지 않음
  - 커밋된 버전에서는 `onOpenConcepts` prop이 필수였으나, 호출부에서 전달하지 않음
  - 로컬 빌드는 로컬 파일 기준이라 성공, Vercel은 Git 기준이라 실패
- **재발 방지책**:
  - 배포 전 `git status` 필수 확인
  - 로컬 변경사항 있으면 먼저 커밋 또는 stash
- **조치 상태**: [x] 완료

### 문제 2: 잘못된 Vercel 프로젝트로 CLI 배포
- **증상**: `vercel --prod` 실행 시 `editor` 프로젝트로 배포됨 (원래는 `foroffensecoach`)
- **영향**: 사용자 혼란, 잘못된 Production URL
- **근본 원인**:
  - `editor/` 디렉토리에 별도 `.vercel/project.json`이 있어 다른 프로젝트로 연결됨
  - Git 배포 실패 후 우회 방법으로 CLI 배포 시도
- **재발 방지책**:
  - **Vercel CLI 직접 배포 금지**
  - Git push로만 배포 (foroffensecoach 프로젝트는 Git 트리거)
- **조치 상태**: [x] 문서화 완료

### 문제 3: Props 인터페이스 불일치
- **증상**: `FloatingActions`, `MobileBottomBar`에서 `onOpenConcepts` 필수 prop 에러
- **영향**: 빌드 실패
- **근본 원인**:
  - 이전 리팩토링(3205c59)에서 PlayEditor에서 prop 제거
  - 컴포넌트 인터페이스는 수정하지 않음 (필수 → 선택적 변경 누락)
- **재발 방지책**:
  - 컴포넌트 호출부 수정 시 해당 컴포넌트의 Props 인터페이스도 함께 확인
  - 사용하지 않는 prop은 선택적(?)으로 변경
- **조치 상태**: [x] 완료 (`FloatingActions`, `MobileBottomBar` 수정)

## 도출된 규칙

1. **배포 전 git status 필수**: 로컬 빌드 성공 ≠ Vercel 빌드 성공 (파일 불일치 가능)
2. **Vercel CLI 배포 금지**: Git push로만 배포, CLI는 프로젝트 혼동 위험
3. **에러 로그 먼저 확인**: 배포 실패 시 추측하지 말고 사용자에게 로그 요청
4. **Props 인터페이스 동기화**: 호출부 수정 시 컴포넌트 타입도 함께 확인

## 수정된 파일

- `editor/src/components/editor/FloatingActions.tsx` - `onOpenConcepts` 선택적으로 변경
- `editor/src/components/editor/MobileBottomBar.tsx` - `onOpenConcepts` 선택적으로 변경
- `CLAUDE.md` - 배포 체크리스트 및 실패 대응 가이드 추가

## 미완료 액션

- [ ] 현재 배포 상태 확인 (아직 실패 중일 수 있음)
- [ ] 최종 빌드 성공 확인 후 배포 완료
