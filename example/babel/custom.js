// const types = require('@babel/types')
const { addSideEffect, addDefault } = require('@babel/helper-module-imports')
const template = require('@babel/template')
const { join, resolve } = require('path')

// const resolve = libPath => join(process.cwd(), libPath)
// const buildImport = template.default(`
//   import IMPORT_NAME from SOURCE
// `)
// console.log(resolve('./style/custom'))

module.exports = function ({ types: t }) {
  const importModules = []
  let packageName

  return {
    visitor: {
      ImportDeclaration: {
        enter(path, state) {
          if (t.isStringLiteral(path.node.source)) {
            packageName = path.node.source.value
          }
          // if (path.node.source.value === 'xm-mui') {
          //   // console.log(state)
          //   // addDefault(path.hub.file.path, 'aa', { nameHint: 'hintedName' })
          //   const specifiers = path.node.specifiers.map(speci => {
          //     // return t.importDeclaration(
          //     //   [t.importDefaultSpecifier(t.Identifier(speci.local.name))],
          //     //   t.StringLiteral(`xm-mui/lib/${speci.local.name}/index.js`)
          //     // )
          //     // return buildImport({
          //     //   IMPORT_NAME: t.identifier(speci.local.name),
          //     //   SOURCE: t.StringLiteral(`xm-mui/lib/${speci.local.name}/index.js`)
          //     // })
          //     return template.default.ast(`
          //     import ${speci.local.name} from 'xm-mui/lib/${speci.local.name}/index.js'
          //   `)
          //   })
          //   path.replaceWithMultiple(specifiers)
          // }
        },
        exit(path, { opts: { libPath, noAlias } }) {
          const sp = packageName.split('/')
          if (sp[0] === 'tcon') {
            sp.slice(1).forEach(module => {
              addSideEffect(path, libPath
                ? `${noAlias ? '.' : '@'}/${join(libPath, `${module}.css`)}`
                : join(packageName, 'dist', `${module}.css`)
              )
            })
            path.remove()
          }
        }
      },
      ImportSpecifier: {
        enter(path) {
          console.log(path)
          importModules.push(path.node.imported.name.toLowerCase())
        }
      }
    }
  }
}
