/*
 * 단계 5. 등록, 수정 화면. AMD 모듈 DS/ENXBoard/js/view.
 *
 * render는 screen 값으로 목록, 상세, 입력 화면을 고른다. Data는 부르지 않고 명령만 올린다.
 *
 * 이 모듈이 올리는 명령:
 * - search, page, open, back: 앞 단계에서 이미 있던 것
 * - create, edit, delete, save, cancel: 이번 단계에서 추가
 *
 * save의 payload.fields는 입력값이다. 검사 실패 문구는 state.errors를 그대로 그린다.
 */
define("DS/ENXBoard/js/view", [], function () {
    var ICONS = {
        list: "wux-ui-3ds wux-ui-3ds-list",
        search: "wux-ui-3ds wux-ui-3ds-search",
        create: "wux-ui-3ds wux-ui-3ds-plus",
        edit: "wux-ui-3ds wux-ui-3ds-pencil",
        remove: "wux-ui-3ds wux-ui-3ds-trash",
        back: "wux-ui-3ds wux-ui-3ds-left",
        save: "wux-ui-3ds wux-ui-3ds-check",
    };

    function View(root, onCommand) {
        this.root = root;
        this.onCommand = onCommand;
    }

    View.prototype.render = function (state) {
        var html = "";
        if (state.screen === "detail") {
            html = this._detail(state);
        } else if (state.screen === "edit" || state.screen === "create") {
            html = this._form(state);
        } else {
            html = this._list(state);
        }
        this.root.innerHTML = html;
        this._bind();
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
                if (command === "save") {
                    payload.fields = self._readForm();
                }
                self.onCommand(command, payload);
            });
        });
    };

    View.prototype._readForm = function () {
        var form = this.root.querySelector("form[data-command=save]");
        var tags = form.querySelector("[name=tags]").value.split(",");
        return {
            title: form.querySelector("[name=title]").value,
            author: form.querySelector("[name=author]").value,
            date: form.querySelector("[name=date]").value,
            content: form.querySelector("[name=content]").value,
            tags: tags,
        };
    };

    function rows(list) {
        if (!list.items.length) {
            return '<tr><td class="empty" colspan="4">검색 결과가 없습니다.</td></tr>';
        }
        return list.items.map(function (post) {
            return (
                '<tr><td><button type="button" class="link" data-command="open" data-id="' +
                escapeHtml(post.id) +
                '">' +
                escapeHtml(post.title) +
                "</button></td><td>" +
                escapeHtml(post.author) +
                "</td><td>" +
                escapeHtml(post.date) +
                "</td><td>" +
                escapeHtml((post.tags || []).join(", ")) +
                "</td></tr>"
            );
        }).join("");
    }

    View.prototype._list = function (state) {
        var list = state.list || { items: [], page: 1, pageCount: 1, total: 0 };
        return (
            this._header("게시판") +
            this._notice(state) +
            '<form class="toolbar" data-command="search">' +
            icon(ICONS.search) +
            '<input name="query" type="search" value="' +
            escapeHtml(state.query) +
            '" placeholder="제목, 작성자, 본문, 태그">' +
            '<button type="submit">검색</button>' +
            '<button type="button" data-command="create">' +
            icon(ICONS.create) +
            "새 글</button>" +
            "</form>" +
            '<p class="count">전체 ' +
            list.total +
            "건, " +
            list.page +
            " / " +
            list.pageCount +
            "쪽</p>" +
            '<table><thead><tr><th>제목</th><th>작성자</th><th>날짜</th><th>태그</th></tr></thead><tbody>' +
            rows(list) +
            "</tbody></table>" +
            this._pager(list)
        );
    };

    View.prototype._detail = function (state) {
        var post = state.post;
        return (
            this._header(post.title) +
            this._notice(state) +
            '<p class="meta">' +
            escapeHtml(post.author) +
            " · " +
            escapeHtml(post.date) +
            "</p>" +
            "<p>" +
            post.tags.map(escapeHtml).join(", ") +
            "</p>" +
            '<article class="content">' +
            escapeHtml(post.content) +
            "</article>" +
            '<div class="actions">' +
            '<button type="button" data-command="back">' +
            icon(ICONS.back) +
            "목록</button>" +
            '<button type="button" data-command="edit" data-id="' +
            escapeHtml(post.id) +
            '">' +
            icon(ICONS.edit) +
            "수정</button>" +
            '<button type="button" data-command="delete" data-id="' +
            escapeHtml(post.id) +
            '">' +
            icon(ICONS.remove) +
            "삭제</button>" +
            "</div>"
        );
    };

    View.prototype._form = function (state) {
        var post = state.post || { title: "", author: "", date: "", content: "", tags: [] };
        var title = state.screen === "create" ? "새 글" : "글 수정";
        return (
            this._header(title) +
            this._errors(state) +
            '<form class="editor" data-command="save">' +
            field("제목", "title", post.title) +
            field("작성자", "author", post.author) +
            field("날짜", "date", post.date) +
            '<label>본문<textarea name="content" rows="8">' +
            escapeHtml(post.content) +
            "</textarea></label>" +
            field("태그", "tags", (post.tags || []).join(", ")) +
            '<div class="actions">' +
            '<button type="button" data-command="cancel">' +
            icon(ICONS.back) +
            "취소</button>" +
            '<button type="submit">' +
            icon(ICONS.save) +
            "저장</button>" +
            "</div></form>"
        );
    };

    View.prototype._header = function (title) {
        return "<header><h1>" + icon(ICONS.list) + escapeHtml(title) + "</h1></header>";
    };

    View.prototype._notice = function (state) {
        return state.notice ? '<p class="notice">' + escapeHtml(state.notice) + "</p>" : "";
    };

    View.prototype._errors = function (state) {
        if (!state.errors || !state.errors.length) {
            return "";
        }
        return (
            '<ul class="errors">' +
            state.errors
                .map(function (error) {
                    return "<li>" + escapeHtml(error) + "</li>";
                })
                .join("") +
            "</ul>"
        );
    };

    View.prototype._pager = function (list) {
        var previous = list.page > 1 ? list.page - 1 : 1;
        var next = list.page < list.pageCount ? list.page + 1 : list.pageCount;
        return (
            '<div class="pager">' +
            '<button type="button" data-command="page" data-page="' +
            previous +
            '"' +
            (list.page <= 1 ? " disabled" : "") +
            ">" +
            icon(ICONS.back) +
            "이전</button>" +
            '<button type="button" data-command="page" data-page="' +
            next +
            '"' +
            (list.page >= list.pageCount ? " disabled" : "") +
            ">다음</button>" +
            "</div>"
        );
    };

    function field(label, name, value) {
        return (
            "<label>" +
            escapeHtml(label) +
            '<input name="' +
            name +
            '" value="' +
            escapeHtml(value || "") +
            '"></label>'
        );
    }

    function icon(className) {
        return '<i class="' + className + '" aria-hidden="true"></i> ';
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
