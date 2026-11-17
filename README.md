# ENXBoard

3D Dashboard 게시판의 AMD 버전이다. 화면은 문자열 HTML이고, 데이터는 `data/posts.json`을 메모리에만 담는다. 아이콘 글꼴은 `vendor/core`에 들어 있다.

## StackBlitz

https://stackblitz.com/fork/github/jrimchoi/enxboard

열리면 `npm install`과 `npm run dev`가 실행되고, 미리보기는 게시판 목록이다.

## 로컬

```text
npm install
npm test
npm run dev
```

`npm test`는 `tdd/steps/`의 검사 순서대로 글 규칙, 쪽, 저장, `fetch`를 실행한다. 화면 확인은 `/stages/`다.

| 주소 | 화면 |
|---|---|
| `/` | 게시판 |
| `/mock-shell.html` | 대시보드 목 셸 |
| `/stages/` | 단계별 데모. 각 폴더가 그 단계의 코드와 확인 화면이다 |

`file://`로 열면 글 목록을 읽지 못한다.

## 구성

| 경로 | 역할 |
|---|---|
| `index.html` | 진입. `AmdLoader`로 AMD 모듈을 읽는다 |
| `js/grid.js` | 목록을 `DS/DataGridView/DataGridView`로 그린다 |
| `vendor/webapps` | `webapps_2025x` 링크. DataGrid와 그 로더 |
| `js/app.js` | 화면 상태와 명령 |
| `js/view.js` | 문자열 HTML |
| `js/data.js`, `js/model.js`, `js/collection.js` | 글 저장, 검사, 검색, 쪽 나눔 |
| `js/controller.js`, `js/widget.js` | React·Vue 이식본이 쓰던 명령과 위젯 연결. 이 진입 화면은 `js/app.js`를 쓴다 |
| `css/board.css` | 화면 골격 |
| `data/posts.json` | 목 데이터 12건 |
| `vendor/core` | `wux-ui-3ds` 아이콘 CSS와 글꼴 |
