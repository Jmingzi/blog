/**
 * 2种思路
 * 1. 双队列，一个队列里寸奇数，一个队列里存偶数
 * 2. 利用 push 和 unshift 来达到相反的效果
 */
 
// var zigzagLevelOrder = function(root) {
//     if (!root) {
//         return []
//     }
    
//     const stack = [{ ...root, level: 0 }]
//     const stackMirror = [{ ...root, level: 0 }]
//     let num = 0
//     const result = []
    
//     const get = (node, nodeMirror) => {
//         if (node || nodeMirror) {
//             const level = node ? node.level : nodeMirror.level
//             const nextLevel = level + 1
//             if (!result[level]) {
//                 result[level] = []
//             }
//             result[level].push(level % 2 ? nodeMirror.val : node.val)
            
//             if (node.left) {
//                 stack.push({ ...node.left, level: nextLevel })
//             }
//             if (node.right) {
//                 stack.push({ ...node.right, level: nextLevel })
//             }
            
//             if (nodeMirror.right) {
//                 stackMirror.push({ ...nodeMirror.right, level: nextLevel })
//             }
//             if (nodeMirror.left) {
//                 stackMirror.push({ ...nodeMirror.left, level: nextLevel })
//             }
            
//             num++
//             if (num <= stack.length) {
//                 get(stack[num], stackMirror[num])
//             }
//         }
//     }
//     get(stack[num], stackMirror[num])
//     return result
// };

var zigzagLevelOrder = function(root) {
    if (!root) {
        return []
    }
    
    const stack = [{ ...root, level: 0 }]
    let num = 0
    const result = []
    
    const get = (node) => {
        if (node) {
            const level = node.level
            const nextLevel = level + 1
            if (!result[level]) {
                result[level] = []
            }
            level % 2 ? result[level].unshift(node.val) : result[level].push(node.val)
            
            if (node.left) {
                stack.push({ ...node.left, level: nextLevel })
            }
            if (node.right) {
                stack.push({ ...node.right, level: nextLevel })
            }
            
            num++
            if (num <= stack.length) {
                get(stack[num])
            }
        }
    }
    get(stack[num])
    return result
};
