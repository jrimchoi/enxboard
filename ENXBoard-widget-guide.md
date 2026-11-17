# 3D Dashboard 위젯 작성 가이드

ENXBoard를 처음 만드는 사람을 위한 절차다. 각 단계는 질문 하나, 모듈 하나, 확인 하나로 끝난다. 확인이 되기 전에 다음 파일을 만들지 않는다.

설계의 계약은 `ENXBoard-design.md`에 있다. DataGridView를 붙이는 절차는 `ENXBoard-datagrid-plan.md`에 있다. 이 문서는 그 계약을 어떤 순서로 코드로 만들고, 브라우저에서 무엇을 보면 통과인지 적는다.

설계서에 API, 화면, 데이터 형식이 있으면 개발은 데이터 형식부터 한다. 화면과 API가 같은 필드를 주고받으므로, 필드 이름이 코드로 고정되기 전에 둘 중 하나를 만들면 나머지를 두 번 고친다. 각 단계 파일의 머리 주석에는 구현 전에 정한 함수와, 그 단계에서 아직 만들지 않는 함수가 적혀 있다. 정적 서버를 켠 뒤 `/stages/`를 연다. 저장소 루트의 `index.html`은 단계 8까지 끝난 게시판이다. 위젯 이벤트 연결은 `stages/10-widget`에만 있다.

| 폴더 | 이 단계에서 만드는 것 |
|---|---|
| `stages/00-shape` | `Post`, `validate`, `toJSON`. 예시 한 건으로 빈 제목과 날짜를 확인 |
| `stages/01-api` | `load`, `fetchList`, `fetchDetail`, `createPost`, `updatePost`, `deletePost`. 화면은 이 이름만 부른다 |
| `stages/02-entry` | `fetchList` 1쪽을 표로만 표시 |
| `stages/03-search` | 검색과 이전, 다음 |
| `stages/04-detail` | 제목은 상세, 목록으로 복귀 |
| `stages/05-save` | 등록, 수정, 삭제. 검사 실패 문구는 입력 화면에 남김 |
| `stages/06-loader` | 같은 화면을 AmdLoader로 연다. DataGridView 요청은 0건 |
| `stages/07-grid` | 두 건짜리 그리드. 제목 클릭은 `open` |
| `stages/08-board` | 검색과 저장은 유지하고 목록 행만 그리드 |
| `stages/09-shell` | 800×600 iframe 안의 단계 8 |
| `stages/10-widget` | `onSearch`, `onRefresh`, `setTitle` |

## 테스트가 순서를 정할 때

`stages/`는 데이터 형식, API, 입구 화면 순서로 모듈을 늘린다. `tdd/steps/`는 그 안의 형식과 API를 검사 하나씩 더 잘게 나눈다. 화면을 그리는 확인은 형식과 API가 통과한 뒤다.

한 번의 순서는 같다.

1. 검사 하나를 추가하고 `npm test`로 실패를 본다.
2. 그 실패를 없애는 코드만 더한다.
3. 다시 통과를 본다.
4. 다음 검사를 추가한다.

`tdd/steps/`가 그 순서의 통과 상태다. `npm test`는 여섯 단계를 차례로 실행하고, 마지막에 같은 검사를 저장소 루트의 `js/model.js`, `js/collection.js`, `js/data.js`에 적용한다.

| 단계 | 먼저 쓰는 검사 | 그 다음에 만드는 코드 | 아직 하지 않는 것 |
|---|---|---|---|
| `tdd/steps/01-empty-title` | 빈 제목은 실패 | 제목만 보는 `Post.validate` | 파일, 검색, 화면 |
| `tdd/steps/02-fields` | 공백 제거, 작성자, 본문, 날짜 | 나머지 검사와 `toJSON` | 목록 |
| `tdd/steps/03-page-search` | 테스트 안의 6건으로 쪽과 검색 | `Collection` | `fetch` |
| `tdd/steps/04-save` | 배열을 `load`하고, 빈 제목 등록은 거절 | `Data`의 등록, 수정, 삭제 | 주소 |
| `tdd/steps/05-fetch` | `load("./data/posts.json")`가 `fetch`를 호출 | 이미 만든 `load`가 그 주소를 읽는다 | 실제 12건 파일. 응답 2건은 테스트가 준다 |
| `tdd/steps/06-production` | 위 검사를 루트 모듈에 다시 실행 | 루트 `js/`가 이미 그 규칙을 가진다 | 화면 |

