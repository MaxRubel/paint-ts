<script>
  // @ts-nocheck

  let isDragging = false;

  let dragOffsetX = 0;
  let dragOffsetY = 0;

  let x = 200;
  let y = 200;

  function handleMouseDown(event) {
    event.preventDefault();

    //set dragging state:
    isDragging = true;

    //calculate the true position of the div from where the mouse position is:
    dragOffsetX = event.clientX - x;
    dragOffsetY = event.clientY - y;

    //add event listener to listen for drag/mouse-movement and release:
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(event) {
    //change x and y positions as the mouse moves:
    if (isDragging) {
      x = event.clientX - dragOffsetX;
      y = event.clientY - dragOffsetY;
    }
  }

  function handleMouseUp() {
    isDragging = false;

    //remove event listeners/stop listening for drag:
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="draggable-thing"
  style="top: {y}px; left: {x}px;"
  on:mousedown={handleMouseDown}
>
  This would be text inside a draggable card
</div>

<style>
  .draggable-thing {
    position: absolute;
    display: flex;
    align-items: center;
    height: 100px;
    width: 250px;
    color: white;
    background-color: purple;
    z-index: 1000;
    cursor: move;
  }
</style>
