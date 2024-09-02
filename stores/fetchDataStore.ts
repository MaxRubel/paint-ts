import { get, writable } from "svelte/store";
import { clearAllTextBoxes, textBoxesStore } from "./textBoxStore";
import { authStore } from "../utils/auth/auth_store";
import { CreateNewDoodle, GetDoodlesOfUser, GetSingleDoodle, UpdateDoodle } from "../api/doodles"
import { event_state_store, selected_store } from "./eventState";
import { ClearCurrentCanvas, ClearOldPathData, GetCanvasContext } from "../utils/drawBrushStroke";
import { ClearUndoStore, undo_store } from "./undoStore";
import { DrawImage } from "./canvasStore";
import { alert_store } from "./alertStore";

export interface ProjectType {
    name: string
    id: number
    owner: any
    date_created: string
    data: any
    collaborators: any[]
}

interface AllProjects {
    yourDoodles: ProjectType[]
    theirDoodles: ProjectType[]
}

export const EmptyFetch: ProjectType = {
    name: "",
    id: 0,
    owner: {},
    date_created: "",
    data: null,
    collaborators: []
}

export const fetched_single = writable<ProjectType>(EmptyFetch);

export const fetched_all = writable<AllProjects>({ yourDoodles: [], theirDoodles: [] })

export function GetAllUserDoodles() {
    const uid = get(authStore).user.id;
    GetDoodlesOfUser(uid).then((data: any) => {
        fetched_all.set(data)
    });
}

export async function CompileAndSaveDoodle(name: string, update: boolean) {
    const rectangles = get(textBoxesStore)
    const canvas: HTMLCanvasElement = document.getElementById('main-canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Oopsies, canvas was not initialized properly")
        return
    }
    const dataURL = canvas.toDataURL('image/png');
    const canvasImage = dataURL.split(',')[1];
    const data = { canvasImage, rectangles }
    const user_id = get(authStore).user.id

    if (!update) {
        const resp: any = await CreateNewDoodle({ name, user_id, data });
        fetched_single.set(resp);
        alert_store.set("alert: Save was successful!");
    } else {
        const { id, date_created } = get(fetched_single);
        const oldName = get(fetched_single).name;
        await UpdateDoodle({ id, name: oldName, user_id, data, date_created });
        alert_store.set("alert: Save was successful!");
    }

    undo_store.set([]);
}

export function FetchAndLoadDoodle(id: number) {
    const canvas: HTMLCanvasElement = document.getElementById('main-canvas') as HTMLCanvasElement;
    const ctx = GetCanvasContext()
    GetSingleDoodle(id).then((resp: any) => {
        ctx?.clearRect(0, 0, canvas?.width, canvas?.height);

        clearAllTextBoxes();
        ClearOldPathData();
        ClearUndoStore();
        ClearCurrentCanvas();

        const { id, name, date_created, collaborators, data, owner } = resp
        fetched_single.set({ id, name, date_created, collaborators, data, owner })
        textBoxesStore.set(data.rectangles)

        DrawImage();

        event_state_store.set("arrow")
        selected_store.set([])
    })
}

export function SyncDoodle() {
    const doodleId = get(fetched_single).id
    GetSingleDoodle(doodleId).then((data: any) => {
        fetched_single.set(data)
    })
}