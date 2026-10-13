# Shift Studio

근무와 생활 사이. Shift_cal의 기능·계산을 보존하고 정보 구조와 UI를 새로 설계한 `empty` 실험 프로젝트입니다. OpenAI 내부 디자인을 구현한 제품이 아니라, 명확한 우선순위와 일관된 조작을 중심으로 만든 독립적인 제안입니다.

## 사용

https://pm2-sepia.vercel.app

- 근무 / 급여 / 식단 / 내 공간, 모바일 하단 탐색과 데스크톱 사이드바
- 오늘·내일 근무, 월간 요약, 다가오는 근무를 기존 달력 옆에 추가
- 같은 엔진을 사용하는 급여·연차·문자 분석·계정·공유·날씨·식단
- 4개 테마·배지 모양·표시 설정 유지
- 네이티브 iOS 동반 앱과 A/B/C 알람 단축어 소스 포함

## 개발 및 검증

```sh
npm ci
npm test
python3 -m http.server 8767
```

정적 서버에서는 API가 실행되지 않습니다. Vercel이 `api/`를 실행합니다. 단위·모의 통합 테스트 외에 `scripts/test-studio-browser.cjs`로 Safari/Chromium의 320/390/412px 및 네 테마를 확인할 수 있습니다. Playwright 모듈과 브라우저가 필요합니다.

- [기능 보존표](docs/FEATURE-PARITY.md)
- [OAuth·저장소·iOS 설정](SETUP.md)
- [원본 엔진 해시](docs/domain-hashes.json)

실제 Google/Apple 계정과 클라우드 저장소는 새 도메인에 맞는 환경 설정이 필요합니다. 문자 원문을 서버에 저장하지 않으며, 로그인한 경우 숫자 기준과 근무·메모 등 설정은 계정에 동기화됩니다.
