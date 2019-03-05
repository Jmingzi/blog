## 后编译 + 按需引入的实践

> 需求的提出是为了解决某种问题，同样的，当某种问题很普遍且亟待解决时，它变成了一种方案。

#### 场景

电商h5的首页、二级页或活动页面，都是由细小的组件拼合而成，在没有ssr的情况下，我们需要用一个大的组件去包含这些组件，然后在接口返回不同的数据时，渲染不同的组件。

在Vue中，大组件可以用**纯函数组件**来实现，从而可以使页面内所有的组件平铺。

但是如果组件库包含了50+或者更多组件时，打包成一个文件就会很大了。虽然我们可以`externals：Vue、Lazyload、polyfill`等第三方库，但打包出的文件还是很大的。

#### 问题

我们当然能想到使用webpack动态引入

```js
const ComponentA = () => import(
  /* webpackChunkName: 'component-a' */
  'ComponentA'
)
```
但打包后在实际的项目中，是无法从npm包中动态下载的，因为打包时的`publicPath: ''`，包在`node_modules`目录下，未被拷贝到项目的`dist`目录中，并且`path`也无法设置。源码如下：

```js
script.src = __webpack_require__.p + "" + ({"0":"component-a","1":"none"}[chunkId]||chunkId) + ".bundle.js";
```

#### 思路

我们可以引入源码，在打包时配置上 include
```js
rules: [
  {
    test: /\.(js|vue)$/,
    include: [
      resolve('ComponentA')
    ]
  }
]
```
但是在 ComponentA 中通过相对路径 import 的 npm 包项目文件属于嵌套引用，我们不可能手动将它们都添加进`include`，所以可以写一个 webpack 插件去处理该情况。

在 npm 包发布时，在`package.json`中可以指定`module`字段为源码 path。

> webpack 从版本 2 开始也可以识别 pkg.module 字段。打包工具遇到 package1 的时候，如果存在 module 字段，会优先使用，如果没找到对应的文件，则会使用 main 字段，并按照 CommonJS 规范打包。

如果有必要的情况下，我们仍然可以编写一个 babel 插件去处理引用的问题，类似 `babel-plugin-import`。

#### 结论

后编译的优势目前还是有的
- 无需指定 externals
- 无需为包 polyfill
- 无冗余的 webpack 构建代码

但是按需引入得分情况，例如上述的组件场景是得不偿失的，将组件拆分为多个http请求是浪费的。

#### 链接

- [编写一个webpack插件](https://webpack.docschina.org/contribute/writing-a-plugin/)
- [webpack-post-compile-plugin](https://github.com/dolymood/webpack-post-compile-plugin/blob/master/lib/index.js)
- [代码分离](https://webpack.docschina.org/guides/code-splitting/#%E9%98%B2%E6%AD%A2%E9%87%8D%E5%A4%8D-prevent-duplication-)
- [webpack 应用编译优化之路](https://juejin.im/post/59dc57f2f265da431d3ba2ef)





