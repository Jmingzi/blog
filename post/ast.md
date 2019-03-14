## AST

现在js生态中，几乎所有的工具、库都依赖AST，例如 vue template，webpack，eslint，babel等等，因为它们要分析词法语义，从而进行转化。那么我们有必要对它进行系统化的理解，有助于今后理解库的源码、写 babel、eslint 插件也好都是有很大帮助的。

> 本文只涉及 babel 相关的 [AST](https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md)

AST 是树形结构，由一个个节点组成，也就是一个个 Node 节点。在 js 中，只存在2种声明：变量和函数，那这2种 Node 节点结构如下：

```js
// 变量声明
VariableDeclaration: {
  type: 'VariableDeclaration',
  start: 0,
  end: 11,
  kind: 'const',
  declarations: [
    VariableDeclarator
  ]
}

// 函数声明
FunctionDeclaration: {
  type: 'FunctionDeclaration',
  start: 25,
  end: 91,
  id: Identifier,
  params: [
    Identifier
  ],
  body: BlockStatement
}
```

AST 树的根节点是 Program，定义如下

```js
interface Program <: Node {
  type: "Program";
  interpreter: InterpreterDirective | null;
  sourceType: "script" | "module";
  body: [ Statement | ModuleDeclaration ];
  directives: [ Directive ];
}
```

我们可以利用 [AST Explorer](https://astexplorer.net/) 来将代码转化成 AST帮助我们理解。例如一段简单的代码被转化为 AST 树如下图

```js
const a = 1
const c = 2

function b(obj) {
	let name = 'ym'
    obj.age = 18
  return obj
}

setTimeout(() => {}, 1000)

if (a = 1) {}
```

<img src=../images/ast.jpg width=600px>

在 Program body 中，都是由 statement 和 declaration 组成。

## AST 的生成

由 babel-parser 转化得到，代码是一个个单词，AST 是语法树，那将代码转化为 AST 需要经过2个步骤

- 词法分析 将代码进行分词
- 语法分析 对单词分析形成语法  
  例如 VariableDeclaration，FunctionDeclaration，ExpressionStatement等等都是语法
  
  

