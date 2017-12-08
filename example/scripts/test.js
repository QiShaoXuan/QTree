var mockData = [
  {id: "1", pid: "0", name: "节点 1", value_1: '1234', value_2: '56789123'},
  {id: "11", pid: "1", name: "节点 1-1", value_1: '1234', value_2: '56789123'},
  {id: "110", pid: "11", name: "节点 1-1-0", value_1: '1234', value_2: '56789123'},
  {id: "111", pid: "11", name: "节点 1-1-1", value_1: '1234', value_2: '56789123'},
  {id: "12", pid: "1", name: "节点 1-2", value_1: '4', value_2: '56789123'},
  {id: "13", pid: "1", name: "节点 1-3", value_1: '4', value_2: '56789123'},
  {id: "112", pid: "11", name: "节点 1-1-2", value_1: '1234', value_2: '56789123'},
  {id: "1120", pid: "112", name: "节点 1-1-2-0", value_1: '1234', value_2: '56789123'},
  {id: "1121", pid: "112", name: "节点 1-1-2-1", value_1: '1234', value_2: '56789123'},
  {id: "1122", pid: "112", name: "节点 1-1-2-2", value_1: '1234', value_2: '56789123'},
  {id: "2", pid: "0", index: 0, name: "节点 2", value_1: '15', value_2: '6'},
  {id: "21", pid: "2", index: 1, name: "节点 2-1", value_1: '5', value_2: '2'},
  {id: "22", pid: "2", index: 1, name: "节点 2-2", value_1: '5', value_2: '2'},
  {id: "23", pid: "2", index: 1, name: "节点 2-3", value_1: '5', value_2: '2'},
  {id: "3", pid: "0", index: 0, name: "节点 3", value_1: '12', value_2: '9'},
  {id: "31", pid: "3", index: 1, name: "节点 3-1", value_1: '4', value_2: '3'},
  {id: "32", pid: "3", index: 1, name: "节点 3-2", value_1: '4', value_2: '3'},
  {id: "33", pid: "3", index: 1, name: "节点 3-3", value_1: '4', value_2: '3'},
];

let tree = new Qtree('#tree-container', mockData);
let tree_menu = new Qtree('#tree-dropdown-menu', mockData);
let treeID = 40;//新建id时以此累加


let tree_define = new Qtree('#tree-container-define', mockData, {
  branchFormatter: `<div class="QTree-branch">
                      <span class="tree-content" name></span>
                      <div class="branchCenter">
                        <span class="tree-content" value_1></span>
                        <span class="tree-content" value_2></span>
                      </div>
                      <div class="edit-container">
                        <span class="btn edit-btn">编辑</span>
                        <span class="btn edit-btn">添加</span>
                        <span class="btn del-btn">删除</span>
                      </div>
                    </div>`,
  renderData: ['name', 'value_1', 'value_2'],
  // openBranch:1120
})
//编辑按钮
$('#tree-container-define').on('click','.edit-btn',function () {
  let data = $(this).parents('.QTree-branch').data('treeData');
  $("#treeModal").data('data', data).data('type','edit')
  $('#node-name').val(data.name);
  $('#value_1').val(data.value_1);
  $('#value_2').val(data.value_2);
  //打开对应节点
  $('#tree-dropdown .text').text(data.name)
  tree_menu.openBranch(data.id);
  $('#tree-dropdown').data('data',data)
  $("#treeModal").modal('show')

})

//添加按钮
$('#tree-container-define').on('click','.add-btn',function () {
  let data = $(this).parents('.QTree-branch').data('treeData');
  $("#treeModal").data('data', data).data('type','add')
  $('#node-name').val('');
  $('#value_1').val('');
  $('#value_2').val('');
  //打开对应节点
  $('#tree-dropdown .text').text(data.name)
  tree_menu.openBranch(data.id);
  $('#tree-dropdown').data('data',data)
  $("#treeModal").modal('show')
})

//模态框确定按钮
$("#tree-modal-sure").on('click', function (e) {
  switch ($("#treeModal").data('type')){
    case 'edit':
      var data = $("#treeModal").data('data');
      var name = $('#node-name').val();
      var value_1 = $('#value_1').val();
      var value_2 = $('#value_2').val();
      var menuID = $('#tree-dropdown').data('data').id;
      tree_define.updateBranch(data.id,{name:name,value_1:value_1,value_2:value_2});
      //节点移动
      // console.log($('#tree-dropdown').data('data'),data)
      if(menuID != data.id){
        tree_define.moveBranch(data.id, menuID)
      }
      break;
    case 'add':
      var name = $('#node-name').val();
      var value_1 = $('#value_1').val();
      var value_2 = $('#value_2').val();
      var pid = $('#tree-dropdown').data('data').id;
      treeID += 1;
      tree_define.addBranch(pid,{id:treeID,name:name,value_1:value_1,value_2:value_2})

      break;
  }

  $("#treeModal").modal('hide')
});

//下拉菜单点击事件
$('#tree-dropdown-menu').on('click','.QTree-branch',function () {
  let branchData = $(this).data('treeData');
  $('#tree-dropdown').data('data',branchData).find('.text').text(branchData.name)
})
