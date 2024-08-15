import { get, writable } from "svelte/store";
import { clearAllTextBoxes, textBoxesStore } from "./textBoxStore";
import { authStore } from "../utils/auth/auth_store";
import { CreateNewDoodle, GetDoodlesOfUser, GetSingleDoodle, UpdateDoodle } from "../api/doodles"
import { event_state_store, selected_store } from "./eventState";
import { ClearOldPathData, GetCanvasContext } from "../utils/drawBrushStroke";
import { ClearUndoStore } from "./undoStore";
import { DrawImage } from "./canvasStore";


export const fetched_single = writable({collaborators: []})
export const fetched_all = writable({yourDoodles: [], theirDoodles: []})

export const loaded_data_store = writable({})

export function GetAllUserDoodles(){
    const uid = get(authStore).user.id;
    GetDoodlesOfUser(uid).then((data: any) => {
    console.log(data)
     fetched_all.set(data)
    });
}

export function CompileAndSaveDoodle(name: string, update: boolean) {
    const rectangles = get(textBoxesStore)
    const canvas = document.getElementById('main-canvas')
    if (!canvas) {
        console.error("Oopsies, canvas was not initialized properly")
        return
    }
    const dataURL = canvas.toDataURL('image/png');
    const canvasImage = dataURL.split(',')[1];
    const data = { canvasImage, rectangles }
    const user_id = get(authStore).user.id

    if (!update) {
        CreateNewDoodle({ name, user_id, data }).then((resp: any) => {
            fetched_single.set(resp)
            event_state_store.set("alert: Save was sucessful!")
        })
    } else {
        const { id, date_created } = get(fetched_single)
        const oldName = get(fetched_single).name

        UpdateDoodle({ id, name: oldName, user_id, data, date_created }).then((resp: any) => {
            event_state_store.set("alert: Save was sucessful!")
        })
    }
}

export function FetchAndLoadDoodle(id: number) {

    const canvas = document.getElementById("main-canvas")
    const ctx = GetCanvasContext()
    GetSingleDoodle(id).then((resp) => {
        ctx?.clearRect(0, 0, canvas?.width, canvas?.height);
        clearAllTextBoxes();
        ClearOldPathData();
        ClearUndoStore();
        const { id, name, date_created, collaborators, data } = resp
        fetched_single.set({ id, name, date_created, collaborators, data })
        textBoxesStore.set(data.rectangles)
        DrawImage();
        event_state_store.set("arrow")
        selected_store.set([])
    })
}