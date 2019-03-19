## 归并排序

归并排序采用了分治法的思想，思路是

- 用递归将一个数组不断的分割为二（向上取整或向下均可）
- 当分割后的数组粒度为 1 时，从左到右合并
- 合并的同时，遍历取出最小值，继续比较剩余的值
- 直到最后剩余或不剩余

```js
const mergeSort = (function() {
  const merge = (left, right) => {
    const result = []
    while (left.length && right.length) {
      let min
      if (left[0] < right[0]) {
        min = left.shift()
      } else {
        min = right.shift()
      }
      result.push(min)
    }
    return result.concat([...left, ...right])
  }

  return (arr) => {
    if (arr.length === 1) {
      return arr
    }
    const middleIndex = Math.ceil(arr.length / 2)
    const left = arr.slice(0, middleIndex)
    const right = arr.slice(middleIndex)
    // 从左至右深度优先
    return merge(mergeSort(left), mergeSort(right))
  }
})()
```
