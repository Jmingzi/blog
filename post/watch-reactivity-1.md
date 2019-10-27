## Vue 3.0 —— Watch 与 Reactivity 代码走读

> 本篇文章同步发表在个人博客 [Vue 3.0 —— Watch 与 Reactivity 代码走读](https://iming.work/detail/5db5502ca3180b0068a18495)

> 如果对源码查看没有头绪的可以先参见[参考文章](#参考文章)

本篇文章为梳理 scheduler、 effect、scheduler 与 proxy 之间的关系

本篇文章以一个很简单小例子打断点入口开始分析，情况很单一，仅仅是一个简单的 object，没有涉及到组件实例，目的也很简单：搞清楚三者之间的工作流程、同时熟悉一些概念。

例子代码：

```js
const { reactive, watch } = Vue
const a = reactive({ name: 'ym' })

watch(() => a.name, (val) => {
  console.log(val)
}, { lazy: true })

setTimeout(() => {
  a.name = 'cjh'
}, 1000)
```

## 代码走读

我们将 demo 代码分为 3个部分：

- 初始化 reactive
- 初始化 watch
- 赋值属性

所以代码走读也分为三个部分，来分别参数这三个过程。

### 第一部分

先用 reactive 初始化了对象 a，所以我们看看 reactive 初始化过程

```ts
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (readonlyToRaw.has(target)) {
    return target
  }
  // target is explicitly marked as readonly by user
  if (readonlyValues.has(target)) {
    return readonly(target)
  }
  return createReactiveObject(
    target,
    rawToReactive,
    reactiveToRaw,
    mutableHandlers,
    mutableCollectionHandlers
  )
}
```

reactive 中有2个对象是需要理解的

- `rawToReactive = new WeakMap<any, any>()` 普通对象与reactivity对象的映射
- `reactiveToRaw = new WeakMap<any, any>()` reactivity对象与普通对象的映射

利用 WeakMap 初始化的弱引用对象，弱引用对象在这里的好处：

- 避免内存泄漏，即不用手动清除依赖对象的引用
- 键名可以直接使用对象、减少遍历查找操作

例如：

```js
const wm = new WeakMap()
let arr = new Array(1024 * 1024)
wm.set(arr, 1)
// 这里只用将arr的引用去除，而不用再将 wm 所引用的 arr 删除
arr = null
```

这么做是为了缓存提高查找性能，因为对于一个嵌套对象，是需要递归遍历每一个属性的。


reactive 本质是对 createReactiveObject 的包裹，其中传入了 mutableHandlers，mutableHandlers 用来定义一个对象的属性描述符，和 defineProperty 类似，这里我们只看 get 和 set。

```ts
// get 是由 createGetter 函数创建
function createGetter(isReadonly: boolean) {
  return function get(target: any, key: string | symbol, receiver: any) {
    // 避免循环引用
    const res = Reflect.get(target, key, receiver)
    // 排除关键字
    if (typeof key === 'symbol' && builtInSymbols.has(key)) {
      return res
    }
    // 自动 unwrap 属性，所以对于一个 reactivity 对象的属性，我们直接 obj.property 即可
    if (isRef(res)) {
      return res.value
    }
    // 此处非常关键，属于收集依赖的入口
    track(target, OperationTypes.GET, key)
    // 递归处理
    return isObject(res) ? reactive(res) : res
  }
}

// set 
function set(
  target: any,
  key: string | symbol,
  value: any,
  receiver: any
): boolean {
  const hadKey = hasOwn(target, key)
  const result = Reflect.set(target, key, value, receiver)
  // 当前仅当 target 和 调用对象相同时才做处理
  // 关于 receiver 这里可以查看我的另外一篇文章：熟悉 Proxy
  if (target === toRaw(receiver)) {
    if (!hadKey) {
      trigger(target, OperationTypes.ADD, key)
    } else if (value !== oldValue) {
      // 触发收集的依赖
      trigger(target, OperationTypes.SET, key)
    }
  }
  return result
}
```

初始化一个对象时，唯一值得说的就是递归对象，为每一个属性都添加上 proxy，因为 proxy 的层级只有一层。

### 第二部分

同样，我们发现所有的 Api 入口函数都只是内部函数的一个包装，这样利于逻辑的单一且副作用分隔。

```ts
// 针对 demo 的例子，我们传入 doWatch 的有三个参数，刚好对上
function doWatch(source, cb, WatchOptions): StopHandle {
  let getter: Function
  if (isArray(source)) {
    // 保证 getter 拿到的始终是普通对象
    getter = () =>
      source.map(
        s =>
          // 这里可以发现 watch 数组时，也会自动 unwrap
          isRef(s)
            ? s.value
            : callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER)
      )
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (cb) {
    // getter with cb
    getter = () =>
      callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)
  } else {
    // no cb -> simple effect
    getter = () => {
      if (instance && instance.isUnmounted) {
        return
      }
      if (cleanup) {
        cleanup()
      }
      return callWithErrorHandling(
        source,
        instance,
        ErrorCodes.WATCH_CALLBACK,
        [registerCleanup]
      )
    }
  }

  // 以上我们可以看到 watch 的对象有3种
  // 数组
  // ref包裹的对象
  // 回调函数
  // 最后的 else 其实是错误处理
  // callWithErrorHandling 是一个取值包装函数，用来包裹取值时的错误处理

  let oldValue = isArray(source) ? [] : undefined
  // 包裹回调
  // applyCb 是依赖更新后触发的真正函数
  const applyCb = cb
    ? () => {
        const newValue = runner()
        if (deep || newValue !== oldValue) {
          // cleanup before running cb again
          if (cleanup) {
            cleanup()
          }
          callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
            newValue,
            oldValue,
            registerCleanup
          ])
          oldValue = newValue
        }
      }
    : void 0

  // 定义 scheduler，默认是值更新后再触发
  // 时机是 nextTick 后即下一个 task 队列执行之前
  let scheduler: (job: () => any) => void
  scheduler = job => {
    queuePostRenderEffect(job, suspense)
  }

  // 初始化 effect
  const runner = effect(getter, {
    lazy: true,
    // so it runs before component update effects in pre flush mode
    computed: true,
    onTrack,
    onTrigger,
    scheduler: applyCb ? () => scheduler(applyCb) : scheduler
  })

  // 缓存旧值
  oldValue = runner()

  // 返回停止 watch 的句柄
  return () => {
    stop(runner)
  }
}
```

watch 的初始化做了 2 件事
- 定义 getter，获取真正的值
- 初始化 effect，同时注入 scheduler

### 第三部分

`a.name = 'cjh'` 的赋值，此时会触发 set 的 `trigger`

```js
trigger(target, OperationTypes.SET, key)
```

我们先来看看 track 收集依赖的函数，因为 trigger 必定是依赖 track 收集后的数据的

```ts
export function track(target, type, key) {
  // 初始化 reactive 时触发 track
  // activeReactiveEffectStack 是不会有值的，那么这个依赖是什么时候注入的呢？
  // 思考下，肯定是在 watch 初始化的时候
  // 我们回到 watch，初始化旧值时，我们初始化了 effect
  // 在 run 函数中，activeReactiveEffectStack.push(effect)
  // 所以这里的依赖是存在的
  const effect = activeReactiveEffectStack[activeReactiveEffectStack.length - 1]
  if (effect) {
    // targetMap 是proxy递归时的用来存放的那层单一对象的键值对
    // 其中 key 就是这个对象，值初始化空的 Map
    // depsMap 是一个空的 Map
    let depsMap = targetMap.get(target)
    // dep 是一个 Set
    let dep = depsMap.get(key!)
    if (dep === void 0) {
      depsMap.set(key!, (dep = new Set()))
    }
    if (!dep.has(effect)) {
      // dep 用来存放所有对 watch 的 getter
      dep.add(effect)
      // ⚠️这一步不知道原因？？？
      // ️️⚠️包括 targetMap 何时被 set ？？？不然的话 depsMap 永远是个空的 Map
      effect.deps.push(dep)
    }
  }
}
```

我们再来看看 trigger 函数

```ts
export function trigger(target, type, key, extraInfo) {
  // 由 trigger 添加的 dep 依赖的 Set
  const depsMap = targetMap.get(target)
  // 空的 Set
  const effects = new Set<ReactiveEffect>()
  const computedRunners = new Set<ReactiveEffect>()
  
  // schedule runs for SET | ADD | DELETE
  if (key !== void 0) {
    addRunners(effects, computedRunners, depsMap.get(key))
  }
  // also run for iteration key on ADD | DELETE
  // 这是针对数组的 Proxy， push时会触发多次的 hack：一次是下标赋值，一次是 length 赋值
  if (type === OperationTypes.ADD || type === OperationTypes.DELETE) {
    const iterationKey = Array.isArray(target) ? 'length' : ITERATE_KEY
    addRunners(effects, computedRunners, depsMap.get(iterationKey))
  }

  const run = (effect: ReactiveEffect) => {
    scheduleRun(effect, target, type, key, extraInfo)
  }
  // Important: computed effects must be run first so that computed getters
  // can be invalidated before any normal effects that depend on them are run.
  computedRunners.forEach(run)
  effects.forEach(run)
}
```

trigger 函数做了 1 件事：添加 `addRunners` runners ，再调用它们。

接下来再看看 addRunners

```ts
function addRunners(effects, computedRunners, effectsToAdd) {
  if (effectsToAdd !== void 0) {
    effectsToAdd.forEach(effect => {
      // effect 就是 trigger 里的 dep 数组

      if (effect.computed) {
        // 这里应该是用来区分 computed 函数初始化的依赖
        computedRunners.add(effect)
      } else {
        // 这是普通的 watch 依赖数组
        effects.add(effect)
      }
    })
  }
}
```

addRunners 区分 computed 分别为 2 个数组 push 值。我们这里的 demo 没有 computed，所以最终就是 forEach 数组调用 scheduleRun。

scheduleRun 就是调用 watch 初始化时的 applyCb
```ts
effect.scheduler(effect)
```

而初始化时 

```ts
effect.scheduler = job => {
  queuePostRenderEffect(job, suspense)
}
```

我们看看 queuePostRenderEffect 函数，本质是调用的 `queuePostFlushCb`

```ts
export function queuePostFlushCb(cb: Function | Function[]) {
  if (Array.isArray(cb)) {
    // 这种写法比 concat 优雅。。。
    postFlushCbs.push.apply(postFlushCbs, cb)
  } else {
    postFlushCbs.push(cb)
  }
  if (!isFlushing) {
    nextTick(flushJobs)
  }
}
```

queuePostFlushCb 函数也比较简单，收集回调函数，再 nextTick 后 flushJobs。

我们可以发现 scheduler 中有 2 个队列：

- queue
- postFlushCbs

对应的添加函数

- queueJob
- queuePostFlushCb

很显然，这是对应的 2 种更新时机的回调，而触发这些回调都是由 flushJobs 完成：

```ts
function flushJobs(seenJobs?: JobCountMap) {
  isFlushing = true
  let job
  while ((job = queue.shift())) {
    try {
      // queueJob
      job()
    } catch (err) {
      handleError(err, null, ErrorCodes.SCHEDULER)
    }
  }
  flushPostFlushCbs()
  isFlushing = false
  // some postFlushCb queued jobs!
  // keep flushing until it drains.
  if (queue.length) {
    flushJobs(seenJobs)
  }
}
```

最后我们回到回调函数 applyCb

```ts
() => {
  // 获取最新值
  const newValue = runner()
  // 如果值发生了改变
  if (deep || newValue !== oldValue) {
    // 触发回调函数
    // 可以看到回调函数也可以是一个 Promise
    callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
      newValue,
      oldValue,
      registerCleanup
    ])
    oldValue = newValue
  }
}
```

## 总结

再回过头来看这三个部分及它们的作用

- reactivity 的作用在于处理对象的 proxy，在每个取值操作的地方 track。track 有多种来源：一种是普通的取值，一种是依赖取值，依赖取值时会在 activeReactiveEffectStack 数组中 push 依赖 effect。这其实就完成了初始化。
- watch 的巧妙之处在于取旧值添加依赖，所以能明白为什么第一个参数只能传回调函数了。创建 effect 的同时，对回调进行 scheduler 处理，scheduler 显然是根据 flush 时机来区分的。
- scheduler 相对简单了，目前来看只是对回调的收集分类与触发做了处理。

Vue 3中还有 ref 和 computed ，我觉得熟悉完 reactivity 和 watch 后基本就能理解全部了。

当然其中还有很多细节没有说到也不知道，因为必须有相应的场景你才能明白它这么写的作用，如果你连应用的场景都考虑不到或者说都没用过，强行去理解就没有太大意义了。

未完待续。


## 参考文章

- [Vue3.x源码调试技巧](https://juejin.im/post/5d99d9a0f265da5b8601264c)
- [ES6 系列之 WeakMap](https://juejin.im/post/5b594512f265da0f6263840f)
- [Vue 3 源码导读](https://juejin.im/post/5d977f47e51d4578453274b3)