01의 `js/model.js`로 02의 날짜 검사를 실행하면 실패한다. 그래서 날짜 코드를 02에서 더한다. 05 이전의 `load`는 배열만 받는다. 주소 문자열을 넘기는 검사는 05가 처음이다.

화면 검사는 이 여섯 단계가 통과한 뒤에 브라우저에서 하나씩 더한다. 데이터 규칙이 빨간 상태에서 화면을 붙이면, 실패가 규칙 때문인지 화면 때문인지 구분할 수 없다.

| 다음 검사 | 보는 데모 |
|---|---|
| 1쪽 목록이 보인다 | `stages/02-entry` |
| 검색과 상세, 빈 제목 저장 거절 | `stages/03-search`, `stages/04-detail`, `stages/05-save` |
| 공통 로더를 붙여도 표가 같다 | `stages/06-loader` |
| 두 건을 그리드에 붙이고 제목은 `open` | `stages/07-grid` |
| 목록 행만 그리드다 | `stages/08-board` |
| iframe 안에서도 목록이 같다 | `stages/09-shell` |
| `onSearch` 다음에도 `onRefresh`가 그 검색을 유지한다 | `stages/10-widget` |

## 1. 위젯을 열기 전에 고정하는 사실

3D Dashboard 위젯은 대시보드 iframe 안에서 도는 웹 페이지다. 부모가 제목 막대, Preferences, Refresh를 그린다. 위젯 페이지는 자기 본문만 그린다.

이 앱이 지키는 경계는 다섯 가지다.

| 사실 | 이 저장소에서 |
|---|---|
| 화면 전환은 라우터가 없다 | `App`이 `screen` 문자열을 바꾸고 `View.render`에 스냅샷을 넘긴다 |
| 화면은 데이터를 부르지 않는다 | 클릭은 `data-command` 이름만 올린다. `App`이 `Data`를 호출한다 |
| 글 저장은 아직 서버가 없다 | `data/posts.json`을 읽어 메모리 `Collection`에 둔다. 새로고침하면 사라진다 |
| 공통 UI는 복사하지 않는다 | `DS/DataGridView/DataGridView`는 `vendor/webapps`로 잇는 `webapps_2025x`를 `require`한다 |
| 대시보드 API는 마지막에 연결한다 | `js/widget.js`가 `onLoad`·`onRefresh`·`onSearch`를 받을 준비는 되어 있다. `js/app.js`는 아직 이 모듈을 부르지 않는다 |

버튼을 모듈로 만들지 않는다. `Button` 클래스를 만들기 전에 명령 이름을 정한다. 명령은 `search`, `page`, `open`, `create`, `edit`, `delete`, `save`, `back`, `cancel` 아홉 개다. 화면과 `App`이 이 문자열만 공유한다.

## 2. 만들기 전에 종이에 적는 계약

코드를 열기 전에 아래 표가 채워져 있어야 한다. 구현 중에 칸을 바꾸면, 그 칸을 읽는 모듈의 테스트를 다시 한다.

### 화면

| 화면 | `screen` 값 | 들어가는 곳 | 나가는 명령 |
|---|---|---|---|
| 목록 | `list` | 첫 화면, 삭제 후, 등록 취소 | `search`, `page`, `open`, `create` |
| 상세 | `detail` | 제목 클릭, 저장 성공 | `edit`, `delete`, `back` |
| 등록 | `create` | 새 글 | `save`, `cancel` |
| 수정 | `edit` | 상세의 수정 | `save`, `cancel` |

### 글 한 건

필드는 `id`, `title`, `author`, `date`, `content`, `tags`다. 제목·작성자·본문은 필수다. 날짜는 비우거나 `YYYY-MM-DD`다. 태그는 문자열 배열이다.

### 목록 응답

`fetchList`가 돌려주는 객체는 `{ items, page, pageSize, total, pageCount }`다. `items`의 원소는 `Post.toJSON()` 결과다. 쪽 크기는 5다. 0건이어도 `pageCount`는 1이다.

### 한 방향

```text
클릭  --명령-->  App  --메서드-->  Data  --목록-->  Collection  --한 건-->  Post
화면  <--state--  App  <--JSON----  Data
```

`View`의 `define` 배열에는 `Data`가 없다. `Grid`의 `define` 배열에는 `Data`가 없다. `Data`의 `define` 배열에는 `View`가 없다.

## 3. 단계마다 같은 방식으로 접근한다

한 단계의 순서는 항상 같다.

