let mockData = [
  {id: "32", pid: "3", index: 1, name: "叶子节点 3-2", allArea: '4', rentArea: '3'},
  {id: "1", pid: "0", name: "父节点 1", allArea: '1234', rentArea: '56789123'},
  {id: "112", pid: "11", name: "叶子节点 1-1-2", allArea: '1234', rentArea: '56789123'},
  {id: "22", pid: "2", index: 1, name: "叶子节点 2-2", allArea: '5', rentArea: '2'},
  {id: "1120", pid: "112", name: "叶子节点 1-1-2-0", allArea: '1234', rentArea: '56789123'},
  {id: "12", pid: "1", name: "叶子节点 1-2", allArea: '4', rentArea: '56789123'},
  {id: "13", pid: "1", name: "叶子节点 1-3", allArea: '4', rentArea: '56789123'},
  {id: "2", pid: "0", index: 0, name: "父节点 2", allArea: '15', rentArea: '6'},
  {id: "21", pid: "2", index: 1, name: "叶子节点 2-1", allArea: '5', rentArea: '2'},
  {id: "11", pid: "1", name: "叶子节点 1-1", allArea: '1234', rentArea: '56789123'},
  {id: "110", pid: "11", name: "叶子节点 1-1-0", allArea: '1234', rentArea: '56789123'},
  {id: "111", pid: "11", name: "叶子节点 1-1-1", allArea: '1234', rentArea: '56789123'},
  {id: "1121", pid: "112", name: "叶子节点 1-1-2-1", allArea: '1234', rentArea: '56789123'},
  {id: "23", pid: "2", index: 1, name: "叶子节点 2-3", allArea: '5', rentArea: '2'},
  {id: "3", pid: "0", index: 0, name: "父节点 3", allArea: '12', rentArea: '9'},
  {id: "31", pid: "3", index: 1, name: "叶子节点 3-1", allArea: '4', rentArea: '3'},
  {id: "1122", pid: "112", name: "叶子节点 1-1-2-2", allArea: '1234', rentArea: '56789123'},
  {id: "33", pid: "3", index: 1, name: "叶子节点 3-3", allArea: '4', rentArea: '3'},
];

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
  openBranch:1120

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


});

