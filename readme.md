# 树状图插件Qtree.js

## 运行示例

```javascript
npm install 
gulp
```

## 数据格式

```javascript
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
```

## 基础用法

```javascript
var tree = new Qtree('#tree-container', mockData)
```

## 自定义渲染内容

```javascript
var domStr =
  `<div class="QTree-branch">
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
  </div>`;
var tree_define = new Qtree('#tree-container-define', mockData,
  {
    branchFormatter: domStr,
    renderData: ['name', 'value_1', 'value_2'],
  })
```

## 配置项

```javascript
var tree = new Qtree(containerID, data, setting)

containerID // 树状图容器的id
data //相关数据
setting //相关配置

//默认配置如下
{
  branchFormatter: '<div class="QTree-branch"><span class="tree-content name" name></span></div>',
  renderData: ['name'],
  openBranch: 0,
  needLine:true
}
   
```



## 说明

节点的相关数据存放在该节点`.QTree-branch`下的`treeData`,可通过jquery`.data('treeData')`获取

## 方法

1. 打开节点

   ```javascript
   tree.openBranch(id[,openUp=true]);
   ```

   openUp 为是否向上打开节点，默认为true

2. 关闭节点

   ```javascript
   tree.closeBranch(id);
   ```

3. 添加节点

   ```javascript
   tree.addBranch(pid, data);
   ```

4. 移除节点

   ```javascript
   tree.removeBranch(id);
   ```

5. 检查节点是否有子节点

   ```javascript
   tree.checkChlidren(id);
   ```

   返回Boolean值

6. 更新节点数据

   ```javascript
   tree.updateBranch(id, editData);
   ```

7. 移动节点

   ```javascript
   tree.moveBranch(id, newpid);
   ```

8. 获取节点的数据（默认全部）

   ```javascript
   tree.getTreeData([id]);
   ```

9. 关闭所有节点

   ```javascript
   tree.closeAllBranch();
   ```

10. 查找父节点

  ```javascript
  tree.findParent(id);
  ```

  ​返回 {parentDom: '父节点的dom元素', parentContainer: ‘父节点的子节点容器’}