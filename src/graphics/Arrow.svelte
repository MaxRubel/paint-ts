<script>
  export let colorBarVisible;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  class:colorBarVisible
  width="16"
  height="16"
  fill="currentColor"
  class="bi bi-arrow-up animate"
  viewBox="0 0 16 16"
>
  <path
    fill-rule="evenodd"
    d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"
  />
</svg>

<style>
  .colorBarVisible {
    transform: rotate(-180deg);
  }

  .animate {
    transition: transform 1s ease;
    pointer-events: none;
  }
</style>
