import { ItemView, Plugin } from 'obsidian'
import { Canvas, CanvasNode, CanvasView } from '../../types/canvas'
import { CanvasStickersSettings } from '../../type'





export function isSticker(node: CanvasNode, settings:CanvasStickersSettings): boolean {
  const path = node?.file?.path ?? node?.getData?.()?.file
  return typeof path === 'string' && (path.startsWith(settings.stickerFolder) || path.startsWith(settings.stickerFavoritesFolder))
}

function tagStickerClass(canvas: Canvas, settings:CanvasStickersSettings): void {
  for (const node of canvas.nodes?.values() ?? []) {
    const el: HTMLElement | undefined = node.nodeEl
    if (!el) continue
    const should = isSticker(node, settings)
    if (el.classList.contains('sticker-node') !== should) {
      el.classList.toggle('sticker-node', should)
    }
  }
}

export function registerStickerClassTagger(plugin: Plugin, settings:CanvasStickersSettings): void {
  const observed = new WeakSet<HTMLElement>()

  const attach = (retries = 10): void => {
    const view = plugin.app.workspace.getActiveViewOfType(ItemView)
    if (view?.getViewType() !== 'canvas') return

    const canvas = (view as CanvasView).canvas
    const root: HTMLElement | undefined = canvas?.wrapperEl 


    if (!root) {
      if (retries > 0) window.setTimeout(() => attach(retries - 1), 150)
      return
    }
    if (observed.has(root)) return
    observed.add(root)

    let frame = 0
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => tagStickerClass(canvas, settings))
    })
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'], 
    })
    view.register(() => observer.disconnect())

    tagStickerClass(canvas, settings)
  }

  plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', () => attach()))
  plugin.registerEvent(plugin.app.workspace.on('layout-change', () => attach()))
  plugin.app.workspace.onLayoutReady(() => attach())
}