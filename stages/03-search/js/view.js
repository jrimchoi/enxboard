/*
 * 단계 3. 첫 조작은 검색. AMD 모듈 DS/ENXBoard/js/view.
 *
 * 목록이 보인 뒤에 버튼 하나를 더한다. 이번 조작은 검색과, 검색 결과에 맞춘 이전, 다음이다.
 * 제목 클릭과 등록은 아직 없다.
 *
 * 구현 전에 이 단계에 더하기로 정한 함수:
 * - View(root, onCommand): 클릭을 명령 이름으로 올린다.
 * - render(state): 목록 위에 검색 폼과 쪽 버튼을 그린다.
 * - _bind(): data-command가 search 또는 page인 요소만 연결한다.
 *
 * 나중에 추가할 명령: open, create, edit, delete, save, back, cancel.
 */
define("DS/ENXBoard/js/view", [], function () {
    function View(root, onCommand) {
        this.root = root;
        this.onCommand = onCommand;
    }

    View.prototype.render = function (state) {
        var list = state.list || { items: [], page: 1, pageCount: 1, total: 0 };
        this.root.innerHTML =
            "<header><h1>게시판</h1></header>" +
            '<form class="toolbar" data-command="search">' +
            '<input name="query" type="search" value="' + escapeHtml(state.query) + '" placeholder="제목, 작성자, 본문, 태그">' +
            "<button type=\"submit\">검색</button></form>" +
            '<p class="count">전체 ' + list.total + "건, " + list.page + " / " + list.pageCount + "쪽</p>" +
            "<table><thead><tr><th>제목</th><th>작성자</th><th>날짜</th><th>태그</th></tr></thead><tbody>" +
            rows(list) +
            "</tbody></table>" +
            pager(list);
        this._bind();
    };

    // 검색은 폼 제출, 쪽 이동은 버튼 클릭이다. 화면은 목록을 다시 계산하지 않는다.
    View.prototype._bind = function () {
        var self = this;
        this.root.querySelectorAll("[data-command]").forEach(function (node) {
            var eventName = node.tagName === "FORM" ? "submit" : "click";
            node.addEventListener(eventName, function (event) {
                event.preventDefault();
                var command = node.getAttribute("data-command");
                var payload = {};
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

    function rows(list) {
        if (!list.items.length) {
            return '<tr><td class="empty" colspan="4">검색 결과가 없습니다.</td></tr>';
        }
        return list.items.map(function (post) {
            return (
                "<tr><td>" + escapeHtml(post.title) + "</td><td>" +
                escapeHtml(post.author) + "</td><td>" +
                escapeHtml(post.date) + "</td><td>" +
                escapeHtml((post.tags || []).join(", ")) + "</td></tr>"
            );
        }).join("");
    }

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
