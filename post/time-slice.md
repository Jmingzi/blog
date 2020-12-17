## 前言

### 本文主要内容

- 时间切片概念和原理
- 时间切片的实际使用场景

time-slice 被称为“时间切片”，主要用来解决 js 大量更新视图时耗时操作带来的“掉帧”现象。

## 正文

### 掉帧

我们先从问题现象开始探究——为什么会出现“掉帧”？

众所周知，一般浏览器最差最差刷新频率也需要 60HZ 即每秒 60 帧，肉眼才能直观的感受到是流畅的。出现掉帧也就是一秒钟内刷新频率少于 60 帧，一帧耗时 1000/60 = 16.67ms，也就是说在原本 60 帧的渲染过程中，有几帧的执行耗时超过了 16.67 ms。

那么探究重点当然要归于一帧中的渲染过程，以及我们从中能学到些什么。

### 时间切片原理

由于一帧渲染过程中的 js 操作属于业务型代码，要优化耗时操作可以由业务方手动优化 js 代码。

假设 1 千次简单的 DOM 操作耗时在 16.67ms内，那么业务方将 1万次 DOM 操作用 setTimeout 分 10 次才不会出现掉帧，这样也能达到优化目的。

还有一种办法是由系统调度，因为很多时候并不是每一帧的耗时都是满满的 16.67 ms，或者说根本没有视图更新，不需要触发帧的渲染，这个时候完全可以用来调度执行那些耗时的视图更新。

时间切片技术就是使用了 `requestIdleCallback` 空闲调度函数来实现。

```js
/*
 * didTimeout {boolean} 回调是否由 timeout 参数时间到了正在被执行
 * timeRemaining {() => number} 用来获取当前一帧范围内剩余空闲时间的毫秒数
 * timeout {number} 用来指定回调的超时时间
 */
requestIdleCallback(({ didTimeout, timeRemaining() }) => {}, { timeout })
```

### 一帧的渲染过程

上面所述的 1 万次更新 DOM 的操作，我简单的说利用 setTimeout 可以分 10 次，是否可以认为：一帧就是一次 macro 调度？答案是否定的。

一帧的渲染过程

1. 处理用户的事件，在页面渲染的过程中，有可能会触发点击、输入、滚动等事件
2. macro、micro 事件循环处理
3. requestAnimationFrame 将视图更新操作放在下一帧中执行，避免在当前帧中更新视图时，导致反复重排重绘
4. parse html、layout、paint、composite 等
5. requestIdleCallback 空闲调度

> 关于浏览器一帧渲染的详细过程我暂未考证

从上可以看出 1、2、3、5 都是处理回调，将回调函数放到相应的队列中等待系统调度处理，第 4 步才是视图更新的真实操作，那么耗时的 js 操作很有可能是在第 4 步产生。

当然，如果认为 `<script></script>` 标签也是 macro 的话，那么 parse html 也应该包含此操作。

也就是说，在一帧渲染过程中，执行同步的 js 代码时长不能超过 16.67ms，实际1、2、3、5步，包括系统调度都需要耗时，严格来讲是没有 16.67ms 可用的，有可能只有 10ms 的时间。

### 代码示例

使用如下代码片段来观察掉帧现象，以下代码每秒都会在控制台打印，但每秒的视图更新却被阻塞了，因为同步的 `parse html` 中解析 js 的操作严重耗时。

```js
var then = Date.now()
var i = 0
var el = document.getElementById('message')
while (true) {
  var now = Date.now()
  if (now - then > 1000) {
    if (i++ >= 5) {
      break;
    }
    el.innerText += 'hello!\n'
    console.log(i)
    then = now
  }
}
```

我们可以使用 `performance` 分析下

> 使用 performance record 之前，将所有的扩展程序关闭以避免额外的干扰。

