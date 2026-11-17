/*
 * 여기가 파일을 읽는 첫 테스트다.
 * 실제 posts.json 대신, 테스트가 fetch 응답으로 2건을 돌려준다.
 */
const checks = require("../../checks");

module.exports = function (ctx) {
    ctx.test(ctx.name + " load는 주소로 fetch한다", async function () {
        await checks.fetchJson(ctx.assert, ctx.load("DS/ENXBoard/js/data"));
    });
};
