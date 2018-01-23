'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//       ul(class=QTree-children-container QTree , id=children_x)
//        |
//        |-- li(class=QTree-branch-container , id=container_x)
//             |
//             |-- div(class=QTree-branch , id=x)
//             |-- ul(class=QTree-children-container , id=children_x)
var Qtree = function () {
  function Qtree(container, treeData) {
    var setting = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Qtree);

    var originSetting = {
      branchFormatter: '<div class="QTree-branch">\n                          <span class="tree-content" name></span>\n                        </div>',
      renderData: ['name'], //渲染的数据名称，同时需要在标签中设置
      openBranch: [], //初始化时默认打开的节点，数组存放id
      needLine: false, //是否需要指示线
      isTile: true, //数据是否为平铺
      openAnimate: true, //是否要展开动画
      openAnimateDuration: 150

      //  如果要自定义渲染的数据，需要在renderData中添加渲染的属性值，并且在branchFormatter中对应的标签内添加相应的值
    };this.setting = Object.assign(originSetting, setting);

    this.cloneData = treeData;
    this.container = $(container);
    this.nodeData;

    this.init();
  }

  _createClass(Qtree, [{
    key: 'init',
    value: function init() {
      this.initData();
      this.createTree();
      this.initEvent();
    }

    //  初始化数据

  }, {
    key: 'initData',
    value: function initData() {
      var _this = this;

      if (this.setting.isTile) {
        var arrangeData = this.cloneData.filter(function (v) {
          return v.pid == 0;
        });

        arrangeData.forEach(function (v) {
          _this.findChildrenDown(v, v.id);
        });

        this.nodeData = arrangeData;
      } else {
        this.nodeData = this.cloneData;
      }
    }

    //  将子节点放入父节点的children中

  }, {
    key: 'findChildrenDown',
    value: function findChildrenDown(parentData, pid) {
      var _this2 = this;

      var children = this.cloneData.filter(function (child) {
        return child.pid == pid;
      });
      if (children.length) {
        parentData.children = children;
        parentData.children.forEach(function (v) {
          _this2.findChildrenDown(v, v.id);
        });
      } else {
        parentData.children = [];
      }
    }

    //  创建树状图

  }, {
    key: 'createTree',
    value: function createTree() {
      var _this3 = this;

      var frag = $('<ul class="QTree-children-container QTree"></ul>'); //最外层ul需要有QTree类名
      this.nodeData.forEach(function (v) {
        frag.append(_this3.createBranch(v));
      });
      this.container.empty().append(frag);
    }

    //  创建分支

  }, {
    key: 'createBranch',
    value: function createBranch(data) {
      //检查是否有children属性，没有需添加一个空的
      if (!('children' in data)) {
        data.children = [];
      }
      var needLine = this.setting.needLine ? ' Qtree-line' : '';
      //检查是否有需要初始化时打开的节点
      var open = false;
      if (this.setting.openBranch.length) {
        open = this.setting.openBranch.find(function (v) {
          return v == data.id;
        });
      }
      var $branch = $('<li class="QTree-branch-container' + needLine + '"><ul class="QTree-children-container" style="display: ' + (open ? 'block' : 'none') + '"></ul></li>');
      $branch.find('ul').append(this.setChildren(data.children));
      $branch.prepend(this.createFormatter(data, open));
      return $branch;
    }

    //  创建展示数据部分

  }, {
    key: 'createFormatter',
    value: function createFormatter(data, open) {
      var formatterBranch = $(this.setting.branchFormatter);
      //节点必须有.Qtree-branch类名
      if (!formatterBranch.hasClass('QTree-branch')) {
        formatterBranch.addClass('QTree-branch');
      }
      //节点添加 branch_id 类名，方便查找
      formatterBranch.addClass('branch_' + data.id);
      //将数据绑定在dom上
      formatterBranch.data('treeData', data);
      //渲染数据
      this.loadBranchData(formatterBranch, data);
      //添加开关
      formatterBranch.prepend(this.setSwitch(data, open));
      return formatterBranch;
    }

    //  添加开关

  }, {
    key: 'setSwitch',
    value: function setSwitch(data, open) {
      if (open && data.children.length) return '<span class="switch minus-btn"></span>';
      return data.children.length ? '<span class="switch plus-btn"></span>' : '<span class="empty-span"></span>';
    }

    //  渲染展示的数据

  }, {
    key: 'loadBranchData',
    value: function loadBranchData(branch, branchData) {
      var _this4 = this;

      var that = this;

      branch.children().each(function (i, child) {
        _this4.setting.renderData.forEach(function (v, i) {
          if (child.hasAttribute(v) && branchData[v]) {
            child.innerHTML = branchData[v];
          }
        });
        if ($(child).children().length) {
          that.loadBranchData($(child), branchData);
        }
      });
    }

    //  创建子节点

  }, {
    key: 'setChildren',
    value: function setChildren(childrenArr) {
      var _this5 = this;

      if (!childrenArr.length) return '';
      var frag = $(document.createDocumentFragment());
      childrenArr.forEach(function (v) {
        frag.append(_this5.createBranch(v));
      });
      return frag;
    }

    //  设置事件

  }, {
    key: 'initEvent',
    value: function initEvent() {
      this.setSwitchEvent();
    }

    //  设置开关事件

  }, {
    key: 'setSwitchEvent',
    value: function setSwitchEvent() {
      var that = this;
      this.container.on('click', '.switch', function (e) {
        e.stopPropagation();
        var $this = $(this);
        var flag = $this.hasClass('plus-btn');
        var $ul = $this.parents('.QTree-branch').siblings('.QTree-children-container');
        if (flag) {
          $this.removeClass('plus-btn').addClass('minus-btn');
          that.setting.openAnimate ? $ul.slideDown(that.setting.openAnimateDuration) : $ul.show();
        } else {
          $this.removeClass('minus-btn').addClass('plus-btn');
          that.setting.openAnimate ? $ul.slideUp(that.setting.openAnimateDuration) : $ul.hide();
        }
      });
    }

    // ----------------------------------------------- 方法 ----------------------------------------------
    //  打开节点

  }, {
    key: 'openBranch',
    value: function openBranch(id) {
      var openUp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (id == 0) return;
      var $branch = this.container.find('.branch_' + id);
      var $ul = $branch.siblings('.QTree-children-container');

      if ($ul.children().length && $ul.is(':hidden')) {
        //打开开关
        $branch.find('.switch').addClass('minus-btn').removeClass('plus-btn');
        //菜单收回
        this.setting.openAnimate ? $ul.slideDown(this.setting.openAnimateDuration) : $ul.show();
        if (openUp) {
          this.openBranch($branch.data('treeData').pid, true);
        }
      }
    }

    //  关闭节点

  }, {
    key: 'closeBranch',
    value: function closeBranch(id) {
      var openDown = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var $branch = this.container.find('.branch_' + id);
      var $ul = $branch.siblings('.QTree-children-container');

      if ($ul.children().length && !$ul.is(':hidden')) {
        //关闭开关
        $branch.find('.switch').removeClass('minus-btn').addClass('plus-btn');
        //菜单下拉
        this.setting.openAnimate ? $ul.slideUp(this.setting.openAnimateDuration) : $ul.hide();
        if (openDown) {
          var treeData = this.container.find('.branch_' + id).data('treeData');
          var that = this;
          treeData.children.forEach(function (v) {
            that.closeBranch(v.id, true);
          });
        }
      }
    }

    //  添加节点

  }, {
    key: 'addBranch',
    value: function addBranch(pid, data) {
      //  检查是否有id和pid
      if (!('id' in data) || !('pid' in data)) return;

      var newBranch = this.createBranch(data);
      //  如果是在根节点上添加
      if (pid == 0) {
        return this.container.find('.QTree').append(newBranch);
      }

      var $parentBranch = this.container.find('.branch_' + pid);
      var parentUl = $parentBranch.siblings('.QTree-children-container');
      //  检查被添加节点是否有子节点 判断是否需要增加开关
      if (!parentUl.children().length) {
        $parentBranch.prepend('<span class="switch plus-btn"></span>').find('.empty-span').remove();
      }
      //添加新的子节点
      parentUl.append(newBranch);
    }

    //  移除节点

  }, {
    key: 'removeBranch',
    value: function removeBranch(id) {
      var $branch = this.container.find('.branch_' + id);
      var $branchLi = $branch.parent();
      var data = $branch.data('treeData');

      //  删除该节点
      $branchLi.remove();
      //  检查该节点是否为父节点的唯一节点 判断是否需要删除开关
      if (!this.checkChlidren(data.pid)) {
        var $parentBranch = this.container.find('.branch_' + data.pid);
        $parentBranch.prepend('<span class="empty-span"></span>').find('.switch').remove();
      }
    }

    //  检查节点是否有子节点

  }, {
    key: 'checkChlidren',
    value: function checkChlidren(id) {
      var $ul = this.container.find('.branch_' + id).siblings('.QTree-children-container');
      return $ul.children().length ? true : false;
    }

    //  更新节点数据

  }, {
    key: 'updateBranch',
    value: function updateBranch(id, data) {
      var $branch = this.container.find('.branch_' + id);
      var oldData = $branch.data('treeData');
      var newData = Object.assign(oldData, data);

      $branch.data('treeData', newData);
      this.loadBranchData($branch, data);
    }

    //  获取节点的数据（默认全部）

  }, {
    key: 'getTreeData',
    value: function getTreeData(id) {
      //  如果有id返回该节点的数据
      if (id) return this.container.find('.branch_' + id).data('treeData');
      //  没有传id则返回全部的
      var allData = [];
      this.container.find('.QTree-branch').each(function (i, v) {
        allData.push($(v).data('treeData'));
      });
      return allData;
    }

    //  移动节点

  }, {
    key: 'moveBranch',
    value: function moveBranch(moveId, newpid) {
      var $cloneBranch = this.container.find('.branch_' + moveId).parent().clone(true);
      var $ul = this.container.find('.branch_' + newpid).siblings('.QTree-children-container');
      this.removeBranch(moveId);
      $ul.append($cloneBranch);
    }

    //  关闭所有节点

  }, {
    key: 'closeAllBranch',
    value: function closeAllBranch() {
      var _this6 = this;

      this.container.find('.QTree-branch').each(function (i, v) {
        var $branch = $(v);
        var $ul = $(v).siblings('.QTree-children-container');
        if ($ul.children().length && !$ul.is(':hidden')) {
          //关闭开关
          $branch.find('.switch').removeClass('minus-btn').addClass('plus-btn');
          //菜单下拉
          _this6.setting.openAnimate ? $ul.slideUp(_this6.setting.openAnimateDuration) : $ul.hide();
        }
      });
    }

    //  打开所有节点

  }, {
    key: 'openAllBranch',
    value: function openAllBranch() {
      var _this7 = this;

      this.container.find('.QTree-branch').each(function (i, v) {
        var $branch = $(v);
        var $ul = $(v).siblings('.QTree-children-container');
        if ($ul.children().length && $ul.is(':hidden')) {
          //关闭开关
          $branch.find('.switch').addClass('minus-btn').removeClass('plus-btn');
          //菜单下拉
          _this7.setting.openAnimate ? $ul.slideDown(_this7.setting.openAnimateDuration) : $ul.show();
        }
      });
    }

    //  查找父节点

  }, {
    key: 'findParent',
    value: function findParent(id) {
      var $branch = this.container.find('.branch_' + id);
      var branchData = $branch.data('treeData');

      return {
        $parentDom: this.container.find('.branch_' + branchData.pid),
        $parentContainer: $branch.parent().parent()
      };
    }
  }]);

  return Qtree;
}();