1. 이 단계가 답하는 질문을 한 문장으로 적는다.
2. 그 질문의 입력과 출력을 함수 이름으로 적는다.
3. 파일을 하나 만들고 `define` 의존을 그 질문에 필요한 모듈만 적는다.
4. 화면이 필요 없으면 브라우저 콘솔에서 그 함수만 호출한다.
5. 통과 조건을 눈으로 확인한 뒤에 다음 단계 파일을 만든다.

콘솔 확인은 페이지를 `file://`로 열면 되지 않는다. `npm run dev`로 연 문서의 개발자 도구에서 `require`한다. `fetch`는 그 서버 출처에서만 `data/posts.json`을 읽는다.

공통 모듈을 고를 때는 카탈로그에서 그 모듈의 실행 예제를 먼저 본다. 예제가 서버 없이 뜨면 위젯에 `require`한다. 예제가 3DSpace 모델이 있어야 뜨면 이 게시판 단계에 넣지 않는다.

아래 4절부터 15절은 페이지를 먼저 띄우던 확인 절차다. 처음 개발할 때 여는 폴더와 그 단계에 두는 함수는 문서 앞의 표와 `stages/` 각 파일의 머리 주석을 따른다.

## 4. 단계 0 — 서버에서 빈 페이지가 열린다

질문: 이 폴더가 브라우저의 서버 루트인가.

만드는 것: `package.json`의 `dev` 스크립트, `index.html`의 `<div id="board">`.

접근: 위젯 코드를 쓰기 전에 문서가 열리는지만 본다. AMD, 데이터, CSS는 아직 없다. `#board` 안에 "게시판을 불러오는 중입니다."처럼 나중에 지워도 되는 문장을 둔다.

테스트:

```text
npm install
npm run dev
```

브라우저에서 서버가 출력한 `/`를 연다.

통과: 탭 제목이 ENXBoard다. `#board` 문장이 보인다. 주소가 `http://`다.

실패: `file://`이면 이후 단계의 `fetch`가 막힌다. 서버를 켜고 그 주소로 다시 연다.

## 5. 단계 1 — 아이콘 글꼴만 요청된다

질문: 공통 아이콘 파일을 이 페이지가 읽는가.

만드는 것: `css/board.css`, `index.html`의 `vendor/core/wux-3ds-fonticons.css` 링크.

접근: 아이콘 위젯(`DS/UIKIT/Iconbar`)을 기동하지 않는다. 그 위젯은 `UWA`가 필요하고, 이 단계의 페이지는 아직 그 로더를 읽지 않는다. 클래스 `wux-ui-3ds`와 `wux-ui-3ds-list`를 빈 `<i>`에 붙여 글꼴 파일만 요청되는지 본다.

테스트: 새로고침 후 네트워크에서 `3ds_fonticon` 요청이 `vendor/core/assets/fonts/`로 가는지 본다.

통과: 글꼴 요청이 200이다. 본문 레이아웃은 아직 비어 있어도 된다.

실패: CSS 404는 링크 경로다. 글꼴 404는 `vendor/core`가 이 저장소를 가리키는지다.

## 6. 단계 2 — 데이터 없이 목록 껍질이 그려진다

질문: `App`이 상태를 들고, `View`가 그 상태로 목록 껍질을 그리는가.

만드는 것: `js/app.js`, `js/view.js`. 이 단계의 `App.init`은 `Data.load`를 부르지 않는다. `showList` 대신 고정 상태를 `render`에 넘긴다.

```javascript
view.render({
    screen: "list",
    query: "",
    list: { items: [], page: 1, pageSize: 5, total: 0, pageCount: 1 },
    post: null,
    errors: [],
    notice: "",
});
```

접근: `View`는 `define([])`로 의존을 비운다. 생성자는 `(root, onCommand)`만 받는다. `render`는 `#board`의 `innerHTML`을 통째로 바꾼다. 목록 HTML에는 제목 "게시판", 검색 폼 `data-command="search"`, 새 글 버튼 `data-command="create"`, 건수 문장, 빈 `<div class="grid-host">`가 있다. 행은 없다.

이 단계의 `index.html`은 아직 AmdLoader가 아니어도 된다. `js/loader.js`는 `DS/ENXBoard/`만 읽고, 그 외 id는 거절한다. 페이지는 `require(["DS/ENXBoard/js/app"], ...)` 한 줄로 `App`을 만든다.

테스트: 새로고침.

