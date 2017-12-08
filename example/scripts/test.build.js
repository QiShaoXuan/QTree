'use strict';

var tree = new Qtree('#tree-container', mockData, {
  branchFormatter: '<div class="QTree-branch">\n                      <span class="tree-content" name></span>\n                      <div class="branchCenter">\n                        <span class="tree-content" allArea></span>\n                        <span class="tree-content" rentArea></span>\n                      </div>\n                      <div class="edit-container">\n                        <span class="btn edit-btn">\u7F16\u8F91</span>\n                        <span class="btn edit-btn">\u6DFB\u52A0</span>\n                        <span class="btn del-btn">\u5220\u9664</span>\n                      </div>\n                    </div>',
  renderData: ['name', 'allArea', 'rentArea']
  // openBranch:1120

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