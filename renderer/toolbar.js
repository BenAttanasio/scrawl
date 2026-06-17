export class Toolbar {
  constructor(drawingCanvas) {
    this.drawingCanvas = drawingCanvas;
    this._bindEvents();
  }

  _bindEvents() {
    // Color swatches
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        swatches.forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
        this.drawingCanvas.setColor(swatch.dataset.color);
      });
    });

    // Custom color picker
    const customColor = document.getElementById('custom-color');
    customColor.addEventListener('input', (e) => {
      this.drawingCanvas.setColor(e.target.value);
      swatches.forEach((s) => s.classList.remove('active'));
    });

    // Width slider
    const widthSlider = document.getElementById('stroke-width');
    const widthValue = document.getElementById('width-value');
    const updateThumb = (val) => {
      const minThumb = 10;
      const maxThumb = 30;
      const t = (val - 3) / (30 - 3);
      const size = minThumb + t * (maxThumb - minThumb);
      widthSlider.style.setProperty('--thumb-size', size + 'px');
    };
    updateThumb(parseInt(widthSlider.value, 10));
    widthSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      widthValue.textContent = val;
      updateThumb(val);
      this.drawingCanvas.setStrokeWidth(val);
    });

    // Blur tool toggle
    const blurBtn = document.getElementById('btn-blur');
    blurBtn.addEventListener('click', () => {
      if (this.drawingCanvas.tool !== 'blur') {
        this.drawingCanvas.setTool('blur');
        blurBtn.classList.add('tool-active');
      } else {
        this.drawingCanvas.setTool('pen');
        blurBtn.classList.remove('tool-active');
      }
    });

    // Clear button
    document.getElementById('btn-clear').addEventListener('click', () => {
      this.drawingCanvas.clearAll();
    });

    // Undo button
    document.getElementById('btn-undo').addEventListener('click', () => {
      this.drawingCanvas.undo();
    });

    // Close button
    document.getElementById('btn-close').addEventListener('click', () => {
      window.scrawlAPI.closeApp();
    });
  }
}
