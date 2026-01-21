# 반성회 기록 - 2026-01-21

## 문제: Vercel 빌드에서 모듈 못 찾음

### 증상
- Vercel 빌드 오류: `Cannot find module '@/lib/concept-preview'`
- 로컬 빌드는 성공, Vercel에서만 실패
- 파일은 분명히 존재하고 git에도 커밋됨

### 영향
- Production 배포 연속 실패 (8회 이상)
- 새 기능 배포 지연

### 5 Whys 분석

1. **왜 Vercel에서 모듈을 못 찾았나?**
   → Turbopack이 workspace root를 repository root로 잘못 추론

2. **왜 잘못 추론했나?**
   → 프로젝트에 package-lock.json이 두 개 있음 (root와 editor/)

3. **왜 두 개가 있나?**
   → monorepo 구조지만 명시적 turbopack 설정이 없었음

4. **왜 명시적 설정이 없었나?**
   → Next.js 16 Turbopack의 monorepo 동작에 대한 인지 부족

5. **근본 원인**
   → 빌드 설정 가이드라인 문서화 부재

### 해결책
```typescript
// next.config.ts
turbopack: {
  root: __dirname,
},
```

### 재발 방지 대책

| 대책 | 상태 |
|------|------|
| `turbopack.root` 설정 추가 | ✅ 완료 |
| CLAUDE.md에 Vercel 빌드 주의사항 추가 | ✅ 완료 |
| 배포 전 로컬 빌드 체크리스트 문서화 | ✅ 완료 |

### 도출된 규칙

1. **Monorepo에서는 turbopack.root 필수**: `editor/next.config.ts`에 `turbopack.root: __dirname` 설정
2. **배포 전 로컬 빌드 확인**: `cd editor && npm run build` 성공 확인 후 push
3. **로컬/CI 환경 차이 주의**: 로컬 성공 ≠ Vercel 성공 (캐시, 환경변수, root 추론 등 차이)

### 커밋
- `e9f1689` - fix: Set turbopack.root to resolve monorepo module detection