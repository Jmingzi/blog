> 本文同步发表在个人博客 [前端微架构实践](https://iming.work/detail/5d9e9971ba39c800682dc7f7)

## 前言

为了拆分与适当解耦聚合业务各模块，我们需要采用一种友好的开发模式去解决这些问题，我们的愿景是：

- ☕️ 主子项目独立开发、部署
- 🔥 主子项目开发时保持热更新
- 🚗 主项目提供路由容器，子项目只是挂载到容器中的视图
- 👊 主子项目共用一个 Vue、Router、Store 实例，这样能保证能共享全局组件或 Vue 插件
- 📦 子项目在开发时会动态注入主项目容器、打包后不会包含任何主项目代码
- 💻 不涉及 Node 服务，配置文件存储在 CDN 中

> Tips: 为了避免主项目打包体积过大，可以将库代码抽取为 CDN 引入（默认），这样子项目动态注入时下载更快。

⚠️ 关于按需加载，在开发环境下，由于webpack devServer 加载资源时是不会跨项目加载的，所以是无法做到的，当然可以改造 webpack 的加载逻辑，把待加载的资源 origin 设置为 项目[菜单配置](https://github.com/micro-structure/cli)中的 `origin`。打包后如果主子项目的静态资源部署在同一个目录下，是可以支持按需加载的。

## 开发流程

1.安装 [micro-structure-cli](https://github.com/micro-structure/cli) 插件

```
npm install -g micro-structure-cli
```

2.创建配置文件，并可以通过 http 访问到该文件

> Tips： 在开发时，你可以在主项目的 `/public/` 目录下创建

配置文件结构示例：

```js
/*
 * 目前这个配置文件的格式有待完善
 * 配置文件对应着加载器逻辑
 */
window._MICRO_APP_CONFIG = {
  // 开发环境的配置
  devMenu: [
    {
      // 资源的唯一标识，用来避免重复加载
      id: 'index',
      name: '首页',
      path: '/',
      // 该项目入口文件的 path，也就是去掉下面 origin 后的地址
      urlPath: '/app.js',
      // 将 origin 抽取出来的目的是用来判断
      // 当前路由对应的项目资源 是否为 当前 devServer ，避免重复加载
      origin: 'http://localhost:8080'
    }
  ],
  // 非开发环境
  normalMenu: []
}
```

3.创建主项目

```
# 初始化选择主项目
micro init

# 提示输入菜单配置文件 url 地址

# 安装依赖
npm install 

启动服务
npm run serve
```

4.创建子项目


借助 [vue-cli-plugin-micro](https://github.com/micro-structure/plugin) 插件来注入主项目资源
```
# 初始化选择子项目
micro init

# 安装依赖
npm install 

# 安装主项目资源注入插件
vue add micro

# 启动服务
npm run serve

# 在配置文件中，增加子项目的菜单信息

# 主项目有更新时，运行命令会自动刷新
npm run micro
```

## 加载器

加载器存在于主项目中，用来加载当前 path 对应的子项目，同时给路由添加守卫，在离开前加载对应路由的子项目。

由上面的配置文件暴露的 window 对象 `_MICRO_APP_CONFIG ` 加载器的逻辑也在该对象下

```
window. _MICRO_APP_CONFIG = {
  // 已区分环境的菜单列表
  menu: [],
  // 加载方法
  load: function (menuItem) {
  },
  // 初始化时为路由添加的守卫
  addWatch: function () {}
}
```

如果是正常的路由跳转，加载器会自动处理。如果需要预加载，可以手动触发 `load` 方法。

> Tips： 加载时的 loading 未实现

## 流程图
![5d9e935c0237d70074da2b4b](http://lc-iYzWnL2H.cn-n1.lcfile.com/2a2182f877620e4067f4)

最后完整的项目地址：[micro-structure](https://github.com/micro-structure)

## 适用场景

业务复杂的中台系统不用多说，很有必要。另外，同类性质的简单页面也适用，例如营销活动页面，可以将库、请求、通用逻辑抽象到主项目上，子项目只用关注活动本身，减小了项目体积，能非常有效的提升开发速度。

也就是说，并不是在业务上属于一个模块的才归属到子项目中，子项目是路由集合，形态结构上属于同一类的业务也可以被归属到一起。

## 扩展

很显然，这是基于 Vue 及 Vue 原型来实现的一套方案，如果换做是 React 呢？或者主子项目跨技术栈呢？我想这些都会比较容易去思考实现。因为这是接下来要做的事情。
