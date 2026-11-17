/*
 * 단계 폴더의 테스트를 그 폴더의 모듈로 실행한다.
 * 06-production만 저장소 루트의 js/model.js, js/collection.js, js/data.js를 읽는다.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const stepsDir = path.join(__dirname, "steps");

function loaderFor(dir, names) {
    const cache = {};
    let started = false;

    function define(id, deps, factory) {
        if (typeof deps === "function") {
            factory = deps;
            deps = [];
        }
        cache[id] = { deps: deps || [], factory: factory, ready: false, value: undefined };
    }

    function ensure() {
        if (started) {
            return;
        }
        started = true;
        const files = names || fs.readdirSync(dir).filter(function (name) {
            return name.endsWith(".js");
        });
        const previous = global.define;
        global.define = define;
        try {
            files.forEach(function (name) {
                const filename = path.join(dir, name);
                vm.runInThisContext(fs.readFileSync(filename, "utf8"), { filename: filename });
            });
        } finally {
            if (previous) {
                global.define = previous;
            } else {
                delete global.define;
            }
        }
    }

    return function load(id) {
        ensure();
        function materialize(moduleId) {
            const mod = cache[moduleId];
            if (!mod) {
                throw new Error("모듈이 없다: " + moduleId);
            }
            if (mod.ready) {
                return mod.value;
            }
            mod.ready = true;
            mod.value = mod.factory.apply(null, mod.deps.map(materialize));
            return mod.value;
        }
        return materialize(id);
    };
}

fs.readdirSync(stepsDir)
    .filter(function (name) {
        return fs.statSync(path.join(stepsDir, name)).isDirectory();
    })
    .sort()
    .forEach(function (name) {
        const stepDir = path.join(stepsDir, name);
        const load = name === "06-production"
            ? loaderFor(path.join(root, "js"), ["model.js", "collection.js", "data.js"])
            : loaderFor(path.join(stepDir, "js"));
        require(path.join(stepDir, "test.js"))({ test: test, assert: assert, load: load, name: name });
    });
