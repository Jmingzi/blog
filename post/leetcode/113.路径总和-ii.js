/*
 * @lc app=leetcode.cn id=113 lang=javascript
 *
 * [113] 路径总和 II
 */
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
 * @return {number[][]}
 */
var pathSum = function(root, sum) {
  let result = []
  let tmp = []

  const getSum = (node) => {
    if (node === null) {
        return false
    }
    tmp.push(node.val)
    
    if (
      node.left === null && 
      node.right === null &&
      tmp.reduce((s, item) => s + item, 0) === sum
    ) {
      result.push(tmp.slice(0))
    }
      
    if (getSum(node.left) === undefined) {      
      tmp.pop()
    }
    if (getSum(node.right) === undefined) {
      tmp.pop()
    }
  }
  getSum(root)
  return result
}

