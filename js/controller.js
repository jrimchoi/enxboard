/*
 * React·Vue가 같이 쓰는 명령 컨트롤러다. AMD 모듈 DS/ENXBoard/js/controller.
 *
 * ENXBoard의 js/app.js는 같은 명령표를 자체 App에 두고 이 모듈을 부르지 않는다.
 * 그 App은 View.render를 직접 호출한다. 이 모듈은 paint 콜백만 받는다.
 * ENXBoardReact는 그 콜백에서 createRoot().render를 호출한다.
 * ENXBoardVue는 Vue.reactive 객체의 필드를 대입하고, Vue가 템플릿을 다시 그린다.
 * ENXBoardNext는 이 파일을 import하지 않는다. Next 빌드는 이 AMD 로더를 실행하지 않아서
 * lib/controller.js에 같은 분기를 ES 모듈로 두었다.
 *
 * init은 widget.js로 onLoad, onRefresh, onSearch를 구독한다.
 * 순수 ENXBoard 진입(index.html → js/app.js)에는 그 구독이 없다.
 * 검색어는 widget.setValue("query")에 남겨 다음 onLoad에서 복원한다.
 */
define("DS/ENXBoard/js/controller", ["DS/ENXBoard/js/data", "DS/ENXBoard/js/widget"], function (Data, WidgetBridge) {
    var PAGE_SIZE = 5;

    function createController(options) {
        var self = {
            root: options.root,
            title: options.title || "ENXBoard",
            appId: options.appId || "ENXBoard",
            postsUrl: options.postsUrl || "./data/posts.json",
            data: new Data(),
            screen: "list",
            query: "",
            page: 1,
            pageSize: PAGE_SIZE,
            post: null,
            list: null,
            errors: [],
            notice: "",
            widget: options.widget || null,
            paint: options.paint || function () {},
            started: false,
            ready: null,
            refreshTimer: 0,
        };

        function snapshot() {
            return {
                screen: self.screen,
                query: self.query,
                list: self.list,
                post: self.post,
                errors: self.errors.slice(),
                notice: self.notice,
            };
        }

        function paint() {
            self.paint(snapshot());
        }

        function normalizeFields(fields) {
            var source = fields || {};
            var tags = Array.isArray(source.tags) ? source.tags : String(source.tags || "").split(",");
            return {
                title: source.title,
                author: source.author,
                date: source.date,
                content: source.content,
                tags: tags
                    .map(function (tag) {
                        return String(tag).trim();
                    })
                    .filter(Boolean),
            };
        }

        self.showList = function () {
            return self.data
                .fetchList({
                    page: self.page,
                    pageSize: self.pageSize,
                    query: self.query,
                })
                .then(function (list) {
                    self.screen = "list";
                    self.list = list;
                    self.page = list.page;
                    self.post = null;
                    self.errors = [];
                    paint();
                });
        };

        self.showDetail = function (id) {
            return self.data.fetchDetail(id).then(function (post) {
                self.screen = "detail";
                self.post = post;
                self.errors = [];
                paint();
            });
        };

        function showForm(screen, post) {
            self.screen = screen;
            self.post = post;
            paint();
        }

        self.handle = function (command, payload) {
            payload = payload || {};
            if (command === "search") {
                self.query = payload.query || "";
                self.page = 1;
                self.notice = "";
                if (self.widget && self.widget.setValue) {
                    self.widget.setValue("query", self.query);
                }
                self.showList();
                return;
            }
            if (command === "page") {
                self.page = payload.page;
                self.showList();
                return;
            }
            if (command === "open") {
                self.notice = "";
                self.showDetail(payload.id);
                return;
            }
            if (command === "create") {
                self.errors = [];
                self.notice = "";
                showForm("create", null);
                return;
            }
            if (command === "edit") {
                self.errors = [];
                self.showDetail(payload.id).then(function () {
                    showForm("edit", self.post);
                });
                return;
            }
            if (command === "delete") {
                if (!window.confirm("이 글을 삭제할까요?")) {
                    return;
                }
                self.data.deletePost(payload.id).then(function () {
                    self.notice = "글을 삭제했습니다.";
                    self.page = 1;
                    return self.showList();
                });
                return;
            }
            if (command === "save") {
                var fields = normalizeFields(payload.fields);
                var editingId = self.post && self.post.id;
                var saving = self.screen === "create" ? self.data.createPost(fields) : self.data.updatePost(editingId, fields);
                saving
                    .then(function (post) {
                        self.notice = self.screen === "create" ? "글을 등록했습니다." : "글을 수정했습니다.";
                        self.errors = [];
                        return self.showDetail(post.id);
                    })
                    .catch(function (reason) {
                        self.errors = reason && reason.errors ? reason.errors : [(reason && reason.message) || "저장하지 못했습니다."];
                        self.post = Object.assign({ id: editingId || "" }, fields);
                        paint();
                    });
                return;
            }
            if (command === "back" || command === "cancel") {
                self.errors = [];
                if (command === "cancel" && self.screen === "edit" && self.post && self.post.id) {
                    self.showDetail(self.post.id);
                    return;
                }
                self.showList();
            }
        };

        function start() {
            if (self.started) {
                return self.ready || Promise.resolve();
            }
            self.started = true;
            if (self.widget && self.widget.setValue) {
                self.widget.setValue("tenantAware", true);
            }
            if (self.widget && self.widget.setTitle) {
                self.widget.setTitle(self.title);
            }
            self.ready = self.data
                .load(self.postsUrl)
                .then(function () {
                    var saved = self.widget && self.widget.getValue && self.widget.getValue("query");
                    if (typeof saved === "string") {
                        self.query = saved;
                    }
                    return self.showList();
                })
                .catch(function (error) {
                    if (self.root) {
                        self.root.textContent = (error && error.message) || "게시판을 시작하지 못했습니다.";
                    }
                });
            return self.ready;
        }

        self.onLoad = function () {
            return start();
        };

        self.onRefresh = function () {
            if (!self.ready) {
                return;
            }
            window.clearTimeout(self.refreshTimer);
            self.refreshTimer = window.setTimeout(function () {
                self.showList();
            }, 1000);
        };

        self.onSearch = function (data) {
            var query = "";
            if (typeof data === "string") {
                query = data;
            } else if (data && typeof data.query === "string") {
                query = data.query;
            } else if (data && typeof data.searchQuery === "string") {
                query = data.searchQuery;
            }
            self.handle("search", { query: query });
        };

        self.init = function () {
            self.widget = WidgetBridge.bind(self, self.widget);
            return start();
        };

        return self;
    }

    return createController;
});
