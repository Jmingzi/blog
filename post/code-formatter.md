> 原文地址：https://iming.work/detail/619c82b5a1710f3117fa195e

## 前言

在写下这篇文章时，我很庆幸前端只有一套代码质量检查工具 Eslint，因为在“代码格式化规范保持统一”这一件事情上竟然算不上容易去做。

常用编辑器 vscode 和 webstorm，常用工具 eslint 和 prettier。

至于 editorconfig，没有必要去使用，一方面它只会做通用的格式处理，不会分析语法结构；另一方面已经存在 prettier 了，且不如 prettier 好用，没必要再引入增加混乱的局面。

## 保持 eslint config 统一

以 vue 项目模版为例，模版代码中定义了 eslint 的配置

```jsx
extends: [
  'plugin:vue/recommended',
  '@xm/standard-vue',
],
parserOptions: {
  parser: '@babel/eslint-parser'
}
```

自定义了 `@xm/eslint-config-standard-vue` ，基于 standard 规范拓展了 2 项：

- comma-dangle(trailing comma) 尾逗号
- space-before-function-paren 函数名称后的空格

这 2 项在很多人的使用规范上有歧义的，所以做了扩展支持。

如果项目未安装，可通过 xnpm 安装后使用

```jsx
xnpm i @xm/eslint-config-standard-vue -D
```

## 保持 prettier config 统一

封装了统一的 prettier 配置文件，通过 xnpm 安装

```jsx
xnpm i @xm/prettier-config -D
```

然后在 package.json 中指明即可

```json
"prettier": "@xm/prettier-config",
```

## 在 webstorm 中仅开启 eslint

由于 webstorm 已足够好用，由于其本身开箱即用，即使新下载的 webstorm，也只需要开启自动 fix 即可：

![a660533390a119e2dd41792ffec83b4978db94a0](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-23/the_parsed_crop_image.1637646944047.png)

## 在 vscode 中开启 prettier 配置

以 vue 项目为例，官方提供了 vetur 插件用来格式化代码。

1.先为你的 vscode 安装 prettier 插件
![89eef3cbbb873ac4060bb81ad39db549d9c6118b](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-23/the_parsed_crop_image.1637646957683.png)

2.将编辑器的默认格式化选项设置为 prettier
![cd6188dde913e3d471c374bf21200540d5f516c2](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-23/the_parsed_crop_image.1637646973271.png)

3.输入 json 进入 json 配置编辑
![43f216e398c0b349c3b990e9a8101fca3915eac1](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-23/the_parsed_crop_image.1637646985315.png)

4.设置 vue 文件的格式化选项

```json
"[vue]": {
  "editor.defaultFormatter": "octref.vetur"
},
"vetur.format.defaultFormatter.html": "js-beautify-html",
"vetur.format.defaultFormatterOptions": {
  "js-beautify-html": {
    // js-beautify-html settings here
    "wrap_attributes": "force"
  }
}
```

5.切换到视图检查 vetur 的配置项
![d6565849c20fbe413570ca86f2e4b6f7e539a861](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-23/the_parsed_crop_image.1637647010289.png)

6.开启自动保存

```json
"editor.formatOnSave": true,
"files.autoSave": "afterDelay",
"editor.formatOnPaste": true,
"editor.formatOnType": true,
```

## 总结

我想用几个疑问来阐述：

- 身为前端开发者我所期望的统一方案是什么？
- 为什么说引入 editorconfig 增加了本就混乱的局面？
- 为什么说 webstorm 足够好用？

第一个问题，在 eslint 足够好用且统一的前提下，编辑器自动保存时，能根据 eslint 的 rules 自动格式化代码，这就是最理想的方案，但是现在 vscode 无法做到。

第二个问题，由于前端技术栈的不稳定性，对于 editorconfig 这种非前端行业的工具来说是不可能为 vue 这样的自定义语法去做扩展的。

prettier 还是前端圈的工具，尚且只想做通用功能。我们可以从很多文档/实例看出，prettier 一直在提供各样的文档和插件用来支撑开发者们搭配 eslint 使用它，这样做是与开箱即用的初衷违背的，但是 eslint 并没有这样做。

为什么要用 prettier？如果你使用的 webstorm 完全没必要使用它。虽然 vue 官方出了 vetur 提供了一些便利性，但是在代码格式化这块，还是不能够让人满意，譬如格式化 template，vetur 给出的方案是 `js-beautify` ，理想的情况是，代码格式化能严格遵循 `eslint-plugin-vue`，现实是 js-beautify-html 并不能够满足。可以看到对于 vscode 的配置，vetur 仅仅只是提供解析 `.vue` 文件，内部的格式化仍然依赖第三方：

![0f5c436ca5d1117aba92d616514b6660c7634723](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-23/the_parsed_crop_image.1637647023692.png)

对于 js 的格式化只能使用 prettier，如果你已熟悉 eslint 的规范(standard 或 airbnb)，prettier 仅仅只是够用而已，因为他只有通用的功能，没有前端库语法的定制，而 eslint 的 rules 确是通过插件定制的，所以并不好用。

在 prettier 的官网上他们说道，prettier 仅有的几个选项是历史遗留的，其实这几个选项都不应该拥有，应该是开箱即用的，所以对于未来，是不可能新增选项了，参考 **[Option Philosophy](https://prettier.io/docs/en/option-philosophy.html) ，**譬如对于 `space-before-function-paren` 有人提了个 pr 也被官方义正严辞的给拒绝了：[Always add a space after the `function` keyword](https://github.com/prettier/prettier/pull/3903) 。

第三个问题，在 vscode 里要格式化 vue 项目代码，既要使用 vetur 又要使用 prettier 还要去看 js-beautify，还得考虑配置项不能和 eslint 的 rules 冲突。

而在 webstorm 中，只需要勾选开关项，即可在保存时格式化为官方定义的 rules 规范。
