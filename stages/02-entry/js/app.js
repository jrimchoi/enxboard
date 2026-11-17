/*
 * 단계 2. 입구 화면의 연결. AMD 모듈 DS/ENXBoard/js/app.
 *
 * 화면이 주소를 부르지 않게, init이 Data.load와 fetchList만 호출하고 View.render에 넘긴다.
 *
 * 구현 전에 이 모듈에 두기로 정한 함수:
 * - App(root): Data와 View를 만든다.
 * - init(): JSON을 읽고 1쪽 목록을 연다.
 * - showList(): fetchList 결과로 render한다. 이 단계의 query는 항상 빈 문자열, page는 1.
 *
 * 나중에 추가할 함수:
 * - _onCommand(search, page, open, create, edit, delete, save, back, cancel)
 * - showDetail(id)
 */
define("DS/ENXBoard/js/app", ["DS/ENXBoard/js/data", "DS/ENXBoard/js/view"], function (Data, View) {
    var PAGE_SIZE = 5;

    function App(root) {
        this.root = root;
        this.data = new Data();
        this.view = new View(root);
        this.pageSize = PAGE_SIZE;
    }

    // 제품의 시작. 버튼보다 먼저 목록 데이터가 화면에 보이게 한다.
    App.prototype.init = function () {
        var self = this;
        return this.data.load("./data/posts.json").then(function () {
            return self.showList();
        }).catch(function (error) {
            self.root.textContent = error.message || "게시판을 시작하지 못했습니다.";
        });
    };

    // 입구 화면은 1쪽만 보여 준다. 검색어 상태는 다음 단계에서 생긴다.
    App.prototype.showList = function () {
        var self = this;
        return this.data.fetchList({
            page: 1,
            pageSize: this.pageSize,
            query: "",
        }).then(function (list) {
            self.view.render({ list: list });
        });
    };

    return App;
});
