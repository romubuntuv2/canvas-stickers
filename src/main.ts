import { Notice, Plugin, ItemView, WorkspaceLeaf } from "obsidian"



import { CanvasStickersSettings } from "./type"
import { DEFAULT_SETTINGS } from "./constants"
import { Canvas, CanvasView } from "./types/canvas"
import SettingTabs from "./settings"
import { registerStickerConnectionsHider } from "./canvas/ui/sticker-connexion-hider"
import { registerStickerCustomMenu } from "./canvas/ui/sticker-custom-menu"
import { registerStickerClassTagger } from "./canvas/ui/sticker-class-tagger"
import { StickerStamp } from "./canvas/sticker-stamp"
import { registerStickerPalette } from "./canvas/sticker-palette"
import { registerStickerFavoritesPalette } from "./canvas/sticker-favorites"




export default class CanvasStickersPlugin extends Plugin {
	public settings: CanvasStickersSettings = DEFAULT_SETTINGS

	private sticker_palette:null|HTMLElement = null
	private sticker_favorites:null|HTMLElement = null

	private mouseX = 0 
	private mouseY = 0 




	async loadSettings() {
	const data = (await this.loadData()) as Partial<CanvasStickersSettings> | null
	this.settings = { ...DEFAULT_SETTINGS, ...data }
	}
	
	async saveSettings() {
		await this.saveData(this.settings)
	}



    async onload() {
		await this.loadSettings()
		this.addSettingTab(new SettingTabs(this.app, this))


		registerStickerConnectionsHider(this)
		registerStickerCustomMenu(this, this.settings)
		registerStickerClassTagger(this, this.settings)

		this.addCommand({
			id: "canvas-sticker-open-favorite",
			name: "Open stickers favorites ",
			hotkeys: [{ modifiers: ['Mod'], key: "t" }],
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(ItemView)
				if (view?.getViewType() !== "canvas") return false

				const active = document.activeElement as HTMLElement | null;
				if (!active) return false;

				if (!view.containerEl.contains(active)) return false;

				if (
					active instanceof HTMLInputElement ||
					active instanceof HTMLTextAreaElement ||
					active.isContentEditable
				) return false;

				if (!checking) this.toogleFavoritesVisibility();
				return true;
			}
		}) 

		this.addCommand({
			id: "canvas-sticker-toggle-palette",
			name: "Toggle stickers palette ",
			hotkeys: [{ modifiers: ['Shift', 'Mod'], key: "t" }],
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(ItemView)
				if (view?.getViewType() !== "canvas") return false

				const active = document.activeElement as HTMLElement | null
				if (
					active instanceof HTMLInputElement ||
					active instanceof HTMLTextAreaElement ||
					active?.isContentEditable
				) return false

				if (!checking) {
					this.togglePaletteVisibility()

				}
				return true
			}
		})

		this.registerDomEvent(document, "mousemove", (evt: MouseEvent) => {
			this.mouseX = evt.clientX
			this.mouseY = evt.clientY
		})


		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf: WorkspaceLeaf | null) => {
				if (leaf?.view.getViewType() === "canvas") {
					this.onCanvasOpened(leaf)
				}
			})
		)



		this.app.workspace.onLayoutReady(() => {
			const leaf = this.app.workspace.getActiveViewOfType(ItemView)?.leaf
			if (leaf?.view.getViewType() === "canvas") this.onCanvasOpened(leaf)
		})
	}


	



	private onCanvasOpened(leaf: WorkspaceLeaf) {
		const container = leaf.view.containerEl
		const owner = leaf.view
		const canvas = (leaf.view as CanvasView).canvas

		if (!canvas) return

		const stamp = new StickerStamp(this.app, owner, () => (canvas), this.settings)
		this.injectStickerFavorites(container, stamp)
		this.injectStickerPalette(container, canvas, stamp)
	}


	private injectStickerPalette(container:HTMLElement, canvas:Canvas, stamp:StickerStamp) {
		const panel = container.createDiv({ cls: 'sticker-palette sticker-hidden' })
		this.sticker_palette = panel

		registerStickerPalette(this, panel, canvas, stamp, this.settings)
	}



	private injectStickerFavorites(container: HTMLElement, stamp:StickerStamp) {
		const panel = container.createDiv({ cls: 'sticker-favorites sticker-hidden' })
		this.sticker_favorites = panel

		registerStickerFavoritesPalette(this, panel, stamp, this.settings)
	}


	private togglePaletteVisibility() {
		if (!this.sticker_palette) return
		const isPanelVisible = !this.isPaletteVisible()
		this.sticker_palette.toggleClass('sticker-hidden', !isPanelVisible)
		new Notice(`Stickers palette ${isPanelVisible ? 'opened' : 'closed' }!`)
	}

	private isPaletteVisible(): boolean {
		const palette = this.sticker_palette
		return !!palette && !palette.hasClass('sticker-hidden')
	}



	private toogleFavoritesVisibility() {
		if (!this.sticker_favorites) return
		const isPanelVisible = !this.isFavoritePanel()
		this.sticker_favorites.toggleClass('sticker-hidden', !isPanelVisible)

		const parent = this.sticker_favorites.parentElement!
		const rect = parent.getBoundingClientRect()
		this.sticker_favorites.style.left = `${this.mouseX - rect.left - 80}px`
		this.sticker_favorites.style.top  = `${this.mouseY - rect.top - 80}px`


		new Notice(`Stickers palette ${isPanelVisible ? 'opened' : 'closed' }!`)
	}


	private isFavoritePanel(): boolean {
		const favorite = this.sticker_favorites
		return !!favorite && !favorite.hasClass('sticker-hidden')
	}



}

