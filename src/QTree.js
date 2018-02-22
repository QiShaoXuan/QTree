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
      openAnimateDuration: 150
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
    //检查是否有children属性，没有需添加一个空的
    if (!('children' in data)) {
      data.children = []
    }
    let needLine = this.setting.needLine ? ' Qtree-line' : ''
    //检查是否有需要初始化时打开的节点
    let open = false
    if(this.setting.openBranch.length){
      open = this.setting.openBranch.find((v) => {
        return v == data.id
      })
    }
    let $branch = $(`<li class="QTree-branch-container${needLine}"><ul class="QTree-children-container" style="display: ${open?'block':'none'}"></ul></li>`)
    $branch.find('ul').append(this.setChildren(data.children))
    $branch.prepend(this.createFormatter(data,open))
    return $branch
  }

  //  创建展示数据部分
  createFormatter(data,open) {
    let formatterBranch = $(this.setting.branchFormatter)
    //节点必须有.Qtree-branch类名
    if (!formatterBranch.hasClass('QTree-branch')) {
      formatterBranch.addClass('QTree-branch')
    }
    //节点添加 branch_id 类名，方便查找
    formatterBranch.addClass(`branch_${data.id}`)
    //将数据绑定在dom上
    formatterBranch.data('treeData', data)
    //渲染数据
    this.loadBranchData(formatterBranch, data)
    //添加开关
    formatterBranch.prepend(this.setSwitch(data,open))
    return formatterBranch
  }

  //  添加开关
  setSwitch(data,open) {
    if(open && data.children.length) return '<span class="switch minus-btn"></span>'
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
    if (!childrenArr.length) return '';
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
        that.setting.openAnimate ? $ul.slideDown(that.setting.openAnimateDuration) : $ul.show()
      } else {
        $this.removeClass('minus-btn').addClass('plus-btn')
        that.setting.openAnimate ? $ul.slideUp(that.setting.openAnimateDuration) : $ul.hide()
      }
    })
  }

// ----------------------------------------------- 方法 ----------------------------------------------
  //  打开节点
  openBranch(id, openUp = true) {
    if (id == 0) return
    let $branch = this.container.find(`.branch_${id}`)
    let $ul = $branch.siblings('.QTree-children-container')

    if ($ul.children().length && $ul.is(':hidden')) {
      //打开开关
      $branch.find('.switch').addClass('minus-btn').removeClass('plus-btn')
      //菜单收回
      this.setting.openAnimate ? $ul.slideDown(this.setting.openAnimateDuration) : $ul.show()
      if (openUp) {
        this.openBranch($branch.data('treeData').pid, true)
      }
    }
  }

  //  关闭节点
  closeBranch(id, openDown = false) {
    let $branch = this.container.find(`.branch_${id}`)
    let $ul = $branch.siblings('.QTree-children-container')

    if ($ul.children().length && !$ul.is(':hidden')) {
      //关闭开关
      $branch.find('.switch').removeClass('minus-btn').addClass('plus-btn')
      //菜单下拉
      this.setting.openAnimate ? $ul.slideUp(this.setting.openAnimateDuration) : $ul.hide()
      if (openDown) {
        let treeData = this.container.find(`.branch_${id}`).data('treeData')
        let that = this
        treeData.children.forEach((v) => {
          that.closeBranch(v.id, true)
        })
      }
    }
  }

  //  添加节点
  addBranch(pid, data) {
    //  检查是否有id和pid
    if (!('id' in data) || !('pid' in data)) return

    let newBranch = this.createBranch(data)
    //  如果是在根节点上添加
    if(pid == 0){
      return this.container.find('.QTree').append(newBranch)
    }

    let $parentBranch = this.container.find(`.branch_${pid}`)
    let parentUl = $parentBranch.siblings('.QTree-children-container')
    //  检查被添加节点是否有子节点 判断是否需要增加开关
    if(!parentUl.children().length){
      $parentBranch.prepend('<span class="switch plus-btn"></span>').find('.empty-span').remove()
    }
    //添加新的子节点
    parentUl.append(newBranch)
  }

  //  移除节点
  removeBranch(id) {
    let $branch = this.container.find(`.branch_${id}`)
    let $branchLi = $branch.parent()
    let data = $branch.data('treeData')

    //  删除该节点
    $branchLi.remove()
    //  检查该节点是否为父节点的唯一节点 判断是否需要删除开关
    if(!this.checkChlidren(data.pid)){
      let $parentBranch = this.container.find(`.branch_${data.pid}`)
      $parentBranch.prepend('<span class="empty-span"></span>').find('.switch').remove()
    }
  }

  //  检查节点是否有子节点
  checkChlidren(id) {
    let $ul = this.container.find(`.branch_${id}`).siblings('.QTree-children-container')
    return $ul.children().length ? true : false
  }

  //  更新节点数据
  updateBranch(id, data) {
    let $branch = this.container.find(`.branch_${id}`)
    let oldData = $branch.data('treeData')
    let newData = Object.assign(oldData, data)

    $branch.data('treeData', newData)
    this.loadBranchData($branch, data)
  }

//  获取节点的数据（默认全部）
  getTreeData(id) {
    //  如果有id返回该节点的数据
    if (id) return this.container.find(`.branch_${id}`).data('treeData');
    //  没有传id则返回全部的
    let allData = []
    this.container.find('.QTree-branch').each((i, v) => {
      allData.push($(v).data('treeData'))
    })
    return allData
  }

  //  移动节点
  moveBranch(moveId, newpid) {
    let $cloneBranch = this.container.find(`.branch_${moveId}`).parent().clone(true)
    let $ul = this.container.find(`.branch_${newpid}`).siblings('.QTree-children-container')
    this.removeBranch(moveId)
    $ul.append($cloneBranch)
  }

  //  关闭所有节点
  closeAllBranch() {
    this.container.find('.QTree-branch').each((i, v) => {
      let $branch = $(v)
      let $ul = $(v).siblings('.QTree-children-container')
      if ($ul.children().length && !$ul.is(':hidden')) {
        //关闭开关
        $branch.find('.switch').removeClass('minus-btn').addClass('plus-btn')
        //菜单下拉
        this.setting.openAnimate ? $ul.slideUp(this.setting.openAnimateDuration) : $ul.hide()
      }
    })
  }

  //  打开所有节点
  openAllBranch() {
    this.container.find('.QTree-branch').each((i, v) => {
      let $branch = $(v)
      let $ul = $(v).siblings('.QTree-children-container')
      if ($ul.children().length && $ul.is(':hidden')) {
        //关闭开关
        $branch.find('.switch').addClass('minus-btn').removeClass('plus-btn')
        //菜单下拉
        this.setting.openAnimate ? $ul.slideDown(this.setting.openAnimateDuration) : $ul.show()
      }
    })
  }

  //  查找父节点
  findParent(id) {
    let $branch = this.container.find(`.branch_${id}`)
    let branchData = $branch.data('treeData')

    return {
      $parentDom: this.container.find(`.branch_${branchData.pid}`),
      $parentContainer: $branch.parent().parent()
    }
  }
}
