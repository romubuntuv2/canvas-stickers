import { App, TFile, TAbstractFile, TFolder, Plugin } from "obsidian"
import { Canvas } from "../types/canvas"
import { StickerStamp } from "./sticker-stamp"
import { CanvasStickersSettings, StickerPaletteSection } from "../type"
import { GENERAL_SECTION_NAME } from "../constants"
import { checkIsImage, collectImages, sortPathByName } from "./utils/images-to-stickers"






export function registerStickerPalette(plugin:Plugin, palette_container:HTMLElement, canvas:Canvas, stamp:StickerStamp, settings:CanvasStickersSettings): ()=>void {
    const app = plugin.app

    const render = () => {
        palette_container.empty()
        const sections = buildSections(app, settings)

        if (sections.length === 0) {
            palette_container.createDiv({ cls: 'sticker-palette-empty', text: 'Aucun sticker' })
            return
        }

        for (const section of sections) {
            const block = palette_container.createDiv({ cls: 'sticker-palette-section' })
            block.createDiv({ cls: 'sticker-palette-title', text: section.name })

            const grid = block.createDiv({ cls: 'sticker-palette-grid' })
            for (const file of section.files) {
                const img = grid.createEl('img', {
                    cls: 'sticker-palette-item',
                    attr: {
                    src: app.vault.getResourcePath(file),
                    alt: file.basename,
                    title: file.basename,
                    draggable: 'false',
                    },
                })
                img.classList.toggle('is-active', stamp.active?.path === file.path)
                img.addEventListener('click', () => {
                    stamp.toggle(file)
                })
            }
        }
    }

    stamp.onChange(render)
    const inStickerDir = (f: TAbstractFile) => f.path.startsWith(settings.stickerFolder)
    const onChange = (f: TAbstractFile) => { if (inStickerDir(f)) render() }

    canvas.view.registerEvent(app.vault.on('create', onChange))
    canvas.view.registerEvent(app.vault.on('delete', onChange))
    canvas.view.registerEvent(app.vault.on('rename', (f, oldPath) => {
        if (inStickerDir(f) || oldPath.startsWith(settings.stickerFolder)) render()
    }))

    render()
    return render
}




function buildSections(app: App, settings:CanvasStickersSettings): StickerPaletteSection[] {
  const root = app.vault.getAbstractFileByPath(settings.stickerFolder.replace(/\/$/, ''))
  if (!(root instanceof TFolder)) return []

  const byPath = (a: TFile, b: TFile) => a.path.localeCompare(b.path)

  const sections: StickerPaletteSection[] = [
    { name: GENERAL_SECTION_NAME, files: root.children.filter(checkIsImage).sort(sortPathByName) },
  ]

  const subfolders = root.children
    .filter((c): c is TFolder => c instanceof TFolder)
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const folder of subfolders) {
    sections.push({ name: folder.name, files: collectImages(folder).sort(byPath) })
  }

  // On ne montre pas les sections vides
  return sections.filter((s) => s.files.length > 0)
}



