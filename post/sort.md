## 排序

在js中，数组才是有序的，所以讲排序一般都是操作数组，以下排序方法中，测试数据均为
```js
const arr = [8, 6, 4, 9, 3, 2, 1]
```

### 冒泡排序

数组长度为 n，遍历 n - 1 次，每次循环 n - i - 1 次找出一个最大值或最小值

```js
const BubbleSort = (arr = []) => {
  const newArr = [...arr]

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < newArr.length; j++) {
      if (j === newArr.length - i - 1) {
        break
      } else if (newArr[j] > newArr[j + 1]) {
        [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]]
      }
    }
  }

  return newArr
}
```

### 选择排序

数组长度为 n，从左到右假设 i 处的值最小，然后遍历 n - i - 1 次找到更小的值并替换

```js
const SelectionSort = (arr = []) => {
  const newArr = [...arr]
  for (let i = 0; i < arr.length - 1; i++) {
    let min = newArr[i]
    let minIndex = i
    for (let j = i + 1; j < newArr.length; j++) {
      if (newArr[j] < min) {
        min = newArr[j]
        minIndex = j
      }
    }
    [newArr[i], newArr[minIndex]] = [newArr[minIndex], newArr[i]]
  }
  return newArr
}
```
