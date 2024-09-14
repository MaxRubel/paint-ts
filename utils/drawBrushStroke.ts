import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { get, writable } from "svelte/store";
import { event_state_store, theme_store } from "../stores/eventState";
import { AddUndoItem } from "../stores/undoStore";
import { brush_size_store } from "../stores/brushStore";
import { active_color_store } from "../stores/paletteStore";
import { drawing_room_id } from "../stores/drawingRoomStore";
import { SendToAll } from "./webRTC/webRTCNegotiate";
import { v4 as uuidv4 } from "uuid";
import type { PointsMap } from "./webRTC/webRTCDataMessages";

type sendArray = [number, number, number][];

export type DrawSendData = {
  end: string | null;
  brush: { size: number; color: string; type: string };
  array: sendArray;
  eventState: "drawing" | "erasing";
};

let ctx: CanvasRenderingContext2D;

let tempPoints: [number, number, number][] = []; //stores the mouse points for one full stroke
let pointsToSend: [number, number, number][] = []; //store the mouse points for rapid/RTC transmission
let paths: { pathData: string; color: string }[] = []; //stores the vector paths and color (Big MB!)

export let pointsMap: PointsMap = {}; //a map of every single stroke key: publicMoveId, value: tempPoints

//transmit
let publicMoveId: string; //provides an ID for each full, single stroke for UNDO purposes
let sendInterval: NodeJS.Timeout | null; //stores the interval id of web rtc send interval
let transmitting: boolean = false;
let watchingForMouseout = false;

let oldRaster: string | null = null; // dataURL for a canvas taken/captured on pointerdown
let currentCanvas: string = ""; //dataURL for a canvas in the most current state

let color = "";

let ogCanvas: string = "";

const DRAW_SEND_INTERVAL = 20; //milliseconds

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

export function DrawImageFromDataURL(dataURL: string) {
  return new Promise((resolve: any, reject) => {
    const img = new Image();

    img.onload = function () {
      requestAnimationFrame(() => {
        const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
        if (!canvas) {
          reject(new Error("Canvas element not found"));
          return;
        }

        canvas.width = img.width;
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

export function ReceiveNewPointsMap(value: PointsMap) {
  pointsMap = value;
}

function startTransmitting() {
  publicMoveId = uuidv4();

  const eventState = get(event_state_store);

  sendInterval = setInterval(() => {
    const brushData = {
      size: get(brush_size_store),
      color: get(active_color_store),
      type: get(event_state_store),
    };
    const sendData: DrawSendData = {
      end: null,
      brush: brushData,
      array: tempPoints,
      eventState: eventState === "drawing" ? "drawing" : "erasing",
    };

    SendToAll(`points&*^${JSON.stringify(sendData)}`);
  }, DRAW_SEND_INTERVAL);
}

function stopTransmitting() {
  transmitting = false;
  if (sendInterval) {
    clearInterval(sendInterval);
  }
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
      startTransmitting();
      transmitting = true;
    }
  }

  tempPoints.push([x, y, e.pressure]);
  pointsToSend.push([x, y, e.pressure]);

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
  // canvas.removeEventListener("mouseleave", handleMouseLeave);

  const eventState = get(event_state_store);

  if (canvas) {
    currentCanvas = canvas.toDataURL();
  }
  if (watchingForMouseout) {
    watchingForMouseout = false;
  }

  if (!get(drawing_room_id)) {
    //not in drawing room:
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
  } else {
    //in drawing room:
    if (transmitting) {
      stopTransmitting();
    }

    const brushData = {
      size: get(brush_size_store),
      color: get(active_color_store),
      type: get(event_state_store),
    };

    const sendData: DrawSendData = {
      end: publicMoveId,
      brush: brushData,
      array: tempPoints,
      eventState: eventState === "drawing" ? "drawing" : "erasing",
    };

    SendToAll(`points&*^${JSON.stringify(sendData)}`);

    AddUndoItem({
      action: "drewBrushPublic",
      data: { publicMoveId, eventState },
    });

    const pointsMap = GetPointsMap();

    pointsMap[publicMoveId] = {
      id: publicMoveId,
      size: get(brush_size_store),
      color: get(active_color_store),
      array: tempPoints,
      eventState: eventState === "drawing" ? "drawing" : "erasing",
    };
    publicMoveId = "";
    SyncPointsMap(pointsMap);
  }

  tempPoints = [];
  pointsToSend = [];
  paths = [];
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
  color = msg.brush.color;
  if (!color) {
    color = "rgb(255, 255, 255)";
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

export async function RebuildCanvasAfterUndo(pointsMap: PointsMap) {
  ctx.clearRect(0, 0, 2000, 3000);

  await DrawImageFromDataURL(ogCanvas);

  Object.values(pointsMap).forEach((object) => {
    const stroke = getStroke(object.array, {
      size: object.size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    const pathData = getSvgPathFromStroke(stroke);
    const canvasPath = new Path2D(pathData);

    if (object.eventState === "drawing") {
      ctx.fillStyle = object.color;
      ctx.fill(canvasPath);
      ``;
    } else if (object.eventState === "erasing") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill(canvasPath);
      ctx.globalCompositeOperation = "source-over";
    }
  });
}

export function SetOgCanvas(value: string) {
  ogCanvas = value;
}

export function ClearOgCanvas() {
  ogCanvas = "";
}

export function GetOgCanvas(): string {
  return ogCanvas;
}

export function GetPointsMap(): PointsMap {
  return pointsMap;
}

export function SyncPointsMap(map: PointsMap) {
  const arrays: any = [];
  Object.values(map).forEach((item) => {
    arrays.push(item.array.length);
  });

  pointsMap = map;
}

export function ClearPointsMap() {
  pointsMap = {};
}