통과: 검색 칸과 새 글 버튼이 보인다. 콘솔에 모듈 로드 에러가 없다. 새 글을 눌러도 화면이 바뀌지 않아도 된다. 명령 함수가 호출되는지만 콘솔에 찍으면 된다.

실패: "이 로더는 DS/ENXBoard 모듈만 읽습니다"는 `define` id나 `require` id가 `DS/ENXBoard/`로 시작하지 않는 것이다. "모듈 ID가 필요합니다"는 `define`의 첫 인자가 문자열 id가 아닌 것이다. 이 저장소의 익명 `define`은 받지 않는다.

## 7. 단계 3 — 글 한 건을 화면 없이 검사한다

질문: 잘못된 글은 저장 전에 거절되는가.

만드는 것: `js/model.js`. id는 `DS/ENXBoard/js/model`. 의존은 없다. 반환은 `Post` 생성자다.

접근: `Post`는 프레임워크 컴포넌트가 아니다. `validate`는 `{ ok, errors }`를 돌려준다. `toJSON`은 앞뒤 공백을 뺀 평범한 객체를 돌려준다. 화면 문구는 여기서 만들지 않는다. 에러 문자열만 돌려주고, 문장을 어디에 그릴지는 나중 단계의 `View`가 정한다.

테스트: 페이지를 연 콘솔에서 모듈만 불러 호출한다.

```javascript
require(["DS/ENXBoard/js/model"], function (Post) {
    console.log(new Post({ title: "  가  ", author: "나", content: "다" }).toJSON());
    console.log(new Post({ title: "", author: "나", content: "다" }).validate());
    console.log(new Post({ title: "가", author: "나", content: "다", date: "2026/3/1" }).validate());
    console.log(new Post({ title: "가", author: "나", content: "다", date: "" }).validate());
});
```

통과:

| 호출 | 기대 |
|---|---|
| 공백 있는 제목의 `toJSON().title` | `"가"` |
| 빈 제목 | `ok: false`, 제목 오류 문자열 |
| `2026/3/1` | `ok: false`, 날짜 오류 문자열 |
| 빈 날짜 | `ok: true` |

실패: `require`가 정의되지 않으면 단계 2의 로더 스크립트가 문서에 없는 것이다. `Post is not a constructor`면 `define`이 생성자 함수를 `return`하지 않은 것이다.

이 단계가 통과하기 전에 `js/collection.js`를 만들지 않는다.

## 8. 단계 4 — 검색과 쪽을 화면 없이 자른다

질문: 12건을 5건씩 자르고, 검색어가 있으면 그 결과만 세는가.

만드는 것: `js/collection.js`. 의존은 `DS/ENXBoard/js/model`뿐이다.

접근: `Collection`은 DOM을 모른다. `getPage(page, pageSize, query)`만 증명하면 된다. 검색은 제목, 작성자, 본문, 태그를 한 문자열로 이어 소문자로 비교한다. 정렬은 날짜 내림차순이다. 쪽 번호는 1부터다. 범위를 벗어나면 안쪽 쪽으로 맞춘다.

테스트용 배열은 `data/posts.json`의 12건을 그대로 쓴다. 파일을 콘솔에 붙이거나, 단계 5 전에 임시로 `fetch("./data/posts.json")` 결과만 넘겨도 된다. `Collection` 안에 `fetch`를 넣지 않는다.

통과:

| 호출 | 기대 |
|---|---|
| `getPage(1, 5, "")` | `items.length === 5`, `total === 12`, `pageCount === 3` |
| `getPage(3, 5, "")` | `items.length === 2` |
| `getPage(9, 5, "")` | `page === 3` |
| `getPage(1, 5, "김하준")` | `total === 2` |
| `getPage(1, 5, "없는말")` | `items.length === 0`, `pageCount === 1` |
| `findById("p01").title` | 환영 패널 글의 제목 |
| `findById("없는id")` | `null` |

실패: 검색이 본문만 맞으면 태그 연결이 빠진 것이다. 1쪽 5건의 첫 날짜가 가장 최근이 아니면 정렬이 빠진 것이다.

## 9. 단계 5 — JSON을 메모리 저장소로 읽는다

질문: `Data`가 Promise로 목록과 한 건을 주고, 검사에 실패한 저장은 목록을 바꾸지 않는가.

만드는 것: `js/data.js`, `data/posts.json`. 의존은 `collection`, `model`뿐이다.

