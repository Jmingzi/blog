<img src="http://file.iming.work/92ed53606d5745439a07.png" width="500px">

## 前言
 
随着 Vue3 的发布，其周边生态正在逐步切换成支持 `3.x` 的版本。

为什么又造个轮子呢？其动机如下：

- `3.x` 的轮子并不与 `2.x` 的冲突，主流 UI 组件厂商都已完成对 `3.x` 版本的切换，例如 `vant@next`，`antd-vue^2.0`等
- 讯盟小程序需要一套完整的 UI 库
- 技术的更新是历史趋势，主动迎合而不是被动接受它。

另外，也不是所有的组件重写，基于 less 的 `modifyVars` ，有赞 `vant` 优秀的源码编写，会复用其已有的组件，否则会做很多无用功，毕竟组件内部的代码逻辑是复用的。

基于以上，我便下定决心要开始动手了。

于是，`Xmi` 诞生了！

![](http://file.iming.work/efdb007569cecb55491e)

## 需求梳理

组件库的三大构成：

- 文档
- 组件
- 示例

文档主要是 markdown 编写，并且能够像使用`vue` 文件/组件 一样在路由或`components`中使用，并且支持代码高亮。于是，能够想到用`markdown-it`先将 markdown 转化为`html`字符串，然后再使用固定的`vue`模版文件容器包裹，这不乏是个比较靠谱的方案，不过需要手写 webpack-loader 来完成这项工作。

组件的构成在`npm`提供`module`字段的时候就已经发生了改变，我们没有必要将组件的依赖用`webpack`解析出来，否则`tree-shaking`的时候会严重冗余组件公共部分、`babel-runtime`等。我们需要做的是在组件按需引入的情况下，保证引入的是通过`@babel/core`转化的`esModule`模块；而在组件全量引入的时候，是webpack解析好的代码。同时，对于主题定制，按需引入的时候也可以是`less`文件。如果没有定制需求，则可以是 css 文件。

示例则是一份完整的 demo，和文档示例同步的内容。示例嵌入在文档中，同时也可以扫码用手机查看。对于小程序来说，很多功能都依赖客户端容器。

## 方案解析

### 文档和示例项目的初始化方案

> 对于一个项目的 webpack 配置，vue 生态已有 vue-cli 和 vite 来支撑，并不需要花额外时间去手动配置。

很容易的我便想到了`vite`+`vue3`这个组合。`vite` 诞生的目的更多在于优化本地化开发，其生产环境的构建和`vue-cli`一致。

根据其文档初始化后，的确很快！很激动人心。
> 需要注意的是，通过`vite`初始化项目本地的`node`版本须切换至`^14.0.0`以上

但是当我想要配置 `webpack` 的时候，在`vite.config.js`中并未生效。再者根据 `vite` 的开发进度，其`multi-page`还并未支持。
>  [#257](https://github.com/vitejs/vite/issues/257) Regardless of SSR, multi-page is something Vite does plan to support.

该方案放弃！

转而采用 `@vue/cli^4.5.6` 支持的 `3.x` 模版，这绝对是可行的。

### markdown 方案

基于上述思路，我便去 github 上找开源的方案，果不其然 `@vant/markdown-loader` 就是这种思路。我们需要手动配置针对`\.md`的文件的 `loader`，即先通过``@vant/markdown-loader``转为vue，再通过`vue-loader`来转化，那么问题来了，`vue-loader`支持`3.x`版本了吗？

对于 `2.x` 的版本，`vue`的版本必须与`vue-template-compiler`版本一致。

通过`vue-cli`初始化的模版中，引用的`@vue/compiler-sfc^3.0.0-0`也是一样的道理。那么loader接受吗？答案很显然不接受。

只能扒`cli-service`的源码了！！！

我们从`node_modules/@vue/cli-service`中去找，其目录结构为：

```
/cli-service
  - /bin     是二进制目录
  - /generator  是生成模版文件的目录
  - /lib  核心逻辑
  - /types 类型声明
```

于是展开 `lib` 目录

```
/lib
  - /commands  与cli的命令有关
  - /config    配置文件 
  - /util   工具函数
  - /webpack webpack编译相关
```
很显然在`config`中了，直接打开`base.js`，搜索`vue-loader`

```
// vue 2 的部分
if (vue && semver.major(vue.version) === 2) {
   // for Vue 2 projects
  const vueLoaderCacheConfig = api.genCacheConfig('vue-loader', {
    'vue-loader': require('vue-loader/package.json').version,
    '@vue/component-compiler-utils': require('@vue/component-compiler-utils/package.json').version,
    'vue-template-compiler': require('vue-template-compiler/package.json').version
  })
// 省略...
} else if (vue && semver.major(vue.version) === 3) {
  // for Vue 3 projects
  const vueLoaderCacheConfig = api.genCacheConfig('vue-loader', {
    'vue-loader': require('vue-loader-v16/package.json').version,
    '@vue/compiler-sfc': require('@vue/compiler-sfc/package.json').version
  })
```

我们可以看到针对 vue3 ，`vue-loader` 搭配使用的是`vue-loader-v16`。

于是在 `vue.config.js` 中，我们也可以这样使用loader：

```
module.exports = {
  chainWebpack: config => {
   config.module.rule('md')
      .test(/\.md$/)
        .use('vue-loader-v16')
        .loader('vue-loader-v16')
        .end()
      .use('@vant/markdown-loader')
        .loader('@vant/markdown-loader')
        .end()
   }
}
```
如此，就可以正确解析`markdown`了。

另外还需要注意的是如果初始化模版时选择了 `eslint` 我们需要将 `\.md` 文件 `exclude` 掉

```
config.module
  .rule('eslint')
  .test(/\.(vue|(j|t)sx?)$/)
    .pre()
    .enforce('pre')
    .exclude
    // 避免 md 语法报错
    .add(/\.md/)
```

### 组件方案

我们都知道 vue 的一大优势就是 template ，组件的编写也应该使用 template 单文件形式的 `sfc`。但是我们只知道`vue-loader`才是干这个事的，loader 是 webpack 的。

前面说过，组件无需使用 webpack，否则会带来一些问题。那么问题来了：

1. `sfc` 的组件必须能够被`compiler`，目前仅知道 `vue-loader` 方案，但是是 webpack
2. `jsx` 的组件可以通过官方的 `@vue/babel-plugin-jsx`，用 babel 将其转化，但是无法享用 template 优势。

于是乎，还是得去研究下如何借助`@vue/compiler-sfc`手写`sfc`的转化。

### vue-loader 中 sfc 的解析流程

在 `2.x` 的版本中，`vue-template-compiler` 是有`broswer`版本的：

链接：`https://unpkg.com/browse/vue-template-compiler@2.6.12/browser.js`

官方文档中，我们可以使用 `Vue.compile` 得到 `render`和`staticRenderFns`函数

```
const { render } = Vue.compile(template)
```
但是并不包含 `script` 部分。到这里，其实就需要扒一下`vue-loader`的源码了 `node_modules/vue-loader`。

梳理下完整流程，伪代码如下：

```
// 第一步先将sfc文件parse成为3部分：template、script和styles
const { parse } = require('@vue/component-compiler-utils')
const descriptor = parse({
  source,
  compiler: options.compiler || loadTemplateCompiler(loaderContext),
  filename,
  sourceRoot,
  needMap: sourceMap
})

// 再使用 compileUtils 编译 template
const compileUtils = require('@vue/component-compiler-utils')
const { code } = compileUtils.compileTemplate({
  compiler,
  source: template,
  isProduction: true,
})
// 此时得到的 code 即为 render 函数字符串

// 第三步，再将 render 字符串和 script 拼接，写入到文件即可。
const { code } = compiled

// finish with ESM exports
return code + `\nexport { render, staticRenderFns }`
```

此时写入文件的内容是 `esModule` 的形式。

到这里，我们就可以使用 babel 愉快的转化了。鉴于此项工作比较多，目前我们的组件库只支持 jsx 的写法，后续将对此支持。

## 基于 Vant 做覆盖

庆幸的是`vant@next`已发布，我们可以完全基于`vant/es/`和`vant/lib/index.less`部分做定制。框架打包出来的代码是内置 vant 的，所以 vant 无需额外引入。

我们只需要在生成`xmi/entry.js`和`xmi/entry.less`时，将 vant 引入。

> 按需引入 xmi 时，无法使用 vant 组件。你可以按需引入 vant。

## 最后

Github 源码地址：[shinemofe/xmi](https://github.com/shinemofe/xmi)

仅仅是样式 copy 至 vant，copy 的样式有注明：`vant.copy.css`。

代码贡献办法：

1. 针对 vant 组件可直接修改 `xmi.theme.vant.less` 做定制。
2. 新增组件，只需在 `docs/docs.config.js` 中新增菜单项，并注明`md`或`vant`，前者表示是md的介绍文本文件，后者表示是vant的组件。在`packages`目录下新增组件文件夹即可。
















