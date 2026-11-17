/*
 * 첫 테스트. posts.json도, 화면도 없다.
 * 이 파일이 실패하는 것을 본 뒤에 js/model.js를 만든다.
 */
const checks = require("../../checks");

module.exports = function (ctx) {
    ctx.test(ctx.name + " 빈 제목은 저장할 수 없다", function () {
        checks.emptyTitle(ctx.assert, ctx.load("DS/ENXBoard/js/model"));
    });
};
