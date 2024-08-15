import { get, writable } from "svelte/store";
import { textBoxesStore } from "./textBoxStore";
import { authStore } from "../utils/auth/auth_store";
import {CreateNewDoodle, UpdateDoodle} from "../api/doodles"
import { event_state_store } from "./eventState";

export const fetched_doodle = writable({})
export const loaded_data_store = writable({})

export function CompileAndSaveDoodle(name: string, update: boolean){
    const rectangles = get(textBoxesStore)
    const canvas = document.getElementById('main-canvas')
    if(!canvas){
        console.error("Oopsies, canvas was not initialized properly")
        return
    }
    const dataURL = canvas.toDataURL('image/png');
    const canvasImage = dataURL.split(',')[1];
    const data = {canvasImage, rectangles}
    const user_id = get(authStore).user.id

    if(!update){
        CreateNewDoodle({name, user_id, data}).then((resp: any)=>{
            fetched_doodle.set(resp)
            event_state_store.set("alert: Save was sucessful!")
        })
    } else {
        const {id, date_created} = get(fetched_doodle)
        const oldName = get(fetched_doodle).name

        UpdateDoodle({id, name: oldName, user_id, data, date_created}).then((resp: any)=>{
            event_state_store.set("alert: Save was sucessful!")
        })
    }
}