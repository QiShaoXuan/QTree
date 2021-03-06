var mockData = [
  {id: "1", pid: "0", name: "节点 1"},
  {id: "11", pid: "1", name: "节点 1-1"},
  {id: "110", pid: "11", name: "节点 1-1-0"},
  {id: "111", pid: "11", name: "节点 1-1-1"},
  {id: "12", pid: "1", name: "节点 1-2"},
  {id: "13", pid: "1", name: "节点 1-3"},
  {id: "112", pid: "11", name: "节点 1-1-2"},
  {id: "1120", pid: "112", name: "节点 1-1-2-0"},
  {id: "1121", pid: "112", name: "节点 1-1-2-1"},
  {id: "1122", pid: "112", name: "节点 1-1-2-2"},
  {id: "2", pid: "0", index: 0, name: "节点 2"},
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
$('#tree-container-define').on('click', '.edit-btn', function () {
  let data = $(this).parents('.QTree-branch').data('treeData');

  $('#node-name').val(data.name);
  $('#value_1').val(data.value_1);
  $('#value_2').val(data.value_2);

  $('#tree-dropdown .text').text(data.name)
  //关闭原有节点并删除样式
  tree_menu.closeAllBranch();
  var intrinsicOpenData =$("#treeModal").data('data');
  if(intrinsicOpenData){
    $('#tree-dropdown-menu .branch_'+intrinsicOpenData.id).removeClass('active-branch')
  }
  //打开对应节点 并添加选中样式
  tree_menu.openBranch(data.id);
  $('#tree-dropdown-menu .branch_'+data.id).addClass('active-branch');
  //将选中数据存在dom中
  $('#tree-dropdown').data('data', data);
  $("#treeModal").data('data', data).data('type', 'edit')
    .modal('show');
})

//添加按钮
$('#tree-container-define').on('click', '.add-btn', function () {
  let data = $(this).parents('.QTree-branch').data('treeData');

  $('#node-name').val('');
  $('#value_1').val('');
  $('#value_2').val('');
  //打开对应节点
  $('#tree-dropdown .text').text(data.name)
  tree_menu.openBranch(data.id);
  $('#tree-dropdown').data('data', data);
  $("#treeModal").data('data', data).data('type', 'add')
    .modal('show');
})
//删除按钮
$('#tree-container-define').on('click', '.del-btn', function () {
  let data = $(this).parents('.QTree-branch').data('treeData');
  //删除节点需要先删除其下所有子节点
  if (tree_define.hasChildren(data.id)) {
    $("#del-modal .modal-body").text(`请先删除 ${data.name}下的所有子节点`);
    $("#del-sure").prop('disabled', true);
  } else {
    $("#del-modal .modal-body").text(`确认删除 ${data.name}？`);
    $("#del-sure").prop('disabled', false);
  }
  $("#del-modal").data('data', data).modal('show')
})

//编辑模态框确定按钮
$("#tree-modal-sure").on('click', function (e) {
  switch ($("#treeModal").data('type')) {
    case 'edit':
      var data = $("#treeModal").data('data');
      var name = $('#node-name').val();
      var value_1 = $('#value_1').val();
      var value_2 = $('#value_2').val();
      var menuID = $('#tree-dropdown').data('data').id;
      tree_define.updateBranch(data.id, {name: name, value_1: value_1, value_2: value_2});
      tree_menu.updateBranch(data.id, {name: name, value_1: value_1, value_2: value_2});
      //节点移动
      if (menuID != data.id) {
        tree_define.moveBranch(data.id, menuID)
        tree_menu.moveBranch(data.id, menuID)
      }
      break;
    case 'add':
      var name = $('#node-name').val();
      var value_1 = $('#value_1').val();
      var value_2 = $('#value_2').val();
      var pid = $('#tree-dropdown').data('data').id;
      treeID += 1;
      tree_define.addBranch(pid, {id: treeID, name: name, value_1: value_1, value_2: value_2})
      tree_menu.addBranch(pid, {id: treeID, name: name, value_1: value_1, value_2: value_2})
      break;
  }

  $("#treeModal").modal('hide')
});
//删除模态框确定按钮
$("#del-sure").on('click', function (e) {
  var data = $("#del-modal").data('data');
  tree_define.removeBranch(data.id);
  $("#del-modal").modal('hide')
})

//下拉菜单点击事件
$('#tree-dropdown-menu').on('click', '.QTree-branch', function () {
  let branchData = $(this).data('treeData');
  var intrinsicOpenData =$('#tree-dropdown').data('data');
  $('#tree-dropdown-menu .branch_'+intrinsicOpenData.id).removeClass('active-branch');
  $('#tree-dropdown-menu .branch_'+branchData.id).addClass('active-branch');

  $('#tree-dropdown').data('data', branchData).find('.text').text(branchData.name)
})
