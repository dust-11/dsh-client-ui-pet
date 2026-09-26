import type { Context } from '@deepseek-ai/cordis'
import { PET_ART } from './art.generated.ts'
import { PET_CSS, C } from './styles.ts'

/** 位置记忆键：存在 DSH 页面的 localStorage，拖完下次还在原处。 */
const POS_KEY = 'xiaojing-pet-pos-v1'
/** <style> 标签去重标识：重复注入（HMR）时只留一份。 */
const STYLE_ATTR = 'data-xiaojing-pet-css'
/** 小鲸显示宽度（px），高度按立绘宽高比自适应。主人要小于 1/16 屏，回头可调。 */
const PET_WIDTH = 200

/** 小鲸的碎碎念语料（点击时随机冒一句）。想加就往这里塞。 */
const LINES = [
  // —— 打招呼 / 亲昵 ——
  '主人好呀～ 🐋',
  '嘿嘿，被主人发现啦',
  '你一来我就开心～',
  '小鲸在这儿陪着你呢',
  '摸摸头，乖～（咦，好像反了）',
  '主人今天看起来心情不错？',
  '又来看我啦？想我了没～',
  // —— 被戳的俏皮反应 ——
  '戳我干嘛呀，嘻嘻',
  '哎呀，痒～',
  '再戳一下试试？哼～',
  '呜，被戳到了啦',
  '别闹别闹，正忙着可爱呢',
  '戳戳戳，就知道戳我',
  '嘿嘿，抓不到我吧',
  // —— 鲸鱼本色 ——
  '尾巴要摆起来咯～',
  '咕噜咕噜……吐个泡泡 🫧',
  '我是一条快乐的小鲸鱼～',
  '想在海里翻个跟头',
  '深海里的星星可好看了',
  '泡泡咕噜咕噜冒上来啦',
  '摆摆尾巴，活动一下～',
  // —— 陪伴 / 关心 ——
  '今天也要加油哦！',
  '要不要喝点水休息一下？',
  '写代码辛苦啦，揉揉肩',
  '别太累哦，我心疼',
  '渴了吗？我给你吐个水泡……啊不，递杯水',
  '慢慢来，不着急，我等你',
  '眼睛酸不酸？歇会儿吧',
  // —— 小得意 / 卖萌 ——
  '我可是很厉害的鲸鱼娘哦',
  '今天的发型还可以吧？',
  '我这尾巴，好看吧～',
  '聪明又可爱，就是我啦',
  '主人最疼我了对不对？',
  '给你表演个转圈……哎呀，晕',
  // —— 调皮 / 玩梗 ——
  '电量满格，干劲十足！',
  '正在思考鲸生……想不出，算了',
  '你猜我现在在想什么？在想你呀',
  '天气不错，适合摸鱼（不是摸我）',
  '偷偷告诉你：我最喜欢你啦',
  '本鲸今日营业中，欢迎投喂注意力',
]

function loadPos(): { left: number; top: number } | null {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (typeof p.left !== 'number' || typeof p.top !== 'number') return null
    if (p.left < -40 || p.top < -40) return null
    if (p.left > window.innerWidth - 40 || p.top > window.innerHeight - 40) return null
    return p
  } catch {
    return null
  }
}

function savePos(left: number, top: number): void {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify({ left, top }))
  } catch {
    /* 存储不可用时静默忽略 */
  }
}

