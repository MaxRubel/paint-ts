export function DrawRectangle(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  e: PointerEvent,
  xStart: number,
  yStart: number
): void {
  const borderRadius = 10;

  // Get the canvas's position relative to the viewport
  const canvasRect = canvas.getBoundingClientRect();

  // Calculate current mouse position relative to the canvas
  const xCurrent = e.clientX + canvasRect.left;
  const yCurrent = e.clientY + canvasRect.top;

  let width = xCurrent - xStart;
  let height = yCurrent - yStart;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = width < 0 ? xStart + width : xStart;
  let y = height < 0 ? yStart + height : yStart;

  width = Math.abs(width);
  height = Math.abs(height);

  let adjustedRadius = Math.min(borderRadius, width / 2, height / 2);

  // Drawing code
  ctx.beginPath();
  ctx.moveTo(x + adjustedRadius, y);
  ctx.lineTo(x + width - adjustedRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + adjustedRadius);
  ctx.lineTo(x + width, y + height - adjustedRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - adjustedRadius, y + height);
  ctx.lineTo(x + adjustedRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - adjustedRadius);
  ctx.lineTo(x, y + adjustedRadius);
  ctx.quadraticCurveTo(x, y, x + adjustedRadius, y);
  ctx.closePath();
  ctx.stroke();
}