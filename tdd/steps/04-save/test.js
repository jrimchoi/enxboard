/*
 * 저장 규칙. load에는 주소 대신 배열을 넘긴다.
 * 빈 제목 등록은 거절되고 건수는 그대로다.
 */
const checks = require("../../checks");

module.exports = function (ctx) {
    ctx.test(ctx.name + " 배열을 읽고 거절과 반영을 가른다", async function () {
        await checks.save(ctx.assert, ctx.load("DS/ENXBoard/js/data"));
    });
};
