# SKALA Weather

Vue 3, Vue Router, Pinia, Axios, Element Plus로 만든 현재 날씨·주간 예보 실습 앱입니다.

## 로컬 실행

```sh
npm ci
cp .env.example .env.local
# .env.local의 VITE_OPENWEATHER_API_KEY에 OpenWeather API 키 입력
npm run dev
```

API 키는 소스에 작성하지 않습니다. `VITE_` 변수는 브라우저 번들에 포함되므로 진짜 비밀 저장소는 아닙니다. 학습용 키를 사용하고, 공급자가 지원한다면 도메인 및 사용량 제한을 설정하세요. 완전한 비밀 처리가 필요하면 별도 백엔드 프록시가 필요합니다.

## 검사와 빌드

```sh
npm run lint
npm run build
npm run build:staging
npm run build:production
```

staging과 production 빌드는 각각 `.env.staging`, `.env.production`의 `VITE_API_URL`을 사용합니다. 소개 화면에서 적용된 mode와 URL을 확인할 수 있습니다.

## GitHub Pages 배포

1. 저장소 Settings → Secrets and variables → Actions에 `VITE_OPENWEATHER_API_KEY`를 등록합니다.
2. Settings → Pages의 Source를 **GitHub Actions**로 선택합니다.
3. `main` 브랜치에 push하거나 `Deploy Vue app to GitHub Pages` 워크플로를 수동 실행합니다.

배포는 lint 후 production mode로 빌드한 `dist` artifact만 GitHub Pages에 게시합니다. Hash Router와 상대 자산 경로를 사용하므로 `/#/forecast` 같은 경로를 정적 호스팅에서도 열 수 있습니다.
