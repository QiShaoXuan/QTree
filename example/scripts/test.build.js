"use strict";

var mockData = [{ id: "32", pid: "3", index: 1, name: "叶子节点 3-2", allArea: '4', rentArea: '3' }, { id: "1", pid: "0", name: "父节点 1", allArea: '1234', rentArea: '56789123' }, { id: "112", pid: "11", name: "叶子节点 1-1-2", allArea: '1234', rentArea: '56789123' }, { id: "22", pid: "2", index: 1, name: "叶子节点 2-2", allArea: '5', rentArea: '2' }, { id: "1120", pid: "112", name: "叶子节点 1-1-2-0", allArea: '1234', rentArea: '56789123' }, { id: "12", pid: "1", name: "叶子节点 1-2", allArea: '4', rentArea: '56789123' }, { id: "13", pid: "1", name: "叶子节点 1-3", allArea: '4', rentArea: '56789123' }, { id: "2", pid: "0", index: 0, name: "父节点 2", allArea: '15', rentArea: '6' }, { id: "21", pid: "2", index: 1, name: "叶子节点 2-1", allArea: '5', rentArea: '2' }, { id: "11", pid: "1", name: "叶子节点 1-1", allArea: '1234', rentArea: '56789123' }, { id: "110", pid: "11", name: "叶子节点 1-1-0", allArea: '1234', rentArea: '56789123' }, { id: "111", pid: "11", name: "叶子节点 1-1-1", allArea: '1234', rentArea: '56789123' }, { id: "1121", pid: "112", name: "叶子节点 1-1-2-1", allArea: '1234', rentArea: '56789123' }, { id: "23", pid: "2", index: 1, name: "叶子节点 2-3", allArea: '5', rentArea: '2' }, { id: "3", pid: "0", index: 0, name: "父节点 3", allArea: '12', rentArea: '9' }, { id: "31", pid: "3", index: 1, name: "叶子节点 3-1", allArea: '4', rentArea: '3' }, { id: "1122", pid: "112", name: "叶子节点 1-1-2-2", allArea: '1234', rentArea: '56789123' }, { id: "33", pid: "3", index: 1, name: "叶子节点 3-3", allArea: '4', rentArea: '3' }];

var tree = new Qtree('#tree-container', mockData, {
  branchFormatter: "<div class=\"QTree-branch\">\n                      <span class=\"tree-content\" name></span>\n                      <div class=\"branchCenter\">\n                        <span class=\"tree-content\" allArea></span>\n                        <span class=\"tree-content\" rentArea></span>\n                      </div>\n                      <div class=\"edit-container\">\n                        <span class=\"btn edit-btn\">\u7F16\u8F91</span>\n                        <span class=\"btn edit-btn\">\u6DFB\u52A0</span>\n                        <span class=\"btn del-btn\">\u5220\u9664</span>\n                      </div>\n                    </div>",
  renderData: ['name', 'allArea', 'rentArea'],
  openBranch: 1120

});

$('#tree-container').on('click', '.del-btn', function () {
  var id = $(this).parents('.QTree-branch').data('treeData').id;

  // tree.removeBranch(id)
  tree.checkChlidren(id);
});

$('#tree-container').on('click', '.edit-btn', function () {
  var id = $(this).parents('.QTree-branch').data('treeData').id;
  $('#treeModal').data('id', id).modal('show');
});

$('#treeModal #tree-modal-sure').on('click', function () {
  var newData = {};
  var id = $('#treeModal').data('id');
  $('#treeModal form').serializeArray().forEach(function (v, i) {
    if (v.name != '') {
      newData[v.name] = v.name;
    }
  });
  if (Object.keys(newData).length) {
    tree.updateBranch(id, newData);
  }
  $('#treeModal').modal('hide');
});