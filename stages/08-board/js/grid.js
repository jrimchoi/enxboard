/*
 * 단계 8. 단계 7의 attach를 입구 화면에 붙인다.
 * 함수는 attach(host, items, onOpen)와 destroy다. Collection은 바꾸지 않고 현재 쪽 items만 넣는다.
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
