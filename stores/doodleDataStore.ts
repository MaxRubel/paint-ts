import { get, writable } from "svelte/store";
import { textBoxesStore } from "./textBoxStore";
import { authStore } from "../utils/auth/auth_store";
import {CreateNewDoodle, UpdateDoodle} from "../api/doodles"
import { event_state_store } from "./eventState";

export const doodle_info = writable({})
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
            doodle_info.set(resp)
            event_state_store.set("alert: Save was sucessful!")
        })
    } else {
        const {id, date_created} = get(doodle_info)
        const oldName = get(doodle_info).name

        UpdateDoodle({id, name: oldName, user_id, data, date_created}).then((resp: any)=>{
            console.log('save success', get(doodle_info))
            event_state_store.set("alert: Save was sucessful!")
        })
    }
}