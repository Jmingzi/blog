> 此文是对另一篇文章的总结

### 前言

关于 this 的指向，看到最常用的说法是“谁调用就是谁”，不能说这种说法是错误的，但也不完全正确，因为它只说明了一部分，并且不知其原理。

我们在谈论 this 指向，一般情况下指的是函数调用时。其中有个比较经典的题，如下

```js
// 正确
(function () { 
  console.log('IIFE')
}())

// Uncaught SyntaxError: Unexpected token '('
(() => {
  console.log('IIFE')
}())
```
这就需要清楚函数调用 `CallExpression` 的使用场景。规范指出：

- `CallExpression` 只能跟在 `CallExpression` 后或者 `MemberExpression` 后
- 箭头函数不是 `MemberExpression` 而是 `AssignmentExpression` 

那么 `MemberExpression` 是指哪些呢？

- `FunctionExpression`
- `MemberExpression.IdentifierName` // 属性访问 foo.bar()
- `MemberExpression[Expression]` // 属性访问 foo\['b' + 'ar'\]()
- `PrimaryExpression` // 原始表达式
- `new MemberExpression Arguments` // 对象创建表达式

----

### js 类型

我们知道基础数据类型和复杂数据类型，这是提供给开发者使用的，还有一种类型是用来描述底层代码实现的，它们是：

- `Reference`
- `Environment Record`
- ...

其中我们也经常会看到 `Reference error` 这样报错，就是因为引用报错。

一个 Reference 对象由3部分构成

```js
var foo = {
    bar: function () {
        return this;
    }
};
foo.bar(); // foo

// bar对应的Reference是：
var BarReference = {
    base: foo,
    propertyName: 'bar',
    strict: false
};

// 或者
var foo = 1;

// 对应的Reference是：
var fooReference = {
    base: EnvironmentRecord,
    name: 'foo',
    strict: false
};
```
- base value 就是属性所在的对象或者就是 EnvironmentRecord，也就是说它的值只可能是 undefined, an Object, a Boolean, a String, a Number, or an environment record 其中的一种。
它的值只可能是 undefined, an Object, a Boolean, a String, a Number, or an environment record 其中的一种。
- referenced name 就是属性的名称

### 如何确定this的值

在函数调用时，需要确定 2 种情况，即 `CallExpression` 左侧的类型
- `MemberExpression`
  - 1. Let ref be the result of evaluating MemberExpression.
  - 2. If Type(ref) is Reference, then
    - a. If IsPropertyReference(ref) is true, then
      - i. Let thisValue be GetBase(ref).
    - b. Else, the base of ref is an Environment Record  
      - i. Let thisValue be the result of calling the ImplicitThisValue concrete method of GetBase(ref).
  - 3. Else, Type(ref) is not Reference. 
    - a. Let thisValue be undefined.
- 非 `MemberExpression`
  - thisValue be undefined.
  
在 `MemberExpression` 的情况下，需要判断 `MemberExpression` 是否是 Reference 类型，即是否满足组成的3部分，如果满足再判断 base 是否是一个对象 Object ，如果是的 thisValue 才等于 base，否则是 undefined 
  
```js
var value = 1;

var foo = {
  value: 2,
  bar: function () {
    return this.value;
  }
}

//示例1
console.log(foo.bar());
//示例2
console.log((foo.bar)());
//示例3
console.log((foo.bar = foo.bar)());
//示例4
console.log((false || foo.bar)());
//示例5
console.log((foo.bar, foo.bar)());
```

对于示例 4，5，6，`CallExpression` 左侧都不是 `MemberExpression`，可以简单的说 this 就是 undefined
