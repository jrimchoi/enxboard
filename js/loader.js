/*
 * 이 페이지 전용 AMD 로더다. require.js가 없고, DS/ENXBoard/ 만 이 폴더의 상대 경로로 바꾼다.
 *
 * define은 반드시 모듈 ID를 받는다. React·Vue 로더와 달리 익명 define을 받지 않는다.
 * 그 두 로더는 react, react-dom, vue UMD가 이름 없는 define을 호출하므로 스크립트를 한 개씩 넣고
 * 지금 읽는 파일의 ID를 붙인다. Next에는 이런 런타임 로더가 없다. import는 빌드할 때 webpack이 묶는다.
 *
 * 스크립트 주소는 이 파일이 아니라 index.html 문서 기준이다.
 */
(function (global) {
    var defined = {};
    var pending = {};
    var loading = {};
    var jobs = [];

    function urlFor(id) {
        var prefix = "DS/ENXBoard/";
        if (id.indexOf(prefix) !== 0) {
            throw new Error("이 로더는 DS/ENXBoard 모듈만 읽습니다: " + id);
        }
        return "./" + id.slice(prefix.length) + ".js";
    }

    function depsReady(deps) {
        return deps.every(function (id) {
            return Object.prototype.hasOwnProperty.call(defined, id);
        });
    }

    function values(deps) {
        return deps.map(function (id) {
            return defined[id];
        });
    }

    function load(id) {
        if (Object.prototype.hasOwnProperty.call(defined, id) || pending[id] || loading[id]) {
            return;
        }
        loading[id] = true;
        var script = document.createElement("script");
        script.async = false;
        script.src = urlFor(id);
        script.onerror = function () {
            var root = document.getElementById("board");
            var message = "모듈을 읽지 못했습니다: " + id;
            if (root) {
                root.textContent = message;
            }
            throw new Error(message);
        };
        document.head.appendChild(script);
    }

    function settle() {
        var moved = true;
        while (moved) {
            moved = false;
            Object.keys(pending).forEach(function (id) {
                var mod = pending[id];
                if (!mod || !depsReady(mod.deps)) {
                    if (mod) {
                        mod.deps.forEach(load);
                    }
                    return;
                }
                defined[id] = mod.factory.apply(null, values(mod.deps));
                delete pending[id];
                moved = true;
            });
        }
        jobs = jobs.filter(function (job) {
            if (!depsReady(job.deps)) {
                return true;
            }
            job.callback.apply(null, values(job.deps));
            return false;
        });
    }

    function define(id, deps, factory) {
        if (typeof id !== "string") {
            throw new Error("모듈 ID가 필요합니다.");
        }
        if (typeof deps === "function") {
            factory = deps;
            deps = [];
        }
        pending[id] = { deps: deps || [], factory: factory };
        settle();
    }

    define.amd = { ENXBoard: true };

    function require(deps, callback) {
        if (typeof deps === "string") {
            deps = [deps];
        }
        jobs.push({ deps: deps, callback: callback });
        deps.forEach(load);
        settle();
    }

    global.define = define;
    global.require = require;
})(window);
