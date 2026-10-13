# 별도 프로젝트 설정

웹 프로젝트: Vercel `empty` (`prj_Ojsl5nzDMILcPBRvB5cez8RcgR6B`)
도메인: https://pm2-sepia.vercel.app
소스: https://github.com/wn-hue/empty

1. `.env.example`의 키를 **empty 프로젝트에만** 설정합니다. 실제 키를 Git에 넣지 않습니다.
2. Google OAuth 클라이언트에 새 도메인의 JavaScript origin과 아래 승인된 리디렉션 URI를 등록합니다.
   - `https://pm2-sepia.vercel.app/api/google-calendar?action=callback`
   Google Calendar API와 Drive API 사용 설정 및 필요한 OAuth 동의 화면/테스트 사용자 설정은 `GOOGLE_ACCOUNT_STORAGE.md`, `GOOGLE_CALENDAR_SETUP.md`에 있습니다.
3. `GOOGLE_CALENDAR_SESSION_SECRET`은 이 프로젝트 전용으로 생성합니다. 기존 서비스 세션을 공유하지 않습니다.
4. Apple Service ID의 웹 도메인/리턴 URL에 `https://pm2-sepia.vercel.app/api/apple-account?action=callback`을 등록하고 Team ID·Key ID·개인키를 설정합니다. Apple 개발자 등록이 필요합니다.
5. 실시간 공유 링크와 Apple 계정 저장에는 **별도 접근 제한 Blob 저장소** 및 `BLOB_READ_WRITE_TOKEN`이 필요합니다.
6. 환경변수 적용 후 재배포하고 실제 계정의 로그인 → 변경 저장 → 다른 기기 복구 → 삭제 → 공유 종료를 검증합니다.

정적 파일만 여는 개발 서버에서는 `/api`가 동작하지 않습니다. 계산·기기 저장 UI는 사용할 수 있고 API는 Vercel에서 실행됩니다. 테스트용 문자 예시는 개인정보 없는 가상 금액만 사용하세요.

## iOS 동반 앱

`ios-alarm`은 기존 네이티브 기능을 유지한 동반 앱 소스입니다. 이번 새 UI의 주 대상은 웹입니다. 네이티브 UI 전체를 새 웹 화면과 같게 다시 만든 것은 아닙니다.

- Bundle ID: `com.wnhue.shiftstudio.alarms`
- 로그인 callback scheme: `shiftstudio`
- Keychain 서비스와 백그라운드 갱신 ID도 별도 사용
- 백엔드/웹 링크는 새 도메인을 사용
- XcodeGen: `xcodegen generate --spec ios-alarm/project.yml`
- iPhone 설치 및 App Store 배포는 개발자 서명/프로비저닝 설정 필요
