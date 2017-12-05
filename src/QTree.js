//    div(class=QTree-children-container , id=children_x)
//        |
//        |--div(class=QTree-branch-container , id=container_x)
//            |
//            |--(class=QTree-branch , id=x)
//            |--(class=QTree-children-container , id=children_x)

class Qtree {
  constructor(container, nodeData, setting) {
    let originSetting = {
      branchFormatter: `<div class="QTree-branch">
                          <span class="tree-content name" name></span>
                          <div class="edit-container"><span class="btn edit-btn">编辑</span></div>
                        </div>`,
      limit: 'auto',
      switchClass: '.switch',
      icon: '',
      openID: '',
      branchClickEvent: '',
      renderData: ['name'],
      openBranch: 0,
    }
    //如果要自定义渲染的数据，需要在renderData中添加渲染的属性值，并且在branchFormatter中对应的标签内添加相应的值

    if (setting) {
      this.setting = Object.assign(originSetting, setting)
    } else {
      this.setting = originSetting;
    }

    this.nodeData = nodeData;
    this.container = $(container)

    this.init()
  }

  init() {
    this.initData()
    this.createTree()
    this.setSwitchEvent()
  }

  //初始化数据
  initData() {
    //添加祖元素
    //可能会有祖元素，也避免实例化多次添加多个
    let ancestor = this.nodeData.find((v) => {
      return v.id == 0;
    })
    if(!ancestor){
      let rootNode = {id: '0', pid: '', name: "root", open: true}
      this.nodeData.splice(0, 0, rootNode);
    }
    //设置初始化时需要打开的分支
    this.setOpenBranchArr()
    //处理数据顺序
    this.sortNodes(this.nodeData);
    console.log(this.nodeData)
  }

  //设置初始时打开分支的化列表
  setOpenBranchArr() {
    let openID = Number(this.setting.openBranch);
    //检查是否为数字且整数
    if (!openID && Math.floor(openID) != openID) return;

    let openArr = [];
    this.findOpenBranch(openID, null, openArr);

    this.setting.openBranch = openArr;
  }

  findOpenBranch(id, pid, arr) {
    if (id == 0) {
      arr.push(id)
      return '0'
    }
    if (pid === '') {
      return;
    }
    if (pid) {
      let parent = this.nodeData.find((v) => {
        return v.id === pid;
      })
      arr.push(parent.id)
      return this.findOpenBranch(id, parent.pid, arr)
    } else {
      let child = this.nodeData.find((v) => {
        return v.id == id;
      });

      arr.push(id)
      return this.findOpenBranch(id, child.pid, arr)
    }
  }

