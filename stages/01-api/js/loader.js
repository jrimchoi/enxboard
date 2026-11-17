/*
 * 이 단계 페이지가 DS/ENXBoard 모듈만 읽게 하는 로더다.
 * 제품의 공통 로더는 화면 흐름이 끝난 뒤 AmdLoader로 바꾼다.
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
            throw new Error("모듈을 읽지 못했습니다: " + id);
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
