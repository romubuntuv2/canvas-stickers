import { App, PluginSettingTab } from "obsidian"
import CanvasStickersPlugin from "./main"

export default class SettingTabs extends PluginSettingTab {
  display(): void {
    throw new Error("Method not implemented.")
  }
  plugin: CanvasStickersPlugin

  constructor(app: App, plugin: CanvasStickersPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  getSettingDefinitions() {
    return [
      {
        name: "Sticker Folder",
        desc: "Set up the main folder for your stickers",
        control: { type: "text", key: "stickerFolder", placeholder: "Stickers" },
      },
      {
        name: "Sticker Favorites Folder",
        desc: "Set up the folder for your favorite stickers",
        control: { type: "text", key: "stickerFavoritesFolder", placeholder: "Stickers/Favorites" },
      },
      {
        name: "Sticker Base Size",
        desc: "Set up the base size of your stickers",
        control: { type: "slider", key: "stickerSize", min: 16, max: 128, step: 16 },
      },
    ]
  }


}