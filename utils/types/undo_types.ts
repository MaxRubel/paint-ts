//UNDO TYPES-------------
export interface UndoExpand {
  action: string,
  data: {
    id: string,
    x: number,
    y: number,
    height: number,
    width: number
  }
}

export interface UndoDragSingle {
  action: string,
  data: {
    id: string,
    x: number,
    y: number
  }
}

export interface UndoTyping {
  action: string,
  data: {
    id: string,
    start: string
  }
}

export interface UndoBrushStroke {
  action: string,
  data: {
    start: number,
    end: number
    oldRaster: CanvasImageSource
  }
}