접근: `load`, `fetchList`, `fetchDetail`, `createPost`, `updatePost`, `deletePost`는 모두 Promise다. 화면은 이 메서드 이름을 나중에 그대로 쓴다. 주소를 서버로 바꿀 때도 이 이름과 JSON 필드는 유지한다. `createPost`의 id는 `p`와 두 자리 번호다. `updatePost`는 `validate`가 통과한 뒤에만 기존 글에 쓴다.

테스트:

```javascript
require(["DS/ENXBoard/js/data"], function (Data) {
    var data = new Data();
    data.load("./data/posts.json").then(function (count) {
        console.log("건수", count);
        return data.fetchList({ page: 1, pageSize: 5, query: "김하준" });
    }).then(function (list) {
        console.log("검색", list.total, list.items.map(function (post) { return post.id; }));
        return data.fetchDetail("p01");
    }).then(function (post) {
        console.log("상세", post.title);
        return data.createPost({ title: "", author: "나", content: "다" });
    }).then(function () {
        console.log("빈 제목이 저장되면 안 된다");
    }, function (reason) {
        console.log("거절", reason.errors);
    });
});
```

통과: 건수 12, 검색 2건, `p01` 제목이 보인다. 빈 제목은 reject이고 `errors` 배열이 있다. 그 다음 `fetchList`의 `total`은 여전히 12다.

실패: "목 데이터를 읽지 못했습니다"는 `posts.json` 경로 또는 서버가 아니다. `Collection is not a constructor`면 `data.js`의 의존 순서가 `define` 배열과 콜백 인자와 어긋난 것이다. 인자를 하나 빼면 뒤의 인자가 전부 밀린다.

## 10. 단계 6 — 명령을 화면 전환에 연결한다

질문: 검색, 쪽, 상세, 등록, 수정, 삭제가 `App` 상태만으로 이어지는가.

만드는 것: 단계 2의 `App`에 `Data`를 연결한다. `View`는 여전히 `Data`를 `require`하지 않는다.

접근: `View._bind`는 `[data-command]`를 찾아 클릭 또는 폼 제출을 막은 뒤 `onCommand(name, payload)`만 호출한다.

| 명령 | payload |
|---|---|
| `search` | `{ query }` 검색 칸의 값 |
| `page` | `{ page }` `data-page` 숫자 |
| `open` | `{ id }` |
| `create` | `{ id: "" }` |
| `edit` | `{ id }` |
| `delete` | `{ id }` |
| `save` | `{ id, fields }` 폼 필드 |
| `back`, `cancel` | `{ id }` |

`App._onCommand`가 이름을 보고 `Data` 메서드를 고른다. 성공한 저장은 `showDetail`이다. 검사 실패는 `errors`를 상태에 넣고 같은 입력 화면을 다시 그린다. 삭제 전 `window.confirm`이 취소면 `deletePost`를 부르지 않는다.

목록의 행은 이 단계까지 HTML이어도 된다. `<table>`이든 빈 `.grid-host`든, 제목을 누르면 명령 `open`과 글 id가 올라가면 된다. 그리드 교체는 단계 9다.

테스트: 서버로 연 페이지에서 손으로 누른다.

| 조작 | 통과 |
|---|---|
| 첫 화면 | 5건, "전체 12건, 1 / 3쪽" |
| 다음 | 2쪽 5건. 1쪽 제목이 아니다 |
| 검색 `김하준` | 2건, 1쪽 |
| 검색 `없는말` | 0건, 쪽 수는 1 |
| 제목 클릭 | 본문, 작성자, 날짜, 태그 |
| 새 글, 제목만 비우고 저장 | 목록 건수가 늘지 않고 제목 오류가 입력 화면에 남는다 |
| 새 글, 필수 칸을 채우고 저장 | 상세로 이동. 새로고침 전까지만 남는다 |
| 상세에서 수정 저장 | 상세 제목이 바뀐다 |
| 상세에서 삭제 확인 | 목록. 그 제목이 없다 |
| 삭제 확인에서 취소 | 상세가 그대로다 |
| 수정 화면에서 취소 | 저장 전 상세 |
| 등록 화면에서 취소 | 목록 |

실패: 검색 뒤에 쪽이 2에 남아 있으면 `search`가 `page`를 1로 되돌리지 않은 것이다. 저장 실패 뒤 입력 칸이 비면, 다시 그릴 때 `post`에 방금 입력한 필드를 넣지 않은 것이다. `render`는 `innerHTML`을 바꾸므로 실패 시점의 입력은 상태가 아니면 사라진다.

