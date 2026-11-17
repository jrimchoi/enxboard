/*
 * 두 번째 묶음. 공백 제거, 작성자, 본문, 날짜를 한 규칙씩 더한다.
 * 01의 빈 제목 테스트도 이 단계 코드로 다시 통과해야 한다.
 */
const checks = require("../../checks");

module.exports = function (ctx) {
    ctx.test(ctx.name + " 빈 제목은 저장할 수 없다", function () {
        checks.emptyTitle(ctx.assert, ctx.load("DS/ENXBoard/js/model"));
    });
    ctx.test(ctx.name + " 공백과 날짜와 필수 칸", function () {
        checks.fields(ctx.assert, ctx.load("DS/ENXBoard/js/model"));
    });
};
