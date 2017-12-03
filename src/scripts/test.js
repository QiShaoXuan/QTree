let tree = new Qtree('#tree-container', mockData, {
  branchFormatter: `<div class="QTree-branch">
                      <span class="tree-content" name></span>
                      <div class="branchCenter">
                        <span class="tree-content" allArea></span>
                        <span class="tree-content" rentArea></span>
                      </div>
                      <div class="edit-container">
                        <span class="btn edit-btn">编辑</span>
                        <span class="btn edit-btn">添加</span>
                        <span class="btn del-btn">删除</span>
                      </div>
                    </div>`,
  renderData: ['name', 'allArea', 'rentArea'],

})

$('#tree-container').on('click', '.del-btn', function () {
  let id = $(this).parents('.QTree-branch').data('treeData').id;

  // tree.removeBranch(id)
  tree.checkChlidren(id)
});

$('#tree-container').on('click', '.edit-btn', function () {
  let id = $(this).parents('.QTree-branch').data('treeData').id;
  $('#treeModal').data('id',id).modal('show')
});

$('#treeModal #tree-modal-sure').on('click', function () {
  let newData = {};
  let id = $('#treeModal').data('id')
  $('#treeModal form').serializeArray().forEach((v, i) => {
    if (v.name != '') {
      newData[v.name] = v.name;
    }
  });
  if(Object.keys(newData).length){
    tree.updateBranch(id,newData)
  }
  $('#treeModal').modal('hide')
})