  //处理数据排序
  sortNodes(treejson) {
    let that = this;
    generateNode(treejson)

    function formatTreeData(treejson) {
      if (!treejson) return;
      let formatTreeJson = {};
      for (let i = 0; i < treejson.length; i++) {
        if (formatTreeJson[treejson[i].pid]) {
          let x = formatTreeJson[treejson[i].pid].i * 1 + 1;
          formatTreeJson[treejson[i].pid].i = x;
          //node数以四位递增，不足补0
          treejson[i].sortID = x * 1 < 10 ? ("000" + x) : ( x * 1 > 100 ? ("00" + x) : (x * 1 > 1000 ? x : ('0' + x)));
          formatTreeJson[treejson[i].pid].child.push(treejson[i]);
        }
        else {
          formatTreeJson[treejson[i].pid] = {};
          formatTreeJson[treejson[i].pid].i = 1;
          formatTreeJson[treejson[i].pid].child = [];
          treejson[i].sortID = "0001";
          formatTreeJson[treejson[i].pid].child.push(treejson[i]);
        }
      }
      return formatTreeJson;
    }

    let formatJson = null;

    function generateNode(treejson) {
      formatJson = formatTreeData(treejson);
      let nodeArr = [];
      node(formatJson[""], "", nodeArr);

      let length = nodeArr.length;

      // that.nodeData = nodeArr.splice(1, length - 1)
      that.nodeData = nodeArr
    }

    function node(json, pnode, arr, pid) {
      if (!json) return;
      json.child.forEach((v, i) => {
        json.child[i].sortID = pnode + json.child[i].sortID;
        arr.push(json.child[i]);

        // console.log(formatJson[json.child[i].id]);
        // if (formatJson[json.child[i].id] && json.child[i].pid != '') {
        //   json.child[i].open = false
        // }
        let isOpen = that.setting.openBranch.find((v) => {
          return v == json.child[i].id;
        });
        let hasChildren = that.nodeData.find((v) => {
          return v.pid === json.child[i].id
        })

        if (isOpen == undefined || hasChildren == undefined) {
          json.child[i].open = false
        } else {
          json.child[i].open = true;
        }
        node(formatJson[json.child[i].id], json.child[i].sortID, arr);
      })
    }
  }

// 创建树
  createTree() {
    let that = this;
    let frag = $(document.createDocumentFragment());
    this.nodeData.forEach((v, i) => {
      if (v.pid) {
        frag.find(`#children_${v.pid}`).append(that.createBranch(v));
        // if ('open' in v) {
        frag.find(`#container_${v.id}`).append(that.createBranchContainer(v.id, v.open))
        // }
      } else {
        frag.append(that.createBranchContainer(v.id, v.open))
      }
    })

    this.container.empty().append(frag)
  }

//  创建分支容器
  createBranchContainer(pid, isopen) {
    const container = `<div class="QTree-children-container ${isopen ? '' : 'QTree-hide'}" id="children_${pid}"></div>`;
    return container
  }

//创建分支
  createBranch(branchData) {
    let branch = $(this.setting.branchFormatter);
    //在dom上绑定对应的数据
    branch.data('treeData', branchData)
    let emptySpan = this.createEmptySpan(branchData.sortID);

    //处理顺序
    //1.加载对应的数据
    //2.添加开关
    //3.添加空格
    //4.添加id

    //1.加载对应的数据
    this.loadBranchData(branch, branchData)

    //2.添加开关
    let switchSpan = this.createSwitch(branchData);
    branch.prepend(switchSpan)
    //3.添加空格
    branch.prepend(emptySpan)

    //4.添加id
    branch.attr('id', branchData.id)
    //分支需要添加QTree-branch类名
    if (!branch.hasClass('QTree-branch')) {
      branch.addClass('QTree-branch')
    }

    let branchContainer = $(`<div class="QTree-branch-container" id="container_${branchData.id}"></div>`);
    branchContainer.append(branch)
    return branchContainer
  }

  //第一次加载时加载分支对应的数据
  loadBranchData(branch, branchData) {
    let that = this;
    branch.children().each((i, child) => {
      this.setting.renderData.forEach((v, i) => {
        if (child.hasAttribute(v) && branchData[v]) {
          child.innerHTML = branchData[v]
        }
      })
      if ($(child).children().length) {
        that.loadBranchData($(child), branchData)
      }
    })
  }

  // isShow(pid, originData) {
  //   if (pid === '') return true;
  //   let parent = this.nodeData.find((v) => {
  //     return v.id == pid
  //   })
  //
  //   if (parent.open) {
  //     return this.isShow(parent.pid, originData)
  //   } else {
  //     return false;
  //   }
  // }

  //判断是否有子节点
  hasChildren(id) {
    let child = this.nodeData.find((v, i) => {
      return v.pid === id;
    })
    return child ? true : false;
  }

  //创建开关按钮
  createSwitch(branchData) {
    let hasChildren = this.nodeData.find((v) => {
      return v.pid == branchData.id
    });
    // 如果有子节点则设置开关
    if (hasChildren != undefined) {
      return this.createSwitchString(branchData.open)
    } else {
      return `<span class="empty-span"></span>`
    }
  }

  createSwitchString(boolean){
    if(boolean){
      return `<i class="switch minus-btn" data-switch="true"></i>`
    }else{
      return `<i class="switch plus-btn" data-switch="false"></i>`
    }

  }

