/*
 * 목록 규칙. 테스트가 6건 배열을 직접 넘긴다. fetch는 아직 없다.
 */
const checks = require("../../checks");

module.exports = function (ctx) {
    ctx.test(ctx.name + " 쪽과 검색", function () {
        checks.pageSearch(ctx.assert, ctx.load("DS/ENXBoard/js/collection"));
    });
};
