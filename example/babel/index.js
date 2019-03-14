const parser = require('@babel/parser')
const traverse = require('@babel/traverse')

const code = `const fn = () => {
  console.log('arrow function')
}`
const ast = parser.parse(code)

// console.log(traverse)
traverse.default(ast, {
  VariableDeclaration(path) {
    console.log(path.get('name'))
    // require('fs').promises.writeFile('./demo.txt', path, 'utf8')
  }
})
// console.log(parserResult)

