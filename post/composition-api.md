# @vue/composition-api 实践

> 原文地址：[https://iming.work](https://iming.work/detail/5d7f5692eaa37500694ab79b)

根据提案衍生的体验包 `@vue/composition-api` 我们可以对 `v3.0` 的思想加以实践。

实践内容：实现一个 todo list，且列表可拖拽。demo：[示例详情](https://iming.work/demo/vue-composition-api-practice/dist/index.html#/)

### 前期准备

1. 定义列表结构

```ts
type TodoItem = {
  id: number
  content: string
  status: 0 | 1
}

type TodoList = Array<TodoItem>
```

2. 定义布局

文件目录

```
.
├── App.vue
├── assets
│   ├── drag.ts
├── components
│   ├── item-input.vue
│   └── item-list.vue
├── main.ts
└── views
    └── home.vue
```

我们将输入框和列表分为2个组件去处理，同时写了一个 `useDrag()` 方法来处理拖拽。

3. 源码带来的一个问题和思考

```js
// home.vue
setup (props, context) {
  // 我们选择将 state 初始化时用一个大对象包裹起来
  // 而不是零散的使用 ref、reactive
  const data = reactive({
    selected: null,
    list: [
      {
        id: 1,
        content: '计划内容、干什么事情',
        status: 1
      }
    ]
  })
  const delItem = (item: TodoItem) => {}
  const changeIndex = (nI: number, oI: number) => {}
  const addItem = (item: TodoItem) => {}

  watch(() => data.list, () => {
    console.log('====变化了')
  }, { lazy: true })

  return {
    // 选择使用大对象包裹，在解构之后是会丢失响应式的，可以使用 toRefs 将大对象里的属性添加引用包裹
    ...toRefs(data),
    delItem,
    changeIndex,
    addItem
  }
}
```

其实，这里也是我在实践时发现的一个问题，即：数组不能被 reactive ?

对于 data 的包裹完全是没有必要的，因为可以：

```js
const selected = ref(null)
const list = reactive([
  // { ... }
])
```

但在实际的操作中，为 list push 一条记录是不会触发 watch 的

```js
setup () {
  const arr = reactive([1, 2])
  watch(() => arr, () => console.log('arr change'), { lazy: true })
  setTimeout(() => { arr.push(3) }, 1000)
}
```

另外，在 setup 中即使你没有为对象或属性添加响应式，将其 return 后，响应式也会被自动添加。

例如 

```html
<template>
  <p @click="a = { b: 2 }">{{ a.b }}</p>
</template>

<script>  
export default {
  setup () {
    const a = {
      b: 1
    }
    return {
      a
    }
  }
}
</script>
```

这个例子中，对象 a 就被自动添加了响应式，模版也会被更新。vue 源码如下：

```js
var binding = setup(props, ctx);

if (isPlainObject(binding)) {
    var bindingObj_1 = binding;
    vmStateManager.set(vm, 'rawBindings', binding);
    // 遍历返回值
    Object.keys(binding).forEach(function (name) {
      var bindingValue = bindingObj_1[name];
      // only make primitive value reactive
      if (!isRef(bindingValue)) {
          if (isReactive(bindingValue)) {
            bindingValue = ref(bindingValue);
          }
          else {
            // a non-reactive should not don't get reactivity
            bindingValue = ref(nonReactive(bindingValue));
          }
      }
      asVmProperty(vm, name, bindingValue);
    });
    return;
}
```

所以在 todo list 这个 demo 中，即使你的 list 不是 reactive 的，在点击 `addItem` push 后，template依旧会更新，但不理解的是这样做 watch 无效。因为我发现，使用 `2.0` 的 api `watch` 这个 list 是没问题的。

这不得不让我去思考 reactive 和 ref 的本质。

### reactive 和 ref

在大概使用这2个 api 后不难发现，对于简单的数据类型我们要使用 ref，而复杂数据类型要使用 reactive。

ref 的作用是为简单数据类型包裹一层对象，这样就可以为对象设置 proxy，达到值的变化监听。

```js
function ref(raw) {
    var _a;
    // 包裹的空对象
    var value = reactive((_a = {}, _a[RefKey] = raw, _a));
    return createRef({
        get: function () { return value[RefKey]; },
        set: function (v) { return (value[RefKey] = v); },
    });
}
```

reactive 的本质就是调用 2.0 api 里的 `observe()`

```js
function reactive(obj) {
  // ...
  var observed = Vue.observable(obj);
  return observed
}
```

这样就会得到一个被监听对象的引用。上面我们说过，即使这个对象没有被 reactive，setup return 之后都会自动添加，那这样做的意义？

很明显，得到这个引用，我们可以单独为这个引用做处理，例如添加 watch，或者 computed，从而实现业务逻辑上的抽象与解耦。

⚠️但是，还是没有解决数组被 reactive 后，watch 不到的问题。。。

### 解耦业务代码

我们思考一下 3.0 的目的，我觉得一方面是为了迎合当下流行的思想，提升知名度与活跃度；另一方面，主要还是为了能更好的抽象与组织代码，充分利用 tree shaking 和 支持 ts。

利用函数的组合，移除了 mixins 中变量冲突与未知来源的问题，也拿掉了面条式的还要记属性顺序的固定的选项，当然，我觉得对于更初级的开发者会更习惯于 2.0 的 api 中明确的界限，例如 state 就放 data 里，method 就放 methods 里等。对于组合 api 式的都在 setup 中写更考验开发者的逻辑组合能力。

例如 todo list 中的拖拽 `useDrag()`，我们看看 `/components/item-list.vue` 文件中的 `setup`

```js
// 接受了 props 列表数据
setup ({ list }: { [k: string]: unknown }, context: SetupContext) {
  const handleSelect = (item: TodoItem) => {
    context.emit('input', item)
  }
  const handleComplete = (item: TodoItem) => {
    // 我发现这里可以直接修改? props，而没有任何报错或警告
    item.status = item.status === 1 ? 0 : 1
  }
  const handleDelete = (item: TodoItem) => {
    context.emit('del-item', item)
  }
  const handleChange = (newIndex: number, oldIndex: number) => {
    context.emit('change-index', newIndex, oldIndex)
  }
  // 通过 useDrag 我们可以得到 2 个有用的信息
  // handleDown 是监听 mousedown 事件的回调
  // finalPosition 是在 mousemove 的过程中，当前被拖拽对象的位置
  // handleChange 是 mouseup 后，如果位置有变化就触发的回调，其实也可以返回而不用传参进去
  const { handleDown, targetIndex, finalPosition } = useDrag(handleChange)

  return {
    handleSelect,
    handleComplete,
    handleDelete,
    handleDown,
    targetIndex,
    finalPosition
  }
}
```

所以在 template 中，我们只需要简单的这样做就可以，是不是更清晰一些呢？关于 drag 的细节，可查看[drag.ts](https://github.com/Jmingzi/vue-composition-api-practice/blob/master/src/assets/drag.ts)

```html
<template>
  <div
    class="todo-list__item"
    :style="finalPosition"
    @mousedown="handleDown"
  >
   ...
  </div>
<template>
```

于是，我们似乎发现，函数式组合的 api 可以提供我们一种能力，在任何地方的任何一个函数里，都可以写出与 vue 生命周期、钩子实例等息息相关的代码，就好像我们写在 2.0 时代的选项 `componentOptions` 中一样。

### 总结

有人说，这越来越像 react 了，确实，对于开创业界潮流 react 一直都是领先者，但你觉得真的是一样吗？由于机制本质的不一样，在 vue 中不需要那么多的原生 hooks 来帮助你实现或优化某些特性，在 vue 中，被称为 hooks 我觉得是不合适的，因为它并不是像钩子、或者守卫一样等待着被调用，它只会在 setup 被中调用一次，时机在 beforeCreate 和 created 之间。另外 mutable 的数据可以很优雅的处理很多 react 中不必要的麻烦，但也会带来一些问题，例如上面提到的“可以直接修改 props 的属性”。
