// const a = require('core-js/es/string/repeat.js')
// const a = require('core-js/es/string/repeat.js')
// const path = require('path')
const babel = require('@babel/core')

// babel.transformFileSync()
const code = babel.transformSync('const b = Array.from([]).filter(x => x).includes(1)', {
  presets: [['@babel/preset-env', {
    useBuiltIns: 'usage',
    corejs: 3
  }]],
  plugins: [['@babel/plugin-transform-runtime', {
    corejs: 3
  }]]
})
console.log(code.code)
