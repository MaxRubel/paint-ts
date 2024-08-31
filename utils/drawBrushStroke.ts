import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { get } from "svelte/store";
import { event_state_store, theme_store } from "../stores/eventState";
import { AddUndoItem } from "../stores/undoStore";
import { brush_size_store } from "../stores/brushStore";
import { active_color_store } from "../stores/paletteStore";
import { drawing_room_id } from "../stores/drawingRoomStore";
import { SendToAll } from "./webRTCNegotiate";
import { v4 as uuidv4 } from "uuid";
import type { PointsMap, PointsObject } from "./webRTCDataMessages";

type sendArray = [number, number, number][]

export type DrawSendData = { end: string | null, brush: { size: number, color: string, type: string }, array: sendArray }

let tempPoints: [number, number, number][] = [];
let pointsToSend: [number, number, number][] = [];
let paths: { pathData: string; color: string }[] = [];
let ctx: CanvasRenderingContext2D;
let color = "";
let publicMoveId: string


let oldIds: string[] = []
let sendInterval: NodeJS.Timeout | null

let watchingForMouseout = false
let transmitting: boolean = false

//Temporary store of canvas as DataURL on mouse down of eraser/drawing
let oldRaster: string | null = null;

//Store of canvas as DataURL on mouse up
let currentCanvas: string = "";

export let pointsMap: PointsMap = {}

const BRUSH_DATA_SEND_INTERVAL = 20 //milliseconds

export function InitCtx(context: CanvasRenderingContext2D) {
  ctx = context;
}

export function GetCanvasContext() {
  if (ctx) {
    return ctx;
  } else {
    console.error("Canvas was not initialized properly");
  }
}

export function DrawImageFromDataURL(
  ctx: CanvasRenderingContext2D,
  dataURL: string,
) {
  return new Promise((resolve: any, reject) => {
    const img = new Image();

    img.onload = function () {
      requestAnimationFrame(() => {
        const canvas = document.getElementById("main-canvas");
        if (!canvas) {
          reject(new Error("Canvas element not found"));
          return;
        }

        //@ts-ignore
        canvas.width = img.width;
        //@ts-ignore
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        resolve();
      });
    };

    img.onerror = (error) => {
      console.error("Error loading image:", error);
      reject(error);
    };

    img.src = dataURL;
  });
}

export function SaveOriginalRaster() {
  if (!ctx) {
    console.error("Canvas context not initialized");
    return;
  }

  const canvas = document.getElementById("main-canvas");
  if (!canvas) {
    console.error("no canvas found");
    return;
  }

  //@ts-ignore
  oldRaster = canvas.toDataURL("image/png");
}


function startTransmitting() {
  publicMoveId = uuidv4()
  sendInterval = setInterval(() => {
    const brushData = { size: get(brush_size_store), color: get(active_color_store), type: get(event_state_store) }
    const sendData: DrawSendData = { end: null, brush: brushData, array: pointsToSend }

    SendToAll(`points&*^${JSON.stringify(sendData)}`)
  }, BRUSH_DATA_SEND_INTERVAL)

}

function stopTransmitting() {
  transmitting = false
  if (sendInterval) {
    clearInterval(sendInterval)

    const brushData = { size: get(brush_size_store), color: get(active_color_store), type: get(event_state_store) }
    const sendData: DrawSendData = { end: publicMoveId, brush: brushData, array: pointsToSend }

    oldIds.push(publicMoveId)

    AddUndoItem({
      action: "drewBrushPublic",
      data: { publicMoveId }
    })

    SendToAll(`points&*^${JSON.stringify(sendData)}`)

  }
  pointsMap[publicMoveId] = {
    id: publicMoveId,
    size: get(brush_size_store),
    color: get(active_color_store),
    array: tempPoints
  }
  pointsToSend = []
  publicMoveId = ""
}

