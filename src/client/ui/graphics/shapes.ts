function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, color: string): void {
  drawAdvEllipse(ctx, x, y, radiusX, radiusY, 0, 0, Math.PI * 2, false, color);
}

function drawAdvEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise: boolean, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
  ctx.fill();
}

// Function to draw a rectangle
function drawRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

// Function to draw a circle
function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.fill();
}

// Function to draw text
function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number, color: string): void {
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(text, x, y);
}

export { drawRectangle, drawCircle, drawEllipse, drawText };
