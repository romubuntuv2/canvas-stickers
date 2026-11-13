import { TAbstractFile, TFile, TFolder } from "obsidian"
import { IMAGE_EXT } from "../../constants"


export const checkIsImage = (f: TAbstractFile): f is TFile =>
  f instanceof TFile && IMAGE_EXT.has(f.extension.toLowerCase())



export function collectImages(folder: TFolder, maxFiles:number = 1000): TFile[] {
  const files: TFile[] = []
  let currentFilesSize : number = 0
  for (const child of folder.children) {
    if (child instanceof TFolder) files.push(...collectImages(child))
    else if (checkIsImage(child)) {
        currentFilesSize += 1 
        files.push(child)
    }
    if (currentFilesSize >= maxFiles) break
  }
  return files
}


const sortByName = (a:string, b:string) => a.localeCompare(b)


export const sortPathByName =(a:TFile, b:TFile) => sortByName(a.path, b.path)