export function TransmitUndoOldPoints() {
  const lastPointsId = oldIds.pop()
  SendToAll(`undobrushstroke&*^${JSON.stringify(lastPointsId)}`)
  //   const last = historyOfSentPoints.pop()
  //   if (!last) return
  //   const { start, end } = last

  //   const msg: UndoSendData = {
  //     brush: {
  //       size: get(brush_size_store),
  //       color: get(active_color_store),
  //       type: "erasing"
  //     },
  //     array: undoPoints
  //   }
  //   SendToAll(`undobrushstroke&*^${JSON.stringify(msg)}`)
}

function handleMouseLeave() {
  // console.log("Mouse left while drawing");
  EndBrushStroke();
}


export function DrawBrushStroke(
  context: CanvasRenderingContext2D,
  e: PointerEvent,
): void {
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();

  // Calculate the scaling factors
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Adjust the coordinates based on the scaling factors
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  if (get(drawing_room_id)) {
    if (!transmitting) {
      startTransmitting()
      transmitting = true
    }
  }

  tempPoints.push([x, y, e.pressure]);
  pointsToSend.push([x, y, e.pressure])

  if (!watchingForMouseout) {
    canvas.addEventListener("mouseleave", handleMouseLeave);
    watchingForMouseout = true;
  }

  const eventState = get(event_state_store);

  if (eventState === "drawing") {
    ctx.globalCompositeOperation = "source-over";
  } else if (eventState === "erasing") {
    ctx.globalCompositeOperation = "destination-out";
  }

  const stroke = getStroke(tempPoints, {
    size: get(brush_size_store),
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  const pathData = getSvgPathFromStroke(stroke);
  const canvasPath = new Path2D(pathData);
  color = get(active_color_store);
  if (!color) {
    color = get(theme_store) === "dark" ? "lightgray" : "black";
  }
  paths.push({ color, pathData });
  context.fillStyle = color;
  context.fill(canvasPath);
}

export function EndBrushStroke() {

  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  const eventState = get(event_state_store);
  if (canvas) {
    currentCanvas = canvas.toDataURL();
  }

  //undo items for non-drawing room
  if (!get(drawing_room_id)) {
    if (eventState === "drawing") {
      AddUndoItem({
        action: "drewBrush",
        data: { color, oldRaster },
      });
    } else if (eventState === "erasing") {
      AddUndoItem({
        action: "erased",
        data: { oldRaster },
      });
    }
  }

  if (transmitting) {
    stopTransmitting();
  }

  if (watchingForMouseout) {
    canvas?.removeEventListener("mouseleave", handleMouseLeave);
    watchingForMouseout = false;
  }

  oldRaster = null;
  paths = [];
  tempPoints = []
}

export function DrawOtherPersonsPoints(msg: DrawSendData) {
  const stroke = getStroke(msg.array, {
    size: msg.brush.size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  const pathData = getSvgPathFromStroke(stroke);
  const canvasPath = new Path2D(pathData);
  color = msg.brush.color
  if (!color) {
    color = "rgb(255, 255, 255)"
  }
  paths.push({ color, pathData });

  if (msg.brush.type === "drawing") {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
  } else if (msg.brush.type === "erasing") {
    ctx.globalCompositeOperation = "destination-out";
  }
  ctx.fill(canvasPath);
}

export function GetCurrentCanvas() {
  return currentCanvas;
}

export function ClearCurrentCanvas() {
  currentCanvas = "";
}

export function ClearOldPathData() {
  paths = [];
}

export function GetVectorPaths() {
  return paths;
}

export function RebuildCanvasAfterUndo() {
  console.log("pointsMap length: ", Object.values(pointsMap).length)

  requestAnimationFrame(() => {
    ctx?.clearRect(0, 0, 2000, 3000)
  })


  Object.values(pointsMap).forEach((pointsData: PointsObject) => {


    const stroke = getStroke(pointsData.array, {
      size: pointsData.size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    const pathData = getSvgPathFromStroke(stroke);
    const canvasPath = new Path2D(pathData);

    ctx.fillStyle = pointsData.color;
    requestAnimationFrame(() => {
      ctx.fill(canvasPath);
    })
  })
}