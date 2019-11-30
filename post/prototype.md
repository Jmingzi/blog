## 前言

原型与闭包的存在，让js衍生出很多设计模式。所以深入理解它们是掌握这门语言基础的重中之重。

本文主要内容：
- 理解原型
- 继承的几种模式

## 理解原型

#### 1. 原型与数据类型

原型是构造函数的属性，那何为构造函数？

在js的类型中，分为：

- 基础数据类型
    - string
    - number
    - boolean
    - undefined
    - null
    - symbol (es6)
- 复杂数据类型（引用类型）
    - Function
    - Object
    - String
    - Number
    - Boolean
    - Array
    - ... 等等

我们可以看到复杂的数据类型都是函数衍生（继承）的，而通过这些函数可以实例化为基础类型或复杂类型的数据，这些函数就是构造函数。

之所以划分数据的类型是因为值的存放方式不一样，但值的本质确是一样的，例如：

```javascript
({}).__proto__ === (1).__proto__.__proto__
```

我们可以看到只要是数据它都是由构造函数实例化而来，如果忽略值存放的位置，在js中，一切都是对象。

一切都是Object的实例

```js
Function.__proto__.__proto__ === Object.prototype
(true).__proto__.__proto__ === Object.prototype
```

#### 2. 函数与对象的关系

对象 `Object.prototype` 是一切的缔造者，因为 `Object.prototype.__proto__ === null` 它不再继承至任何类型。

`Object` 是构造函数，js在创建函数时，默认都会创建 `prototype` 原型属性，`protoype` 是一个指针，指向这个构造函数所拥有的全部属性和方法的对象。例如：

```js
function Super () {
    
}
Super.prototype.getName = () => {}
```
这里 Super 的 prototype  就是一个引用类型的指针，指向 Super 的原型`Prototype`。


那么函数与对象互相从属吗？

- 以正常的继承逻辑思考，`Function` 是对象，那就是 `Object.prototype` 衍生出来的一种类型，例如 `Date` 这种，因为

  ```js
  Function.__proto__ === Function.prototype // 也就是说
  Function.prototype.__proto__ === Object.prototype
  ```
  这个逻辑是通的。

- 反过来， `Object` 也是函数，只不过这个构造函数是由 `Function.prototype` 衍生出来。这个构造函数拥有 `Function.prototype` 的所有属性和方法，因为 
  ```js
  Object.__proto__ === Function.prototype // 等同于
  Object instanceof Function
  ```

如果讲它们是如何互相引用的？

同样以 2 个纬度去思考
- 函数角度：Function 是自己的实例，同样 Object 构造函数也是它的实例
- 对象角度：Function.prototype 函数的原型是 Object 实例
 
可以发现它们并不是完全的从属关系，只能从某种角度去认为是这样，因为 
```js
Object.prototype.__proto__ !== Function.prototype
```
**我们可以这样认为：以函数的角度来说，Object 从属于 Function，以对象的角度来考虑，Function 从属于 Object**

所以，它们是2种数据类型，我们讲一个对象，其实是分为2各部分，一个是构造函数本身，另一个是构造函数原型。

```js
// 函数
Function.__proto__ === Function.prototype
Function.prototype.__proto__ === Object.prototype

// 数组
Array.__proto__ === Function.prototype
Array.prototype.__proto__ === Object.prototype

// 对象
Object.__proto__ === Function.prototype
Object.prototype.__proto__ === null

// 循环当然也是讲的2个引用指向了
Object.__proto__ === Function.prototype
Function.prototype.__proto__ === Object.prototype
```

## 继承的几种模式

虽然现在由新的语法规则，`es6`，`es7`等等，~~但我们仍可以将它当作一种语法糖来理解~~(本质是错误的，但是可以以这样的思维去思考它)，虽然新的语法规则在新版本的浏览器中被实现，例如 `Class` ，但在`Object` 与 `Function` 根深蒂固的影响下，它仍然是语法糖。

所以我们仍然可以将原型与继承当成核心的思路去理解一切。

例如，当声明`class A extends Base`的时候，构造函数`constructor`为何要`super()` ?

目的是为了初始化 `Base`构造函数，将参数传递过去，继承构造函数中的私有属性。

这当然需要借助 es5 的继承模式来理解。

在js中，继承的本质是原型链，在 chrome 中，实例的指针用 `__proto__` 来表示，这是为了便于使用者获取它，还有一种不可获取的表示 `[[Prototype]]`。我们用一个经典的例子来看原型链的继承:

```js
// 父
function Super (name) {
    this.name = name
}
Super.prototype.sayName = function () {
    alert(this.name)
}
// 子
function Sub (name, age) {
    this.name = name
    this.age = age
}
Sub.prototype.sayAge = function () {
    alert(this.age)
}
```
上面是单独的2个构造函数，并没有互相关联，我们用以下方式来关联：

#### 1. 借用构造函数

```js
// 子
function Sub (name, age) {
    Super.call(this, name)
}
Sub.prototype.sayAge = function () {
    alert(this.age)
}
```
我们可以将 Super 构造函数内的属性和方法挂在到当前实例（this）上。这一步其实也是 Super 的意义所在：**初始化父级 Constructor 构造函数并传递参数**。

#### 2. 原型继承

```js
// 子
function Sub (name, age) {
    
}
Sub.prototype = new Super()
Sub.prototype.contructor = Sub
```

通过将 Sub 原型重新指向 Super 的实例

```js
Sub.prototype.__proto__ === Super.prototype
```

Sub 的实例也就指向了 Super.prototype

```
const sub = new Sub()

sub.__proto__ = Sub.prototype
sub.__proto__.__proto__ === Super.prototype
```

又因为

```js
Super.prototype.__proto__ === Object.prototype
```

所以

```
sub.__proto__.__proto__.__proto__ === Object.prototype
```

而这就是原型链继承，原型链继承有个明显的缺点，所有实例都在共享原型的上的属性和方法，并没有自己的数据备份。但是我们可以通过在构造函数中挂在实例本身的属性和方法。

原型继承和 `Object.create()` 的作用一样。

#### 3. 组合继承

我们联想下 class 的 super 和 extends 关键词，似乎就是结合了以上2种情况，由上面说的原型我们知道，一个构造函数对象包含了2个部分，构造函数本身 和 构造函数原型，继承当然需要继承这2者。

```js
// 子
function Sub (name, age) {
    Super.call(this, name)
    this.age = age
}
Sub.prototype = new Super()
// 或
Sub.prototype = Object.create(Super)
Sub.constructor = Sub
Sub.ptototype.sayAge = function () {
    console.log(this.age)
}
```

## 总结

继承是原型链的实践，原型链是通过原型修改指向而一步步串联而成。

继承也是需要场景的，当需要浅继承的时候直接使用原型继承模式，反之使用组合继承模式。

继承也是一种代码复用的方式，但是继承的写法对 tree-shaking 并不那么友好。

因为tree-shaking使用es6 module的模块规范，通过静态分析代码，对于import的字符串常量变量才能做到。

所以原型与继承的场景并不是在代码复用中，应该是在框架或工具的设计模式里作为一个整体被使用，而不是为了复用某一块功能的代码。
