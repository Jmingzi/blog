# Typescript

### 概述

ts 包含了类型检查与es代码转化 2 部分，私以为其相对于 babel 的转换还是比较鸡肋的，例如在 ts 里我想用 `optional-chain` 写法插件怎么办？

所以，我觉得目前需要了解的是ts的类型注解部分，即官方文档的目录：

- 基础类型
- 接口
- 泛型
- 高级类型
- 命名空间和模块
- 声明文件

### 编译选项

我们先从最简单的 `index.ts` => `index.js` 转化开始， 编译选项分为 3 部分

```json
{
  "compilerOptions": {},
  "include": [],
  "exclude": []
}
```

其中主要注意 `compilerOptions` ，

### 基础类型

- string,
- boolean,
- number, 
- 数组 
  - string[], 字符数组
  - Array<boolean>, 泛型数组
  - [string, number]  元组
    ```js
    // 元组的顺序要一一对应
    const list: [string, number, boolean] = ['1', 2, false]
    ```
- enum 枚举，为新的数据类型，不属于类型校验范畴，不建议使用  
- any, 但不确定值的类型时才用
  ```js
  // 同元组的例子
  // 当不确定元组类型 
  // 切元组数量很大时 适合用 any
  const list: any[] = [1, true, 'free']
  ```
- void, 可以代表 null 和 undefined
- null 和 undefined 在编译选项 `strictNullChecks` 开启时只能赋值给自己，也建议这样使用
- never 适用于那些总是抛出异常、且没有 end point 的函数
  ```js
  function neverTest(): never {
    throw new Error('error')
  }
  ```
- object

### 类型断言

很明确的指明 any 或 联合类型下，某种情况时的类型，例如

```js
const value: any = 'string'
const len: number = (value as string).length
```

`as` 的写法兼容 jsx，`<string>value` 写法不支持。 

### 接口

接口可以用来描述一个对象的属性和方法，例如

```js
const obj = {
  name: 'ym',
  age: 18
}

// 用接口描述，注意每行结束没有逗号
interface ObjProps {
  name: string
  age: number
}
```

接口还可以单独用来描述一个函数

```js
interface SearchFunc {
  (source: string, subString: string): boolean
}

const mySearch: SearchFunc = function(src: string, sub: string): boolean {
  const result = src.search(sub)
  return result > -1
}
```

其实，当我们声明 `mySearch: SearchFunc` 后，后面的匿名函数不需要指明类型了

```js
const mySearch: SearchFunc = function(src, sub) {
	const result = src.search(sub)
	return result > -1
}
mySearch(11, 11) // Error
```

索引与对象的任意属性

```js
interface ObjProps {
  // 同时添加了索引类型 与 任意属性的匹配
  [index: string]: string | number
	name?: string
	age?: number
}
```

理所当然的，接口可以描述一个类，接口描述了类的公共部分，而不是公共和私有两部分。 它不会帮你检查类是否具有某些私有成员。

```js
interface ObjProps {
  love: string
}

class Obj implements ObjProps {
  static love: string = 'ym'
}

// Error，ObjProps 里的 love 属性未被 implements
```

另外需要说明的是，接口对于类不是必须的，因为在接口中将类或方法的进行类型声明后，在类中仍然需要再次声明类型，ts不会去做类型推论。这点不同于函数对于接口的声明。

### 声明文件的自动引入

```json
{
  "compilerOptions": {
    "typeRoots": ["node_modules"]
  }
}
```

默认为 `node_modules/@types` 文件夹下以及它们子文件夹下的所有包。
