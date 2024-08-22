<!-- <script>
  // @ts-nocheck
  import { onDestroy, onMount } from "svelte";

  let canvas;
  let ctx;
  let animationId;
  let isAnimating = false;

  onMount(() => {
    canvas = document.getElementById("main-canvas");
    ctx = canvas.getContext("2d");

    // Start the animation
    startAnimate();
  });

  onDestroy(() => {
    stopAnimate();
  });

  function animate(currentTime) {
    if (!isAnimating) return;

    animationId = requestAnimationFrame(animate);

    let lastTime = 0;
    const interval = 1000 / 24; // 24 fps, adjust as needed

    // Check if enough time has passed since the last frame
    if (currentTime - lastTime < interval) return;

    // Update lastTime
    lastTime = currentTime;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Measure the size of the cleared canvas
    canvas.toBlob((blob) => {
      console.log(`PNG size: ${(blob.size / 1024).toFixed(2)} KB`);
    }, "image/png");
  }

  function startAnimate() {
    if (!isAnimating) {
      isAnimating = true;
      animationId = requestAnimationFrame(animate);
      console.log("Animation started");
    }
  }

  function stopAnimate() {
    isAnimating = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
      console.log("Animation stopped");
    }
  }
</script>

<div class="mult-menu">
  <button on:click={stopAnimate}> Stop Animate</button>
</div>

<style>
  button {
    width: auto;
  }
  .mult-menu {
    position: fixed;
    z-index: 1003;
    bottom: 0px;
    left: 100px;
    height: 100px;
    width: 500px;
    background-color: red;
  }
</style> -->