## 11. 단계 7 — 공통 로더를 붙여도 화면이 그대로다

질문: `webapps_2025x`를 읽을 준비만 하고, 아직 그리드를 만들지 않아도 단계 6이 유지되는가.

만드는 것: `vendor/webapps` 심볼릭 링크. `index.html`이 `js/loader.js` 대신 AmdLoader를 읽게 바꾼다.

순서는 이렇다.

1. `window.dsDefaultWebappsBaseUrl`을 `./vendor/webapps`의 절대 URL로 둔다.
2. `./vendor/webapps/AmdLoader/AmdLoader.js`를 읽는다.
3. `require.config`의 `paths`에 `DS/ENXBoard`만 이 저장소 루트를 적는다.
4. `require(["DS/ENXBoard/js/app"], ...)`로 `init`한다.

접근: `DS`보다 `DS/ENXBoard`가 더 구체적인 경로라 앱 파일은 `./js/`에서 온다. `DS/DataGridView/...`는 `vendor/webapps`에서 온다. 이 단계에서는 그 id를 `require`하지 않는다. 링크와 경로만 증명한다.

테스트: 단계 6의 조작을 한 번 더 한다. 네트워크 필터에 `DataGridView`가 없어야 한다.

통과: 목록, 상세, 검색이 단계 6과 같다. `js/app.js` 요청 URL에 `vendor/webapps/ENXBoard`가 없다.

실패: 앱 스크립트가 `vendor/webapps/ENXBoard`로 가면 `paths`의 `DS/ENXBoard`가 적용되지 않은 것이다. AmdLoader의 `DS` 규칙이 더 구체적인 경로를 이긴 것이 아니다. `require.config`가 AmdLoader 스크립트보다 앞에 있으면 설정이 무시된다.

## 12. 단계 8 — 그리드 모듈만 빈 호스트에 붙인다

질문: 현재 쪽 행만 넘기면 DataGridView가 네 열을 그리는가.

만드는 것: `js/grid.js`. 의존은 `DS/DataGridView/DataGridView`, `DS/TreeModel/TreeDocument`, `DS/TreeModel/TreeNodeModel`뿐이다.

접근: 공통 모듈은 한 번에 하나만 더한다. 첫 모듈이 DataGridView다. 파일을 `js/`로 복사하지 않는다. `webapps_2025x` 원본도 고치지 않는다.

`attach(host, items, onOpen)`는 `items`로만 `TreeDocument`를 만든다. `Collection`을 받지 않는다.

| 글 필드 | 노드 |
|---|---|
| `title` | `label`. 열 `dataIndex`는 `"tree"` |
| `author`, `date` | `grid.author`, `grid.date` |
| `tags` | `grid.tags`. 화면에는 쉼표로 잇는다 |
| `id` | `grid.id`. 열로 보이지 않는다 |

제목 열은 `typeRepresentation: "url"`이고 `getCellValue`가 `{ label, func }`를 돌려준다. `func`가 `onOpen(id)`를 부른다. 열은 편집 불가, 행 선택은 `single`, 체크박스·행 드래그·우클릭 열은 끈다. `identifier`는 `enxboard-list`다. 이 값이 같으면 브라우저 `localStorage`에 열 너비가 남는다. `placeholder`는 "검색 결과가 없습니다."다.

호스트에 높이가 있어야 한다. 높이가 0이면 가상 행이 그려지지 않는다.

테스트: 콘솔에서 호스트를 만들어 두 건만 붙인다.

```javascript
require(["DS/ENXBoard/js/grid"], function (Grid) {
    var host = document.createElement("div");
    host.style.height = "240px";
    document.body.appendChild(host);
    Grid.attach(host, [
        { id: "t1", title: "첫 글", author: "가", date: "2026-03-01", tags: ["보기"] },
        { id: "t2", title: "둘째", author: "나", date: "2026-03-02", tags: [] },
    ], function (id) {
        console.log("open", id);
    });
});
```

통과: 열이 제목, 작성자, 날짜, 태그다. "첫 글"을 누르면 콘솔에 `open t1`이 찍힌다. 네트워크에 `DataGridView.js`가 200이다.

실패: 스크립트 404는 단계 7의 링크다. `i18n` JSON이나 `css` 404는 그 모듈의 `assets`가 체크아웃에 없는 것이다. 없는 파일만 경로를 확인하고, 의존 트리를 `js/`로 복사하지 않는다. 표가 하얗기만 하면 호스트 높이다.

