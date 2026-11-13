import { ItemView, Plugin } from 'obsidian'
import { CanvasView } from '../../types/canvas'



export function registerStickerConnectionsHider(plugin: Plugin): void {
  const attached = new WeakSet<HTMLElement>()

  const attach = (): void => {
    const view = plugin.app.workspace.getActiveViewOfType(ItemView)
    if (view?.getViewType() !== 'canvas') return

    const wrapper: HTMLElement | undefined = (view as CanvasView).canvas?.wrapperEl
    if (!wrapper || attached.has(wrapper)) return
    attached.add(wrapper)

    let frame = 0
    plugin.registerDomEvent(
      wrapper,
      'mousemove',
      (e: MouseEvent) => {
        const { target, clientX, clientY } = e
        cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(() => {
          const el = target as HTMLElement


          if (el.closest('.canvas-node-interaction-layer')) return


          const nodeEl = el.closest('.canvas-node')
          const near = nodeEl
            ? nodeEl.hasClass('sticker-node')
            : isNearSticker(wrapper, clientX, clientY)

          wrapper.toggleClass('hovering-sticker', near)
        })
      },
      true,
    )

    plugin.registerDomEvent(wrapper, 'mouseleave', () => {
      cancelAnimationFrame(frame)
      wrapper.removeClass('hovering-sticker')
    })
  }

  plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', attach))
  plugin.registerEvent(plugin.app.workspace.on('layout-change', attach))
  plugin.app.workspace.onLayoutReady(attach)
}

function isNearSticker(wrapper: HTMLElement, x: number, y: number): boolean {
  for (const el of Array.from(wrapper.querySelectorAll<HTMLElement>('.sticker-node'))) {
    const r = el.getBoundingClientRect()
    if (
      x >= r.left - 40 && x <= r.right + 40 &&
      y >= r.top - 40 && y <= r.bottom + 40
    ) return true
  }
  return false
}
