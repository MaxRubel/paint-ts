export function DrawRectangle(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, e: PointerEvent, xStart: number, yStart: number ): void{
    //xStart and yStart are the starting coordinates of the mouse click
    const borderRadius = 10;
    const xCurrent = e.clientX - canvas.offsetLeft;
    const yCurrent = e.clientY - canvas.offsetTop;

    let width = xCurrent - xStart;
    let height = yCurrent - yStart;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = width < 0 ? xStart + width : xStart;
    let y = height < 0 ? yStart + height : yStart;

    width = Math.abs(width);
    height = Math.abs(height);

    let adjustedRadius = Math.min(borderRadius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + adjustedRadius, y);
    ctx.lineTo(x + width - adjustedRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + adjustedRadius);
    ctx.lineTo(x + width, y + height - adjustedRadius);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - adjustedRadius,
      y + height,
    );
    ctx.lineTo(x + adjustedRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - adjustedRadius);
    ctx.lineTo(x, y + adjustedRadius);
    ctx.quadraticCurveTo(x, y, x + adjustedRadius, y);
    ctx.closePath();
    ctx.stroke();
}