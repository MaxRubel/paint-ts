<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { event_state_store, theme_store } from "../../stores/eventState";
  import { createEventDispatcher } from "svelte";
  import { deleteTextBox } from "../../stores/migmaStore";
  import type { TextBoxType } from "../../utils/types/app_types";

  export let data: TextBoxType;
  export let updateTextBox: any;

  let { x, y, id } = data;
  let textareaElement: HTMLTextAreaElement;
  let isDragging = false;
  let dragOffsetX: number = 0;
  let dragOffsetY: number = 0;
  let isEditing = true;
  let theme = "dark";

  const unsubcribe = theme_store.subscribe((value) => {
    theme = value;
  });

  const dispatch = createEventDispatcher();

  onMount(() => {
    event_state_store.set("typing");
  });

  onDestroy(() => {
    unsubcribe();
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;

    if (target) {
      const value = target.value;
      updateTextBox(id, { ...data, text: value });
      event_state_store.set("typing");
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

  function handleMouseDown(event: MouseEvent) {
    if (!isEditing) {
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
      x = event.clientX - dragOffsetX;
      y = event.clientY - dragOffsetY;
      updateTextBox(id, { ...data, x, y });
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleBlur() {
    isEditing = false;
    event_state_store.set("arrow");
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
    isEditing = true;
    textareaElement.focus();
  }

  function focusAndSelectAll(node: HTMLTextAreaElement) {
    node.focus();
    node.setSelectionRange(0, 0);
  }

  function handleFocus() {
    dispatch("select", `textbox&${id}`);
  }

  $: cursorStyle = isEditing ? "text" : "grab";

  let fontColor: string = "";
  $: {
    if (theme === "dark") {
      fontColor = "";
    } else {
      fontColor = "black";
    }
  }
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<textarea
  bind:this={textareaElement}
  class="text-box"
  class:non-selectable={!isEditing}
  class:no-select={!isEditing}
  id="textbox-{id}"
  style="top: {y}px; left: {x}px; cursor: {cursorStyle}; color: {fontColor}"
  on:input={handleInput}
  on:click={handleSingleClick}
  on:keydown={handleKeydown}
  on:mousedown={handleMouseDown}
  on:dblclick={handleDoubeClick}
  on:blur={handleBlur}
  on:focus={handleFocus}
  use:focusAndSelectAll
  readonly={!isEditing}>{data.text}</textarea
>

<style>
  textarea {
    background-color: red;
  }

  .text-box {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
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
    background-color: rgba(43, 43, 43, 0.86);
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
