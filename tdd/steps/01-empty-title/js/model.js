/*
 * 첫 테스트만 통과하는 글이다. 빈 제목을 거절한다.
 * 작성자, 본문, 날짜는 다음 테스트가 생기기 전에는 검사하지 않는다.
 */
define("DS/ENXBoard/js/model", [], function () {
    function Post(raw) {
        var source = raw || {};
        this.title = source.title || "";
        this.author = source.author || "";
        this.content = source.content || "";
    }

    Post.prototype.validate = function () {
        var errors = [];
        if (!String(this.title).trim()) {
            errors.push("제목을 입력하세요.");
        }
        return { ok: errors.length === 0, errors: errors };
    };

    return Post;
});
