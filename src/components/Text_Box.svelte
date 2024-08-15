<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    event_state_store,
    locked_store,
    selected_store,
    theme_store,
  } from "../../stores/eventState";
  import { createEventDispatcher } from "svelte";
  import { font_family_store, font_size_store, text_alignment } from "../../stores/textBoxStore";
  import type { TextBoxType } from "../../utils/types/app_types";
  import { StartDragMany, DragMany, EndDragMany } from "../../utils/dragMultiple";
  import { AddUndoItem } from "../../stores/undoStore";
  import { updateTextBox } from "../../stores/textBoxStore";
  import { color_store } from "../../stores/colorStore";
  export let data: TextBoxType;

  let { id } = data;
  $: x = data.x;
  $: y = data.y;
  $: height = data.height;
  $: width = data.width;
  $: align = data.align;
  $: fontColor = data.fontColor;
  $: fontFamily = data.fontFamily;
  $: fontSize = data.fontSize;

  let textareaElement: HTMLTextAreaElement;
  let isDragging = false;
  let dragOffsetX: number = 0;
  let dragOffsetY: number = 0;
  let eventState: string = "";
  let typing = true;
  let theme = "dark";
  let cursorStyle = "";
  let hidden: boolean = true;
  let expand = "";
  let locked: boolean;
  let textContainer: HTMLElement;
  let selected: HTMLTextAreaElement[] = [];
  let iAmSelected = false;
  let typeStart = "";

  const unsubcribe = theme_store.subscribe((value: string) => {
    theme = value;
  });

  const unsubcribe2 = event_state_store.subscribe((value: string) => {
    eventState = value;
  });

  const unsubscribe3 = locked_store.subscribe((value: boolean) => {
    locked = value;
  });

  const unsubscribe4 = selected_store.subscribe((value) => {
    selected = value;
    if (selected.some((item) => item?.id === `textbox&${id}`)) {
      iAmSelected = true;
      font_size_store.set(fontSize);
      text_alignment.set(align);
      font_family_store.set(fontFamily);
      if (selected.length > 0) {
        hidden = false;
      }
    } else {
      iAmSelected = false;
      hidden = true;
    }
  });

  const unsubscribe5 = color_store.subscribe((value) => {
    if (!value) return;
    if (eventState.includes("typing")) {
      const [, boxId] = eventState.split("&");
      if (value !== fontColor && boxId === id) {
        console.log("hello");
        AddUndoItem({
          action: "changedFontColor",
          data: { id, oldColor: fontColor },
        });
        fontColor = value;
        updateTextBox(id, { fontColor: value });
      }
    }
  });

  const dispatch = createEventDispatcher();

  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
  });

  function handleChange(e: Event): void {
    const target = e.target as HTMLTextAreaElement;

    if (target) {
      const value = target.value;
      updateTextBox(id, { ...data, text: value });
      event_state_store.set(`typing&${id}`);
    } else {
      console.error("Event target is not an HTMLTextAreaElement");
    }
    checkOverflow();
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaElement.blur();
      event_state_store.set("arrow");
      selected_store.set([]);
    }
  }
  let oldX = 0;
  let oldY = 0;
  //---------Drag and Drop---------------------------
  function handleMouseDown(event: MouseEvent): void {
    if (eventState === "selected" && selected.length === 1) {
      selected_store.set([textareaElement]);
    }
    if (eventState === "selected" && selected.length > 1 && !iAmSelected) {
      selected_store.set([textareaElement]);
    }
    if (eventState === "arrow") {
      event_state_store.set("selected");
      selected_store.set([textareaElement]);
    }
    if (eventState.includes("typing")) {
      textareaElement.focus();
    }
    if (!typing) {
      event.preventDefault();
      oldX = x;
      oldY = y;
      isDragging = true;
      dragOffsetX = event.clientX - x;
      dragOffsetY = event.clientY - y;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    if (isDragging) {
      textareaElement.blur();
    }
    if (eventState === "selected" && iAmSelected) {
      StartDragMany(event);
      isDragging = true;
    }
  }

  function handleMouseMove(event: MouseEvent): void {
    if (!isDragging) return;
    if (eventState === "selected" && selected.length > 1) {
      DragMany(event);
      return;
    }

    if (locked) {
      x = Math.round((event.clientX - dragOffsetX) / 20) * 20;
      y = Math.round((event.clientY - dragOffsetY) / 20) * 20;
    } else {
      x = event.clientX - dragOffsetX;
      y = event.clientY - dragOffsetY;
    }
    updateTextBox(id, { x, y });
  }

  function handleMouseUp(event: MouseEvent): void {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (oldX !== x || oldY !== y) {
        if (selected.length === 1) {
          AddUndoItem({
            action: "draggedSingle",
            data: { id, x: oldX, y: oldY },
          });
        } else if (selected.length > 1) {
          EndDragMany();
        }
      }
    }
  }

  function handleBlur() {
    // textareaElement?.setSelectionRange(
    //   textareaElement.selectionStart,
    //   textareaElement.selectionStart,
    // );
    // if (eventState.includes("typing")) {
    //   if (oldValue !== textareaElement.value) {
    //     AddUndoItem({
    //       action: "typed",
    //       data: {
    //         id,
    //         start: oldValue ? oldValue : "",
    //       },
    //     });
    //   }
    // }
    // if (eventState === "selecting") {
    //   hidden = true;
    // }
    // if (
    //   eventState !== "creating_text" &&
    //   eventState !== "selecting" &&
    //   eventState !== "selected"
    // ) {
    //   if (!eventState.includes("expanding")) {
    //     selected_store.set([textareaElement]);
    //   }
    // }
    // if (textareaElement?.value === "") {
    //   //auto remove empty text boxes
    //   deleteTextBox(id);
    // }
    // checkOverflow();
    updateTextBox(id, { x, y, height, width });
  }

  function handleSingleClick() {
    if (eventState === "arrow") {
      selected_store.set([textareaElement]);
    }

    event_state_store.set("selected");
    textareaElement.focus();
  }

  function handleDoubeClick() {
    event_state_store.set(`typing&${id}`);
    textareaElement.focus();
  }

  function focusAndSelectAll(node: HTMLTextAreaElement) {
    node.focus();
    node.setSelectionRange(0, 0);
  }

  let oldValue = "";
  function handleFocus() {
    dispatch("select", `textbox&${id}`);
    hidden = false;
    oldValue = textareaElement?.value;
  }

  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startMouseX = 0;
  let startMouseY = 0;
  let expanding = false;
  let tooSmol = false;

  function checkOverflow() {
    if (textContainer && textareaElement) {
      //auto horizontal expand
      if (
        typing &&
        textareaElement.scrollHeight > textareaElement.clientHeight &&
        width < window.innerWidth * 0.5
      ) {
        width = width + 50;
        updateTextBox(id, { x, y, width, height });
        return;
      }
      //vertical expand
      if (textareaElement.scrollHeight > textareaElement.clientHeight) {
        if (expanding) {
          tooSmol = true;
          return;
        } else {
          height = textareaElement.scrollHeight + 20;
          updateTextBox(id, { ...data, x, y, width, height });
          tooSmol = false;
          return;
        }
      } else {
        tooSmol = false;
      }
    }
  }

  let oldState = "";
  function handleExpandStart(e: MouseEvent): void {
    selected_store.set([textareaElement]);
    oldState = eventState;
    typing = false;
    const target = e.target as HTMLElement;
    expand = target.id;
    expanding = true;
    startX = x;
    startY = y;
    startWidth = width;
    startHeight = height;
    startMouseX = e.clientX;
    startMouseY = e.clientY;

    document.addEventListener("mousemove", handleExpanding);
    document.addEventListener("mouseup", stopExpanding);

    switch (expand) {
      case "top-left":
        event_state_store.set("expanding-nw");
        break;
      case "top-right":
        event_state_store.set("expanding-ne");
        break;
      case "bottom-left":
        event_state_store.set("expanding-sw");
        break;
      case "bottom-right":
        event_state_store.set("expanding-se");
        break;
      case "left":
        event_state_store.set("expanding-w");
        break;
      case "right":
        event_state_store.set("expanding-e");
        break;
      case "top-center":
        event_state_store.set("expanding-n");
        break;
      case "bottom-center":
        event_state_store.set("expanding-s");
        break;
    }
  }

  function handleExpanding(e: MouseEvent): void {
    if (!expanding) return;

    const dx = e.clientX - startMouseX;
    const dy = e.clientY - startMouseY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startX;
    let newY = startY;

    switch (expand) {
      case "top-left":
        newWidth = Math.max(startWidth - dx, 100);
        newHeight = Math.max(startHeight - dy, 44);
        newX = startX + (startWidth - newWidth);
        newY = startY + (startHeight - newHeight);
        break;
      case "top-right":
        newWidth = Math.max(startWidth + dx, 100);
        newHeight = Math.max(startHeight - dy, 44);
        newY = startY + (startHeight - newHeight);
        break;
      case "bottom-left":
        newWidth = Math.max(startWidth - dx, 100);
        newHeight = Math.max(startHeight + dy, 44);
        newX = startX + (startWidth - newWidth);
        break;
      case "bottom-right":
        newWidth = Math.max(startWidth + dx, 100);
        newHeight = Math.max(startHeight + dy, 44);
        break;
      case "left":
        newWidth = Math.max(startWidth - dx, 100);
        newX = startX + (startWidth - newWidth);
        break;
      case "right":
        newWidth = Math.max(startWidth + dx, 100);
        break;
      case "top-center":
        newHeight = Math.max(startHeight - dy, 44);
        newY = startY + (startHeight - newHeight);
        break;
      case "bottom-center":
        newHeight = Math.max(startHeight + dy, 44);
        break;
    }

    if (locked) {
      x = Math.round(newX / 20) * 20;
      y = Math.round(newY / 20) * 20;
      width = Math.round(newWidth / 20) * 20;
      height = Math.round(newHeight / 20) * 20;
    } else {
      x = newX;
      y = newY;
      width = newWidth;
      height = newHeight;
    }
    checkOverflow();
  }

  function stopExpanding(): void {
    if (oldState.includes("typing")) {
      event_state_store.set("arrow");
    } else {
      event_state_store.set(oldState);
    }
    if (startX !== x || startY !== y || startHeight !== height || startWidth !== width) {
      AddUndoItem({
        action: "expanded",
        data: {
          id,
          x: startX,
          y: startY,
          width: startWidth,
          height: startHeight,
        },
      });
    }

    expanding = false;
    isDragging = false;
    document.removeEventListener("mousemove", handleExpanding);
    document.removeEventListener("mouseup", stopExpanding);
    updateTextBox(id, { height, width, x, y });
    checkOverflow();
  }

  function handleMouseEnter(): void {
    hidden = false;
    if (eventState.includes("typing")) {
      if (iAmSelected) {
        cursorStyle = "text";
      } else {
        cursorStyle = "grab";
      }
    }
  }

  function handleMoueLeave(): void {
    if (eventState === "selected") {
      if (iAmSelected) {
        hidden = false;
        return;
      }
    }
    if (!expanding && !iAmSelected) {
      hidden = true;
    }
    if (eventState.includes("typing")) {
      cursorStyle = "default";
    }
  }

  $: {
    //handle cursor:
    if (eventState.includes("typing")) {
      const [_, eventId] = eventState.split("&");
      if (eventId === id) {
        cursorStyle = "text";
      }
    } else if (eventState === "selecting") {
      cursorStyle = "default";
    } else if (!eventState.includes("expanding")) {
      cursorStyle = "grab";
    }
  }

  $: {
    //handle theme
    if (!fontColor) {
      if (theme === "dark") {
        fontColor = "lightgray";
      } else {
        fontColor = "black";
      }
    }
  }

  $: {
    if (eventState === "creating_text") {
      hidden = true;
    }
  }

  $: {
    //turn on typing mode
    if (eventState.includes("typing")) {
      const [_, eventId] = eventState.split("&");
      if (eventId === id) {
        typing = true;
        typeStart = textareaElement?.value;
      }
    } else {
      typing = false;
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="text-container"
  bind:this={textContainer}
  style="
  top: {y}px; 
  left: {x}px; 
  cursor: {cursorStyle}; 
  height: {height}px; 
  width: {width}px;
  border-radius: 10px;
  border: 3px solid {fontColor};
  "
  class:non-selectable={!typing}
  class:no-select={!typing}
  class:no-pointer={eventState === "selecting" ||
    eventState === "drawing" ||
    eventState === "creating_text" ||
    eventState.includes("expanding")}
  class:iAmSelected
  on:focus={() => {
    hidden = false;
  }}
  on:blur={() => {
    hidden = true;
  }}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMoueLeave}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="top-left" class:hidden on:mousedown={handleExpandStart}></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="top-center" class:hidden on:mousedown={handleExpandStart}></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="top-right" class:hidden on:mousedown={handleExpandStart}></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="left" class:hidden on:mousedown={handleExpandStart}></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="right" class:hidden on:mousedown={handleExpandStart}></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="bottom-left" class:hidden on:mousedown={handleExpandStart}></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="bottom-center" class:hidden on:mousedown={handleExpandStart}></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="bottom-right" class:hidden on:mousedown={handleExpandStart}></div>
  {#if tooSmol}
    <div class="too-smol" style="height: {height}px; width: {width}px"></div>
  {/if}
  <textarea
    bind:this={textareaElement}
    class="text-box"
    class:non-selectable={true}
    class:no-select={true}
    class:active-background={expanding}
    style="
      cursor: {cursorStyle};
      color: {fontColor};
      text-align: {align};
      font-family: {fontFamily};
      font-size: {fontSize}px;
    "
    id="textbox&{id}"
    on:input={handleChange}
    on:click={handleSingleClick}
    on:keydown={handleKeydown}
    on:mousedown={handleMouseDown}
    on:dblclick={handleDoubeClick}
    on:blur={handleBlur}
    on:focus={handleFocus}
    use:focusAndSelectAll
    readonly={!typing}>{data.text}</textarea
  >
</div>

<style>
  textarea {
    /* background-color: transparent; */
    resize: both;
    background-color: rgb(113, 113, 113);
    overflow: hidden;
  }

  .hidden {
    display: none;
  }

  .text-container {
    position: absolute;
    background-color: transparent;
    /* overflow: hidden; */
    box-sizing: border-box;
    z-index: 100;
  }

  .too-smol {
    background-color: rgba(231, 194, 192, 0);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 500;
  }

  .text-box {
    position: relative;
    display: flex;
    background-color: transparent;
    height: 100%;
    width: 100%;
    border: none;
    color: lightgray;
    font-size: 18pt;
    z-index: 100;
    transition: box-shadow 0.3s ease;
    text-align: center;
    padding: 20px 10px 10px;
    box-sizing: border-box;
    resize: none;
  }

  #top-left {
    position: absolute;
    height: 12px;
    width: 12px;
    z-index: 1000;
    top: -8px;
    left: -6px;
    cursor: nwse-resize;
    background-color: rgb(113, 113, 113);
  }

  #left {
    position: absolute;
    height: 12px;
    width: 12px;
    z-index: 1000;
    top: 50%;
    transform: translateY(-50%);
    left: -8px;
    cursor: ew-resize;
    background-color: rgb(113, 113, 113);
  }

  #right {
    position: absolute;
    height: 12px;
    width: 12px;
    z-index: 1000;
    top: 50%;
    transform: translateY(-50%);
    right: -8px;
    cursor: ew-resize;
    background-color: rgb(113, 113, 113);
  }

  .iAmSelected {
    background-color: rgba(43, 43, 43, 0.636);
  }

  #top-center {
    position: absolute;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  #top-right {
    position: absolute;
    top: -8px;
    right: -6px;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    cursor: nesw-resize;
  }

  #bottom-left {
    position: absolute;
    bottom: -8px;
    left: -6px;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    cursor: nesw-resize;
  }

  #bottom-center {
    position: absolute;
    bottom: -8px;
    left: 50%;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  #bottom-right {
    position: absolute;
    bottom: -8px;
    right: -6px;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    cursor: nwse-resize;
  }

  .text-box:hover {
    background-color: rgba(43, 43, 43, 0.636);
  }

  .active-background {
    background-color: rgba(43, 43, 43, 0.636);
  }

  .text-box:focus,
  .text-box:active {
    outline: none;
  }

  .non-selectable {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .no-pointer {
    pointer-events: none;
  }
</style>