이 콘솔 테스트가 통과하기 전에 `View`의 표를 그리드로 바꾸지 않는다.

## 13. 단계 9 — 목록 표만 그리드로 바꾼다

질문: 단계 6의 검색·쪽·상세가 유지된 채, 목록 행만 그리드인가.

만드는 것: `View._list`의 행 자리에 `<div class="grid-host">`만 남긴다. 검색, 건수, 이전·다음은 `View`가 그대로 그린다. `App._paint`가 `render` 뒤에, 화면이 `list`일 때만 `Grid.attach`를 부른다.

접근: `View.render`는 `#board`를 다시 쓰므로 이전 그리드 DOM이 사라진다. 목록을 그릴 때마다 `attach`하고, 그리기 전에 이전 인스턴스의 `destroy`를 부른다. 상세·등록·수정에서는 `attach`하지 않는다. 쪽 크기 5는 유지한다. 그리드에는 `list.items`만 넣는다. `onInfiniteScroll`이나 서버 행 모델은 쓰지 않는다.

제목 클릭의 `onOpen`은 `App`에서 명령 `open`으로 올린다. 명령 문자열을 그리드 안에서 새로 짓지 않는다.

```javascript
this.grid = Grid.attach(host, items, function (id) {
    self._onCommand("open", { id: id });
});
```

테스트: 단계 6의 표를 다시 한다. 추가로 아래를 본다.

| 조작 | 통과 |
|---|---|
| 목록 | 그리드 4열. HTML `<table>`이 없다 |
| 제목 클릭 | 상세. 그리드 DOM이 없다 |
| 목록으로 돌아오기 | 그리드가 다시 붙는다. 콘솔에 이미 destroy된 그리드 오류가 없다 |
| 검색과 다음 쪽 | 보이는 행이 그 쪽의 5건 이하다 |
| 결과 0건 | 호스트는 남고 placeholder 문장이 보인다 |
| 등록·수정 화면 | 그리드를 만들지 않는다. 네트워크에 새 DataGrid 요청이 연달아 나지 않아도 된다 |
| 빈 제목 저장 | 단계 6과 같이 거절된다 |

실패: 제목을 눌러도 상세로 안 가면 `func`가 id를 닫아 두지 않았거나 `onOpen`이 `open` 명령으로 이어지지 않은 것이다. 쪽을 바꿀 때마다 행이 쌓이면 이전 그리드를 `destroy`하기 전에 같은 호스트에 다시 `inject`한 것이다. 열 너비만 이상하면 `localStorage`의 `enxboard-list` 항목이다. 키를 지우고 새로고침한다.

## 14. 단계 10 — 대시보드 부모를 흉내 낸 창에서 연다

질문: iframe 안에서도 단계 9와 같이 동작하는가.

만드는 것: `mock-shell.html`. 위젯 소스(`js/`, `index.html`)는 바꾸지 않는다.

접근: 대시보드 부모가 주던 객체만 이 파일이 만든다.

| 부모 객체 | 값 |
|---|---|
| `window.parent.appId` | `"ENXBoard"` |
| `window.parent.widget` | `id`, `appId`, `title`, `getValue`, `setValue`, `deleteValue`, `addEvent`, `setTitle` |
| `window.parent.dashboard` | `{ appId, widget, postToWidget(type, data) }` |

iframe은 `index.html`이고 크기는 800×600이다. 부모가 iframe에 `{ source: "3DDashboard", appId, widgetId, type, data }`를 보낸다. iframe이 로드되면 `type: "onLoad"`를 한 번 보낸다.

테스트: 정적 서버에서 `/mock-shell.html`을 연다. iframe 안에서 단계 9의 목록·검색·상세를 반복한다.

통과: 제목 막대에 ENXBoard가 보인다. iframe 안의 목록이 `/`를 직접 열 때와 같다.

실패: iframe이 빈 화면이면 `index.html` 경로가 셸 문서 기준이 아닌 것이다. 글이 없고 콘솔에 fetch 오류면 셸을 `file://`로 연 것이다.

이 단계의 앱 코드는 부모를 읽지 않는다. 셸이 있어도 목록 동작이 직접 열 때와 같은 것이 통과 조건이다.

## 15. 단계 11 — 위젯 생명주기를 앱 메서드에 연결한다

질문: 대시보드가 Refresh나 검색을 보낼 때 목록이 다시 그려지는가.

