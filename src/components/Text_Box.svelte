<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    event_state_store,
    locked_store,
    theme_store,
  } from "../../stores/eventState";
  import { createEventDispatcher } from "svelte";
  import { deleteTextBox } from "../../stores/migmaStore";
  import type { TextBoxType } from "../../utils/types/app_types";
  import { get } from "svelte/store";

  export let data: TextBoxType;
  export let updateTextBox: any;

  let { x, y, height, width, id } = data;
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

  const unsubcribe = theme_store.subscribe((value: string) => {
    theme = value;
  });

  const unsubcribe2 = event_state_store.subscribe((value: string) => {
    eventState = value;
  });

  const unsubscribe3 = locked_store.subscribe((value: boolean) => {
    locked = value;
  });

  $: {
    if (eventState.includes("typing")) {
      const [_, eventId] = eventState.split("&");
      if (eventId === id) {
        typing = true;
      }
    } else {
      typing = false;
    }
  }

  const dispatch = createEventDispatcher();

  onMount(() => {
    event_state_store.set(`typing&${id}`);
  });

  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubscribe3();
  });

  function handleInput(e: Event): void {
    const target = e.target as HTMLTextAreaElement;

    if (target) {
      const value = target.value;
      updateTextBox(id, { ...data, text: value });
      event_state_store.set(`typing&${id}`);
    } else {
      console.error("Event target is not an HTMLTextAreaElement");
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaElement.blur();
    }
  }

  //---------Drag and Drop---------------------------
  function handleMouseDown(event: MouseEvent): void {
    if (!typing) {
      event.preventDefault();
      isDragging = true;
      dragOffsetX = event.clientX - x;
      dragOffsetY = event.clientY - y;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    if (isDragging) {
      textareaElement.blur();
    }
  }

  function handleMouseMove(event: MouseEvent): void {
    if (!isDragging) return;

    if (locked) {
      x = Math.round((event.clientX - dragOffsetX) / 20) * 20;
      y = Math.round((event.clientY - dragOffsetY) / 20) * 20;
    } else {
      x = event.clientX - dragOffsetX;
      y = event.clientY - dragOffsetY;
    }
    updateTextBox(id, { ...data, x, y });
  }

  function handleMouseUp(event: MouseEvent): void {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  }

  function handleBlur() {
    if (get(event_state_store) !== "createTextBox") {
      event_state_store.set("arrow");
    }
    dispatch("select", null);
    if (textareaElement.value === "") {
      deleteTextBox(id);
    }
    textareaElement.setSelectionRange(
      textareaElement.selectionStart,
      textareaElement.selectionStart,
    );
  }

  function handleSingleClick() {
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

  function handleFocus() {
    dispatch("select", `textbox&${id}`);
  }
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startMouseX = 0;
  let startMouseY = 0;
  let expanding = false;

  function handleExpandStart(e: MouseEvent): void {
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
  }

  function handleExpanding(e: MouseEvent): void {
    if (!expanding) return;
    event_state_store.set("arrow");
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

    updateTextBox(id, { ...data, x, y, width, height });
  }

  function stopExpanding(): void {
    expanding = false;
    isDragging = false;
    document.removeEventListener("mousemove", handleExpanding);
    document.removeEventListener("mouseup", stopExpanding);
  }

  function handleHidden(): void {}

  $: {
    if (eventState.includes("typing")) {
      const [_, eventId] = eventState.split("&");
      if (eventId === id) {
        cursorStyle = "text";
      }
    } else {
      cursorStyle = "grab";
    }
  }

  let fontColor: string = "";

  $: {
    if (theme === "dark") {
      fontColor = "lightgray";
    } else {
      fontColor = "black";
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="text-container"
  style="top: {y}px; left: {x}px; cursor: {cursorStyle}; height: {height}px; width: {width}px;"
  class:non-selectable={!typing}
  class:no-select={!typing}
  on:mouseenter={() => {
    hidden = false;
  }}
  on:mouseleave={() => {
    if (!expanding) {
      hidden = true;
    }
  }}
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

  <textarea
    bind:this={textareaElement}
    class="text-box"
    class:non-selectable={!typing}
    class:no-select={!typing}
    class:active-background={expanding}
    style="cursor: {cursorStyle}; color: {fontColor}"
    id="textbox-{id}"
    on:input={handleInput}
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
  }

  .hidden {
    display: none;
  }

  .text-container {
    position: absolute;
    background-color: transparent;
    border: 3px solid rgb(113, 113, 113);
    border-radius: 12px;
    /* overflow: hidden; */
    box-sizing: border-box;
    z-index: 100;
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
</style>
