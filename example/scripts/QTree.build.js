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
      needLine: true, //是否需要指示线
      isTile: true, //数据是否为平铺
      openAnimate: true //是否要展开动画


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
      var needLine = this.setting.needLine ? ' Qtree-line' : '';
      var $branch = $('<li class="QTree-branch-container' + needLine + '"><ul class="QTree-children-container" style="display: none"></ul></li>');
      $branch.find('ul').append(this.setChildren(data.children));
      $branch.prepend(this.createFormatter(data));
      return $branch;
    }

    //  创建展示数据部分

  }, {
    key: 'createFormatter',
    value: function createFormatter(data) {
      var formatterBranch = $(this.setting.branchFormatter);
      //节点必须有.Qtree-branch类名
      if (!formatterBranch.hasClass('QTree-branch')) {
        formatterBranch.addClass('QTree-branch');
      }
      //渲染数据
      this.loadBranchData(formatterBranch, data);
      //添加开关
      formatterBranch.prepend(this.setSwitch(data));
      return formatterBranch;
    }

    //  添加开关

  }, {
    key: 'setSwitch',
    value: function setSwitch(data) {
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
          that.setting.openAnimate ? $ul.slideDown(150) : $ul.show();
        } else {
          $this.removeClass('minus-btn').addClass('plus-btn');
          that.setting.openAnimate ? $ul.slideUp(150) : $ul.hide();
        }
      });
    }
  }]);

  return Qtree;
}();