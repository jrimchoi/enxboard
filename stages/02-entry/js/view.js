/*
 * 단계 2. 입구 화면. AMD 모듈 DS/ENXBoard/js/view.
 *
 * API가 목록 JSON을 돌려준 뒤에 만든다. 이 단계는 그 목록을 보여 주는 것까지만 한다.
 * 검색, 상세, 등록 버튼은 표시가 된 뒤에 다음 단계에서 하나씩 붙인다.
 *
 * 구현 전에 이 모듈에 두기로 정한 함수:
 * - View(root): 그릴 요소를 받는다. 명령 콜백은 아직 없다.
 * - render(state): state.list.items를 표로 그린다.
 *
 * 나중에 추가할 함수:
 * - 검색 폼과 쪽 버튼이 생기면 render가 명령을 올린다.
 * - 상세, 등록, 수정 화면은 render가 screen 값으로 고른다.
 */
define("DS/ENXBoard/js/view", [], function () {
    function View(root) {
        this.root = root;
    }

    // fetchList가 돌려준 items만 표시한다. 클릭은 아직 명령을 만들지 않는다.
    View.prototype.render = function (state) {
        var list = state.list || { items: [], page: 1, pageCount: 1, total: 0 };
        var rows = list.items.map(function (post) {
            return (
                "<tr><td>" + escapeHtml(post.title) + "</td><td>" +
                escapeHtml(post.author) + "</td><td>" +
                escapeHtml(post.date) + "</td><td>" +
                escapeHtml((post.tags || []).join(", ")) + "</td></tr>"
            );
        }).join("");
        if (!rows) {
            rows = '<tr><td class="empty" colspan="4">표시할 글이 없습니다.</td></tr>';
        }
        this.root.innerHTML =
            "<header><h1>게시판</h1></header>" +
            '<p class="count">전체 ' + list.total + "건, " + list.page + " / " + list.pageCount + "쪽</p>" +
            "<table><thead><tr><th>제목</th><th>작성자</th><th>날짜</th><th>태그</th></tr></thead><tbody>" +
            rows +
            "</tbody></table>";
    };

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    return View;
});
