/*
 * 단계 0. 데이터 형식. AMD 모듈 DS/ENXBoard/js/model.
 *
 * 설계서에 API, 화면, 데이터 형식이 있으면 화면과 주소 호출보다 먼저 형식을 코드로 고정한다.
 * 화면과 API가 같은 필드 이름을 쓰게 하려는 것이다.
 * 이 페이지의 HTML은 제품 화면이 아니다. 형식 검사를 보여 주는 개발용 페이지다.
 *
 * 구현 전에 이 모듈에 두기로 정한 함수:
 * - Post(raw): 설계서 필드로 글 하나를 만든다. 빠진 문자열은 빈 값, 태그는 빈 배열.
 * - validate(): { ok, errors }. 제목, 작성자, 본문은 필수. 날짜는 비우거나 YYYY-MM-DD.
 * - toJSON(): 앞뒤 공백을 뺀 { id, title, author, date, content, tags }.
 *
 * 아직 만들지 않는 함수:
 * - 목록의 검색과 쪽 나누기. 다음 단계 Collection.
 * - load, fetchList, fetchDetail, createPost. 그다음 단계 Data.
 * - render. 입구 화면은 API 함수가 예시 데이터를 돌려준 뒤.
 */
define("DS/ENXBoard/js/model", [], function () {
    // 필드 이름을 한곳에 모은다. 이후 API 응답과 화면 state는 이 모양만 쓴다.
    function Post(raw) {
        var source = raw || {};
        this.id = source.id || "";
        this.title = source.title || "";
        this.author = source.author || "";
        this.date = source.date || "";
        this.content = source.content || "";
        this.tags = Array.isArray(source.tags) ? source.tags.slice() : [];
    }

    // 저장하기 전에 거절할 값을 정한다. 문구는 나중에 입력 화면이 그대로 보여 준다.
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

    // 화면과 검색이 읽는 평범한 객체다. 컴포넌트나 DOM을 만들지 않는다.
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
