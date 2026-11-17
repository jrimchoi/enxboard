/*
 * 단계 3. 검색 명령을 API에 연결한다. AMD 모듈 DS/ENXBoard/js/app.
 *
 * 화면이 올린 명령 이름만 보고 fetchList의 query와 page를 바꾼다.
 *
 * 이번 단계에 더하는 함수:
 * - _onCommand(command, payload): search와 page만 처리한다.
 *
 * 이미 있는 함수: init, showList.
 * 아직 없는 함수: showDetail. open 명령도 아직 받지 않는다.
 */
define("DS/ENXBoard/js/app", ["DS/ENXBoard/js/data", "DS/ENXBoard/js/view"], function (Data, View) {
    var PAGE_SIZE = 5;

    function App(root) {
        this.root = root;
        this.data = new Data();
        this.view = new View(root, this._onCommand.bind(this));
        this.query = "";
        this.page = 1;
        this.pageSize = PAGE_SIZE;
        this.list = null;
    }

    App.prototype.init = function () {
        var self = this;
        return this.data.load("./data/posts.json").then(function () {
            return self.showList();
        }).catch(function (error) {
            self.root.textContent = error.message || "게시판을 시작하지 못했습니다.";
        });
    };

    // 검색어와 쪽 번호는 App이 갖고, Data는 그 인자만 받는다.
    App.prototype.showList = function () {
        var self = this;
        return this.data.fetchList({
            page: this.page,
            pageSize: this.pageSize,
            query: this.query,
        }).then(function (list) {
            self.list = list;
            self.page = list.page;
            self.view.render({ query: self.query, list: list });
        });
    };

    // 검색하면 1쪽으로 돌아간다. 결과 건수는 fetchList가 센다.
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
        }
    };

    return App;
});
