const parser = require('@babel/parser')
const traverse = require('@babel/traverse')
const babel = require('@babel/core')
const custom = require('./custom')

const code = `import { Toast, Loading } from 'xm-mui'`
const ast = parser.parse(code, {
  sourceType: 'module'
})

babel.transformFromAst(ast, code, {
  plugins: [
    [custom, {
      name: 'ym'
    }, 'custom']
  ]
}, function(err, result) {
  if (err) throw err
  const { code, map, ast } = result
  console.log(code)
})

// console.log(ast.program.body)

