## 排序

在js中，数组才是有序的，所以讲排序一般都是操作数组

### 冒泡排序

数组长度为n，遍历 n - 1 次，每次循环 n - i - 1 次找出一个最大值或最小值

```js
const arr = [8, 6, 4, 9, 3, 2, 1]
let newArr = arr

for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < newArr.length; j++) {
    if (j === newArr.length - i - 1) {
      break
    } else if (newArr[j] > newArr[j + 1]) {
      [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]]
    }
  }
}
console.log(newArr)
```

### 选择排序

