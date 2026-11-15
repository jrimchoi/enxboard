# DataGridView를 가져오는 계획

목록 표만 `DS/DataGridView/DataGridView`로 바꾼다. 상세, 등록, 수정, 삭제의 화면과 `Data` 계약은 그대로다. 아래 절차는 `index.html`, `js/grid.js`, `js/app.js`, `js/view.js`에 반영되어 있다.

## 지금 상태

`js/view.js`의 `_list`가 제목, 작성자, 날짜, 태그 `<table>`을 문자열로 그린다. `js/loader.js`는 `DS/ENXBoard/`만 `./` 상대 경로로 바꾸고, 그 외 id는 거절한다. `i18n!`, `css!` 같은 플러그인도 없다.

원본은 형제 체크아웃 `webapps_2025x/DataGridView/DataGridView.js`다. 이 파일 하나에 `define`이 27개 있고, 진입 id `DS/DataGridView/DataGridView`의 의존은 36개다. 그중 이 묶음 밖은 `UWA/Core`, `DS/CollectionView/CollectionView`, `DS/TreeModel/TreeDocument`, `DS/TreeModel/TreeNodeModel`, `DS/Controls/Button`, `DS/Tweakers/TypeRepresentationFactory`, `DS/Menu/ContextualMenu`, `DS/Windows/Dialog`, `i18n!DS/DataGridView/assets/nls/translation` 등이다.

`DS/ENXNav/views/xNavDataGridView`는 쓰지 않는다. ENXNav와 대시보드 앱 옵션이 더 붙는다.

## 가져오는 방법

소스를 이 저장소에 복사하지 않는다. `webapps_2025x`도 수정하지 않는다.

`npm run dev`는 이 폴더만 서버 루트로 연다. 그래서 `vendor/webapps`를 `../../webapps_2025x`로 잇는 심볼릭 링크로 같은 출처에 올린다. StackBlitz에는 그 체크아웃이 없으므로 그리드 확인은 로컬에서 한다.

`index.html`은 `js/loader.js` 대신 아래 순서로 읽는다.

1. `window.dsDefaultWebappsBaseUrl = "./vendor/webapps/"`
2. `./vendor/webapps/AmdLoader/AmdLoader.js`
3. `require.config`로 `DS/ENXBoard`만 이 저장소 루트에 고정한다. `DS`보다 구체적인 경로라 `DS/ENXBoard/js/app`은 `./js/app.js`가 된다.
4. `require(["DS/ENXBoard/js/app"], ...)`

AmdLoader가 `DS`를 `vendor/webapps`, `UWA`를 `vendor/webapps/UWA2/js`로 둔다. `pluginDS`는 `DS/DataGridView/DataGridView` 요청을 `DataGridView/DataGridView.js` 묶음으로 먼저 받는다. 묶음 안 27개 `define`은 그 파일에 있다. `i18n!`과 `css!`도 이 로더 안에 있다.

## 앱에서 쓰는 경계

새 모듈 `js/grid.js`(`DS/ENXBoard/js/grid`)만 DataGrid와 TreeModel을 `require`한다. `View`의 의존은 비워 둔다.

`View._list`는 검색, 건수, 쪽 이동을 유지하고 `<table>` 자리에 `<div class="grid-host">`만 둔다. `App`이 목록을 그린 뒤 `Grid.attach(host, items, onOpen)`을 호출한다.

`attach`는 그 페이지의 `items`로만 트리를 만든다. 저장소는 `Collection` 그대로다.

| 글 필드 | 노드 |
|---|---|
| `title` | `label`. 열 `dataIndex: "tree"` |
| `author`, `date` | `grid.author`, `grid.date` |
| `tags` | `grid.tags`에 쉼표로 잇는다 |
| `id` | `grid.id`. 화면 열은 아니다 |

제목 셀의 `func`가 `onOpen(id)`를 부르고, 그건 지금처럼 명령 `open`이다. 열 정의는 편집 불가, 행 선택은 `single`, 체크박스·행 드래그·우클릭 열은 끈다. `identifier`는 `enxboard-list`로 둔다. 그리드가 열 너비를 `localStorage`에 남긴다.

쪽 크기 5와 이전·다음은 `View`에 남긴다. 그리드에는 현재 쪽 행만 넣는다. 서버 행 모델과 `onInfiniteScroll`은 쓰지 않는다.

`View.render`가 `#board`를 다시 쓰면 그리드 DOM이 사라진다. 목록을 그릴 때마다 `attach`하고, 다른 화면으로 가기 전에 이전 인스턴스를 버린다. `.grid-host`에는 높이를 준다. 높이가 0이면 가상 행이 안 그려진다.

## 하지 않는 것

- `DataGridView.js`와 그 의존 트리를 `js/`나 `vendor` 파일로 복사하지 않는다.
- 상세, 등록, 수정 폼을 그리드 편집으로 바꾸지 않는다.
- `Data.load`, `fetchList`, `fetchDetail`, `createPost`, `updatePost`, `deletePost`의 이름과 JSON 필드를 바꾸지 않는다.
- 명령 문자열을 바꾸지 않는다.

## 구현 순서

| 단계 | 하는 일 | 확인 |
|---|---|---|
| 1 | `vendor/webapps` 링크, `index.html`을 AmdLoader로 교체, `DS/ENXBoard` 경로 | 새로고침 후 지금 목록·상세·검색이 그대로다. 네트워크에 DataGrid 요청은 없다 |
| 2 | `js/grid.js`와 목록 호스트, `App`이 목록 페인트 뒤에 `attach` | 목록이 그리드 4열이다. 제목 클릭은 상세다. 검색과 쪽이 현재 쪽 행만 바꾼다 |
| 3 | 빈 검색, 등록, 수정, 삭제 | 빈 목록은 호스트만 남는다. 폼 화면은 그리드를 만들지 않는다 |

1단계가 된 뒤에 2단계 파일을 더한다. 끝나기 전에는 `ENXBoard-design.md` 7절의 "기동하지 않는다"를 고치지 않는다. 3단계 확인이 되면 그 문장과 9절의 "`DataGridView`를 이 순서에 넣지 않는다"를 이 계획의 결과로 바꾼다.

## 실패하면 볼 곳

스크립트 404는 경로다. `DS/ENXBoard`가 `vendor/webapps/ENXBoard`로 가면 3번 설정의 구체 경로가 이긴 것이 아니다. `i18n` JSON이나 `css`가 404면 그 모듈의 `assets`가 체크아웃에 있는지 보고, 없을 때만 그 파일 경로를 추가한다. 의존을 미리 복사하지 않는다.
