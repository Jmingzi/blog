/**
 * 思路：
 * 1 首先要遍历整个树，每个节点都不能落下
 * 2 关键是如何统计深度，我们可以这样转化：
 *     将统计深度变为 0 和 1，即：有子节点返回1，无子节点返回0，然后递归累加
 */

var maxDepth = root => root === null ? 0 : (Math.max.call(null, maxDepth(root.left), maxDepth(root.right)) + 1)

// 迭代的思路去解题
