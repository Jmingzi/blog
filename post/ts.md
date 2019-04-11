# Typescript

## 概述

ts 包含了类型检查与es代码转化 2 部分，私以为其相对于 babel 的转换还是比较鸡肋的，例如在 ts 里我想用 `optional-chain` 写法插件怎么办？

所以，我觉得目前需要了解的是ts的类型注解部分，即官方文档的目录：

- 基础类型
- 接口
- 泛型
- 内置函数
- 高级类型
- 声明文件

## 基础类型

- string,
- boolean,
- number, 
- 数组 
  - string[], 字符数组
  - Array<boolean>, 泛型数组
  - [string, number]  元组
    ```typescript
    // 元组的顺序要一一对应
    const list: [string, number, boolean] = ['1', 2, false]
    ```
- enum 枚举，为新的数据类型，不属于类型校验范畴，不建议使用  
- any, 但不确定值的类型时才用
  ```typescript
  // 同元组的例子
  // 当不确定元组类型 
  // 切元组数量很大时 适合用 any
  const list: any[] = [1, true, 'free']
  ```
- void, 可以代表 null 和 undefined
- null 和 undefined 在编译选项 `strictNullChecks` 开启时只能赋值给自己，也建议这样使用
- never 适用于那些总是抛出异常、且没有 end point 的函数
  ```typescript
  function neverTest(): never {
    throw new Error('error')
  }
  ```
- object

## 类型断言

很明确的指明 any 或 联合类型下，某种情况时的类型，例如

```typescript
const value: any = 'string'
const len: number = (value as string).length
```

`as` 的写法兼容 jsx，`<string>value` 写法不支持。 

## 接口

接口可以用来描述一个对象的属性和方法，例如

```typescript
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

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean
}

const mySearch: SearchFunc = function(src: string, sub: string): boolean {
  const result = src.search(sub)
  return result > -1
}
```

另外，一个函数的完整类型声明，是有参数和返回值组成，即 `(arg1: type) => type`，例如：

```typescript
let myAdd: (x: number, y: number) => number 
myAdd = function(x: number, y: number): number { 
  return x + y 
}

// 但是一般情况下，我们使用了 ts 的类型推论 或 上面的接口声明来简化
// 类型推论
let myAdd = function(x: number, y: number): number { 
  return x + y 
}
// 或
let myAdd: (x: number, y: number) => number
myAdd = function(x, y) {
	return x + y
}
// 或接口声明
```


其实，当我们声明 `mySearch: SearchFunc` 后，后面的匿名函数不需要指明类型了

```typescript
const mySearch: SearchFunc = function(src, sub) {
  const result = src.search(sub)
  return result > -1
}
mySearch(11, 11) // Error
```

索引与对象的任意属性

```typescript
interface ObjProps {
  // 同时添加了索引类型 与 任意属性的匹配
  [index: string]: string | number
  name?: string
  age?: number
}
```

理所当然的，接口可以描述一个类，ts只会检查一个类的公共部分，对于私有和静态的属性或方法是不会检查的。

```typescript
interface ObjProps {
  love: string
}

class Obj implements ObjProps {
  static love: string = 'ym'
}

// Error，ObjProps 里的 love 属性未被 implements
```

另外需要说明的是，接口对于类不是必须的，因为在接口中将类或方法的进行类型声明后，在类中仍然需要再次声明类型，ts不会去做类型推论。这点不同于函数对于接口的声明。

## 泛型

- 泛型数组
- 泛型函数
- 泛型类

上面在介绍基础类型时，提到了泛型数组，即 `Array<string>`，可以用来描述 `let list = ['1', '2']`

同样，可以创建泛型函数，泛型函数的核心是 **利用泛型变量来得到输入类型**，从而我们可以用这个类型来做一些限制，而不是用any。例如：

```typescript
// 限制输入输出类型一致
function identity<T>(arg: T): T {
  return arg
}
identity('ym')
```

定义泛型，上面我们提到过关于函数的类型声明可以用接口实现，那么上面这个函数用接口来实现

```typescript
interface IdentityFn {
  <T>(arg: T): T
}

let identity: IdentityFn = function(arg) {
  return arg
}
```

指定泛型类型的泛型定义，这就是泛型函数的终极用法。

```typescript
// 泛型接口定义
interface IdentityFn<T> {
  (arg: T): T
}
// 完整的泛型函数声明，对于函数的类型可以向上面一样简写
let identity: IdentityFn<string> = function <T>(arg: T): T {
  return arg
}
```

泛型类我觉得限制太过单一，场景比较限制，例如

```typescript
class Obj<T> {
  name: T
}
new Obj<string>()
```

泛型约束，可以使用 extends 来使类型变量继承任意类型，在这里我们约束类型 K 一定是类型 T 的成员

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

let x = { a: 1, b: 2, c: 3, d: 4 }

getProperty(x, "a") // okay
getProperty(x, "m") // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.
```

## 内置函数

内置函数没有文档的特殊声明，但是可以通过**文档版本**中每一个版本新增的特性去查看，这里做下汇总

- 1.4
  - typeof instanceof 类型守护
  - type 类型别名
  - | 联合类型
- 1.6
  - as 类型转换 同 <> 例如 `let x = <any> foo` === `let x = foo as any`，同**类型断言**
  - 交叉类型 &
- 1.8   
  - 泛型别名
  ```typescript
  type Some<T> = T | void
  function isDefined<T>(val: Some<T>): val is T {
    return val !== undefined && val !== null
  }
  ```
- 2.0
  - 只读属性 readonly   
- 2.1
  - 查找类型 keyof
  ```typescript
  interface Person {
      name: string
      age: number
      location: string
  }
  type K1 = keyof Person // "name" | "age" | "location"
  type K2 = keyof Person[]  // "length" | "push" | "pop" | "concat" | ...
  ```  
  - 索引类型
  ```typescript
  type P1 = Person['name'] // string
  type P2 = string[]['push'] // (...items: string[]) => number
  ```
  - 综合使用，就是我们上面提到的类型约束的例子
  ```typescript
  function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
      return obj[key]  // 推断类型是T[K]
  }
  ```
  
## 高级类型



## 编译选项

我们先从最简单的 `index.ts` => `index.js` 转化开始， 编译选项分为 3 部分

```json
{
  "compilerOptions": {},
  "include": [],
  "exclude": []
}
```

其中主要注意 `compilerOptions` ，

### 声明文件的自动引入

```json
{
  "compilerOptions": {
    "typeRoots": ["node_modules"]
  }
}
```

默认为 `node_modules/@types` 文件夹下以及它们子文件夹下的所有包。
