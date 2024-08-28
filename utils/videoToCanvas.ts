function videoToCanvas(
  id: string,
  video: HTMLVideoElement,
  chromaKeyColor: { r: number; g: number; b: number },
) {
  const canvas = document.getElementById(
    `canvas-element-${id}`,
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  canvas.height = 3000;
  canvas.width = 2000;

  console.log("c width", canvas.width);
  console.log("c height", canvas.height);
  console.log("v width", video.width);
  console.log("v height", video.height);

  function applyChromaKey(imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Check if the pixel color matches the chroma key color (with some tolerance)
      if (
        Math.abs(r - chromaKeyColor.r) < 30 &&
        Math.abs(g - chromaKeyColor.g) < 30 &&
        Math.abs(b - chromaKeyColor.b) < 30
      ) {
        data[i + 3] = 0; // Set alpha to 0 (fully transparent)
      }
    }
    return imageData;
  }

  function draw() {
    if (video.paused || video.ended) return;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply chroma key effect
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const processedImageData = applyChromaKey(imageData);
      ctx.putImageData(processedImageData, 0, 0);
    }

    requestAnimationFrame(draw);
  }

  draw();
}
