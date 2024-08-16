<script>
  import Close from "../../graphics/Close.svelte";
</script>

<from class="color-palette-form cool">
  <div class="top-row">
    <div id="empty" />
    <div class="center-top"><h3 style="text-align: center;">Palette</h3></div>
    <div class="top-right">
      <button class="clear-button moved close-button centered"><Close /></button>
    </div>
  </div>
</from>

<style>
  .color-palette-form {
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    left: 50%;
    height: 500px;
    width: 800px;
    z-index: 1000;
  }

  .top-row {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .center-top {
    text-align: center;
  }
</style>
