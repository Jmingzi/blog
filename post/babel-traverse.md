## babel-traverse

在 babel-parser 将代码转成 AST 后，再由 babel-traverse 进行语法转化。

转化的过程其实就是深度优先遍历 AST 树，遍历的时候会经过每一个 Node 节点，对每个节点可以进行增删改查操作。

babel 提供给每个 plugin 一个对象，也就是访问者 Visitor 

```js
const visitor = {
  VariableDeclaration(path, state) {
    // do something
  }
}
```

对于每一个访问者，都会有进入 enter 和退出 exit 事件，在访问者上接受2个参数 path 和 state

用一段代码来举例

```js
// 转换前
import { Toast, Loading } from 'xm-mui'

// 转换后
import Toast from 'xm-mui/lib/Toast/index.js'
import Loading from 'xm-mui/lib/Loading/index.js'
```

#### path 

包含了当前节点的基本属性和操作节点的方法，属性基本如下：

```js
{
  parent: {},
  hub: {
    file: File
  },
  contexts: {},
  data: {},
  parentPath: {
    parent: {},
    hub: {}
    // ...
  },
  context: {},
  container: [
    Node
  ],
  listKey: 'body',
  inList: true,
  parentKey:: 'body',
  key: 0,
  node: {
    type: 'ImportDeclaration'
    // ... Node
  },
  scope: {
    uid: 0,
    block: Node,
    path: NodePath, // 等同于自身？
    labels: Map{},
    references: { Toast: true, Loading: true }, // 引用
    bindings: { Toast: [Binding], Loading: [Binding] }, // 绑定的引用
    // ...
  },
  type: 'ImportDeclaration'
}
```

其中我们最常关心的应该是
```js
{
  node: {}, // 节点
  parent: {}, // 父节点
  parentPath: {}, // 父节点的path
  scope: {} // 作用域，可用来处理当前变量或声明的引用关系
}
```

path 中的属性都是响应式的，对属性直接赋值会直接影响到对应的 AST 节点。

path 中的方法

```js
{
  get(), // 获取子节点属性，一般我们可以用 path.node.value 直接取值
  findParent(), // 在父节点中查找
  getSibling(), // 获取兄弟节点
  getFunctionParent(), // 获取最近的 function 父节点
  getStatementParent(), // 获取最近的 statement 父节点
  replaceWith(), // 用 AST 节点替换当前节点
  replaceWithMultiple(), // 用多个 AST 替换，数组格式
  insertBefore(), // 在兄弟节点前面插入
  insertAfter(), // 在兄弟节点后面插入
  remove(), // 移除当前节点
  pushContainer() // 将 AST 节点 push 到节点的属性前面，类似数组的 push
}
```

### state