![image](https://user-images.githubusercontent.com/9743418/102439409-30355280-4059-11eb-858b-5976c855b659.png)

将面板分为 3 部分来看：

1. 可以总览每个 task 耗时，这里的 task 我理解为 script、macro、micro 所包含的同步 js 代码
2. 可以看到浏览器各个线程的处理情况，我们可以理解为 network 网络请求线程、Main 主线程、其余线程（这个知识点和上述浏览器渲染帧的详细过程相关）
   - 在主线程下，js 代码被划分为一块块的 Task，从左往右排列，从上到下为 Task 内的 Call Stack 执行顺序
   - 从中我们还能看到，伴随着主线程 js 代码的执行，垃圾回收 GC 的调用是时时存在的，而且它们还会被 anonymous 匿名函数包裹多次调用。
3. 这部分重要的是可以看到各个 call stack 的耗时情况以及具体到某一行的耗时代码

从上图可以看到，Raster 一直被阻塞直到 Main 执行完成，在帧渲染过程中 Raster 处理完成后会交给 GPU 处理。

> Raster Scheduled、Rasterize 排版线程组织页面图块，栅格化数据，提交给GPU进程去绘制；
> 一个数据帧渲染结束，把栅格化的数据提交给 GPU进程 去绘制页面。

### 示例改造

```js
let list = document.querySelector('.list')
let total = 100000
for (let i = 0; i < total; ++i) {
  let item = document.createElement('li')
  item.innerText = `我是${i}`
  list.appendChild(item)
  console.log(i)
}
```

上述示例代码操作 10 万次 DOM，改造起来也是需要有成本的，有 2 种方案可选：

1. 使用 generator 函数改造
2. 将循环体 push 到队列中，由 requestIdleCallback 去消费

#### generator 方案

```js
function* task () {
    let list = document.querySelector('.list')
    let total = 100000
    for (let i = 0; i < total; ++i) {
      let item = document.createElement('li')
      item.classList.add(`r${Math.random()}`)
      item.innerText = `我是${i}`
      list.appendChild(item)
      yield
    }
  }

  function ts (callback) {
    requestIdleCallback(idleDeadline => {
      let next = callback.next()
      while (!next.done) {
        if (idleDeadline.timeRemaining() <= 0) {
          ts(callback)
          return
        }
        next = callback.next()
      }
    })
  }

ts(task)
```

这样改造后的效果通过 performance 分析得到：

![image](https://user-images.githubusercontent.com/9743418/102455093-f6c10f00-4079-11eb-92a8-94f1a3869c24.png)

#### 通过队列

```js
const queen = []
function task () {
  let list = document.querySelector('.list')
  let total = 10000
  for (let i = 0; i < total; ++i) {
    ts(() => {
      // 此处 dom 操作应用用 fragment 收集后
      // 再使用 requestAnimationFrame 统一添加
      let item = document.createElement('li')
      item.classList.add(`r${Math.random()}`)
      item.innerText = `我是${i}`
      list.appendChild(item)
    })
    // console.log(i)
  }
}

let isHandling
function ts (fn) {
  queen.push(fn)
  if (!isHandling) {
    requestIdleCallback(runIdle)
  }
}

function runIdle (idleDeadline) {
  while (idleDeadline.timeRemaining() > 0 && queen.length) {
    const fn = queen.shift()
    fn()
  }

  if (queen.length) {
    isHandling = requestIdleCallback(runIdle)
  } else {
    isHandling = 0
  }
}

task()
```

总的来看，通过 generator 函数去改造侵入性小一点；通过队列的方式，需要将业务代码重新组织。

仔细观察上述 performance 中的 task，耗时均超过了 50 ms，被标为红色，说明是可以被优化的。查看具体的某一个 task：

> chrome 针对超时的 task 给出了 warning：Warning [Long task](https://web.dev/rail/#goals-and-guidelines)，解释了为何是 50 ms的时间，大意是在用户感知的 100ms 时间前提下，留出 50 ms 的时间给用户交互带来的事件提供优先的时间去处理。

![image](https://user-images.githubusercontent.com/9743418/102452853-0cccd080-4076-11eb-8784-41969dd4f7b7.png)

可以看到耗时都在 Rerender 上，接着 查看 Rerender 详情

![image](https://user-images.githubusercontent.com/9743418/102452997-53222f80-4076-11eb-89c7-470e5b6ac66f.png)

可以看到主要耗时在 `Update Layer Tree` 和 `Layout`，这说明在回调执行过程中，发生了重绘和重排，我们应该将操作的 DOM 用 `createDocumentFragment` 来统一存放，然后在合适的时机使用 `requestAnimationFrame` 在下一帧中更新。

### 一些建议

关于帧渲染的过程与细节，其实与时间切片的知识点息息相关，我们必须要弄清楚一帧的渲染过程，才能更好的分析和优化代码。学习这个过程原理，可以从 performance 面板中的关键词着手研究：Frames、Raster、Rasterizer Thread、GPU、Compositor等，也可以从浏览器重绘重排的原理为入口着手。

### 参考

- [MDN Background_Tasks_API](https://developer.mozilla.org/zh-CN/docs/Web/API/Background_Tasks_API)
- [浏览器渲染帧](https://www.jianshu.com/p/15921f80c2c5)
- [浏览器的 16ms 渲染帧](https://harttle.land/2017/08/15/browser-render-frame.html)
- [JavaScript中的时间分片](https://cloud.tencent.com/developer/article/1601600)







