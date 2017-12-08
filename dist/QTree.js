'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//    div(class=QTree-children-container , id=children_x)
//        |
//        |--div(class=QTree-branch-container , id=container_x)
//            |
//            |--(class=QTree-branch , id=x)
//            |--(class=QTree-children-container , id=children_x)

var Qtree = function () {
  function Qtree(container, nodeData, setting) {
    _classCallCheck(this, Qtree);

    var originSetting = {
      branchFormatter: '<div class="QTree-branch">\n                          <span class="tree-content name" name></span>\n                          <div class="edit-container"><span class="btn edit-btn">\u7F16\u8F91</span></div>\n                        </div>',
      limit: 'auto',
      switchClass: '.switch',
      icon: '',
      openID: '',
      branchClickEvent: '',
      renderData: ['name'],
      openBranch: 0
      //如果要自定义渲染的数据，需要在renderData中添加渲染的属性值，并且在branchFormatter中对应的标签内添加相应的值

    };if (setting) {
      this.setting = Object.assign(originSetting, setting);
    } else {
      this.setting = originSetting;
    }

    this.nodeData = nodeData;
    this.container = $(container);

    this.init();
  }

  _createClass(Qtree, [{
    key: 'init',
    value: function init() {
      this.initData();
      this.createTree();
      this.setSwitchEvent();
    }

    //初始化数据

  }, {
    key: 'initData',
    value: function initData() {
      //添加祖元素
      //可能会有祖元素，也避免实例化多次添加多个
      var ancestor = this.nodeData.find(function (v) {
        return v.id == 0;
      });
      if (!ancestor) {
        var rootNode = { id: '0', pid: '', name: "root", open: true };
        this.nodeData.splice(0, 0, rootNode);
      }
      //设置初始化时需要打开的分支
      this.setOpenBranchArr();
      //处理数据顺序
      this.sortNodes(this.nodeData);
    }

    //设置初始时打开分支的化列表

  }, {
    key: 'setOpenBranchArr',
    value: function setOpenBranchArr() {
      var openID = Number(this.setting.openBranch);
      //检查是否为数字且整数
      if (!openID && Math.floor(openID) != openID) return;

      var openArr = [];
      this.findOpenBranch(openID, null, openArr);

      this.setting.openBranch = openArr;
    }
  }, {
    key: 'findOpenBranch',
    value: function findOpenBranch(id, pid, arr) {
      if (id == 0) {
        arr.push(id);
        return '0';
      }
      if (pid === '') {
        return;
      }
      if (pid) {
        var parent = this.nodeData.find(function (v) {
          return v.id === pid;
        });
        arr.push(parent.id);
        return this.findOpenBranch(id, parent.pid, arr);
      } else {
        var child = this.nodeData.find(function (v) {
          return v.id == id;
        });

        arr.push(id);
        return this.findOpenBranch(id, child.pid, arr);
      }
    }

    //处理数据排序

  }, {
    key: 'sortNodes',
    value: function sortNodes(treejson) {
      var that = this;
      var treejson = treejson;

      generateNode(treejson);

      function formatTreeData(treejson) {
        if (!treejson) return;
        var formatTreeJson = {};
        for (var i = 0; i < treejson.length; i++) {
          if (formatTreeJson[treejson[i].pid]) {
            var x = formatTreeJson[treejson[i].pid].i * 1 + 1;
            formatTreeJson[treejson[i].pid].i = x;
            //node数以四位递增，不足补0
            treejson[i].sortID = x * 1 < 10 ? "000" + x : x * 1 > 100 ? "00" + x : x * 1 > 1000 ? x : '0' + x;
            formatTreeJson[treejson[i].pid].child.push(treejson[i]);
          } else {
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
        var nodeArr = [];
        node(formatJson[""], "", nodeArr);

        that.nodeData = nodeArr;
      }

      function node(json, pnode, arr, pid) {
        if (!json) return;
        json.child.forEach(function (v, i) {
          json.child[i].sortID = pnode + json.child[i].sortID;
          arr.push(json.child[i]);

          // console.log(formatJson[json.child[i].id]);
          // if (formatJson[json.child[i].id] && json.child[i].pid != '') {
          //   json.child[i].open = false
          // }
          var isOpen = that.setting.openBranch.find(function (v) {
            return v == json.child[i].id;
          });
          var hasChildren = that.nodeData.find(function (v) {
            return v.pid === json.child[i].id;
          });

          if (isOpen == undefined || hasChildren == undefined) {
            json.child[i].open = false;
          } else {
            json.child[i].open = true;
          }
          node(formatJson[json.child[i].id], json.child[i].sortID, arr);
        });
      }
    }

    // 创建树

  }, {
    key: 'createTree',
    value: function createTree() {
      var that = this;
      var frag = $(document.createDocumentFragment());
      this.nodeData.forEach(function (v, i) {
        if (v.pid) {
          frag.find('#children_' + v.pid).append(that.createBranch(v));
          // if ('open' in v) {
          frag.find('#container_' + v.id).append(that.createBranchContainer(v.id, v.open));
          // }
        } else {
          frag.append(that.createBranchContainer(v.id, v.open));
        }
      });

      this.container.empty().append(frag);
    }

    //  创建分支容器

  }, {
    key: 'createBranchContainer',
    value: function createBranchContainer(pid, isopen) {
      var container = '<div class="QTree-children-container ' + (isopen ? '' : 'QTree-hide') + '" id="children_' + pid + '"></div>';
      return container;
    }

    //创建分支

  }, {
    key: 'createBranch',
    value: function createBranch(branchData) {
      var branch = $(this.setting.branchFormatter);
      //在dom上绑定对应的数据
      branch.data('treeData', branchData);
      var emptySpan = this.createEmptySpan(branchData.sortID);

      //处理顺序
      //1.加载对应的数据
      //2.添加开关
      //3.添加空格
      //4.添加id

      //1.加载对应的数据
      this.loadBranchData(branch, branchData);

      //2.添加开关
      var switchSpan = this.createSwitch(branchData);
      branch.prepend(switchSpan);
      //3.添加空格
      branch.prepend(emptySpan);

      //4.添加id
      branch.attr('id', branchData.id);
      //分支需要添加QTree-branch类名
      if (!branch.hasClass('QTree-branch')) {
        branch.addClass('QTree-branch');
      }

      var branchContainer = $('<div class="QTree-branch-container" id="container_' + branchData.id + '"></div>');
      branchContainer.append(branch);
      return branchContainer;
    }

    //第一次加载时加载分支对应的数据

  }, {
    key: 'loadBranchData',
    value: function loadBranchData(branch, branchData) {
      var _this = this;

      var that = this;
      branch.children().each(function (i, child) {
        _this.setting.renderData.forEach(function (v, i) {
          if (child.hasAttribute(v) && branchData[v]) {
            child.innerHTML = branchData[v];
          }
        });
        if ($(child).children().length) {
          that.loadBranchData($(child), branchData);
        }
      });
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

  }, {
    key: 'hasChildren',
    value: function hasChildren(id) {
      var child = this.nodeData.find(function (v, i) {
        return v.pid === id;
      });
      return child ? true : false;
    }

    //创建开关按钮

  }, {
    key: 'createSwitch',
    value: function createSwitch(branchData) {
      var hasChildren = this.nodeData.find(function (v) {
        return v.pid == branchData.id;
      });
      // 如果有子节点则设置开关
      if (hasChildren != undefined) {
        return this.createSwitchString(branchData.open);
      } else {
        return '<span class="empty-span"></span>';
      }
    }
  }, {
    key: 'createSwitchString',
    value: function createSwitchString(boolean) {
      if (boolean) {
        return '<i class="switch minus-btn" data-switch="true"></i>';
      } else {
        return '<i class="switch plus-btn" data-switch="false"></i>';
      }
    }

    //根据index判断是第几层级添加空格

  }, {
    key: 'createEmptySpan',
    value: function createEmptySpan(sortID, isNumber) {
      //isNumber为true直接创建
      var num = isNumber ? sortID : this.countIndex(sortID);
      var emptySpan = '';

      for (var i = 0; i < num; i++) {
        emptySpan = emptySpan + '<span class="empty-span"></span>';
      }
      return emptySpan;
    }

    //根据sortID判断当前节点层级

  }, {
    key: 'countIndex',
    value: function countIndex(sortID) {
      if (sortID) {
        return sortID.length / 4 - 2;
      } else {
        return 0;
      }
    }

    //同步视图上的数据和dom中存储的数据

  }, {
    key: 'syncData',
    value: function syncData(id, data) {
      var $branchDom = this.container.find('#' + id);
      for (var i in data) {
        $branchDom.data('treeData')[i] = data[i];
      }
    }
  }, {
    key: 'onchangeBranch',
    value: function onchangeBranch(id) {}

    //打开分支

  }, {
    key: 'openBranch',
    value: function openBranch(id) {
      this.container.find('#children_' + id).removeClass('QTree-hide');
      this.syncData(id, { open: true });
    }

    //关闭分支

  }, {
    key: 'closeBranch',
    value: function closeBranch(id) {
      this.container.find('#children_' + id).addClass('QTree-hide');
      this.syncData(id, { open: false });
    }

    //设置开关事件

  }, {
    key: 'setSwitchEvent',
    value: function setSwitchEvent() {
      var that = this;
      this.container.on('click', '.switch', function (e) {
        e.stopPropagation();
        var status = $(this).attr('data-switch');
        var id = $(this).parents('.QTree-branch').data('treeData').id;
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
      });
    }

    //更新分支

  }, {
    key: 'updateBranch',
    value: function updateBranch(id, editData) {
      if (Object.prototype.toString.call(editData) != '[object Object]') return;
      var $branchDom = this.container.find('#' + id);
      if (!$branchDom.length) return;

      var originData = $branchDom.data('treeData');

      var changeData = {};
      //检查要更新的数据
      for (var key in editData) {
        if (key in originData && editData[key] != originData[key]) {
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

  }, {
    key: 'updateBranchData',
    value: function updateBranchData($branchDom, branchData) {
      var that = this;
      $branchDom.children().each(function (i, child) {
        for (var key in branchData) {
          if (child.hasAttribute(key)) {
            child.innerHTML = branchData[key];
          }
        }
        if ($(child).children().length) {
          that.updateBranchData($(child), branchData);
        }
      });
    }

    //  删除分支

  }, {
    key: 'removeBranch',
    value: function removeBranch(id) {
      var $branchDom = this.container.find('#container_' + id);
      console.log($branchDom);
      if (!$branchDom.length) return;
      $branchDom.remove();
      this.checkSwitch(id, 'del');
    }

    //  检查分支是否有子分支，返回true或false

  }, {
    key: 'checkChlidren',
    value: function checkChlidren(id) {
      var $branchDom = this.container.find('#children_' + id);
      if ($branchDom.children().length) {
        return true;
      } else {
        return false;
      }
    }

    //  添加分支
    //  data中需要id

  }, {
    key: 'addBranch',
    value: function addBranch(pid, data) {
      if (!('id' in data)) {
        console.error('add branch must need this branch\'s id');
        return;
      }

      var branchContainer = $('#children_' + pid);
      // 设置sortID
      var parentSortID = $('#' + pid).length ? $('#' + pid).data('treeData').sortID : '';
      var sortIndex = branchContainer.children.length + 1;
      data.sortID = parentSortID + (sortIndex * 1 < 10 ? "000" + sortIndex : sortIndex * 1 > 100 ? "00" + sortIndex : sortIndex * 1 > 1000 ? sortIndex : '0' + sortIndex);
      //设置open
      data.open = false;

      var newBranch = this.createBranch(data);
      newBranch.append(this.createBranchContainer(data.id, data.open));
      branchContainer.append(newBranch);

      this.checkSwitch(pid, 'add');
    }

    //  在删除或添加分支后检查节点的子节点，判断是否需要隐藏开关
    //  在添加或删除操作完成后使用

  }, {
    key: 'checkSwitch',
    value: function checkSwitch(id, action) {
      switch (action) {
        case 'del':
          var pid = $('#' + id).data('treeData').pid;
          var branchP = $('#' + pid);
          if (!this.checkChlidren(id) && branchP.find('.switch').length) {
            //无子节点有开关
            var emptySpan = this.createEmptySpan('000100010001');
            branchP.find('.switch').remove().end().prepend(emptySpan);

            $('#children_' + pid).addClass('QTree-hide');
          }
          break;
        case 'add':
          var branch = $('#' + id);
          // if (!this.checkChlidren(id) && !branch.find('.switch').length) {
          //   let switchString = this.createSwitchString(false);
          //   branch.find('.empty-span').last().after(switchString).remove();
          // }
          if (this.checkChlidren(id) && !branch.find('.switch').length) {
            //有子节点无开关
            var switchString = this.createSwitchString(false);
            branch.find('.empty-span').last().after(switchString).remove();
          }
          break;
      }
    }

    //  输出分支下的所有数据
    //  默认所有的数据

  }, {
    key: 'getTreeData',
    value: function getTreeData(id) {
      var branchID = id ? id : 0;
      var dataList = [];

      // 如果不是所有节点，需要把当前节点的数据存入
      if (branchID) {
        dataList.push($('#' + id).data('treeData'));
      }

      $('#children_' + id).find('.QTree-branch').each(function (i, v) {
        dataList.push($(v).data('treeData'));
      });

      return dataList;
    }

    //  移动节点

  }, {
    key: 'moveBranch',
    value: function moveBranch(id, newpid) {
      //  克隆出要移动的dom，container_x
      //  获取到要移动的数据
      //  获取新的父节点sortID进行比较
      //  改变要移动的数据的sortID和顶层节点的pid
      //  将改变的数据重新绑定在克隆出来的dom中
      //  将dom插入到新的节点下
      var moveData = this.getTreeData(id); //要移动的所有节点的数据
      var moveBranch = $('#' + id); //要移动选中的节点

      moveBranch.data('treeData').pid = newpid;

      var allMoveBranch = $('#container_' + id).clone(); //克隆要移动的所有节点
      var moveBranch_sortID = moveBranch.data('treeData').sortID; //选中的移动节点的sortID
      var newParentBranch = $('#' + newpid); //新的父节点
      var newParentBranch_children = $('#children_' + id); //新的父节点的子节点容器
      var newParentBranch_sortID = newParentBranch.data('treeData').sortID; //新的父节点的sortID

      //  对比sortID
      var d_value = this.countIndex(moveBranch_sortID) - this.countIndex(newParentBranch_sortID); //差值
      if (d_value == 0) {
        return;
      }
      //层级降低
      if (d_value > 0) {
        allMoveBranch.find('.QTree-branch').each(function (i, v) {
          while (d_value) {
            $(v).find('.empty-span').eq(0).remove();
            d_value--;
          }
        });
      }
      //层级增加
      if (d_value < 0) {
        var emptySpan = this.createEmptySpan(Math.abs(d_value), true);
        allMoveBranch.find('.QTree-branch').prepend(emptySpan);
      }

      //绑定数据
      moveData.forEach(function (v) {
        allMoveBranch.find('#' + v.id).data('treeData', v);
      });

      //  插入节点
      newParentBranch_children.append(allMoveBranch);
    }
  }]);

  return Qtree;
}();