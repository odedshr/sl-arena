function drawEllipse(ctx, x, y, radiusX, radiusY, color) {
    drawAdvEllipse(ctx, x, y, radiusX, radiusY, 0, 0, Math.PI * 2, false, color);
}
function drawAdvEllipse(ctx, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    ctx.fill();
}
// Function to draw a rectangle
function drawRectangle(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
// Function to draw a circle
function drawCircle(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
}
// Function to draw text
function drawText(ctx, text, x, y, fontSize, color) {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(text, x, y);
}
export { drawRectangle, drawCircle, drawEllipse, drawText };
