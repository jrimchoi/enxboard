/*
 * 목록 호스트에 DS/DataGridView/DataGridView를 붙인다. AMD 모듈 DS/ENXBoard/js/grid.
 *
 * 행은 현재 쪽의 items만 TreeDocument로 만든다. Collection은 바꾸지 않는다.
 * 제목 셀을 누르면 onOpen(id)다. App이 그 호출을 명령 open으로 올린다.
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
            identifier: "enxboard-list",
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
