# Decorator

vue 并不是类的写法，要想实现需借助 `vue-class-component` 或者 `vue-property-decorator`，例如：

```js
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class YourComponent extends Vue {
  @Prop(Number) readonly propA!: number
  @Prop({ default: 'default value' }) readonly propB!: string
  @Prop([String, Boolean]) readonly propC!: string | boolean
}
```

可以看到装饰器的场景就很广泛了，包括现在使用很广泛的库 `core-decorators`。另外类的写法对支持 ts 更友好。  

从 tc39 上看到目前该提案还处于 `stage 2`，最后一次提交提案是在 `January 2019`，看来到真正定稿还需要一段时间。

## Babel 与 Decorator

插件 `@babel/plugin-proposal-decorators` 支持 2 种模式：

- `legacy: true` 在 es7 提出 Decorator 时，babel 就做过支持，有过一个转化的版本
- `decoratorsBeforeExport: true` 如今处于 stage 2 后 babel 又做了一个与之前完全不同的转化版本

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { 
      "legacy": false, 
      "decoratorsBeforeExport": true
    }]
  ]
}
```

另外需要注意的是，如果使用老版本的 Decorator ，需要为 `@babel/plugin-proposal-class-properties` 添加 option `{ "loose" : true }`，才能兼容 class 写法。

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }]
  ]
}
```

## 源码分析

```js
class C {
  @unenumerable
  @readonly
  method () {}
}
```

`{ "legacy": true }` 时的版本

```js
var _class;

/**
 * 赋值调用Decorator，从函数语义上也可以看出来
 * @param target {Object} 类的原型 class.prototype
 * @param property {String} 方法或属性的名称
 * @param decorators {Array} 装饰器数组
 * @param descriptor {Object} 对象的属性描述
 * @param context {Object} 类属性的初始值方法赋值调用需要的上下文
 * @returns descriptor {Object} 对象的属性描述，用于初始化属性值
 */
function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  // 第二部分
  // 属性描述的拷贝
  // 属性分为 数据属性 和 访问属性，二者公共的部分是 configurable 和 enumerable
  var desc = {};
  Object.keys(descriptor)
    .forEach(function (key) {
      desc[key] = descriptor[key];
    });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;
  // 如果该属性为类的属性值，也就是数据属性
  // 或者该值有被初始化
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  // 第三部分
  // 可以看到装饰器是写法上从下至上调用的
  // 然后从左至右调用了装饰器，并得到最终的属性描述对象
  desc = decorators.slice()
    .reverse()
    .reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);
  // 初始化类的属性值
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }
  // 将最终的属性描述对象挂载到该属性上
  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }
  return desc;
}

// 第一部分，赋值调用，等同于
// _class = class C { method() {} }
// 如果有多个属性和方法，则调用下面这个方法多次
// _applyDecoratedDescriptor(_class.prototype, ...)
// let C = _class
let C = (_class = class C { method() {} },
  (_applyDecoratedDescriptor(
    _class.prototype,
    "method",
    [unenumerable, readonly],
    Object.getOwnPropertyDescriptor(_class.prototype, "method"),
    _class.prototype
  )),
  _class
);

function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function unenumerable(target, name, descriptor) {
  descriptor.enumerable = false;
  return descriptor;
}
```

当源码新增静态属性赋值时

```js
class C {
  @readonly
  name = 'ym'

  @unenumerable
  @readonly
  method () {}
}
```
装饰器的方法调用变为

```js
_descriptor = _applyDecoratedDescriptor(_class.prototype, "name", [readonly], {
  configurable: true,
  enumerable: true,
  writable: true,
  // 初始化值的方法
  initializer: function () {
    return 'ym';
  }
  // 没有初始化上下文了
})
```
