# core-js

core-js 是 js 语法 API 的库，目前有3个版本，v1/v2/v3，版本之间互不兼容，属于断崖式更新，那我们来看看它为何要这么做。

```
# 安装 v1 版本
cnpm i core-js@1

# 目录结构
├── core
├── es5
├── es6
├── es7 // es2016 stable 的方法
├── fn
├── library
├── modules // 基本都是引用这个目录
│   ├── $.a-function.js // 内部的方法都是以 $ 开头
│   ├── es7.string.at.js // 暴露出来的方法 都是以 规范年份开头标识
│   └── js.array.statics.js
├── shim.js
└── web // 浏览器相关 api
```

那它是如何注入的呢？拿 `es6.string.repeat.js` 举例，会发现方法是全局注入、污染型的。

```js
module.exports = function repeat(count){
  var str = String(defined(this))
    , res = ''
    , n   = toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
```

----

```
# 安装 v2 版本，版本为 @2.6.5
cnpm i core-js@2

# 目录结构
├── core
├── es5
├── es6
├── es7
├── fn
├── library
├── modules
│   ├── _string-repeat.js // v2 版本修改了内部方法的命名 
│   ├── es6.string.repeat.js
├── shim.js
├── stage // 相比 v1，增加了新的 propsals 的阶段
│   ├── 0.js
│   ├── 1.js
│   ├── 2.js
│   ├── 3.js
│   ├── 4.js
│   ├── index.js
│   └── pre.js
└── web
```

v2 与 v1 的区别貌似只是增加了 stage，然后 API 更完善了，本质的 `$export` 导出还是没变化，依然是污染的。当然了，由于停止维护的原因，里面的 API 只包含当时的提议。

以上 v1 和 v2 版本中，我说是污染的，其实它也提供了非污染的使用方法，`/library/modules/_exports.js` 修改了导出方式，例如

```js
// 相当于手动加了 namespace
var core = require('core-js/library/es6/string')
core.repeat('*', 10)
```

同时，还有 fn 的目录，`/fn/` 和 `library/fn/`，它们的作用是一样的？都是为了避免全局污染
```js
const fill = require('core-js/fn/array/fill')
const fill = require('core-js/library/fn/array/fill')
```
----

目前维护更新的是 v3 版本，默认安装的是 `core-js@3.0.1` 

```
cnpm i core-js

# 目录结构
├── es // 包含与ES相关的 stable 的方法
├── features // 包含了所有的方法
├── internals // 内部的方法，例如 export
├── modules // require后，全局注入的方法
├── proposals // 处于提案的方法
│   ├── string-at.js
├── stable // 包含ES相关的 和 web 标准相关的方法
├── stage
└── web
```

v3 版本的代码，命名与结构上优化了很多，没有冗余的代码，核心模块都是引用 `/modules` 目录，只不过`export`方式不一样。

## 与 @babel/polyfill 的关系

```js
import '@babel/polyfill'

// 等价于
import 'core-js/stable' // 只会 polyfill 已经稳定的 API
import 'regenerator-runtime/runtime'
```

## 与 @babel/preset-env 的关系

@babel/preset-env 和 @babel/polyfill 是没有任何关系的，我们可以从其[package.json](https://github.com/babel/babel/blob/master/packages/babel-preset-env/package.json)中查看得到这个结论。

事实上，它依赖的是 `core-js-compat`，而 `core-js-compat` 是根据 `.browserslist` 中定义的浏览器范围生成依赖的模块 json，例如：
```js
{
  '3.0': [
    'es.string.repeat',
    'web.url'
  ]
}
```

在配置 `preset-env` 时，可以配置`core-js`选项：`2, 3 or { version: 2 | 3, proposals: boolean }, defaults to 2.`

## 与 @babel/runtime 的关系

`@babel/runtime-corejs3` 和 core-js 的版本也是对应的，

`core-js-pure` 是类似纯函数的库，不会全局污染，都是直接导出的方法

```js
import from from 'core-js-pure/stable/array/from'
from(new Set([1, 2, 3, 2, 1]))
```

在实际的使用中，是使用 [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime/)，它本质也就是 `@babel/runtime`。

`@babel/plugin-transform-runtime`的目的是为了解决`@babel/runtime`中的`helper`重复导出的问题，需要被提取，同时会将 polyfill 的引用转换为对 `core-js` 的引用，这样就不会造成重复 polyfill 了。

-----

`preset-env` 默认引入的 core-js 是2，由于 2 已经停止更新了，新的特性都会在 3 上，可以指定 corejs 的版本配置

```js
{
  presets: [['@babel/preset-env', {
    useBuiltIns: 'usage',
    corejs: 3
  }]],
  plugins: [['@babel/plugin-transform-runtime', {
    corejs: 3
  }]]
}
```

