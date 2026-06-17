import { DrawingCanvas } from './canvas.js';
import { Toolbar } from './toolbar.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('drawing-canvas');
  const drawingCanvas = new DrawingCanvas(canvasEl);
  new Toolbar(drawingCanvas);

  // Listen for overlay toggle from main process
  window.scrawlAPI.onToggleOverlay((visible) => {
    if (visible) {
      document.body.classList.remove('overlay-hidden');
      drawingCanvas.setVisible(true);
    } else {
      document.body.classList.add('overlay-hidden');
      drawingCanvas.setVisible(false);
    }
  });
});
