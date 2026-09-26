#!/usr/bin/env node
// 把抠好的透明 PNG 压小、转 base64，生成 src/client/art.generated.ts。
// 宠物在页面上只显示约 300px 高，没必要内嵌 1536px 原图——压到高 512 足够清晰。
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const SRC = join(root, 'assets', 'xiaojing.png')
const OUT = join(root, 'src', 'client', 'art.generated.ts')

// 用 sharp 压图？profile 里不一定有。改用 Pillow 已压好的版本——
// 但为稳妥，这里直接读 PNG 并校验；若体积过大则提示先在 Python 侧缩放。
const buf = readFileSync(SRC)
const b64 = buf.toString('base64')
const kb = (buf.length / 1024).toFixed(1)

const ts = `// 本文件由 scripts/embed-art.mjs 自动生成，请勿手改。
// 小鲸立绘（透明背景 PNG，base64 内嵌）。原始尺寸见 assets/xiaojing.png。
export const PET_ART = 'data:image/png;base64,${b64}'
`

writeFileSync(OUT, ts)
console.log(`✅ 已生成 ${OUT}`)
console.log(`   内嵌 PNG: ${kb} KB -> base64 ${(b64.length / 1024).toFixed(1)} KB`)
if (buf.length > 400 * 1024) {
  console.log('   ⚠️ 体积偏大，建议先在 Python 侧把 PNG 缩到高 512px 再重新生成')
}
