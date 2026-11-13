import { App, Component, TFile } from 'obsidian'
import { Canvas } from '../types/canvas'
import { CanvasStickersSettings } from '../type'


const STAMPING_CLASS = 'sticker-stamping'
const IGNORE = '.canvas-controls, .canvas-menu, .canvas-card-menu, .sticker-palette'
const BLOCKED = ['mousedown', 'click', 'dblclick', 'auxclick'] as const

export class StickerStamp {
  private file: TFile | null = null
  private ghost: HTMLImageElement | null = null
  private wrapper: HTMLElement | null = null
  private doc: Document | null = null
  private listeners = new Set<() => void>()

  constructor(
    private app: App,
    owner: Component,
    private getCanvas: () => Canvas | null,
    private setting:CanvasStickersSettings
  ) {
    owner.register(() => this.stop())
  }

  get active(): TFile | null { return this.file }
  onChange(cb: () => void): void { this.listeners.add(cb) }
  private emit(): void { this.listeners.forEach((cb) => cb()) }

  toggle(file: TFile): void {
    if (this.file?.path === file.path) this.stop()
    else this.start(file)
  }

  start(file: TFile): void {
    const wrapper: HTMLElement | undefined = this.getCanvas()?.wrapperEl
    if (!wrapper) return

    this.file = file

    if (!this.wrapper) {
      const doc = wrapper.ownerDocument
      this.wrapper = wrapper
      this.doc = doc
      wrapper.addClass(STAMPING_CLASS)

      this.ghost = doc.body.createEl('img', {
        cls: 'sticker-ghost',
        attr: { draggable: 'false' },
      })

      // Tout sur le document, en capture : on passe avant Obsidian, même pour le fond du canvas
      doc.addEventListener('pointermove', this.onMove, true)
      doc.addEventListener('pointerdown', this.onPointerDown, true)
      for (const type of BLOCKED) doc.addEventListener(type, this.onBlock, true)
      doc.addEventListener('contextmenu', this.onContextMenu, true)
      doc.addEventListener('keydown', this.onKeyDown, true)
    }

    this.ghost!.src = this.app.vault.getResourcePath(file)
    this.emit()
  }

  stop(): void {
    const doc = this.doc
    if (doc) {
      this.wrapper?.removeClass(STAMPING_CLASS)
      doc.removeEventListener('pointermove', this.onMove, true)
      doc.removeEventListener('pointerdown', this.onPointerDown, true)
      for (const type of BLOCKED) doc.removeEventListener(type, this.onBlock, true)
      doc.removeEventListener('contextmenu', this.onContextMenu, true)
      doc.removeEventListener('keydown', this.onKeyDown, true)
    }
    this.ghost?.remove()
    this.ghost = null
    this.wrapper = null
    this.doc = null

    if (this.file) {
      this.file = null
      this.emit()
    }
  }


  private inCanvas(e: Event): boolean {
    const t = e.target as HTMLElement | null
    return !!t && !!this.wrapper?.contains(t) && !t.closest?.(IGNORE)
  }


  private block(e: Event): void {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
  }

  private onMove = (e: PointerEvent): void => {
    const g = this.ghost
    if (!g) return
    if (!this.inCanvas(e)) {
      g.toggleClass('is-visible', false) 
      return
    }
    const size = this.setting.stickerSize * this.scale(this.getCanvas() as Canvas)
    g.style.width = g.style.height = `${size}px`
    g.style.transform = `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px)`
    g.toggleClass('is-visible', true)
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (!this.inCanvas(e)) return
    if (e.button === 0) {
      this.block(e)
      this.place(e)
    } else if (e.button === 2) {
      this.block(e)
    }
  }

  private onBlock = (e: MouseEvent): void => {
    if (!this.inCanvas(e)) return
    if (e.button === 0 || e.button === 2) this.block(e)
  }

  private onContextMenu = (e: MouseEvent): void => {
    if (!this.inCanvas(e)) return
    this.block(e)
    window.setTimeout(() => this.stop(), 0)
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.stop()
  }


  private scale(canvas: Canvas): number {
    const el: HTMLElement | undefined = canvas?.canvasEl
    if (!el) return 1
    const a = new DOMMatrix(getComputedStyle(el).transform).a
    return Number.isFinite(a) && a > 0 ? a : 1
  }

  private canvasPos(canvas: Canvas, e: PointerEvent): { x: number, y: number } {
    const fromObsidian = canvas.posFromEvt?.(e)
    if (fromObsidian) return fromObsidian

    const rect = (this.wrapper as HTMLElement).getBoundingClientRect()
    const z = this.scale(canvas)
    return {
      x: canvas.x + (e.clientX - (rect.left + rect.width / 2)) / z,
      y: canvas.y + (e.clientY - (rect.top + rect.height / 2)) / z,
    }
  }

  private place(e: PointerEvent): void {
    const canvas = this.getCanvas()
    if (!canvas || !this.file) return

    const p = this.canvasPos(canvas, e)
    canvas.createFileNode({
      file: this.file,
      pos: { x: p.x - this.setting.stickerSize / 2, y: p.y - this.setting.stickerSize / 2 },
      size: { width: this.setting.stickerSize, height: this.setting.stickerSize },
      save: true,
    })
    canvas.requestSave()
  }
}