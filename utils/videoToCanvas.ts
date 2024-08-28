export function VideoToCanvas(id: string, video: HTMLVideoElement) {
  const canvas = document.getElementById(
    `canvas-element-${id}`,
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  // Create a buffer canvas
  const bufferCanvas = document.createElement("canvas");
  const bufferCtx = bufferCanvas.getContext("2d", { willReadFrequently: true });

  function applyChromaKey(imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r < 10 && g < 10 && b < 10) {
        data[i + 3] = 0; // Set alpha to 0 (fully transparent)
      }
    }
    return imageData;
  }

  function updateCanvasSize() {
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      bufferCanvas.width = video.videoWidth;
      bufferCanvas.height = video.videoHeight;
    }
  }

  function draw() {
    if (video.paused || video.ended) return;

    // Check if we need to update canvas size
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      updateCanvasSize();
    }

    // Only proceed if the canvas has valid dimensions
    if (canvas.width && canvas.height) {
      bufferCtx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply chroma key effect
      if (bufferCtx) {
        const imageData = bufferCtx.getImageData(0, 0, canvas.width, canvas.height);
        const processedImageData = applyChromaKey(imageData);
        bufferCtx.putImageData(processedImageData, 0, 0);

        // Draw the processed frame to the main canvas
        ctx?.drawImage(bufferCanvas, 0, 0);
      }
    }

    requestAnimationFrame(draw);
  }

  // Start drawing when the video is ready
  video.addEventListener("loadedmetadata", () => {
    updateCanvasSize();
    draw();
  });

  // Also listen for the 'canplay' event as a fallback
  video.addEventListener("canplay", () => {
    if (!canvas.width || !canvas.height) {
      updateCanvasSize();
      draw();
    }
  });
}
