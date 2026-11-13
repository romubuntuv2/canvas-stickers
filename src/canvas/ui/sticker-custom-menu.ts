import { ItemView, Plugin } from 'obsidian'
import { Canvas, CanvasNode, CanvasView } from '../../types/canvas'
import { CanvasStickersSettings } from '../../type'
import { isSticker } from './sticker-class-tagger'




export function registerStickerCustomMenu(plugin: Plugin, settings:CanvasStickersSettings): void {
  const attached = new WeakSet<HTMLElement>()

  const getCanvas = (): Canvas | null => {
    const view = plugin.app.workspace.getActiveViewOfType(ItemView)
    return view?.getViewType() === 'canvas' ? (view as CanvasView).canvas ?? null : null
  }

  const updateSelectionClass = (canvas: Canvas): void => {
    const selection = [...(canvas.selection ?? [])]
    const onlyStickers = selection.length > 0 && selection.every((node) => isSticker(node, settings))
    canvas.wrapperEl?.toggleClass('canvas-menu-stickers', onlyStickers)
  }

  const attach = (): void => {
    const canvas = getCanvas()
    const el: HTMLElement | undefined = canvas?.wrapperEl
    if (!canvas || !el || attached.has(el)) return
    attached.add(el)

    const refresh = () => window.requestAnimationFrame(() => updateSelectionClass(canvas))
    el.addEventListener('pointerup', refresh)
    el.addEventListener('keyup', refresh)
  }

  plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', attach))
  plugin.registerEvent(plugin.app.workspace.on('layout-change', attach))
  plugin.app.workspace.onLayoutReady(attach)
}