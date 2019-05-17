/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} sum
 * @return {boolean}
 */

// 解法1
// var hasPathSum = function(root, sum) {
//     if (root === null) {
//         return false
//     }
//     let flag = false
//     const getPath = (node, total) => {
//         total += node.val
//         if (node.left === null && node.right === null) {
//             flag = total === sum
//         }
//         if (node.left && flag === false) {
//             getPath(node.left, total)
//         }
//         if (node.right && flag === false) {
//             getPath(node.right, total)
//         }
//     }
//     getPath(root, 0)
//     return flag
// };

// 解法1 优化
// var hasPathSum = function(root, sum) {
//     const getPath = (node, total) => {
//         if (node === null) {
//             return false
//         }
//         total += node.val
//         if (node.left === null && node.right === null) {
//             return total === sum
//         }
//         return getPath(node.left, total) || getPath(node.right, total)
//     }
//     return getPath(root, 0)
// };

// 解法2
var hasPathSum = function(root, sum) {
  if (root === null) {
      return false
  }
  return root.left === null && root.right === null 
      ? sum - root.val === 0
      : hasPathSum(root.left, sum - root.val) || hasPathSum(root.right, sum - root.val)
};