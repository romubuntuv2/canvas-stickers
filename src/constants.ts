import { CanvasStickersSettings, StickerPaletteSection } from "./type"


export const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])


// STICKER PALETTE 
export const GENERAL_SECTION_NAME = 'General'
export const EMPTY_STICKER_PALLETE_SECTIONS : StickerPaletteSection[] =[{name:GENERAL_SECTION_NAME, files:[]}]

// CLASS NAME
export const STICKER_CLASS = 'sticker-node'


// SETTINGS
export const DEFAULT_SETTINGS: CanvasStickersSettings = {
	stickerFolder:"Stickers",
	stickerFavoritesFolder:'Stickers/Favorites',
	stickerSize: 32,
}
