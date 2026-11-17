/*
 * 단계 1. API가 목록을 자를 때 쓰는 계산. AMD 모듈 DS/ENXBoard/js/collection.
 *
 * 화면은 이 모듈을 직접 부르지 않는다. Data.fetchList가 getPage 결과를 JSON으로 돌려준다.
 * 검색 입력칸은 아직 없다. 검색 규칙은 화면보다 먼저 이 함수에 둔다.
 *
 * 구현 전에 이 모듈에 두기로 정한 함수:
 * - Collection(items): Post 배열로 목록을 만든다.
 * - add(post): 목록 끝에 한 건을 넣는다.
 * - remove(id): 빼낸 글. 없으면 null.
 * - findById(id): 글 또는 null.
 * - getPage(page, pageSize, query): 검색 뒤 날짜 내림차순으로 자른다.
 *   반환은 { items, page, pageSize, total, pageCount }. items는 toJSON 결과.
 *
 * 아직 만들지 않는 것: fetch, 화면, 버튼.
 */
define("DS/ENXBoard/js/collection", ["DS/ENXBoard/js/model"], function (Post) {
    function Collection(items) {
        this.items = (items || []).map(function (item) {
            return item instanceof Post ? item : new Post(item);
        });
    }

    // 등록이 검사를 통과한 뒤에만 Data가 호출한다.
    Collection.prototype.add = function (post) {
        var model = post instanceof Post ? post : new Post(post);
        this.items.push(model);
        return model;
    };

    // 삭제. 화면의 삭제 버튼은 나중 단계에서 이 결과를 쓴다.
    Collection.prototype.remove = function (id) {
        var index = this.items.findIndex(function (post) {
            return post.id === id;
        });
        if (index < 0) {
            return null;
        }
        return this.items.splice(index, 1)[0];
    };

    // 상세 화면이 생기기 전에, id로 한 건을 찾는 규칙을 고정한다.
    Collection.prototype.findById = function (id) {
        return (
            this.items.find(function (post) {
                return post.id === id;
            }) || null
        );
    };

    // 제목, 작성자, 본문, 태그를 한 문자열로 찾아 날짜가 최근인 글부터 자른다.
    // 0건이어도 pageCount는 1이다. 화면의 이전, 다음은 이 숫자를 그대로 쓴다.
    Collection.prototype.getPage = function (page, pageSize, query) {
        var size = pageSize > 0 ? pageSize : 5;
        var needle = String(query || "").trim().toLowerCase();
        var matched = this.items.filter(function (post) {
            if (!needle) {
                return true;
            }
            var haystack = [post.title, post.author, post.content, post.tags.join(" ")].join(" ").toLowerCase();
            return haystack.indexOf(needle) !== -1;
        });
        matched.sort(function (left, right) {
            if (left.date === right.date) {
                return right.id < left.id ? -1 : 1;
            }
            return right.date < left.date ? -1 : 1;
        });
        var total = matched.length;
        var pageCount = Math.max(1, Math.ceil(total / size));
        var current = Math.min(Math.max(page || 1, 1), pageCount);
        var start = (current - 1) * size;
        return {
            items: matched.slice(start, start + size).map(function (post) {
                return post.toJSON();
            }),
            page: current,
            pageSize: size,
            total: total,
            pageCount: pageCount,
        };
    };

    return Collection;
});
