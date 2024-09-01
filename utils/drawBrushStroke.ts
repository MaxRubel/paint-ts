import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { get } from "svelte/store";
import { event_state_store, theme_store } from "../stores/eventState";
import { AddUndoItem } from "../stores/undoStore";
import { brush_size_store } from "../stores/brushStore";
import { active_color_store } from "../stores/paletteStore";
import { drawing_room_id } from "../stores/drawingRoomStore";
import { SendToAll } from "./webRTC/webRTCNegotiate";
import { v4 as uuidv4 } from "uuid";
import type { PointsMap, PointsObject } from "./webRTC/webRTCDataMessages";

type sendArray = [number, number, number][]

export type DrawSendData = { end: string | null, brush: { size: number, color: string, type: string }, array: sendArray }

let ctx: CanvasRenderingContext2D;

let tempPoints: [number, number, number][] = []; //stores the mouse points for one full stroke
let pointsToSend: [number, number, number][] = []; //store the mouse points for rapid/RTC transmission
let paths: { pathData: string; color: string }[] = []; //stores the vector paths and color (Big MB!)
export let pointsMap: PointsMap = {} //a map of every single stroke key: publicMoveId, value: tempPoints


//transmit
let publicMoveId: string //provides an ID for each full, single stroke for UNDO purposes
let sendInterval: NodeJS.Timeout | null //stores the interval id of web rtc send interval
let transmitting: boolean = false
let watchingForMouseout = false

let oldRaster: string | null = null; // dataURL for a canvas taken/captured on pointerdown
let currentCanvas: string = ""; //dataURL for a canvas in the most current state 

let color = "";

const DRAW_SEND_INTERVAL = 20 //milliseconds

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

  console.log('saving raster')

  //@ts-ignore
  oldRaster = canvas.toDataURL("image/png");
}

export function ReceiveNewPointsMap(value: PointsMap) {
  pointsMap = value
}

let mouseHasLeftCanvas = false

function startTransmitting() {
  publicMoveId = uuidv4()
  sendInterval = setInterval(() => {
    const brushData = {
      size: get(brush_size_store),
      color: get(active_color_store),
      type: get(event_state_store)
    }
    const sendData: DrawSendData = {
      end: null,
      brush: brushData,
      array: pointsToSend
    }

    SendToAll(`points&*^${JSON.stringify(sendData)}`)
  }, DRAW_SEND_INTERVAL)

}

function stopTransmitting() {
  transmitting = false
  if (sendInterval) {
    clearInterval(sendInterval)
  }
}

function handleMouseLeave() {
  mouseHasLeftCanvas = true
  EndBrushStroke();
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
  canvas.addEventListener("mouseenter", handleMouseEnter);
}

function handleMouseEnter() {
  mouseHasLeftCanvas = false
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
  canvas.removeEventListener("mouseenter", handleMouseEnter);
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

  const eventState = get(event_state_store);

  if (eventState === "drawing") {
    ctx.globalCompositeOperation = "source-over";
  } else if (eventState === "erasing") {
    ctx.globalCompositeOperation = "destination-out";
  }


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

  const stroke = getStroke(tempPoints, {
    size: get(brush_size_store),
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  const pathData = getSvgPathFromStroke(stroke);
  const canvasPath = new Path2D(pathData);
  context.fill(canvasPath);

  color = get(active_color_store);
  context.fillStyle = color;

  paths.push({ color, pathData });

}

export function EndBrushStroke() {
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  canvas.removeEventListener("mouseleave", handleMouseLeave);

  const eventState = get(event_state_store);

  if (canvas) { currentCanvas = canvas.toDataURL(); }
  if (watchingForMouseout) { watchingForMouseout = false; }

  //undo items for non-drawing room
  if (!get(drawing_room_id)) {
    if (eventState === "drawing") {
      console.log('adding undo item')
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
    tempPoints = []
  } else {
    if (transmitting) {
      stopTransmitting();
    }

    const brushData = {
      size: get(brush_size_store),
      color: get(active_color_store),
      type: get(event_state_store)
    }

    if (!mouseHasLeftCanvas) {
      const sendData: DrawSendData = {
        end: publicMoveId,
        brush: brushData,
        array: pointsToSend
      }

      SendToAll(`points&*^${JSON.stringify(sendData)}`)

      AddUndoItem({
        action: "drewBrushPublic",
        data: { publicMoveId }
      })

      pointsMap[publicMoveId] = {
        id: publicMoveId, //important: end id only gets sent if mouse is on canvas
        size: get(brush_size_store),
        color: get(active_color_store),
        array: tempPoints
      }
      tempPoints = []
      publicMoveId = ""
    } else { //mouse is not on cavas
      const sendData: DrawSendData = {
        end: null,
        brush: brushData,
        array: pointsToSend
      }
      SendToAll(`points&*^${JSON.stringify(sendData)}`)
    }
  }

  pointsToSend = []
  paths = [];
  oldRaster = null;
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

  ctx.clearRect(0, 0, 2000, 3000)

  Object.values(pointsMap).forEach((object: PointsObject) => {
    const stroke = getStroke(object.array, {
      size: object.size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    const pathData = getSvgPathFromStroke(stroke);
    const canvasPath = new Path2D(pathData);

    ctx.fillStyle = object.color;
    ctx.fill(canvasPath);
  })
}