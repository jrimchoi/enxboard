/*
 * 단계 6. 공통 로더를 붙여도 함수는 단계 5와 같다.
 * init, showList, showDetail, _onCommand와 명령 create, edit, save, delete, cancel은 그대로다.
 * DataGridView는 이 모듈의 define에 넣지 않는다. 표 교체는 다음 단계다.
 */
define("DS/ENXBoard/js/app", ["DS/ENXBoard/js/data", "DS/ENXBoard/js/view"], function (Data, View) {
    var PAGE_SIZE = 5;

    function App(root) {
        this.root = root;
        this.data = new Data();
        this.view = new View(root, this._onCommand.bind(this));
        this.screen = "list";
        this.query = "";
        this.page = 1;
        this.pageSize = PAGE_SIZE;
        this.post = null;
        this.list = null;
        this.errors = [];
        this.notice = "";
    }

    App.prototype.init = function () {
        var self = this;
        return this.data.load("./data/posts.json").then(function () {
            return self.showList();
        }).catch(function (error) {
            self.root.textContent = error.message || "게시판을 시작하지 못했습니다.";
        });
    };

    App.prototype.showList = function () {
        var self = this;
        return this.data.fetchList({
            page: this.page,
            pageSize: this.pageSize,
            query: this.query,
        }).then(function (list) {
            self.screen = "list";
            self.list = list;
            self.page = list.page;
            self.post = null;
            self.errors = [];
            self._paint();
        });
    };

    App.prototype.showDetail = function (id) {
        var self = this;
        return this.data.fetchDetail(id).then(function (post) {
            self.screen = "detail";
            self.post = post;
            self.errors = [];
            self._paint();
        });
    };

    App.prototype._showForm = function (screen, post) {
        this.screen = screen;
        this.post = post;
        this._paint();
    };

    App.prototype._onCommand = function (command, payload) {
        var self = this;
        if (command === "search") {
            this.query = payload.query || "";
            this.page = 1;
            this.notice = "";
            this.showList();
            return;
        }
        if (command === "page") {
            this.page = payload.page;
            this.showList();
            return;
        }
        if (command === "open") {
            this.notice = "";
            this.showDetail(payload.id);
            return;
        }
        if (command === "create") {
            this.errors = [];
            this.notice = "";
            this._showForm("create", null);
            return;
        }
        if (command === "edit") {
            this.errors = [];
            this.showDetail(payload.id).then(function () {
                self._showForm("edit", self.post);
            });
            return;
        }
        if (command === "delete") {
            if (!window.confirm("이 글을 삭제할까요?")) {
                return;
            }
            this.data.deletePost(payload.id).then(function () {
                self.notice = "글을 삭제했습니다.";
                self.page = 1;
                return self.showList();
            });
            return;
        }
        if (command === "save") {
            var fields = normalizeFields(payload.fields);
            var editingId = this.post && this.post.id;
            var saving = this.screen === "create"
                ? this.data.createPost(fields)
                : this.data.updatePost(editingId, fields);
            saving.then(function (post) {
                self.notice = self.screen === "create" ? "글을 등록했습니다." : "글을 수정했습니다.";
                self.errors = [];
                return self.showDetail(post.id);
            }).catch(function (reason) {
                self.errors = reason && reason.errors ? reason.errors : [reason.message || "저장하지 못했습니다."];
                self.post = Object.assign({ id: editingId || "" }, fields);
                self._paint();
            });
            return;
        }
        if (command === "back" || command === "cancel") {
            this.errors = [];
            if (command === "cancel" && this.screen === "edit" && this.post && this.post.id) {
                this.showDetail(this.post.id);
                return;
            }
            this.showList();
        }
    };

    App.prototype._paint = function () {
        this.view.render({
            screen: this.screen,
            query: this.query,
            list: this.list,
            post: this.post,
            errors: this.errors,
            notice: this.notice,
        });
    };

    function normalizeFields(fields) {
        var tags = Array.isArray(fields.tags) ? fields.tags : String(fields.tags || "").split(",");
        return {
            title: fields.title,
            author: fields.author,
            date: fields.date,
            content: fields.content,
            tags: tags.map(function (tag) {
                return String(tag).trim();
            }).filter(Boolean),
        };
    }

    return App;
});
