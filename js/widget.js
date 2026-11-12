/*
 * 3D Dashboard 위젯 다리다. AMD 모듈 DS/ENXBoard/js/widget.
 *
 * window.widget 또는 parent.widget의 onLoad, onRefresh, onSearch를 앱 메서드로 연결한다.
 * 부모가 postMessage로 먼저 보낸 이벤트는 __enxTakeWidgetQueue에 쌓였다가 bind할 때 비운다.
 * React·Vue의 index.html과 Next의 pages/_document.js가 그 큐를 만든다.
 * ENXBoard의 index.html은 큐도, 이 모듈 호출도 없다. js/app.js가 위젯을 보지 않기 때문이다.
 *
 * ENXBoardNext/lib/widget.js는 같은 연결을 export function bindWidget으로 둔다.
 * 이 파일의 AMD 반환 { resolveWidget, bind }와 달리 바깥으로 나가는 함수는 bind 하나다.
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
