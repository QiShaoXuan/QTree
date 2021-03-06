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
                        </div>`,
      renderData: ['name'],
      openBranch: 0,
      needLine:true
    }
    //   <div class="QTree-branch">
    //   <span class="tree-content name" name></span>
    // <div class="edit-container"><span class="btn edit-btn">编辑</span></div>
    // </div>
    //如果要自定义渲染的数据，需要在renderData中添加渲染的属性值，并且在branchFormatter中对应的标签内添加相应的值

    if (setting) {
      this.setting = Object.assign(originSetting, setting);
    } else {
      this.setting = originSetting;
    }

    this.nodeData = nodeData;
    this.container = $(container);

    this.init();
  }

  init() {
    this.initData();
    this.createTree();
    this.setSwitchEvent();
  }

  //初始化数据
  initData() {
    //添加祖元素
    //可能会有祖元素，也避免实例化多次添加多个
    let ancestor = this.nodeData.find((v) => {
      return v.id == 0;
    })
    if (!ancestor) {
      let rootNode = {
        id: '0',
        pid: '',
        name: "root",
        open: true
      };
      this.nodeData.splice(0, 0, rootNode);
    }
    //设置初始化时需要打开的分支
    this.setOpenBranchArr();
    //处理数据顺序
    this.sortNodes(this.nodeData);
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

  //初始化时处理要打开的节点（仅在初始化时使用）
  findOpenBranch(id, pid, arr) {
    if (id == 0) {
      arr.push(id);
      return '0';
    }
    if (pid === '') {
      return;
    }
    if (pid) {
      let parent = this.nodeData.find((v) => {
        return v.id === pid;
      })
      arr.push(parent.id)
      return this.findOpenBranch(id, parent.pid, arr);
    } else {
      let child = this.nodeData.find((v) => {
        return v.id == id;
      });

      arr.push(id);
      if (child) {
        return this.findOpenBranch(id, child.pid, arr);
      } else {
        return;
      }
    }
  }

  //处理数据排序
  sortNodes(treejson) {
    let that = this;
    var treejson = treejson;

    generateNode(treejson);

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

    var formatJson = null;

    function generateNode(treejson) {
      formatJson = formatTreeData(treejson);
      let nodeArr = [];
      node(formatJson[""], "", nodeArr);

      that.nodeData = nodeArr;
    }

    function node(json, pnode, arr, pid) {
      if (!json) return;
      json.child.forEach((v, i) => {
        json.child[i].sortID = pnode + json.child[i].sortID;
        arr.push(json.child[i]);

        let isOpen = that.setting.openBranch.find((v) => {
          return v == json.child[i].id;
        });
        let hasChildren = that.nodeData.find((v) => {
          return v.pid === json.child[i].id;
        })


        if (isOpen == undefined || hasChildren == undefined) {
          if (json.child[i].id == 0) {
            json.child[i].open = true;
          } else {
            json.child[i].open = false;
          }
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
        frag.find(`.children_${v.pid}`).append(that.createBranch(v));
        // if ('open' in v) {
        frag.find(`.container_${v.id}`).append(that.createChildrenContainer(v.id, v.open));
        // }
      } else {
        //创建最外层的容器，需要传入isFirst来判断不添加左边的线条
        frag.append(that.createChildrenContainer(v.id, v.open,true));
      }
    })

    this.container.empty().append(frag);
  }

//  创建分支容器
  createChildrenContainer(pid, isopen,isFirst) {
    let needLine = this.setting.needLine&&!isFirst?' Qtree-line':''
    const container = `<ul class="QTree-children-container children_${pid} ${isopen ? '' : 'QTree-hide'}${needLine}"></ul>`;
    return container;
  }

//创建分支
  createBranch(branchData) {
    let branch = $(this.setting.branchFormatter);
    //在dom上绑定对应的数据
    branch.data('treeData', branchData);
    let emptySpan = this.setting.needLine?'':this.createEmptySpan(branchData.sortID);

    //处理顺序
    //1.加载对应的数据
    //2.添加开关
    //3.添加空格
    //4.添加id

    //1.加载对应的数据
    this.loadBranchData(branch, branchData);

    //2.添加开关
    let switchSpan = this.createSwitch(branchData);
    branch.prepend(switchSpan);
    //3.添加空格
    branch.prepend(emptySpan);

    //4.添加id
    branch.addClass(`branch_${branchData.id}`)
    //分支需要添加QTree-branch类名
    if (!branch.hasClass('QTree-branch')) {
      branch.addClass('QTree-branch');
    }

    let branchContainer = $(`<li class="QTree-branch-container container_${branchData.id}${this.setting.needLine?' Qtree-line':''}"></li>`);
    branchContainer.append(branch);
    return branchContainer;
  }

  //第一次加载时加载分支对应的数据
  loadBranchData(branch, branchData) {
    let that = this;
    branch.children().each((i, child) => {
      this.setting.renderData.forEach((v, i) => {
        if (child.hasAttribute(v) && branchData[v]) {
          child.innerHTML = branchData[v];
        }
      })
      if ($(child).children().length) {
        that.loadBranchData($(child), branchData);
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
      return v.pid == branchData.id;
    });
    // 如果有子节点则设置开关
    if (hasChildren != undefined) {
      return this.createSwitchString(branchData.open);
    } else {
      return `<span class="empty-span"></span>`;
    }
  }

  createSwitchString(boolean) {
    if (boolean) {
      return `<i class="switch minus-btn" data-switch="true"></i>`;
    } else {
      return `<i class="switch plus-btn" data-switch="false"></i>`;
    }
  }

  //根据index判断是第几层级添加空格
  createEmptySpan(sortID, isNumber) {
    //isNumber为true直接创建
    let num = isNumber ? sortID : this.countIndex(sortID);
    let emptySpan = '';

    for (let i = 0; i < num; i++) {
      emptySpan = emptySpan + '<span class="empty-span"></span>';
    }
    return emptySpan;
  }

  //根据sortID判断当前节点层级
  countIndex(sortID) {
    if (sortID) {
      return sortID.length / 4 - 2;
    } else {
      return 0;
    }
  }

  //同步视图上的数据和dom中存储的数据
  syncData(id, data) {
    let $branchDom = this.container.find(`.branch_${id}`);
    for (let i in data) {
      if (i in $branchDom.data('treeData')) {
        $branchDom.data('treeData')[i] = data[i];
      }
    }
  }

  onchangeBranch(id) {
  }

  //打开分支
  openBranch(id) {
    if (id == 0) return;
    let branchData = this.container.find(`.branch_${id}`).data('treeData');
    this.container.find(`.children_${id}`).removeClass('QTree-hide');
    this.syncData(id, {open: true});
    this.openBranch(branchData.pid)
  }

  //关闭分支
  closeBranch(id) {
    this.container.find(`.children_${id}`).addClass('QTree-hide');
    this.syncData(id, {open: false});
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
          $(this).attr('data-switch', 'false').removeClass('minus-btn').addClass('plus-btn');
          break;
        case 'false':
          that.openBranch(id);
          $(this).attr('data-switch', 'true').removeClass('plus-btn').addClass('minus-btn');
          break;
      }
    })
  }

  //更新分支
  updateBranch(id, editData) {
    if (Object.prototype.toString.call(editData) != '[object Object]') return;
    let $branchDom = this.container.find(`.branch_${id}`);
    if (!$branchDom.length) return;

    let originData = $branchDom.data('treeData');

    let changeData = {};
    //检查要更新的数据
    for (let key in editData) {
      if ((key in originData) && (editData[key] != originData[key])) {
        changeData[key] = editData[key];
      }
    }

    if (Object.keys(changeData).length) {
      //将新的数据更新到对应dom中
      this.updateBranchData($branchDom, changeData);
      this.syncData(id, changeData);
    }
  }

  //将新的数据更新到对应dom中(更新分支用)
  updateBranchData($branchDom, branchData) {
    let that = this;
    $branchDom.children().each((i, child) => {
      for (let key in branchData) {
        if (child.hasAttribute(key)) {
          child.innerHTML = branchData[key];
        }
      }
      if ($(child).children().length) {
        that.updateBranchData($(child), branchData);
      }
    })
  }

//  删除分支
  removeBranch(id) {
    let $branchDom = this.container.find(`.container_${id}`);
    let pid = this.container.find(`.branch_${id}`).data('treeData').pid;
    if (!$branchDom.length) return;
    $branchDom.remove();
    this.checkSwitch(pid, 'del');
  }

//  检查分支是否有子分支，返回true或false
  checkChlidren(id) {
    let $branchDom = this.container.find(`.children_${id}`);
    if ($branchDom.children().length) {
      return true;
    } else {
      return false;
    }
  }

//  添加分支
//  data中需要id
  addBranch(pid, data) {
    if (!('id' in data)) {
      console.error('add branch must need this branch\'s id');
      return;
    }

    let branchContainer = this.container.find(`.children_${pid}`);
    // 设置sortID
    let parentSortID = this.container.find(`.branch_${pid}`).length ? this.container.find(`.branch_${pid}`).data('treeData').sortID : '0001';
    let sortIndex = branchContainer.children.length + 1;
    data.sortID = parentSortID + (sortIndex * 1 < 10 ? ("000" + sortIndex) : ( sortIndex * 1 > 100 ? ("00" + sortIndex) : (sortIndex * 1 > 1000 ? sortIndex : ('0' + sortIndex))));
    //设置open
    data.open = false;

    let newBranch = this.createBranch(data);
    newBranch.append(this.createChildrenContainer(data.id, data.open))
    branchContainer.append(newBranch);

    this.checkSwitch(pid, 'add');
  }

//  在删除或添加分支后检查节点的子节点，判断是否需要隐藏开关
//  在添加或删除操作完成后使用
  checkSwitch(id, action) {
    if (!this.container.find(`.branch_${id}`).length && id == 0) return;//在删除所有节点的最后一个时不需要检查
    switch (action) {
      case 'del':
        // let pid = this.container.find(`.branch_${id}`).data('treeData').pid
        let branchP = this.container.find(`.branch_${id}`);
        if (!this.checkChlidren(id) && branchP.find('.switch').length) {
          //无子节点有开关
          let emptySpan = this.setting.needLine?'':this.createEmptySpan(1, true);
          branchP.find('.switch').remove().end()
            .prepend(emptySpan);

          this.container.find(`.children_${id}`).addClass('QTree-hide')
        }
        break;
      case 'add':
        let branch = this.container.find(`.branch_${id}`);
        if (this.checkChlidren(id) && !branch.find('.switch').length) {
          //有子节点无开关
          let switchString = this.createSwitchString(false);
          //这里可能需要判断是否为第一层级或者是否为有指示线，暂未写完
          branch.find('.empty-span').last().after(switchString).remove();
          // if(this.setting.needLine){
          //   branch.prepend(switchString)
          // }else{
          //   branch.find('.empty-span').last().after(switchString).remove();
          // }
        }
        break;
    }

  }

//  输出分支下的所有数据
//  默认所有的数据
  getTreeData(id) {
    let branchID = id ? id : 0;
    let dataList = [];

    // 如果不是所有节点，需要把当前节点的数据存入
    if (branchID) {
      dataList.push(this.container.find(`.branch_${id}`).data('treeData'))
    }

    this.container.find(`.children_${id} .QTree-branch`).each((i, v) => {
      dataList.push($(v).data('treeData'));
    });

    return dataList;
  }

//  移动节点
  moveBranch(id, newpid) {
    //  克隆出要移动的dom，container_x
    //  获取到要移动的数据
    //  获取新的父节点sortID进行比较
    //  改变要移动的数据的sortID和顶层节点的pid
    //  将改变的数据重新绑定在克隆出来的dom中
    //  将dom插入到新的节点下
    let moveData = this.getTreeData(id);//要移动的所有节点的数据
    let moveBranch = this.container.find(`.branch_${id}`);//要移动选中的节点
    let allOriginBranch = this.container.find(`.container_${id}`)//所有节点
    let oldPid = '' + moveBranch.data('treeData').pid

    moveBranch.data('treeData').pid = newpid

    let cloneMoveBranch = allOriginBranch.clone(); //克隆要移动的所有节点
    let moveBranch_sortID = moveBranch.data('treeData').sortID;//选中的移动节点的sortID
    let newParentBranch = this.container.find(`.branch_${newpid}`);//新的父节点
    let newParentBranch_children = this.container.find(`.children_${newpid}`);//新的父节点的子节点容器
    let newParentBranch_sortID = newParentBranch.data('treeData').sortID;//新的父节点的sortID

    //  对比sortID
    let d_value = this.countIndex(moveBranch_sortID) - this.countIndex(newParentBranch_sortID);//差值
    // if (d_value == 0) {
    //   return;
    // }
    //层级降低
    if (d_value > 0) {
      cloneMoveBranch.find('.QTree-branch').each((i, v) => {
        while (d_value) {
          $(v).find('.empty-span').eq(0).remove();
          d_value--;
        }
      })
    }
    //层级增加
    if (d_value <= 0) {
      // let emptySpan = this.createEmptySpan(Math.abs(d_value + 1), true)
      // cloneMoveBranch.find('.QTree-branch').prepend(emptySpan)
    }

    //绑定数据
    moveData.forEach((v) => {
      cloneMoveBranch.find(`.branch_${v.id}`).data('treeData', v)
    });

    //  插入节点
    allOriginBranch.remove();
    newParentBranch_children.append(cloneMoveBranch);
    this.checkSwitch(oldPid, 'del');
    this.checkSwitch(newpid, 'add')
  }

  //  关闭所有节点
  closeAllBranch() {
    this.container.find('.children_0 .QTree-branch-container').each((i, v) => {
      $(v).find('.QTree-children-container').addClass('QTree-hide')
    })
  }

  //查找父节点
  findParent(id) {
    let child = this.container.find(`.branch_${id}`);
    let pid = child.data('treeData').pid;
    let parent = this.container.find(`.branch_${pid}`);
    let parentContainer = this.container.find(`.children_${pid}`)

    return {
      parentDom: parent,
      parentContainer: parentContainer
    }
  }
}




