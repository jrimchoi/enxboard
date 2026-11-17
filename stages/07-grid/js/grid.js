/*
 * 단계 7. 공통 표. AMD 모듈 DS/ENXBoard/js/grid.
 *
 * 화면 흐름이 끝난 뒤에 만든다. 이 페이지는 게시판 App 없이 두 건만 붙여 본다.
 * 공통 모듈 파일은 복사하지 않고 require만 한다.
 *
 * 구현 전에 정한 함수:
 * - attach(host, items, onOpen): 현재 쪽 items로 그리드를 만들고 제목 클릭에서 onOpen(id)를 부른다.
 * - 반환값 destroy(): 화면을 다시 그리기 전에 이전 그리드를 버린다.
 */
define("DS/ENXBoard/js/grid", [
    "DS/DataGridView/DataGridView",
    "DS/TreeModel/TreeDocument",
    "DS/TreeModel/TreeNodeModel",
], function (DataGridView, TreeDocument, TreeNodeModel) {
    function textOf(cell, name) {
        return cell.nodeModel.options.grid[name] || "";
    }

    function attach(host, items, onOpen) {
        var tree = new TreeDocument();
        (items || []).forEach(function (post) {
            tree.addRoot(new TreeNodeModel({
                label: post.title,
                grid: {
                    id: post.id,
                    author: post.author,
                    date: post.date,
                    tags: (post.tags || []).join(", "),
                },
            }));
        });

        var grid = new DataGridView({
            identifier: "enxboard-stage-grid",
            treeDocument: tree,
            columns: [
                {
                    text: "제목",
                    dataIndex: "tree",
                    typeRepresentation: "url",
                    getCellValue: function (cell) {
                        var id = cell.nodeModel.options.grid.id;
                        return {
                            label: cell.nodeModel.options.label,
                            func: function () {
                                onOpen(id);
                            },
                        };
                    },
                },
                {
                    text: "작성자",
                    dataIndex: "author",
                    getCellValue: function (cell) {
                        return textOf(cell, "author");
                    },
                },
                {
                    text: "날짜",
                    dataIndex: "date",
                    getCellValue: function (cell) {
                        return textOf(cell, "date");
                    },
                },
                {
                    text: "태그",
                    dataIndex: "tags",
                    getCellValue: function (cell) {
                        return textOf(cell, "tags");
                    },
                },
            ],
            defaultColumnDef: {
                editableFlag: false,
                sortableFlag: true,
                typeRepresentation: "string",
            },
            selectionMode: "row",
            rowSelection: "single",
            showRowIndexFlag: false,
            showSelectionCheckBoxesFlag: false,
            showContextualMenuColumnFlag: false,
            rowDragEnabledFlag: false,
            cellDragEnabledFlag: false,
            placeholder: "검색 결과가 없습니다.",
        });
        grid.inject(host);
        return {
            destroy: function () {
                grid.destroy();
            },
        };
    }

    return {
        attach: attach,
    };
});
