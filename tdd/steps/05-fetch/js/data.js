/*
 * 글 저장소다. AMD 모듈 DS/ENXBoard/js/data. Collection과 Post만 의존한다.
 *
 * load는 posts.json을 fetch하거나 배열을 받아 메모리 Collection으로 바꾼다.
 * 등록·수정·삭제는 그 메모리만 고친다. 서버로 다시 쓰지 않는다. 네 앱의 계약이 같다.
 *
 * ENXBoardReact·ENXBoardVue는 이 모듈 ID를 require한다.
 * ENXBoardNext는 lib/data.js에 Post, Collection, Data를 한 파일의 ES export로 다시 둔다.
 * 메서드 이름과 Promise 반환은 같고, 모듈을 읽는 방식만 다르다.
 */
define("DS/ENXBoard/js/data", ["DS/ENXBoard/js/collection", "DS/ENXBoard/js/model"], function (Collection, Post) {
    function Data() {
        this.collection = new Collection([]);
        this.ready = false;
    }

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

    Data.prototype.fetchList = function (options) {
        var query = options || {};
        return Promise.resolve(this.collection.getPage(query.page, query.pageSize, query.query));
    };

    Data.prototype.fetchDetail = function (id) {
        var post = this.collection.findById(id);
        if (!post) {
            return Promise.reject(new Error("글을 찾지 못했습니다."));
        }
        return Promise.resolve(post.toJSON());
    };

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
