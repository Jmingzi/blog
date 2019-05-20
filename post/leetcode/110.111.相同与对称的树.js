/**
 * 相同的树满足3个条件
 *    1. 2颗树当前节点相等
 *    2. 其中1颗树的左子节点 === 等于另外1颗树的左子节点
 *    3. 其中1颗树的右子节点 === 等于另外1颗树的右子节点
 *
 * 同理，对称的树则为
 *    1. 2颗树当前节点相等
 *    2. 其中1颗树的左子节点 === 等于另外1颗树的右子节点
 *    3. 其中1颗树的右子节点 === 等于另外1颗树的左子节点
 */

var isSameTree = function(p, q) {
  return p !== null && q !== null && p.val === q.val
    ? isSameTree(p.left, q.left) && isSameTree(p.right, q.right)
    : p === q
}

var isSymmetric = function(root) {
  const isMirror = (p, q) => p !== null && q !== null && p.val === q.val
    ? isMirror(p.right, q.left) && isMirror(p.left, q.right)
    : p === q
  return isMirror(root, root)
}
