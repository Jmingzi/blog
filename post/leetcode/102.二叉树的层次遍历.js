/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */

/**
 * 关键思路
 * 广度优先 - 从上到下，从左到右
 * 用队列存放待遍历节点
 * 然后索引自增遍历队列
 * 存放队列时，将深度level一并存入
 */

var levelOrder = function(root) {
  if (!root) {
    return []
  }

  const queen = [{ ...root, level: 0 }]
  let num = 0
  const result = []
  const get = () => {
    const node = queen[num]
    if (node) {
      if (!result[node.level]) {
        result[node.level] = []
      }
      result[node.level].push(node.val)

      if (node.left) {
        queen.push({ ...node.left, level: node.level + 1 })
      }
      if (node.right) {
        queen.push({ ...node.right, level: node.level + 1 })
      }

      num++
      if (num <= queen.length) {
        get()
      }
    }
  }
  get()
  return result
};
