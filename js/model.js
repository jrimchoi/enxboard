/*
 * 글 한 건이다. AMD 모듈 DS/ENXBoard/js/model. 의존이 없다.
 *
 * validate는 제목·작성자·본문을 필수로 보고, 날짜는 비우거나 YYYY-MM-DD만 허용한다.
 * toJSON은 화면과 검색이 쓰는 평범한 객체다. 프레임워크 컴포넌트가 아니다.
 *
 * React에 넘기는 state, Vue reactive에 복사하는 값, Next useState에 넣는 값은 이 toJSON 결과다.
 * ENXBoardNext/lib/data.js의 Post는 이 생성자와 같은 필드와 같은 검사를 갖는다.
 */
define("DS/ENXBoard/js/model", [], function () {
    function Post(raw) {
        var source = raw || {};
        this.id = source.id || "";
        this.title = source.title || "";
        this.author = source.author || "";
        this.date = source.date || "";
        this.content = source.content || "";
        this.tags = Array.isArray(source.tags) ? source.tags.slice() : [];
    }

    Post.prototype.validate = function () {
        var errors = [];
        if (!String(this.title).trim()) {
            errors.push("제목을 입력하세요.");
        }
        if (!String(this.author).trim()) {
            errors.push("작성자를 입력하세요.");
        }
        if (!String(this.content).trim()) {
            errors.push("본문을 입력하세요.");
        }
        if (this.date && !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
            errors.push("날짜는 YYYY-MM-DD 형식입니다.");
        }
        return { ok: errors.length === 0, errors: errors };
    };

    Post.prototype.toJSON = function () {
        return {
            id: this.id,
            title: String(this.title).trim(),
            author: String(this.author).trim(),
            date: this.date,
            content: String(this.content).trim(),
            tags: this.tags.map(function (tag) {
                return String(tag).trim();
            }).filter(Boolean),
        };
    };

    return Post;
});
