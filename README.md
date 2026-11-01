# 유령의 도구 모음

내가 만든 웹 도구들을 모아두는 허브. https://ghost11-sin.github.io

## 아이폰에 설치

1. 아이폰 **Safari**로 https://ghost11-sin.github.io 열기
2. 하단 **공유** 버튼 → **홈 화면에 추가**
3. 홈 화면의 `도구 모음` 아이콘으로 실행

## 새 도구 올리기

HTML 파일을 저장소에 올리면 끝. GitHub Action이 `build_apps.mjs`를 돌려서 `apps.json`을 갱신하고,
허브를 다음에 열 때 새 도구가 자동으로 추가된다.

각 파일의 `<head>`에 적으면 허브에 반영된다. (모두 선택)

```html
<title>월급 배분기</title>                          <!-- 이름 -->
<meta name="description" content="월급을 나눠 봐요">  <!-- 설명 -->
<meta name="icon" content="🧮">                     <!-- 아이콘 (없으면 이름 첫 글자) -->
<meta name="category" content="돈">                 <!-- 분류 (같은 분류는 같은 색) -->
```

이름이 `_` 또는 `.`으로 시작하는 파일과 폴더는 목록에서 빠진다.

## 폰에서 편집

오른쪽 위 `편집`을 누르면 앱 추가·수정·순서 이동·삭제가 된다. 이 목록은 그 기기에만 저장된다.
삭제한 앱은 다시 나타나지 않고, 저장소에 새로 올린 앱만 자동으로 추가된다.
`⋯` → `기본 목록(apps.json)으로 초기화`를 누르면 저장소 목록대로 되돌아간다.

## 파일

| 파일 | 역할 |
|---|---|
| `index.html` | 허브 화면 |
| `apps.json` | 자동 생성되는 앱 목록 (직접 고치지 않기) |
| `build_apps.mjs` | `apps.json` 생성기 (`node build_apps.mjs`) |
| `manifest.webmanifest`, `icons/` | 홈 화면 앱 이름·아이콘 |
| `sw.js` | 오프라인 캐시. 한 번 열어본 도구는 인터넷 없이도 열린다 |
