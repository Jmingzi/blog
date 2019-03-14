// const types = require('@babel/types')
// const { addSideEffect, addDefault } = require('@babel/helper-module-imports')
const template = require('@babel/template')

// const buildImport = template.default(`
//   import IMPORT_NAME from SOURCE
// `)

module.exports = function ({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (path.node.source.value === 'xm-mui') {
          console.log(state)
          // addDefault(path.hub.file.path, 'aa', { nameHint: 'hintedName' })
          const specifiers = path.node.specifiers.map(speci => {
            // return t.importDeclaration(
            //   [t.importDefaultSpecifier(t.Identifier(speci.local.name))],
            //   t.StringLiteral(`xm-mui/lib/${speci.local.name}/index.js`)
            // )
            // return buildImport({
            //   IMPORT_NAME: t.identifier(speci.local.name),
            //   SOURCE: t.StringLiteral(`xm-mui/lib/${speci.local.name}/index.js`)
            // })
            return template.default.ast(`
              import ${speci.local.name} from 'xm-mui/lib/${speci.local.name}/index.js'
            `)
          })
          path.replaceWithMultiple(specifiers)
        }
      }
    }
  }
}
