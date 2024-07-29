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

  let { x, y, id } = data;
  let textareaElement: HTMLTextAreaElement;
  let isDragging = false;
  let dragOffsetX: number = 0;
  let dragOffsetY: number = 0;
  let eventState: string = "";
  let typing = true;
  let theme = "dark";
  let cursorStyle = "";

  const unsubcribe = theme_store.subscribe((value: string) => {
    theme = value;
  });

  const unsubcribe2 = event_state_store.subscribe((value: string) => {
    eventState = value;
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
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;

    if (target) {
      const value = target.value;
      updateTextBox(id, { ...data, text: value });
      event_state_store.set(`typing&${id}`);
    } else {
      console.error("Event target is not an HTMLTextAreaElement");
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaElement.blur();
    }
  }

  //---------Drag and Drop---------------------------
  function handleMouseDown(event: MouseEvent) {
    if (!typing) {
      isDragging = true;
      dragOffsetX = event.clientX - x;
      dragOffsetY = event.clientY - y;
      event.preventDefault();
    }
    if (isDragging) {
      textareaElement.blur();
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (isDragging) {
      if (get(locked_store)) {
        x = Math.round((event.clientX - dragOffsetX) / 20) * 20;
        y = Math.round((event.clientY - dragOffsetY) / 20) * 20;
        updateTextBox(id, { ...data, x, y }); //save data to store
      } else {
        x = event.clientX - dragOffsetX;
        y = event.clientY - dragOffsetY;
        updateTextBox(id, { ...data, x, y }); //save data to store
      }
    }
  }

  function handleMouseUp() {
    isDragging = false;
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
  let hidden: boolean = true;
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="text-container"
  style="top: {y}px; left: {x}px; cursor: {cursorStyle}"
  on:mouseenter={() => {
    hidden = false;
  }}
  on:mouseleave={() => {
    hidden = true;
  }}
>
  <div class="top-left" class:hidden></div>
  <div class="top-center" class:hidden></div>
  <div class="top-right" class:hidden></div>
  <div class="left" class:hidden></div>
  <div class="right" class:hidden></div>
  <div class="bottom-left" class:hidden></div>
  <div class="bottom-center" class:hidden></div>
  <div class="bottom-right" class:hidden></div>

  <textarea
    bind:this={textareaElement}
    class="text-box"
    class:non-selectable={!typing}
    class:no-select={!typing}
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
    background-color: transparent;
    resize: none;
    background-color: rgb(113, 113, 113);
  }

  .hidden {
    display: none;
  }

  .top-left {
    position: absolute;
    height: 12px;
    width: 12px;
    z-index: 300;
    top: -4px;
    left: -4px;
    cursor: nwse-resize;
    background-color: rgb(113, 113, 113);
  }

  .top-center {
    position: absolute;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  .top-right {
    position: absolute;
    top: -4px;
    right: -4px;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    cursor: nesw-resize;
  }

  .bottom-left {
    position: absolute;
    bottom: -4px;
    left: -4px;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    cursor: nesw-resize;
  }

  .bottom-center {
    position: absolute;
    bottom: -4px;
    left: 50%;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  .bottom-right {
    position: absolute;
    bottom: -4px;
    right: -4px;
    height: 12px;
    width: 12px;
    background-color: rgb(113, 113, 113);
    z-index: 201;
    cursor: nwse-resize;
  }

  .text-container {
    position: absolute;
  }

  .text-box {
    position: relative;
    display: flex;
    background-color: transparent;
    border: none;
    min-width: 100px;
    min-height: 20px;
    color: lightgray;
    font-size: 18pt;
    z-index: 200;
    border-radius: 12px;
    transition: box-shadow 0.3s ease;
    text-align: center;
    border: 3px solid rgb(113, 113, 113);
    padding-top: 20px;
  }

  .text-box:hover {
    background-color: rgba(43, 43, 43, 0.636);
  }

  .text-box:focus,
  .text-box:active {
    outline: none;
    border: 3px solid rgb(113, 113, 113);
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
