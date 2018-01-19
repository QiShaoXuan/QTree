//       ul(class=QTree-children-container QTree , id=children_x)
//        |
//        |-- li(class=QTree-branch-container , id=container_x)
//             |
//             |-- div(class=QTree-branch , id=x)
//             |-- ul(class=QTree-children-container , id=children_x)

class Qtree {
  constructor(container, treeData, setting = {}) {
    let originSetting = {
      branchFormatter: `<div class="QTree-branch">
                          <span class="tree-content" name></span>
                        </div>`,
      renderData: ['name'],//渲染的数据名称，同时需要在标签中设置
      openBranch: [],//初始化时默认打开的节点，数组存放id
      needLine: true, //是否需要指示线
      isTile: true,//数据是否为平铺
      openAnimate: true,//是否要展开动画
    }

    //  如果要自定义渲染的数据，需要在renderData中添加渲染的属性值，并且在branchFormatter中对应的标签内添加相应的值
    this.setting = Object.assign(originSetting, setting)

    this.cloneData = treeData
    this.container = $(container)
    this.nodeData

    this.init()
  }

  init() {
    this.initData()
    this.createTree()
    this.initEvent()
  }

  //  初始化数据
  initData() {
    if (this.setting.isTile) {
      const arrangeData = this.cloneData.filter((v) => {
        return v.pid == 0
      })

      arrangeData.forEach((v) => {
        this.findChildrenDown(v, v.id)
      })

      this.nodeData = arrangeData;
    } else {
      this.nodeData = this.cloneData
    }
  }

  //  将子节点放入父节点的children中
  findChildrenDown(parentData, pid) {
    let children = this.cloneData.filter((child) => {
      return child.pid == pid
    })
    if (children.length) {
      parentData.children = children
      parentData.children.forEach((v) => {
        this.findChildrenDown(v, v.id)
      })
    } else {
      parentData.children = []
    }
  }

  //  创建树状图
  createTree() {
    let frag = $('<ul class="QTree-children-container QTree"></ul>')//最外层ul需要有QTree类名
    this.nodeData.forEach((v) => {
      frag.append(this.createBranch(v))
    })
    this.container.empty().append(frag)
  }

  //  创建分支
  createBranch(data) {
    let needLine = this.setting.needLine ? ' Qtree-line' : ''
    let $branch = $(`<li class="QTree-branch-container${needLine}"><ul class="QTree-children-container" style="display: none"></ul></li>`)
    $branch.find('ul').append(this.setChildren(data.children))
    $branch.prepend(this.createFormatter(data))
    return $branch
  }

  //  创建展示数据部分
  createFormatter(data) {
    let formatterBranch = $(this.setting.branchFormatter)
    //节点必须有.Qtree-branch类名
    if (!formatterBranch.hasClass('QTree-branch')) {
      formatterBranch.addClass('QTree-branch')
    }
    //渲染数据
    this.loadBranchData(formatterBranch, data)
    //添加开关
    formatterBranch.prepend(this.setSwitch(data))
    return formatterBranch
  }

  //  添加开关
  setSwitch(data) {
    return data.children.length ? '<span class="switch plus-btn"></span>' : '<span class="empty-span"></span>'
  }

  //  渲染展示的数据
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

  //  创建子节点
  setChildren(childrenArr) {
    let frag = $(document.createDocumentFragment())
    childrenArr.forEach((v) => {
      frag.append(this.createBranch(v))
    })
    return frag
  }

  //  设置事件
  initEvent() {
    this.setSwitchEvent()
  }
  //  设置开关事件
  setSwitchEvent() {
    let that = this
    this.container.on('click', '.switch', function (e) {
      e.stopPropagation()
      let $this = $(this)
      let flag = $this.hasClass('plus-btn')
      let $ul = $this.parents('.QTree-branch').siblings('.QTree-children-container')
      if (flag) {
        $this.removeClass('plus-btn').addClass('minus-btn')
        that.setting.openAnimate ? $ul.slideDown(150) : $ul.show()
      } else {
        $this.removeClass('minus-btn').addClass('plus-btn')
        that.setting.openAnimate ? $ul.slideUp(150) : $ul.hide()
      }
    })
  }
}
