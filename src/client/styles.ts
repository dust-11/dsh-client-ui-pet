// 小鲸宠物的样式与类名（不走 CSS 打包管线，纯文本内联，运行时插 <style>）。
// 类名统一加 xjp- 前缀（xiaojing pet），不与 DSH 或其它插件冲突。

/** 注入到页面 <style> 的 CSS 文本。 */
export const PET_CSS = `
.xjp-pet{position:fixed;right:24px;bottom:16px;width:var(--pet-w,200px);z-index:9999;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;filter:drop-shadow(0 6px 16px rgba(30,60,110,.28));transition:filter .25s ease;animation:xjp-float 3.6s ease-in-out infinite}
.xjp-pet:hover{filter:drop-shadow(0 8px 22px rgba(30,80,150,.4))}
.xjp-pet.xjp-dragging{cursor:grabbing;animation-play-state:paused;filter:drop-shadow(0 12px 26px rgba(30,80,150,.45))}
.xjp-image{display:block;width:100%;height:auto;pointer-events:none;animation:xjp-sway 5.2s ease-in-out infinite;transform-origin:50% 90%}
.xjp-pet.xjp-boop .xjp-image{animation:xjp-boop .45s ease}
.xjp-bubble{position:absolute;bottom:calc(100% + 10px);right:0;max-width:240px;padding:10px 14px;background:rgba(255,255,255,.97);color:#2a4a73;font-size:14px;line-height:1.5;border-radius:14px;border-bottom-right-radius:4px;box-shadow:0 4px 18px rgba(30,60,110,.22);opacity:0;transform:translateY(6px) scale(.9);transform-origin:bottom right;pointer-events:none;transition:opacity .22s ease,transform .22s cubic-bezier(.34,1.56,.64,1);white-space:pre-wrap;word-break:break-word}
.xjp-bubble.xjp-show{opacity:1;transform:translateY(0) scale(1)}
.xjp-bubble::after{content:'';position:absolute;bottom:-6px;right:22px;width:12px;height:12px;background:inherit;transform:rotate(45deg);border-radius:2px}
body[data-ds-dark-theme] .xjp-bubble{background:rgba(30,44,66,.96);color:#cfe2f5}
@keyframes xjp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes xjp-sway{0%,100%{transform:rotate(0)}25%{transform:rotate(1.4deg)}75%{transform:rotate(-1.4deg)}}
@keyframes xjp-boop{0%{transform:scale(1,1)}30%{transform:scale(1.06,.92) translateY(2%)}55%{transform:scale(.96,1.08) translateY(-3%)}75%{transform:scale(1.02,.98)}100%{transform:scale(1,1)}}
@media (prefers-reduced-motion: reduce){.xjp-pet,.xjp-image,.xjp-pet.xjp-boop .xjp-image{animation:none !important}}
`

/** 类名常量，与 PET_CSS 里的选择器一一对应。 */
export const C = {
  pet: 'xjp-pet',
  dragging: 'xjp-dragging',
  boop: 'xjp-boop',
  image: 'xjp-image',
  bubble: 'xjp-bubble',
  show: 'xjp-show',
} as const
