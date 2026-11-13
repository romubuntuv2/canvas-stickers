import { App, TFile, TFolder, Plugin, Notice } from "obsidian"
import { CanvasStickersSettings } from "../type"
import { collectImages } from "./utils/images-to-stickers"
import { StickerStamp } from "./sticker-stamp"

export function registerStickerFavoritesPalette(plugin:Plugin, favorites_container:HTMLElement, stamp: StickerStamp, settings:CanvasStickersSettings) {
    const app = plugin.app

    const render = () => {
        favorites_container.empty()

        const items = buildItems(app, settings)

		items.slice(0, 8).forEach(file => {
			const slot = favorites_container.createDiv({ cls: 'sticker-wheel-slot' })
            const img = slot.createEl('img', {
                cls: 'sticker-wheel-slot-image',
                attr: {
                src: app.vault.getResourcePath(file),
                alt: file.basename,
                title: file.basename,
                draggable: 'false',
                },
            })
			slot.addEventListener('click', () => {
                stamp.toggle(file)
                favorites_container.addClass('sticker-hidden')
                new Notice(`Stickers palette closed!`)
            })
		})
    }


    stamp.onChange(render)


    render()
    return render

}


function buildItems(app:App, settings:CanvasStickersSettings):TFile[] {
  const folder = app.vault.getFolderByPath(settings.stickerFavoritesFolder.replace(/\/$/, ''))
  if (!(folder instanceof TFolder)) return []

    return collectImages(folder)

}



 