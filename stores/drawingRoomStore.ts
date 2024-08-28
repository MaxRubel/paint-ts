import { get, writable } from "svelte/store";
import { fetched_single, type ProjectType } from "./fetchDataStore";
import type { RedoType, UndoType } from "../utils/types/app_types";
import { textBoxesStore } from "./textBoxStore";
import { undo_store } from "./undoStore";
import { redo_store } from "./redoStore";
import { ClearCurrentCanvas, GetCanvasContext } from "../utils/drawBrushStroke";

interface undosType {
  undos: UndoType[];
  redos: RedoType[];
}

export interface DataTransitionType {
  drawingData: ProjectType;
  undos: undosType;
}

export const drawing_room_store = writable(false);
export const drawing_room_id = writable("");
export const data_transition = writable(<DataTransitionType>{});
export const i_am_hosting = writable(false);
export const myPublicId = writable("");
export const i_have_joined = writable(false)

export function TransitionToDrawingRoom() {
  const canvas: HTMLCanvasElement = document.getElementById(
    "main-canvas",
  ) as HTMLCanvasElement;
  if (!canvas) {
    console.error("Oopsies, canvas was not initialized properly");
    return;
  }
  ClearCurrentCanvas();
  const dataURL = canvas.toDataURL("image/png");
  const canvasImage = dataURL.split(",")[1];
  const rectangles = get(textBoxesStore);
  const doodleFetched = get(fetched_single);

  let drawingData = {
    name: "",
    owner: {},
    id: 0,
    date_created: "",
    collaborators: [],
    data: {},
  };

  drawingData.data = { canvasImage, rectangles };

  if (doodleFetched.id) {
    drawingData.name = doodleFetched.name;
    drawingData.id = doodleFetched.id;
    //@ts-ignore
    drawingData.collaborators = doodleFetched.collaborators;
    drawingData.date_created = doodleFetched.date_created;
  }

  const undos = { undos: get(undo_store), redos: get(redo_store) };

  data_transition.set({ drawingData, undos });
}

export function UnpackTransition() {
  const { drawingData, undos } = get(data_transition);
  const { collaborators, data, date_created, id, name, owner } = drawingData;
  undo_store.set(undos.undos);
  //@ts-ignore
  redo_store.set(undos.redos);

  if (id) {
    fetched_single.set({
      id,
      name,
      owner,
      collaborators,
      date_created,
      data: {
        rectangles: {},
        canvasImage: "",
      },
    });
  }
  fetched_single.update((preVal) => ({
    ...preVal,
    data: { rectangles: data.rectangles, canvasImage: data.canvasImage },
  }));

  const dataURL = "data:image/png;base64," + data.canvasImage;

  textBoxesStore.set(data.rectangles);
  const img = new Image();

  img.onload = function () {
    setTimeout(() => {
      const ctx = GetCanvasContext();
      if (!ctx) {
        console.error(
          "Oopsies-error transitioning to drawing room.  Canvas Context was not initialized when the canvas image attempted to load",
        );
        return;
      }
      requestAnimationFrame(() => {
        ctx.drawImage(img, 0, 0);
      });
    }, 1);
  };

  //@ts-ignore
  img.src = dataURL;
}
