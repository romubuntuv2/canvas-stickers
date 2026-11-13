import { ItemView, TFile } from "obsidian"



export type CanvasNode = {
    nodeEl: HTMLElement,
    file?: TFile,
    getData(): {file?:string}
}

export type Canvas = {
    wrapperEl: HTMLElement,
    canvasEl: HTMLElement,
    nodes: Map<string, CanvasNode>,
    selection: Set<CanvasNode>,
    view:ItemView, 
    x:number,
    y:number,
    posFromEvt?(e:MouseEvent): {x:number, y:number},
    createFileNode(options: {
        file:TFile,
        pos: {x: number, y:number},
        size: {width:number, height:number},
        save?: boolean,
        focus?: boolean
    }): CanvasNode,
    requestSave(): void
}


export type CanvasView  = ItemView & {
    canvas: Canvas
}