  //根据index判断是第几层级添加空格
  createEmptySpan(sortID) {
    let num = this.countIndex(sortID);
    let emptySpan = '';
    for (let i = 0; i < num; i++) {
      emptySpan = emptySpan + '<span class="empty-span"></span>';
    }
    return emptySpan
  }

  //根据sortID判断当前节点层级
  countIndex(sortID) {
    if (sortID) {
      return sortID.length / 4 - 2
    } else {
      return 0
    }
  }

  //同步视图上的数据和dom中存储的数据
  syncData(id, data) {
    let $branchDom = this.container.find(`#${id}`);
    for (let i in data) {
      $branchDom.data('treeData')[i] = data[i]
    }
  }

  onchangeBranch(id) {
  }

  //打开分支
  openBranch(id) {
    this.container.find(`#children_${id}`).removeClass('QTree-hide');
    this.syncData(id, {open: true})
  }

  //关闭分支
  closeBranch(id) {
    this.container.find(`#children_${id}`).addClass('QTree-hide');
    this.syncData(id, {open: false})
  }

  //设置开关事件
  setSwitchEvent() {
    let that = this;
    this.container.on('click', '.switch', function (e) {
      e.stopPropagation();
      let status = $(this).attr('data-switch');
      let id = $(this).parents('.QTree-branch').data('treeData').id;
      switch (status) {
        case 'true':
          that.closeBranch(id);
          $(this).attr('data-switch', 'false').removeClass('minus-btn').addClass('plus-btn')
          break;
        case 'false':
          that.openBranch(id)
          $(this).attr('data-switch', 'true').removeClass('plus-btn').addClass('minus-btn')
          break;
      }
    })
  }

  //更新分支
  updateBranch(id, editData) {
    if (Object.prototype.toString.call(editData) != '[object Object]') return;
    let $branchDom = this.container.find(`#${id}`);
    if (!$branchDom.length) return;

    let originData = $branchDom.data('treeData');

    let changeData = {};
    //检查要更新的数据
    for (let key in editData) {
      if ((tkey in originData) && (editData[key] != originData[key])) {
        changeData[key] = editData[key]
      }
    }

    if (Object.keys(changeData).length) {
      //将新的数据更新到对应dom中
      this.updateBranchData($branchDom, changeData)
      this.syncData(id, changeData)
    }
  }

  //将新的数据更新到对应dom中(更新分支用)
  updateBranchData($branchDom, branchData) {
    let that = this;
    $branchDom.children().each((i, child) => {
      for (let key in branchData) {
        if (child.hasAttribute(key)) {
          child.innerHTML = branchData[key]
        }
      }
      if ($(child).children().length) {
        that.updateBranchData($(child), branchData)
      }
    })
  }

//  删除分支
  removeBranch(id) {
    let $branchDom = this.container.find(`#${id}`);
    if (!$branchDom.length) return;
    $branchDom.parent().remove();
    this.checkSwitch(id)
  }

//  检查分支是否有子分支，返回true或false
  checkChlidren(id) {
    let $branchDom = this.container.find(`#${id}`);
    if ($branchDom.siblings('.QTree-children-container').children().length) {
      return true;
    } else {
      return false;
    }
  }

//  添加分支
  addBranch(pid, data) {
    let branchContainer = $(`children_${pid}`)
    if (!branchContainer.length) return;
    let newBranch = this.createBranch(data);
    branchContainer.append(newBranch);
    this.checkSwitch(pid)
  }

//  在删除或添加分支后检查节点的子节点，判断是否需要隐藏开关
//  在添加或删除操作完成后使用
  checkSwitch(id) {
    let branch = $(`#${id}`);
    let branchIndex = this.countIndex(branch.data('treeData')['sortID']);
    if (this.checkChlidren(id) && !branch.find('.switch').length) {
      //有子节点无开关
      let switchString = this.createSwitchString(false);
      branch.find('.empty-span').last().after(switchString).remove();
    } else if (!this.checkChlidren(id) && branch.find('.switch').length) {
      //无子节点有开关
      let emptySpan = this.createEmptySpan('000100010001')
      branch.find('.switch').remove().end()
        .prepend(emptySpan)
    }
  }
}




