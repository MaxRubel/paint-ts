<script lang="ts">
  import { event_state_store, selected_store } from "../../../stores/eventState";
  import {
    ChangeTextFont,
    font_family_store,
    font_size_store,
    text_alignment,
    textBoxesStore,
    updateTextBox,
  } from "../../../stores/textBoxStore";
  import TextLeft from "../../graphics/TextLeft.svelte";
  import TextCenter from "../../graphics/TextCenter.svelte";
  import TextRight from "../../graphics/TextRight.svelte";
  import { get } from "svelte/store";
  import { AddUndoItem } from "../../../stores/undoStore";
  import ColorPickerInSettings from "./ColorPickerInSettings.svelte";
  import PaletteInSettings from "./PaletteInSettings.svelte";
  import { authStore } from "../../../utils/auth/auth_store";
  import { side_bar_hidden_store } from "../../../stores/userPrefsStore";
  import SideBarCollapseButton from "./SideBarCollapseButton.svelte";

  let isVisible = false;
  let eventState: string;
  let fontSize: number = 22;
  let textAlignment: string;
  let fontFamily = "";
  let auth: any;
  let sidebarHidden: boolean;

  $: eventState = $event_state_store;
  $: fontSize = $font_size_store;
  $: textAlignment = $text_alignment;
  $: fontFamily = $font_family_store;
  $: auth = $authStore.user;
  $: sidebarHidden = $side_bar_hidden_store;

  function handleFontChange(e: any) {
    ChangeTextFont(e.target.value);
  }

  function handleAlignment(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const id = target.id;
    text_alignment.set(id);
    const eventState = get(event_state_store);

    if (eventState.includes("typing")) {
      const [, textboxid] = eventState.split("&");
      const oldAlign = get(textBoxesStore)[textboxid].align;
      updateTextBox(textboxid, { align: id });
      if (oldAlign !== id)
        AddUndoItem({
          action: "textBoxAligned",
          data: { id: textboxid, align: oldAlign },
        });
      document.getElementById(`textbox&${textboxid}`)?.focus();
    }

    if (eventState === "selected") {
      const selectedArray = get(selected_store);
      const data: any[] = [];
      selectedArray.forEach((item) => {
        const [, textboxid] = item.id.split("&");
        const oldAlign = get(textBoxesStore)[textboxid].align;
        data.push({ id: textboxid, align: oldAlign });
        updateTextBox(textboxid, { align: id });
      });
      AddUndoItem({ action: "manyTextBoxAligned", data });
    }
  }

  let oldFontSize = 24;
  function handleSizeChange(
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
    const target = e.currentTarget;
    const value = Number(target.value);

    if (value < 8) return;
    font_size_store.set(value);

    if (eventState.includes("typing")) {
      const [, id] = eventState.split("&");
      updateTextBox(id, { fontSize: value });
      AddUndoItem({
        action: "changedFontSizes",
        data: [{ id, oldFontSize }],
      });
    }

    if (eventState === "selected") {
      const data: any[] = [];
      get(selected_store).forEach((item) => {
        const [, id] = item.id.split("&");
        updateTextBox(id, { fontSize: value });
        data.push({ id, oldFontSize });
      });
      AddUndoItem({ action: "changedFontSizes", data });
    }
    oldFontSize = value;
  }

  $: {
    if (
      eventState.includes("creating_text") ||
      eventState.includes("typing") ||
      eventState === "selected"
    ) {
      isVisible = true;
    } else {
      isVisible = false;
    }
  }

  let left: number;
  $: {
    if (sidebarHidden) {
      left = -254;
    } else {
      left = 15;
    }
  }
</script>

<div class="text-settings" class:isVisible style="left: {left}px;">
  <SideBarCollapseButton {sidebarHidden} />
  <div class="content-wrapper">
    <div class="font-container centered">
      Font
      <select class="font-box" id="" value={fontFamily} on:change={handleFontChange}>
        <option class="font-box" value="Arial">Arial</option>
        <option class="font-box" value="Patrick Hand">Patrick Hand</option>
        <option class="font-box" value="Times New Roman">Times New Roman</option>
      </select>
    </div>
    <div class="size-container centered">
      <div>Size</div>
      <div>
        <input
          type="number"
          id="font-size-input-box"
          class="font-box size-box"
          on:input={handleSizeChange}
          value={fontSize}
          style="width: 50px; height: 24px; padding: 8px"
        />
      </div>
    </div>
    <div class="align-box centered" style="margin-top: 10px;">
      Align
      <div class="text-position">
        <button
          id="left"
          class="a-button"
          style={textAlignment === "left" ? "color: white;" : undefined}
          on:click={handleAlignment}
        >
          <TextLeft />
        </button>
        <button
          id="center"
          class="a-button"
          style={textAlignment === "center" ? "color: white;" : undefined}
          on:click={handleAlignment}><TextCenter /></button
        >
        <button
          id="right"
          class="a-button"
          style={textAlignment === "right" ? "color: white;" : undefined}
          on:click={handleAlignment}><TextRight /></button
        >
      </div>
    </div>
    <ColorPickerInSettings location={"text-color-picker"} width={100} />
    <PaletteInSettings />
  </div>
</div>

<style>
  .text-settings {
    position: fixed;
    color: white;
    border-radius: 20px;
    height: 640px;
    background-color: rgb(25, 29, 31);
    padding: 20px;
    top: 70px;
    display: none;
    flex-direction: column;
    border: 2px solid rgba(255, 255, 255, 0.198);
    width: 208px;
    transition: all 0.8s ease;
  }

  .font-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .font-box {
    padding: 5px;
    padding-top: 3px;
    border-radius: 5px;
    background-color: white;
    color: black;
    border: 1px solid rgb(255, 255, 255);
    outline: none;
    height: 36px;
    width: 145px;
  }

  .font-box option {
    background-color: transparent;
  }

  select option {
    background-color: transparent;
    color: black;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: transparent;
    /* Other styles... */
  }

  .size-box {
    width: 50px;
  }

  .isVisible {
    display: flex;
  }

  .align-box {
    flex-direction: column;
    border-bottom: 2px solid rgba(255, 255, 255, 0.198);
    padding-bottom: 15px;
  }

  .a-button {
    width: 50px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    background-color: transparent;
    color: rgb(255, 255, 255);
    border: 1px solid white;
  }

  .text-position {
    margin-top: 5px;
    display: flex;
    gap: 10px;
  }

  .size-container {
    flex-direction: row;
    margin-top: 10px;
    gap: 40px;
    justify-content: space-between;
    border-bottom: 2px solid rgba(255, 255, 255, 0.198);
    padding-bottom: 15px;
  }
</style>
