# dsh-client-ui-pet-xiaojing

给 [DeepSeek Harness](https://github.com/deepseek-ai) Web 控制终端右下角挂一只**可互动的桌面宠物**。
纯浏览器客户端插件，只在打开 DSH 页面时出现，不占桌面、不受 Wayland 限制。

> **关于立绘**：本仓库**不包含**作者定制的形象资源。`assets/` 与 `src/client/art.generated.ts`
> 均未随仓库分发，仓库内保留的是 1x1 透明占位。请自备一张透明背景 PNG（见下方「准备立绘」），
> 换成你自己的形象即可。

## 功能

- 🐋 **悬浮于右下角**：fixed 定位，`drop-shadow` 立体感
- 🌊 **待机动作**：呼吸浮动 + 轻微摇摆（CSS animation，无逐帧素材）
- 💬 **点击互动**：随机冒一句碎碎念气泡 + 跳一下
- 🖐️ **可拖动**：Pointer Events（鼠标/触屏通吃），拖完位置记忆在 localStorage
- ♿ **无障碍**：尊重系统 `prefers-reduced-motion`（用户减弱动画则静止）
- 🧹 **干净卸载**：`ctx.effect` 注册清理，插件卸载/HMR 时移除全部 DOM 与监听

## 结构

```
package.json                  插件清单（dsh.client 声明 + tsdown 构建脚本）
cordis.patch.yml              自包含注册：把 ui-pet-xiaojing 插进客户端名册
src/index.ts                  host 端入口（空实现，纯浏览器插件）
src/client/index.ts           注入 / 拖动 / 点击 / 气泡 主逻辑（含 PET_WIDTH、LINES）
src/client/styles.ts          样式与动画（纯文本内联，运行时插入 <style>）
src/client/art.generated.ts   立绘 base64（由 scripts/embed-art.mjs 生成，仓库内为占位）
scripts/embed-art.mjs         把 assets/xiaojing.png 转成 base64 内嵌模块
scripts/normalize-client-banner.mjs  把 tsdown 产物包成 __ModuleLoader__.load 单文件
assets/                       立绘原始图（不随仓库分发）
```

## 构建

```bash
pnpm install                    # 装 tsdown / typescript / cordis
node scripts/embed-art.mjs      # 把你的 PNG 转成 base64 内嵌模块（见下）
pnpm build                      # tsdown 产出 + normalize 包成客户端单文件
```

### 准备立绘

1. 准备一张**透明背景 PNG**，放到 `assets/xiaojing.png`
   （宠物显示高度约 300px，建议原图高 512px 左右即可，过大只是徒增体积）
2. 运行 `node scripts/embed-art.mjs` 生成 `src/client/art.generated.ts`
3. 再执行 `pnpm build`

抠图可用 [rembg](https://github.com/danielgatis/rembg)（`rembg i -m u2netp <输入> <输出>`）。

## 安装到 DSH

```bash
dsh plugin --profile web add <本目录路径>
# 重启 DSH（客户端插件须重启后重新加载）
```

### 本仓库的关键机制（改客户端插件容易踩的坑）

- 客户端插件产物必须是 `window.__ModuleLoader__.load({ id, factory })` 包裹的**单文件**，
  由 `scripts/normalize-client-banner.mjs` 从 tsdown 产物转换而来——**直接跑 tsdown 是不够的**。
- CSS 不走 tsdown 管线：样式在 `styles.ts` 里以纯文本内联，运行时插 `<style>`，类名带固定前缀避免污染全局。

## 调参

- 大小：`src/client/index.ts` 的 `PET_WIDTH`（默认 200px）
- 语料：同文件的 `LINES` 数组
- 动画：`src/client/styles.ts` 各 `@keyframes`

## License

[MIT](LICENSE)

**授权范围仅覆盖代码。** 作者定制的形象 / 立绘资源不对外分发、也不在本许可证授权范围内
（本仓库亦未包含，见文首「关于立绘」）。你自备的图片版权归你所有。
