function TreeNode (val) {
  this.val = val
  this.left = this.right = null
}

function define(arr, i) {
  let tree = arr[i] ? new TreeNode(arr[i]) : null
  if (tree) {
    tree.left = define(arr, 2*i + 1)
    tree.right = define(arr, 2*i + 2)
  }
  return tree
}