만드는 것: `js/widget.js`를 `App`이 호출하게 연결한다. 이 파일은 저장소에 이미 있다. `resolveWidget`은 인자, `window.widget`, `window.parent.widget` 순으로 `addEvent`가 있는 객체를 찾는다. `bind(app)`은 `onLoad`, `onRefresh`, `onSearch`를 앱 메서드로 넘긴다. 부모가 `postMessage`로 먼저 보낸 이벤트는 `__enxTakeWidgetQueue`에 쌓였다가 `bind`할 때 비운다.

접근: 이벤트 이름을 앱 화면 이름으로 바꾸지 않는다. 대시보드가 보내는 이름은 `onLoad`, `onRefresh`, `onSearch`다. 앱 메서드가 그 이름을 받는다.

| 이벤트 | 앱이 할 일 |
|---|---|
| `onLoad` | `init`과 같다. JSON을 읽고 목록을 연다. 두 번 호출돼도 글이 두 배로 늘면 안 된다 |
| `onRefresh` | 메모리 목록을 유지한 채 `showList`만 다시 호출한다. 사용자가 방금 등록한 글이 새로고침 한 번에 사라지면 안 된다 |
| `onSearch` | 검색 명령과 같다. 검색어를 저장하고 1쪽 `showList` |

지금 `js/app.js`는 이 모듈을 `require`하지 않는다. `index.html`도 큐를 만들지 않는다. 연결은 단계 9가 통과한 뒤에 한다. 연결 전에 넣으면 목록 실패가 그리드 문제인지 부모 메시지 문제인지 구분할 수 없다.

테스트: `mock-shell.html` 콘솔에서 부모의 `postToWidget`으로 보낸다.

```javascript
dashboard.postToWidget("onSearch", { query: "김하준" });
dashboard.postToWidget("onRefresh", {});
```

셸이 그 메시지를 iframe에 넘기고, iframe의 `bind`가 앱을 호출해야 한다. `widget.setTitle("다른 제목")`을 부르면 제목 막대 문구가 바뀐다.

통과: 검색 이벤트 뒤 iframe 목록이 2건이다. Refresh 뒤에도 그 검색 결과 쪽이 유지된다. `onLoad`를 다시 보내도 같은 id의 글이 두 줄이 되지 않는다.

실패: 이벤트를 보내도 목록이 그대로면 `App`이 `bind`를 호출하지 않았거나, `addEvent` 전에 도착한 메시지를 큐에서 비우지 않은 것이다. `parent.widget` 접근이 예외면 다른 출처 iframe이다. `resolveWidget`은 그 예외를 삼키고 `null`을 돌려준다. 같은 서버의 `mock-shell.html`에서 다시 연다.

## 16. 단계가 끝난 뒤에만 하는 일

| 하고 싶어지는 것 | 두는 곳 |
|---|---|
| 메서드 이름을 서버 API 경로로 바꾸기 | 하지 않는다. `Data` 메서드 이름과 Promise, JSON 필드를 유지하고 구현만 바꾼다 |
| 쪽 크기 바꾸기 | `App`의 `PAGE_SIZE`. `fetchList`의 `pageSize`로 이미 전달된다 |
| 체크박스로 여러 글을 지우기 | 새 명령 이름을 정한 뒤 `View`와 `App`에 같이 추가한다. 그리드 옵션만 켜지 않는다 |
| 상세를 그리드 편집으로 바꾸기 | 하지 않는다. 등록·수정은 폼 화면이다 |
| 두 번째 공통 모듈 | DataGridView 확인이 끝난 뒤에 하나 더 `require`한다 |

## 17. 실패를 모듈로 되돌리는 순서

화면이 이상하면 아래 순서로 범위를 줄인다. 그리드부터 의심하지 않는다.

1. 네트워크에 빨간 요청이 있는가. 있으면 경로다. 단계 7 또는 단계 8이다.
2. 콘솔에 `define` 의존 오류가 있는가. 콜백 인자 순서가 `define` 배열과 같은지 본다.
3. 단계 3~5의 콘솔 호출이 아직 통과하는가. 통과하면 데이터 계약은 살아 있다.
4. 명령이 찍히는가. 안 찍히면 `data-command`와 `_bind`다. `render` 이후에 바인딩해야 한다.
5. 명령은 찍히는데 화면이 그대로면 `App._onCommand`가 그 이름을 모르는 것이다.
6. 목록만 하얗면 `.grid-host` 높이와 `attach` 호출 여부다.
7. 부모 메시지만 실패하면 단계 11이다. iframe을 빼고 `/`에서 단계 9를 다시 한다.