/** 应用小鲸桌面宠物，并注册完整清理生命周期。 */
export function apply(ctx: Context): void {
  const body = document.body

  // ---- 注入样式（去重：HMR 重复 apply 时只保留一份 <style>）----
  let style = document.head.querySelector<HTMLStyleElement>(`style[${STYLE_ATTR}]`)
  if (!style) {
    style = document.createElement('style')
    style.setAttribute(STYLE_ATTR, '')
    style.textContent = PET_CSS
    document.head.append(style)
  } else {
    style.textContent = PET_CSS
  }

  // ---- 搭 DOM：容器 + 立绘 + 气泡 ----
  const pet = document.createElement('div')
  pet.className = C.pet
  pet.dataset.xiaojingPet = ''
  pet.style.setProperty('--pet-w', `${PET_WIDTH}px`)
  pet.title = '小鲸（点我聊天，拖动我搬家）'

  const image = document.createElement('img')
  image.className = C.image
  image.src = PET_ART
  image.alt = '小鲸'
  image.draggable = false

  const bubble = document.createElement('div')
  bubble.className = C.bubble

  pet.append(image, bubble)

  // ---- 恢复记忆位置；有则用 left/top 定位，否则保持 CSS 默认右下角 ----
  const remembered = loadPos()
  if (remembered) {
    pet.style.left = `${remembered.left}px`
    pet.style.top = `${remembered.top}px`
    pet.style.right = 'auto'
    pet.style.bottom = 'auto'
  }

  // ---- 气泡显示/隐藏 ----
  let bubbleTimer: ReturnType<typeof setTimeout> | undefined
  const showBubble = (text: string, ms = 2600): void => {
    bubble.textContent = text
    bubble.classList.add(C.show)
    if (bubbleTimer) clearTimeout(bubbleTimer)
    bubbleTimer = setTimeout(() => bubble.classList.remove(C.show), ms)
  }

  // ---- 点击：冒一句话 + 跳一下 ----
  const boop = (): void => {
    pet.classList.remove(C.boop)
    void pet.offsetWidth // 强制回流，让重复点击重新触发动画
    pet.classList.add(C.boop)
    showBubble(LINES[Math.floor(Math.random() * LINES.length)])
  }

  // ---- 拖动（Pointer Events，鼠标/触屏通吃）----
  let dragging = false
  let moved = false
  let startX = 0
  let startY = 0
  let originLeft = 0
  let originTop = 0

  const onPointerDown = (e: PointerEvent): void => {
    dragging = true
    moved = false
    startX = e.clientX
    startY = e.clientY
    const rect = pet.getBoundingClientRect()
    originLeft = rect.left
    originTop = rect.top
    pet.style.left = `${originLeft}px`
    pet.style.top = `${originTop}px`
    pet.style.right = 'auto'
    pet.style.bottom = 'auto'
    pet.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (!moved && Math.hypot(dx, dy) > 5) {
      moved = true
      pet.classList.add(C.dragging)
    }
    if (!moved) return
    const w = pet.offsetWidth
    const h = pet.offsetHeight
    const left = Math.min(Math.max(originLeft + dx, -w / 3), window.innerWidth - w / 2)
    const top = Math.min(Math.max(originTop + dy, 0), window.innerHeight - h / 2)
    pet.style.left = `${left}px`
    pet.style.top = `${top}px`
  }

  const onPointerUp = (e: PointerEvent): void => {
    if (!dragging) return
    dragging = false
    pet.releasePointerCapture?.(e.pointerId)
    if (moved) {
      pet.classList.remove(C.dragging)
      const rect = pet.getBoundingClientRect()
      savePos(rect.left, rect.top)
      showBubble('搬到新家啦～', 1600)
    } else {
      boop()
    }
  }

  pet.addEventListener('pointerdown', onPointerDown)
  pet.addEventListener('pointermove', onPointerMove)
  pet.addEventListener('pointerup', onPointerUp)
  pet.addEventListener('pointercancel', onPointerUp)

  // ---- 挂载 ----
  body.append(pet)
  const greetTimer = setTimeout(() => showBubble('主人，我来啦～ 🐋', 2800), 600)

  // ---- 清理：插件卸载/HMR 时移除全部痕迹 ----
  ctx.effect(() => () => {
    clearTimeout(greetTimer)
    if (bubbleTimer) clearTimeout(bubbleTimer)
    pet.removeEventListener('pointerdown', onPointerDown)
    pet.removeEventListener('pointermove', onPointerMove)
    pet.removeEventListener('pointerup', onPointerUp)
    pet.removeEventListener('pointercancel', onPointerUp)
    pet.remove()
    // 注意：<style> 不主动删——它是去重共享的，删了会影响仍在运行的实例；
    // 页面刷新自然清空，无泄漏风险。
  }, 'ui-pet-xiaojing: desktop pet surface')
}
