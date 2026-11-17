/*
 * 글 목록이다. AMD 모듈 DS/ENXBoard/js/collection. Post만 의존한다.
 *
 * getPage는 제목·작성자·본문·태그를 대소문자 없이 거르고, 날짜 내림차순 뒤 id로 한 번 더 정렬해 자른다.
 * 쪽 크기 기본은 5다. 0건이어도 pageCount는 1이다. 화면 프레임워크와 무관한 계산이다.
 *
 * ENXBoard의 App, 공유 controller, ENXBoardNext/lib/data.js의 Collection이 같은 규칙을 쓴다.
 * React·Vue는 이 모듈을 직접 그리지 않고 Data.fetchList가 돌려주는 JSON만 받는다.
 */
define("DS/ENXBoard/js/collection", ["DS/ENXBoard/js/model"], function (Post) {
    function Collection(items) {
        this.items = (items || []).map(function (item) {
            return item instanceof Post ? item : new Post(item);
        });
    }

    Collection.prototype.add = function (post) {
        var model = post instanceof Post ? post : new Post(post);
        this.items.push(model);
        return model;
    };

    Collection.prototype.remove = function (id) {
        var index = this.items.findIndex(function (post) {
            return post.id === id;
        });
        if (index < 0) {
            return null;
        }
        return this.items.splice(index, 1)[0];
    };

    Collection.prototype.findById = function (id) {
        return (
            this.items.find(function (post) {
                return post.id === id;
            }) || null
        );
    };

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
