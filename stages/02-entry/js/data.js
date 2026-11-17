/*
 * 단계 1. API. AMD 모듈 DS/ENXBoard/js/data.
 *
 * 데이터 형식을 고정한 다음에 만든다. 화면은 주소와 fetch를 모르고 아래 함수 이름만 부른다.
 * 서버가 없으면 load에 배열을 넘기거나 posts.json을 목 응답으로 읽는다.
 * 이 단계 페이지는 제품 화면이 아니다. 함수를 직접 호출해 반환 형식만 확인한다.
 *
 * 구현 전에 이 모듈에 두기로 정한 함수. 모두 Promise를 반환한다.
 * - load(source): 배열 또는 JSON 주소를 Collection에 넣고 건수를 반환한다.
 * - fetchList({ page, pageSize, query }): getPage 결과.
 * - fetchDetail(id): 글 하나. 없으면 reject.
 * - createPost(raw): validate를 통과한 뒤에만 추가한다. 실패 값은 { ok: false, errors }.
 * - updatePost(id, raw): 검사를 통과한 뒤에만 기존 글에 반영한다.
 * - deletePost(id): 제거한 글의 JSON.
 *
 * 화면이 나중에 부를 이름도 이 목록과 같다. 등록 버튼을 만들기 전에 거절 규칙을 여기서 확인한다.
 */
define("DS/ENXBoard/js/data", ["DS/ENXBoard/js/collection", "DS/ENXBoard/js/model"], function (Collection, Post) {
    function Data() {
        this.collection = new Collection([]);
        this.ready = false;
    }

    // 배열이면 그대로 쓰고, 주소면 fetch한다. 화면은 둘 중 어느 쪽인지 구분하지 않는다.
    Data.prototype.load = function (source) {
        var self = this;
        var incoming = Array.isArray(source)
            ? Promise.resolve(source)
            : fetch(source || "./data/posts.json").then(function (response) {
                  if (!response.ok) {
                      throw new Error("목 데이터를 읽지 못했습니다.");
                  }
                  return response.json();
              });
        return incoming.then(function (rows) {
            self.collection = new Collection(rows);
            self.ready = true;
            return self.collection.items.length;
        });
    };

    // 입구 화면이 가장 먼저 부를 함수다. 반환 items는 Post.toJSON 배열이다.
    Data.prototype.fetchList = function (options) {
        var query = options || {};
        return Promise.resolve(this.collection.getPage(query.page, query.pageSize, query.query));
    };

    // 상세 화면이 생길 때 부를 함수다. 이 단계에서는 호출 결과만 표로 본다.
    Data.prototype.fetchDetail = function (id) {
        var post = this.collection.findById(id);
        if (!post) {
            return Promise.reject(new Error("글을 찾지 못했습니다."));
        }
        return Promise.resolve(post.toJSON());
    };

    // 빈 제목이면 목록 건수가 늘지 않아야 한다. 화면의 오류 문구는 errors를 그대로 쓴다.
    Data.prototype.createPost = function (raw) {
        var post = new Post(raw);
        post.id = this._nextId();
        if (!post.date) {
            post.date = new Date().toISOString().slice(0, 10);
        }
        var check = post.validate();
        if (!check.ok) {
            return Promise.reject(check);
        }
        this.collection.add(post);
        return Promise.resolve(post.toJSON());
    };

    // 검사에 실패한 수정은 기존 제목을 남겨 둔다.
    Data.prototype.updatePost = function (id, raw) {
        var current = this.collection.findById(id);
        if (!current) {
            return Promise.reject(new Error("글을 찾지 못했습니다."));
        }
        var next = new Post({
            id: current.id,
            title: raw.title,
            author: raw.author,
            date: raw.date,
            content: raw.content,
            tags: Array.isArray(raw.tags) ? raw.tags : [],
        });
        var check = next.validate();
        if (!check.ok) {
            return Promise.reject(check);
        }
        current.title = next.title;
        current.author = next.author;
        current.date = next.date;
        current.content = next.content;
        current.tags = next.tags;
        return Promise.resolve(current.toJSON());
    };

    Data.prototype.deletePost = function (id) {
        var removed = this.collection.remove(id);
        if (!removed) {
            return Promise.reject(new Error("글을 찾지 못했습니다."));
        }
        return Promise.resolve(removed.toJSON());
    };

    // 설계서의 id 형식. p와 두 자리 번호.
    Data.prototype._nextId = function () {
        var max = this.collection.items.reduce(function (highest, post) {
            var number = parseInt(String(post.id).replace(/\D/g, ""), 10);
            return Number.isFinite(number) ? Math.max(highest, number) : highest;
        }, 0);
        var next = String(max + 1);
        return "p" + next.padStart(2, "0");
    };

    return Data;
});
