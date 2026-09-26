#!/usr/bin/env node
// 把 tsdown 产出的 ESM 客户端包，包成 DSH 客户端加载器要求的
// `window.__ModuleLoader__.load({ id, factory })` 单文件格式。
// 参照：@deepseek-ai/dsh-client-ui-theme、dshmarket 的 client.js 产物格式。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const PKG = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const ID = PKG.name // 加载器 id 用包名

// tsdown 产出的客户端文件（ESM，含 apply 导出）
const SRC = join(root, 'lib', 'client', 'index.mjs')
// DSH 期望的客户端产物路径（exports["./client"] 指向它）
const OUT_DIR = join(root, 'client')
const OUT = join(OUT_DIR, 'client.js')

const body = readFileSync(SRC, 'utf8')

// 把 ESM 的 export 转成 CommonJS 风格的 exports，套进 factory(require) 里。
// tsdown 产物的 apply 以 `export { apply }` 结尾；factory 内用 module.exports。
const wrapped = `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {


\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

${transformEsmToCjs(body)}

\t\treturn module.exports;
\t}
});
`

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, wrapped)
console.log(`✅ 已生成 DSH 客户端产物: ${OUT}`)
console.log(`   加载器 id: ${ID}`)
console.log(`   大小: ${(wrapped.length / 1024).toFixed(1)} KB`)

// 极简 ESM->CJS 转换：处理 tsdown 产物的两种导出写法。
// 1) `export { apply }` / `export { apply, x }`  ->  `exports.apply = apply; ...`
// 2) 其余（import 一律不应出现——客户端代码须自包含；CSS/图片已被内联）
function transformEsmToCjs(code) {
  let out = code
  // 收集具名导出
  const named = []
  out = out.replace(/export\s*\{([^}]+)\}\s*;?/g, (_, list) => {
    for (const part of list.split(',')) {
      const p = part.trim()
      if (!p) continue
      const m = p.match(/^(\S+)\s+as\s+(\S+)$/)
      if (m) named.push([m[1], m[2]])
      else named.push([p, p])
    }
    return ''
  })
  // export default -> exports.default
  out = out.replace(/export\s+default\s+/g, 'exports.default = ')
  // 追加具名导出赋值
  if (named.length) {
    const assigns = named.map(([local, exported]) => `\t\texports.${exported} = ${local};`).join('\n')
    out += `\n${assigns}\n`
  }
  // import 检查：客户端产物不应再有运行时 import（须全部内联/external 由 require 提供）
  const leftoverImport = out.match(/^\s*import\s+[^\n]+/gm)
  if (leftoverImport) {
    console.warn('   ⚠️ 检测到残留 import（应改为 require 或内联）:')
    for (const line of leftoverImport) console.warn('      ' + line.trim())
  }
  return out
}
