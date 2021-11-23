> 原文地址：https://iming.work/detail/619882001d6ef6526078a990

## 由问题着手

很多人不清楚 eslint 和 prettier 是干什么的，导致在项目中，如何选择使用、怎么配置都不太了解，只知道从网上 copy 一些配置或解决办法来临时 hack。

本文将带你从概念及其生态全方位入门。

## 概念

先从名称开始了解：`Es` 和 `lint` ，前者代表 `ECMAScript` ，后者翻译为 “皮棉”，可以理解为 “琐碎”、“小问题”。最早在 c 语言的代码质量检测上 lint 被这一静态检查工具命名，延续至今。

其实可以看出来，设计之初就是为了做代码静态分析的质量检查的，而早期的工具是 `JsLint` 和 `JsHint` 都是 ”The JavaScript Code Quality Tool“。

所以在使用方式上，我们一般会将其添加到处理模块依赖的工具插件中，例如 rollup、webpack 的插件，而模块的“编译”过程，也是代码的静态分析处理过程。不过，一切都是依赖 ES 的模块化，这些工作才能得以实现。

同时，我们还会通过 cli 的方式执行，一般用来做 `fix` ，至于原理，我们在下面讲。

## 配置

这里只说下 `rulers` 、`extends`  和 `parser` ，更多配置项用法可查看 [Configuration Files](https://eslint.org/docs/user-guide/configuring/configuration-files#extending-configuration-files)

### extends

在实际的项目中 rulers 和 extends 可以合并为一项，为什么这么说呢？rulers 代表个性化定制，但是在团队维度下，当然是共用一套 rulers ，这时候可以将共用的一套定制为 `eslint-config-xxx` ，然后写到 extends 中，所以，我们常看到这样的配置：

```jsx
extends: [
  'plugin:vue/vue3-essential',
  '@vue/standard',
  '@vue/typescript/recommended',
]
```

这其实是用了缩写，在 extends 中有 2 种缩写，本质是对应到 package.json 中的 npm 包文件

- 针对 config 的，前缀为 `eslint-config-`
- 针对 plugin 的，前缀为 `eslint-plugin-`

对应为

```json
"eslint-plugin-vue": "~7",
"@vue/eslint-config-standard": "~6.1",
"@vue/eslint-config-typescript": "~7.0",
```

有 2 个注意点：

- 插件 `plugin:vue` 后面跟着的也是缩写，完整路径为 `/lib/config/vue3-essential.js`
![c8f383daa546a1b2a2cd708560206e1dec797d64](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-20/the_parsed_crop_image.1637384643073.png)
    
- 配置 `@vue/typescript` 后面跟着的是包文件名，完整路径为
![51fede96b69284c9cd26d5246a38b34d3d7ec4d0](https://raw.githubusercontent.com/Jmingzi/blog-image/main/2021-11-20/the_parsed_crop_image.1637384668706.png)
    

那么 config 和 plugin 有啥区别呢，上面也提到了 config 是针对已有的 rulers 做开关，而 plugin 可以自定义 rules 和 config。

所以针对新的语法，我们可以定制对应的 plugin，譬如 `eslint-plugin-vue` 和 `eslint-plugin-react` 等等

## parser 和生态

### parser

这是最核心的一环，该 parser 可以理解为 ECMAScript 语言的解析器，ECMAScript 的版本为 es5 → es2015 → es2016 ... es2021 这样的发展节奏，每个版本新增的 API 都需要定义，不能像之前的浏览器厂商一样各玩各的，逐渐的，社区都以 Firefox 浏览器的 js 解析引擎 “SpiderMonkey” 提供的 API 作为标准，这一规范标准被称为 [estree](https://github.com/estree/estree) 。

而 eslint 自带的解析器是 [espree](https://github.com/eslint/espree) ，可以从 eslint 的 package.json 依赖中看到，而 espree 最早是 fork 的 `[esprima](https://github.com/jquery/esprima)@1.2.2` 版本，现在呢基于 [Acorn](https://github.com/acornjs/acorn) 来扩展的。

说白了就是 eslint 不想用别人的，就基于别人的改了一套，看 espree 不还是自家的东西，至于为什么会换呢，可能是 acorn 的插件机制更灵活一些，再者你看 esprima 不还是 jquery 那帮人弄的，再看看 contributors 会发现，acorn 的作者其实也参与了 estree 标准的制定。

但是，玩家有这么多，轮子当然也有很多，大家都自己玩自己的。

我们最熟悉的还是 babel，它提供的 `@babel/eslint-parser` 本质依赖的 `@babel/core` ，反正轮子遵循 estree-compliant 的结构规范就行。其实 babel 也是借鉴的 acorn，官网上可是用了 "Heavily based" 来表述的。

但是一翻依赖，并不像 espree 那么老实，babel 压根儿就没有依赖 acorn 和 acorn-jsx，都是自己实现的，只是代码或者思路直接抄的 acorn。

写着写着咋发现和八卦一样了。。。

那时候，正当 babel 混的风生水起，typescript 开源了，人家上来就是 javascript 的超集，直接大 babel 一个辈分。`@typescript-eslint/parser`  本质是依赖 [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/typescript-estree)，ts 根据自己的语法和类型也写了套 ts-estree。其实最早 ts 是打算撇开 eslint 自己玩质量检查的，社区也贡献了 [tslint](https://github.com/palantir/tslint) ，也写了 [eslint-plugin-tslint](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin-tslint) ，由于 tslint 自己定义的规范，并没有按照 estree 来，对于前端生态来说当然是不合适的。

总的来说，ECMAScript 的 parser 目前有 4 种：acorn、esprima、babel-parser、ts-estree，在 eslint 的 parser 配置项中，我们可以使用 `@babel/eslint-parser` 和 `@typescript-eslint/parser` ，需要注意的是，虽然他们都是遵循 estree 规范的，但是他们有自己的特性，需要单独定义 `parserOptions` 才能合理使用。

在 `@babel/eslint-parser` 描述中，可以看到他是支持解析 typescript 的，但是不支持 linting，其实也可以去做支持，只不过没必要，因为已经存在了 `@typescript-eslint/parser` 。

### 生态

其实上面的说的 parser 也是属于生态的一部分，因为有了 eslint 这一套在，使得大家都会往上面靠。

上面讲了 extends 可以配置 2 种，一种是 config，一种是 plugin。对于 config，社区也有比较流行的 2 套：`eslint-config-airbnb` 和 `eslint-config-standard`，对于纯粹使用 js 编码的库或项目来说，是足够用的。

但是库定义的新的语法也需要被支持，仅仅从已有的 rules 中是完全不够用的，需要为新语法定义新的 parser ，譬如 vue 的新文件格式就自己写了套 `[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser)` ，但是对于 es 的部分直接依赖了 espree，而没有造轮子。

对于 typescript 的适配 vue 官方出了 `@vue/eslint-config-typescript` 其实就是帮你定义了一些 rules，本质还是依赖的 @typescript-eslint。

如果使用的 standard 规范，在项目中，我们还会看到常用的 3 个 plugin，即

- eslint-plugin-import 规范模块化导入导出
- eslint-plugin-node node 规范
- eslint-plugin-promise

而 airbnb 规范不会依赖这些。

## 回到问题

prettier 仅仅支持 code formatter 代码格式化用的，很显然 eslint 可以和 prettier 搭配使用，前提是 prettier 的配置风格要和 eslint-config-xxx 或自定义的 rules 风格一致。

既然 eslint 的功能包含 prettier 那为啥还要使用 prettier 呢？结合实际情况来看，prettier 的最佳实践应当是结合编辑器，在保存的时候自动格式化，格式化完了后再去走模块化依赖的 eslint 插件。

试想一下，如果一个新人的规范和团队不一样的时候，也没有 prettier，他的编码体验是怎样的？

写一段代码，保存，等待编译结束，控制台提示一堆问题，然后根据问题一个个修改，再保存，如此往复，才能将这个新人驯化为和团队规范一致，时间和精力成本很高。但如果使用 prettier 这套，是没有这些心智负担的，他在可以不阻塞开发业务的情况下，慢慢适应新的规范。

但是对于一个适应规范的老手来说，是不需要 prettier 的，因为写出的代码即规范。

总结，在团队项目中，eslint 应该搭配 prettier 使用，前者工作在编译运行时，后者应当在编译之前工作，即搭配编辑器。

接下来，团队需要提供 prettier 的 vscode 和 webstorm 的编辑器配置，以及定义好在项目模版中使用的 eslint-config 和 eslint-plugin 及 parser。

## 参考

- [@babel/eslint-parser](https://github.com/babel/babel/tree/main/eslint/babel-eslint-parser)
- [@babel/parser](https://github.com/babel/babel/tree/main/packages/babel-parser)
- [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser)
- [espree](https://github.com/eslint/espree)
- [acorn](https://github.com/acornjs/acorn)
- [esprima](https://github.com/jquery/esprima)
- [eslint](https://github.com/eslint/eslint)
- [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)
- [vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser)
- [@vue/eslint-config-typescript](https://github.com/vuejs/eslint-config-typescript)
- [ESLint 的 parser 是个什么东西](https://zhuanlan.zhihu.com/p/295291463)
