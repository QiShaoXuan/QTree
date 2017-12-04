"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mockData = [{ id: "32", pid: "3", index: 1, name: "叶子节点 3-2", allArea: '4', rentArea: '3' }, { id: "1", pid: "0", name: "父节点 1", allArea: '1234', rentArea: '56789123' }, { id: "112", pid: "11", name: "叶子节点 1-1-2", allArea: '1234', rentArea: '56789123' }, { id: "22", pid: "2", index: 1, name: "叶子节点 2-2", allArea: '5', rentArea: '2' }, { id: "1120", pid: "112", name: "叶子节点 1-1-2-0", allArea: '1234', rentArea: '56789123' }, { id: "12", pid: "1", name: "叶子节点 1-2", allArea: '4', rentArea: '56789123' }, { id: "13", pid: "1", name: "叶子节点 1-3", allArea: '4', rentArea: '56789123' }, { id: "2", pid: "0", index: 0, name: "父节点 2", allArea: '15', rentArea: '6' }, { id: "21", pid: "2", index: 1, name: "叶子节点 2-1", allArea: '5', rentArea: '2' }, { id: "11", pid: "1", name: "叶子节点 1-1", allArea: '1234', rentArea: '56789123' }, { id: "110", pid: "11", name: "叶子节点 1-1-0", allArea: '1234', rentArea: '56789123' }, { id: "111", pid: "11", name: "叶子节点 1-1-1", allArea: '1234', rentArea: '56789123' }, { id: "1121", pid: "112", name: "叶子节点 1-1-2-1", allArea: '1234', rentArea: '56789123' }, { id: "23", pid: "2", index: 1, name: "叶子节点 2-3", allArea: '5', rentArea: '2' }, { id: "3", pid: "0", index: 0, name: "父节点 3", allArea: '12', rentArea: '9' }, { id: "31", pid: "3", index: 1, name: "叶子节点 3-1", allArea: '4', rentArea: '3' }, { id: "1122", pid: "112", name: "叶子节点 1-1-2-2", allArea: '1234', rentArea: '56789123' }, { id: "33", pid: "3", index: 1, name: "叶子节点 3-3", allArea: '4', rentArea: '3' }];
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
      branchFormatter: "<div class=\"QTree-branch\">\n                          <span class=\"tree-content name\" name></span>\n                          <div class=\"edit-container\"><span class=\"btn edit-btn\">\u7F16\u8F91</span></div>\n                        </div>",
      limit: 'auto',
      switchClass: '.switch',
      icon: '',
      openID: '',
      branchClickEvent: '',
      renderData: ['name']
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
    key: "init",
    value: function init() {
      this.sortNodes(this.nodeData);
      this.createTree();
      this.setSwitchEvent();
    }

    //处理数据排序

  }, {
    key: "sortNodes",
    value: function sortNodes(treejson) {
      var that = this;
      //添加祖元素
      var rootNode = { id: '0', pid: '', name: "root", open: true };
      treejson.splice(0, 0, rootNode);
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

        var length = nodeArr.length;

        // that.nodeData = nodeArr.splice(1, length - 1)
        that.nodeData = nodeArr;
      }

      function node(json, pnode, arr, pid) {
        if (!json) return;
        json.child.forEach(function (v, i) {
          json.child[i].sortID = pnode + json.child[i].sortID;
          arr.push(json.child[i]);
          if (formatJson[json.child[i].id] && json.child[i].pid != '') {
            json.child[i].open = false;
          }
          node(formatJson[json.child[i].id], json.child[i].sortID, arr);
        });
      }
    }

    // 创建树

  }, {
    key: "createTree",
    value: function createTree() {
      var that = this;
      var frag = $(document.createDocumentFragment());
      this.nodeData.forEach(function (v, i) {
        if (v.pid) {
          frag.find("#children_" + v.pid).append(that.createBranch(v));
          // if ('open' in v) {
          frag.find("#container_" + v.id).append(that.createBranchContainer(v.id, v.open));
          // }
        } else {
          frag.append(that.createBranchContainer(v.id, v.open));
        }
      });

      this.container.empty().append(frag);
    }

    //  创建分支容器

  }, {
    key: "createBranchContainer",
    value: function createBranchContainer(pid, isopen) {
      var container = "<div class=\"QTree-children-container " + (isopen ? '' : 'QTree-hide') + "\" id=\"children_" + pid + "\"></div>";
      return container;
    }

    //创建分支

  }, {
    key: "createBranch",
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
      if (branchData.hasOwnProperty('open')) {
        var switchSpan = this.createSwitch(branchData.open);
        branch.prepend(switchSpan);
      }
      //3.添加空格
      branch.prepend(emptySpan);

      //4.添加id
      branch.attr('id', branchData.id);
      //分支需要添加QTree-branch类名
      if (!branch.hasClass('QTree-branch')) {
        branch.addClass('QTree-branch');
      }

      var branchContainer = $("<div class=\"QTree-branch-container\" id=\"container_" + branchData.id + "\"></div>");
      branchContainer.append(branch);
      return branchContainer;
    }

    //第一次加载时加载分支对应的数据

  }, {
    key: "loadBranchData",
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
    //   var parent = this.nodeData.find((v) => {
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
    key: "hasChildren",
    value: function hasChildren(id) {
      var child = this.nodeData.find(function (v, i) {
        return v.pid === id;
      });
      return child ? true : false;
    }

    //创建开关按钮

  }, {
    key: "createSwitch",
    value: function createSwitch(open) {
      if (open) {
        return "<i class=\"switch minus-btn\" data-switch=\"true\"></i>";
      } else {
        return "<i class=\"switch plus-btn\" data-switch=\"false\"></i>";
      }
    }

    //根据index判断是第几层级添加空格

  }, {
    key: "createEmptySpan",
    value: function createEmptySpan(sortID) {
      var num = countIndex(sortID);
      var emptySpan = '';
      for (var i = 0; i < num; i++) {
        emptySpan = emptySpan + '<span class="empty-span"></span>';
      }
      return emptySpan;

      //根据sortID判断当前节点层级
      function countIndex(sortID) {
        if (sortID) {
          return sortID.length / 4 - 2;
        } else {
          return 0;
        }
      }
    }

    //同步视图上的数据和dom中存储的数据

  }, {
    key: "syncData",
    value: function syncData(id, data) {
      var $branchDom = this.container.find("#" + id);
      for (var i in data) {
        $branchDom.data('treeData')[i] = data[i];
      }
    }
  }, {
    key: "onchangeBranch",
    value: function onchangeBranch(id) {}

    //打开分支

  }, {
    key: "openBranch",
    value: function openBranch(id) {
      this.container.find("#children_" + id).removeClass('QTree-hide');
      this.syncData(id, { open: true });
    }
    //关闭分支

  }, {
    key: "closeBranch",
    value: function closeBranch(id) {
      this.container.find("#children_" + id).addClass('QTree-hide');
      this.syncData(id, { open: false });
    }
    //设置开关事件

  }, {
    key: "setSwitchEvent",
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
    key: "updateBranch",
    value: function updateBranch(id, editData) {
      if (Object.prototype.toString.call(editData) != '[object Object]') return;
      var $branchDom = this.container.find("#" + id);
      if (!$branchDom.length) return;

      var originData = $branchDom.data('treeData');

      var changeData = {};
      //检查要更新的数据
      for (var key in editData) {
        if (tkey in originData && editData[key] != originData[key]) {
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
    key: "updateBranchData",
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
    key: "removeBranch",
    value: function removeBranch(id) {
      var $branchDom = this.container.find("#" + id);
      if (!$branchDom.length) return;
      $branchDom.parent().remove();
    }
    //  检查分支是否有子分支，返回true或false

  }, {
    key: "checkChlidren",
    value: function checkChlidren(id) {
      var $branchDom = this.container.find("#" + id);
      if ($branchDom.siblings('.QTree-children-container').length) {
        return true;
      } else {
        return false;
      }
    }
    //  添加分支

  }, {
    key: "addBranch",
    value: function addBranch(pid, data) {
      var branchContainer = $("children_" + pid);
      if (!branchContainer.length) return;
      var newBranch = this.createBranch(data);
      branchContainer.append(newBranch);
    }
  }]);

  return Qtree;
}();