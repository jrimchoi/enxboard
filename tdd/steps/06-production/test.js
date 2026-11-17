/*
 * 앞 단계의 검사를 저장소 루트 js/에 그대로 적용한다.
 * 화면, 그리드, 위젯 이벤트는 이 실행에 없다. 그 확인은 stages/ 2단계부터다.
 */
const checks = require("../../checks");

module.exports = function (ctx) {
    ctx.test(ctx.name + " 루트 모듈이 같은 규칙을 지킨다", async function () {
        var Post = ctx.load("DS/ENXBoard/js/model");
        var Collection = ctx.load("DS/ENXBoard/js/collection");
        var Data = ctx.load("DS/ENXBoard/js/data");
        checks.emptyTitle(ctx.assert, Post);
        checks.fields(ctx.assert, Post);
        checks.pageSearch(ctx.assert, Collection);
        await checks.save(ctx.assert, Data);
        await checks.fetchJson(ctx.assert, Data);
    });
};
