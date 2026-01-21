# /deploy - 프로젝트 배포

이 스킬은 ForOffenseCoach 프로젝트를 Vercel에 배포합니다.

## 실행 단계

1. **빌드 확인**
   ```bash
   cd c:/FOC/editor && npm run build
   ```
   - 빌드 실패 시 에러 보고 후 중단

2. **Git 상태 확인**
   ```bash
   cd c:/FOC/editor && git status
   ```

3. **변경사항 스테이징**
   ```bash
   cd c:/FOC/editor && git add .
   ```

4. **커밋 생성**
   - 변경된 파일들을 분석하여 커밋 메시지 자동 생성
   - 형식: `type: 간단한 설명`
   - 타입: feat, fix, refactor, style, docs, chore
   - 반드시 `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` 포함

5. **푸시**
   ```bash
   cd c:/FOC/editor && git push
   ```

6. **완료 보고**
   - 푸시 성공 시: "배포 완료! Vercel이 자동으로 빌드합니다."
   - 푸시 실패 시: 에러 내용 보고

## 주의사항

- 커밋 전 항상 빌드 성공 확인
- .env 파일이나 민감한 정보가 포함되지 않도록 확인
- 강제 푸시 (--force) 절대 금지
