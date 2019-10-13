> 本文同步发表在个人博客[前端微架构实践（二）](https://iming.work/detail/5da29b69a91c930068ab4bb8)

## 概述

由前一篇 [前端微架构实践](https://iming.work/detail/5d9e9971ba39c800682dc7f7) 扩展而来，在支持主子项目拆分独立开发部署的前提下，增加了对 React 的支持，也就是说这种模式支持以下特性：

- 主子项目的创建通过 cli 工具初始化模版
- 主子项目开发时，能看到全部的项目内容，而不是仅仅只有项目本身的内容
- 独立开发部署
- 主子项目可以是 Vue 或 React 技术栈
- 非 iframe 嵌套，纯路由渲染

这是一种比较傻瓜式的架构模式，但容易理解并解决了目前项目所带来的问题：项目大、打包慢、项目的技术栈或主库版本一旦更新就涉及很大重构等等。流程图在第一篇文章有介绍，这种模式的缺点：

- 同时存在 Vue 和 React 实例、路由实例。
- store 可以使用一种技术栈共享，但互相通信有额外成本
- 等等目前还未遇到的问题

## 原理

在之前介绍的原理之上，新增加的部分：

- 通过 CDN 引入主库 gz 后的代码，6个包总共约 1.2M（下面有截图）
- 需要提供2个挂载容器给 Vue 和 React 实例，在同一个路由下，2个实例只会渲染其中一个
- 开发与构建时的 publicPath 区分，可解决按需加载 js、css、 img 的问题
- 关于文件 hash 的问题，因为在配置文件中要指定子项目的 app.js ，考虑过是否要去掉 hash，后面还是保留了，因为去掉 hash 后解决缓存的唯一办法就是在部署时增加版本号，相比于使用脚本去自动生成配置文件，成本更大。

### 1、容器 html 的代码

```html
<body>
    <div id="vue"></div>
    <div id="react"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.min.js"></script>
    <!--⚠️注意：这里 store 我使用 vuex ，完全可以使用其他库，来实现主子项目对全局状态的共享-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vuex/3.1.1/vuex.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue-router/3.1.3/vue-router.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/16.10.2/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.10.2/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-router-dom/5.1.2/react-router-dom.min.js"></script>
    <!--菜单配置文件-->
    <script src="http://localhost:85/config.js"></script>
</body>
```

### 2、渲染后的项目结构

在2个根容器中，分别存在 `nav` 和 `root`，这是我同时使用 vue 和 react 渲染的2个挂载点，在主项目中，2个挂载点 `vue-root` 和 `react-root` 是必须的，这是提供给子项目渲染视图的容器，其他的内容可以随意写。

![5da2969d17b54d0068c0b8c6](https://user-gold-cdn.xitu.io/2019/10/13/16dc3311e36897ca?w=669&h=254&f=png&s=30452)

### 3、渲染后的demo

![](https://iming.work/demo/statics/imgs/micro-demo.gif)

> Tips：菜单信息从配置文件读取渲染（这里 react 菜单是我写死的）

注意观察路由以及 `root` 容器的变化，挂载容器始终只会被渲染其中的一个。另外，在 vue 实例中，主子项目还可以互相调用。

资源加载的大小如下图：

![5da29c91c05a800073e8b8fd](https://user-gold-cdn.xitu.io/2019/10/13/16dc338d2bb5e893?w=423&h=434&f=png&s=51323)

## 如何创建 react 子项目

> React  的项目模版 webpack 我复用了 `vue-cli 3`，好用没任何毛病，虽然可以自己写，但完全没必要。

安装 [micro-structure-cli](https://github.com/micro-structure/cli) 插件

```
micro init

# 选择子项目

# 选择 react
```

等待模版下载完成即可。

## 总结

我大概的了解了目前比较流行的微架构框架 `single spa`，发现

- 不跨技术栈，可以独立开发和部署
- 跨技术栈，主子项目要一起打包

不知是我了解的不够深还是没有看到更好的例子？欢迎回答。

我也看了 [每日优鲜供应链前端团队微前端改造](https://juejin.im/post/5d7f702ce51d4561f777e258?utm_source=gold_browser_extension)，他们实现的模式是没有跨技术栈的，所以能够独立开发部署。但是为了不同的业务场景，使用不同的框架还是非常非常有利的，例如表单使用 react 的 uform。

这种模式存在诸多的缺点与不足，但是带来的收益远大于弊端，况且尝鲜与实践不正是创新的表现吗？

感谢阅读！
