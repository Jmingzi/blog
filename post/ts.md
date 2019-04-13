# Typescript

## 概述

ts 包含了类型检查与 es 代码转化 2 部分，私以为其相对于 babel 的转换还是比较鸡肋的，例如在 ts 里我想用 `optional-chain` 写法插件怎么办？

所以，我觉得目前需要了解的是 ts 的类型注解部分，即官方文档的目录：

- [基础类型](#基础类型)
- [接口](#接口)
- [泛型](#泛型)
- [内置函数](#内置函数)
- [高级类型](#高级类型)
- [声明文件](#声明文件)

## 基础类型

- string
- boolean
- number
- 数组 
  - string[], 字符数组
  - `Array<boolean>`, 泛型数组
  - [string, number]  元组
    ```typescript
    // 元组的顺序要一一对应
    const list: [string, number, boolean] = ['1', 2, false]
    ```
- `enum` 枚举，为新的数据类型，不属于类型校验范畴，不建议使用  
- `any`, 但不确定值的类型时才用
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
- 泛型别名

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
  - Partial,Readonly,Record 和 Pick，在 2.0 中，我们直到了泛型别名，这里的映射类型、只读类型等都是通过它扩展
  ```typescript
  // 可选映射类型 表示一个对象的可选属性类型
  type Partial<T> = {
    [P in keyof T]?: T[P]
  }
  // 例子
  interface Person {
  	name: string,
  	age: number
  }
  function getPerson(person: Partial<Person>): Partial<Person> {
  	return person
  }
  // age就不是必传了
  getPerson({ name: 'ym' })
  
  // 只读映射类型
  type Readonly<T> = {
    readonly [P in keyof T]: T[P]
  }

  // 选取一组属性类型 Pick<T, K>
  interface PickFn<T, K extends keyof T> {
    (obj: T, ...keys: K[]): Pick<T, K>
  }

  // TODO 关于 Record 的场景，还未实现
  function mapObject<K extends string | number, T, U>(obj: Record<K, T>, f: (x: T) => U): Record<K, U>
  ```
  ~~由于别名和接口很相似，所以这里的泛型别名其实也就是泛型接口~~
- 2.7  
  - in 类型保护
- 2.8
  - 有条件类型
      - Exclude<T, U> -- 从T中剔除可以赋值给U的类型。
      - Extract<T, U> -- 提取T中可以赋值给U的类型。
      - NonNullable<T> -- 从T中剔除null和undefined。
      - ReturnType<T> -- 获取函数返回值类型。
      - InstanceType<T> -- 获取构造函数类型的实例类型。
  
## 高级类型

了解完内置函数那一节再来看高级类型就比较轻松了，例如

- 交叉类型 与 联合类型
  ```typescript
  // T & U
  function extend<T, U>(first: T, second: U): T & U {}
  // T | U
  // 联合类型有点像类型别名
  ```
- 类型保护与类型谓词  
  上面提到的类型保护有3种：`typeof` `instanceof` `in`，类型谓词 `is` parameterName is Type
  ```typescript
  function isFish(pet: Fish | Bird): pet is Fish {
  	return (<Fish>pet).swim !== undefined;
  }
  ```
- 类型断言  
  很明确的指明 any 或 联合类型下，某种情况时的类型，例如

  ```typescript
  const value: any = 'string'
  const len: number = (value as string).length
  ```
  `as` 的写法兼容 jsx，`<string>value` 写法不支持 jsx。   
  > 这里的 `as` 和 `<>` 其实是强制类型转换  
  
  还有一种类型断言即 `!` ，感叹号，我们知道 `?:` 表示可能为空的类型，相反的 `!:` 就一定不为空了，例如 Vue 里的 `@Prop()` 写法。同理将 `!`运用到点法对象上也是可行的，例如 `name!.substr(1)`
- 类型别名 与 字符串 或 数字 的字面量类型  
  ```typescript
  // 字面量类型 很容易 让人理解错 为类型别名
  // 但是仔细想其实确实有区别的，因为别人的值都是类型，但是字符串或数字并不是类型
  type Action = 'confirm' | 'cancel' 
  type Range = 0 | 1 | 2 | 3
  ```

- 可辨识联合 就是一种比类型别名更厉害的类型，它具有3个要素：
  - 具有普通的单例类型属性— 可辨识的特征。
  -  一个类型别名包含了那些类型的联合— 联合。
  -  此属性上的类型保护。
  ```typescript
  // 要素 1， kind
  interface Square {
      kind: "square";
      size: number;
  }
  interface Rectangle {
      kind: "rectangle";
      width: number;
      height: number;
  }
  interface Circle {
      kind: "circle";
      radius: number;
  }
  // 要素 2
  type Shape = Square | Rectangle | Circle;
  // 要素 3
  function area(s: Shape) {
    switch (s.kind) {
      case "square": return s.size * s.size;
      case "rectangle": return s.height * s.width;
      case "circle": return Math.PI * s.radius ** 2;
    }
  }
  ```

- 索引类型和字符串索引签名
  ```typescript
  interface Map<T> {
      [key: string]: T
  }
  let keys: keyof Map<number> // string
  let value: Map<number>['foo'] // number
  ```

## 声明文件

在项目中自己声明的 `x.d.ts` 文件默认是自动识别的，因为 ts 的根目录是 `tsconfig.json` 所在的目录，在这根目录下生命文件都会自动识别；另外第三方的库：一种是全局变量；一种是模块化变量；所以声明会有2种方式，即

```js
// 全局的
declare function myLib(a: string): string
interface myLib {}
declare namespace myLib {
  let a: string
  class B {
  }
  interface C {
  }
}

// 模块化
export function myMethod(a: string): string
export interface someType {}
export namespace subProp {
  export function foo(): void	
}
```

如果第三方库自己写好了声明文件，并且在 package.json 中指定了 `"types": "/path/to"` 路径，这样就可以发布为 `@types/*` 的包，但是需要提 pr 才能被官方发布。

发布后，安装 `npm install --save @types/*` 就可以直接使用了，因为 ts 会通过 `"typeRoots"` 字段指定默认查找声明文件的目录。

如果没有被发布，我们也可以手动引入 `import Vue from 'vue/types'`。

```json
{
  "compilerOptions": {
    "typeRoots": ["node_modules"]
  }
}
```

默认为 `node_modules/@types` 文件夹下以及它们子文件夹下的所有包。

## 编译选项

我们先从最简单的 `index.ts` => `index.js` 转化开始， 编译选项分为 3 部分

```json
{
  "compilerOptions": {},
  "include": [],
  "exclude": []
}
```

其中主要注意 `compilerOptions` 中的 `module` 和 `target` 选项，我们不使用其转化功能，那最好使用 `esnext` 。

## links
- [如何编写 Typescript 声明文件](https://juejin.im/post/5bc406795188255c451ed3b3)
