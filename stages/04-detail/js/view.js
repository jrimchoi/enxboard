/*
 * 단계 4. 다음 화면은 상세. AMD 모듈 DS/ENXBoard/js/view.
 *
 * 입구 화면의 검색이 된 뒤에 화면을 하나 더한다. 제목을 누르면 상세, 상세의 목록 버튼은 입구로 돌아온다.
 * 등록과 수정은 상세가 열린 뒤에 붙인다.
 *
 * 이번 단계에 더하는 함수:
 * - render(state): state.screen이 detail이면 상세, 아니면 목록.
 * - 명령 open, back.
 *
 * 아직 없는 명령: create, edit, delete, save, cancel.
 */
define("DS/ENXBoard/js/view", [], function () {
    function View(root, onCommand) {
        this.root = root;
        this.onCommand = onCommand;
    }

    View.prototype.render = function (state) {
        this.root.innerHTML = state.screen === "detail" ? this._detail(state) : this._list(state);
        this._bind();
    };

    View.prototype._list = function (state) {
        var list = state.list || { items: [], page: 1, pageCount: 1, total: 0 };
        var body = list.items.map(function (post) {
            return (
                '<tr><td><button type="button" class="link" data-command="open" data-id="' +
                escapeHtml(post.id) + '">' + escapeHtml(post.title) + "</button></td><td>" +
                escapeHtml(post.author) + "</td><td>" + escapeHtml(post.date) + "</td><td>" +
                escapeHtml((post.tags || []).join(", ")) + "</td></tr>"
            );
        }).join("");
        if (!body) {
            body = '<tr><td class="empty" colspan="4">검색 결과가 없습니다.</td></tr>';
        }
        return (
            "<header><h1>게시판</h1></header>" +
            '<form class="toolbar" data-command="search">' +
            '<input name="query" type="search" value="' + escapeHtml(state.query) + '" placeholder="제목, 작성자, 본문, 태그">' +
            "<button type=\"submit\">검색</button></form>" +
            '<p class="count">전체 ' + list.total + "건, " + list.page + " / " + list.pageCount + "쪽</p>" +
            "<table><thead><tr><th>제목</th><th>작성자</th><th>날짜</th><th>태그</th></tr></thead><tbody>" +
            body + "</tbody></table>" + pager(list)
        );
    };

    // 상세는 fetchDetail JSON의 필드를 그대로 보여 준다. 수정, 삭제 버튼은 다음 단계다.
    View.prototype._detail = function (state) {
        var post = state.post;
        return (
            "<header><h1>" + escapeHtml(post.title) + "</h1></header>" +
            '<p class="meta">' + escapeHtml(post.author) + " · " + escapeHtml(post.date) + "</p>" +
            "<p>" + post.tags.map(escapeHtml).join(", ") + "</p>" +
            '<article class="content">' + escapeHtml(post.content) + "</article>" +
            '<div class="actions"><button type="button" data-command="back">목록</button></div>'
        );
    };

    View.prototype._bind = function () {
        var self = this;
        this.root.querySelectorAll("[data-command]").forEach(function (node) {
            var eventName = node.tagName === "FORM" ? "submit" : "click";
            node.addEventListener(eventName, function (event) {
                event.preventDefault();
                var command = node.getAttribute("data-command");
                var payload = { id: node.getAttribute("data-id") || "" };
                if (command === "search") {
                    payload.query = node.querySelector("[name=query]").value;
                }
                if (command === "page") {
                    payload.page = Number(node.getAttribute("data-page"));
                }
                self.onCommand(command, payload);
            });
        });
    };

    function pager(list) {
        var previous = list.page > 1 ? list.page - 1 : 1;
        var next = list.page < list.pageCount ? list.page + 1 : list.pageCount;
        return (
            '<div class="pager">' +
            '<button type="button" data-command="page" data-page="' + previous + '"' +
            (list.page <= 1 ? " disabled" : "") + ">이전</button>" +
            '<button type="button" data-command="page" data-page="' + next + '"' +
            (list.page >= list.pageCount ? " disabled" : "") + ">다음</button></div>"
        );
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    return View;
});
