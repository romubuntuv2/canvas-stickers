import { TFile } from "obsidian";

export type StickerPaletteSection = {
    name: string
    files: TFile[]
}



export type CanvasStickersSettings = {
    stickerFolder:string
    stickerFavoritesFolder:string
    stickerSize: number
}

