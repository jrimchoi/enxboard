/*
 * 테스트가 들고 있는 글이다. posts.json을 읽지 않는다.
 * 6건이면 쪽 크기 5에서 2쪽, 김하준은 2건, 가장 최근은 p06이다.
 */
function rows() {
    return [
        { id: "p01", title: "환영 패널", author: "김하준", date: "2026-03-02", content: "가", tags: ["보안"] },
        { id: "p02", title: "기본 보기", author: "박서연", date: "2026-03-04", content: "나", tags: ["보기"] },
        { id: "p03", title: "저장한 루트", author: "김하준", date: "2026-03-06", content: "다", tags: ["저장"] },
        { id: "p04", title: "새로고침", author: "이도윤", date: "2026-03-08", content: "라", tags: [] },
        { id: "p05", title: "명령", author: "최민재", date: "2026-03-11", content: "마", tags: [] },
        { id: "p06", title: "보안 컨텍스트", author: "정하늘", date: "2026-03-14", content: "바", tags: ["보안"] },
    ];
}

function emptyTitle(assert, Post) {
    var result = new Post({ title: "", author: "나", content: "다" }).validate();
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
}

function fields(assert, Post) {
    assert.equal(new Post({ title: "  가  ", author: "나", content: "다" }).toJSON().title, "가");
    assert.equal(new Post({ title: "가", author: "", content: "다" }).validate().ok, false);
    assert.equal(new Post({ title: "가", author: "나", content: "" }).validate().ok, false);
    assert.equal(new Post({ title: "가", author: "나", content: "다", date: "2026/3/1" }).validate().ok, false);
    assert.equal(new Post({ title: "가", author: "나", content: "다", date: "" }).validate().ok, true);
    assert.deepEqual(new Post({ title: "가", author: "나", content: "다", tags: [" a ", ""] }).toJSON().tags, ["a"]);
}

function pageSearch(assert, Collection) {
    var collection = new Collection(rows());
    var page1 = collection.getPage(1, 5, "");
    var page2 = collection.getPage(2, 5, "");
    var overflow = collection.getPage(9, 5, "");
    var kim = collection.getPage(1, 5, "김하준");
    var none = collection.getPage(1, 5, "없는말");
    assert.equal(page1.items.length, 5);
    assert.equal(page1.total, 6);
    assert.equal(page1.pageCount, 2);
    assert.equal(page1.items[0].id, "p06");
    assert.equal(page2.items.length, 1);
    assert.equal(overflow.page, 2);
    assert.equal(kim.total, 2);
    assert.equal(none.items.length, 0);
    assert.equal(none.pageCount, 1);
    assert.equal(collection.findById("p01").title, "환영 패널");
    assert.equal(collection.findById("없는id"), null);
}

async function save(assert, Data) {
    var data = new Data();
    var count = await data.load(rows());
    assert.equal(count, 6);
    var listed = await data.fetchList({ page: 1, pageSize: 5, query: "김하준" });
    assert.equal(listed.total, 2);
    var detail = await data.fetchDetail("p01");
    assert.equal(detail.title, "환영 패널");
    await assert.rejects(data.createPost({ title: "", author: "나", content: "다" }), function (reason) {
        return reason && reason.ok === false && reason.errors.length > 0;
    });
    var afterReject = await data.fetchList({ page: 1, pageSize: 5, query: "" });
    assert.equal(afterReject.total, 6);
    var created = await data.createPost({ title: "새 글", author: "나", content: "다", date: "", tags: [" a ", ""] });
    assert.equal(created.id, "p07");
    assert.equal(created.date, new Date().toISOString().slice(0, 10));
    assert.deepEqual(created.tags, ["a"]);
    await assert.rejects(
        data.updatePost("p01", { title: "", author: "김하준", content: "가", date: "2026-03-02", tags: [] }),
        function (reason) {
            return reason && reason.ok === false;
        }
    );
    var kept = await data.fetchDetail("p01");
    assert.equal(kept.title, "환영 패널");
    await data.deletePost("p02");
    var afterDelete = await data.fetchList({ page: 1, pageSize: 5, query: "" });
    assert.equal(afterDelete.total, 6);
}

async function fetchJson(assert, Data) {
    var previous = global.fetch;
    global.fetch = function (url) {
        assert.equal(url, "./data/posts.json");
        return Promise.resolve({
            ok: true,
            json: function () {
                return Promise.resolve(rows().slice(0, 2));
            },
        });
    };
    try {
        var data = new Data();
        var count = await data.load("./data/posts.json");
        assert.equal(count, 2);
        var list = await data.fetchList({ page: 1, pageSize: 5, query: "" });
        assert.equal(list.total, 2);
    } finally {
        global.fetch = previous;
    }
}

module.exports = {
    emptyTitle: emptyTitle,
    fields: fields,
    pageSearch: pageSearch,
    save: save,
    fetchJson: fetchJson,
};
