/*
 * 단계 4. 상세 화면. AMD 모듈 DS/ENXBoard/js/app.
 *
 * 제목 클릭은 명령 open이고, App이 fetchDetail을 호출한다.
 *
 * 이번 단계에 더하는 함수:
 * - showDetail(id): 상세 JSON을 받아 screen을 detail로 둔다.
 * - _onCommand의 open, back.
 *
 * 아직 없는 명령: create, edit, delete, save, cancel.
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
        this.list = null;
        this.post = null;
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
            self._paint();
        });
    };

    // 상세는 목록과 다른 화면이다. 데이터는 fetchDetail 한 건이다.
    App.prototype.showDetail = function (id) {
        var self = this;
        return this.data.fetchDetail(id).then(function (post) {
            self.screen = "detail";
            self.post = post;
            self._paint();
        });
    };

    App.prototype._paint = function () {
        this.view.render({
            screen: this.screen,
            query: this.query,
            list: this.list,
            post: this.post,
        });
    };

    App.prototype._onCommand = function (command, payload) {
        if (command === "search") {
            this.query = payload.query || "";
            this.page = 1;
            this.showList();
            return;
        }
        if (command === "page") {
            this.page = payload.page;
            this.showList();
            return;
        }
        if (command === "open") {
            this.showDetail(payload.id);
            return;
        }
        if (command === "back") {
            this.showList();
        }
    };

    return App;
});
