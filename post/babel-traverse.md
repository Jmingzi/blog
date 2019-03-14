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

### path 

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
    path: NodePath, // 等同于自身
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

path 中的属性都是响应式的，对属性直接赋值会直接影响到对应的 AST 节点。path 中的方法:

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

```js
{
  file: {
    declarations: {},
    path: NodePath,
    ast: Node,
    code: 'import { Toast, Loading } from \'xm-mui\'',
    opts: {
      babelrc: false,
      configFile: false,
      plugins: [Array],
      presets: []
    },
    scope: Scope
  },
  opts: {}, // 使用插件时，传入的参数
  filename: ''
}
```

另外，babel-types 是用来辅助增强 AST 节点的，里面包含了 jsx, ts 等的语法 AST，相当于是超集。babel-template 是用来快速创建节点。

上面例子的实现：

```js
function ({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (path.node.source.value === 'xm-mui') {
          // addDefault(path.hub.file.path, 'aa', { nameHint: 'hintedName' })
          const specifiers = path.node.specifiers.map(speci => {
            // 实现1
            // return t.importDeclaration(
            //   [t.importDefaultSpecifier(t.Identifier(speci.local.name))],
            //   t.StringLiteral(`xm-mui/lib/${speci.local.name}/index.js`)
            // )
            // 实现2
            // return buildImport({
            //   IMPORT_NAME: t.identifier(speci.local.name),
            //   SOURCE: t.StringLiteral(`xm-mui/lib/${speci.local.name}/index.js`)
            // })
            // 实现3
            return template.default.ast(`
              import ${speci.local.name} from 'xm-mui/lib/${speci.local.name}/index.js'
            `)
          })
          path.replaceWithMultiple(specifiers)
        }
      }
    }
  }
}
```

## 链接

- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-scopes)
- [babel-plugin-import](https://github.com/ant-design/babel-plugin-import/blob/master/src/Plugin.js)
- [babel 总揽 - AlloyTeam 17年](http://www.alloyteam.com/2017/04/analysis-of-babel-babel-overview/)
- [前端编译技术：Babel 18年11月](http://kunkun12.com/2018/11/24/webcompiler-babel/)
