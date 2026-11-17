/*
 * 단계 10. 대시보드 연결. AMD 모듈 DS/ENXBoard/js/widget.
 *
 * 목록, 저장, 그리드가 된 뒤에 만든다. 화면 명령과 데이터 함수는 바꾸지 않는다.
 *
 * 구현 전에 정한 함수:
 * - resolveWidget(explicit): addEvent가 있는 widget을 인자, window, parent 순으로 찾는다.
 * - bind(app): onLoad, onRefresh, onSearch를 app.onLoad, app.onRefresh, app.onSearch로 넘긴다.
 *
 * 앱에 이번 단계에 더하는 함수:
 * - onLoad: init과 같다. JSON을 다시 읽어도 같은 id가 두 줄이 되면 안 된다.
 * - onRefresh: 메모리 목록과 검색어를 유지한 채 showList만 다시 호출한다.
 * - onSearch: 검색 명령과 같다. 검색어를 저장하고 1쪽을 연다.
 */
define("DS/ENXBoard/js/widget", [], function () {
    function resolveWidget(explicit) {
        if (explicit && typeof explicit.addEvent === "function") {
            return explicit;
        }
        if (typeof window !== "undefined" && window.widget && typeof window.widget.addEvent === "function") {
            return window.widget;
        }
        try {
            if (window.parent && window.parent !== window && window.parent.widget && typeof window.parent.widget.addEvent === "function") {
                return window.parent.widget;
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    function bind(app, explicit) {
        var widget = resolveWidget(explicit);
        function dispatch(type, data) {
            if (type === "onLoad" && app.onLoad) {
                app.onLoad(data || {});
            } else if (type === "onRefresh" && app.onRefresh) {
                app.onRefresh(data || {});
            } else if (type === "onSearch" && app.onSearch) {
                app.onSearch(data);
            } else if (type === "setTitle" && widget && widget.setTitle) {
                var title = data && data.title ? data.title : data;
                if (title) {
                    widget.setTitle(title);
                }
            }
        }

        if (widget && widget.addEvent && !widget.__enxBoardBound) {
            widget.__enxBoardBound = true;
            widget.addEvent("onLoad", function (data) {
                app.onLoad(data || {});
            });
            widget.addEvent("onRefresh", function (data) {
                app.onRefresh(data || {});
            });
            widget.addEvent("onSearch", function (data) {
                app.onSearch(data);
            });
        }

        var queued = [];
        if (typeof window.__enxTakeWidgetQueue === "function") {
            queued = window.__enxTakeWidgetQueue(function (payload) {
                if (!widget || !widget.addEvent) {
                    dispatch(payload.type, payload.data);
                }
            });
        }
        queued.forEach(function (payload) {
            dispatch(payload.type, payload.data);
        });
        return widget;
    }

    return { resolveWidget: resolveWidget, bind: bind };
});
