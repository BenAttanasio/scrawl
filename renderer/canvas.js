import { getStroke } from 'perfect-freehand';
import { getSvgPathFromStroke } from './stroke-utils.js';

export class DrawingCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    // Stroke state
    this.strokes = [];
    this.currentStroke = null;
    this.isDrawing = false;

    // Settings
    this.color = '#000000';
    this.strokeWidth = 8;
    this.tool = 'pen';

    // Box-select state (blur/redact tool)
    this.blurStart = null;
    this.blurEnd = null;

    // Pressure detection
    this.hasPressure = false;
    this.pressureChecked = false;

    this._setupCanvas();
    this._bindEvents();
  }

  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  _bindEvents() {
    this.canvas.addEventListener('pointerdown', this._onPointerDown.bind(this));
    this.canvas.addEventListener('pointermove', this._onPointerMove.bind(this));
    this.canvas.addEventListener('pointerup', this._onPointerUp.bind(this));
    this.canvas.addEventListener('pointerleave', this._onPointerUp.bind(this));

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        this.undo();
      }
    });

    window.addEventListener('resize', () => {
      this._setupCanvas();
      this._redrawAll();
    });
  }

  _onPointerDown(e) {
    if (e.target !== this.canvas) return;

    if (this.tool === 'blur') {
      this.isDrawing = true;
      this.canvas.setPointerCapture(e.pointerId);
      this.blurStart = { x: e.clientX, y: e.clientY };
      this.blurEnd = { x: e.clientX, y: e.clientY };
      return;
    }

    this.isDrawing = true;
    this.canvas.setPointerCapture(e.pointerId);

    if (!this.pressureChecked && e.pointerType === 'pen') {
      this.hasPressure = e.pressure > 0 && e.pressure < 1;
      this.pressureChecked = true;
    }

    this.currentStroke = {
      points: [[e.clientX, e.clientY, e.pressure]],
      color: this.color,
    };
  }

  _onPointerMove(e) {
    if (!this.isDrawing) return;

    if (this.tool === 'blur') {
      this.blurEnd = { x: e.clientX, y: e.clientY };
      this._renderFrame();
      return;
    }

    if (!this.currentStroke) return;

    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ce of events) {
      this.currentStroke.points.push([ce.clientX, ce.clientY, ce.pressure]);
    }

    this._renderFrame();
  }

  _onPointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.tool === 'blur') {
      if (this.blurStart && this.blurEnd) {
        const rect = this._normalizeRect(this.blurStart, this.blurEnd);
        this.blurStart = null;
        this.blurEnd = null;
        if (rect.width > 4 && rect.height > 4) {
          this._applyBlur(rect);
        } else {
          this._redrawAll();
        }
      }
      return;
    }

    if (!this.currentStroke) return;

    const pathData = this._computePathData(this.currentStroke.points, true);
    if (pathData) {
      this.strokes.push({
        pathData,
        color: this.currentStroke.color,
      });
    }
    this.currentStroke = null;
    this._redrawAll();
  }

  _normalizeRect(start, end) {
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  }

  _applyBlur(rect) {
    this.strokes.push({
      type: 'blur',
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      color: this.color,
    });
    this._redrawAll();
  }

  _getStrokeOptions(last) {
    return {
      size: this.strokeWidth,
      thinning: 0.5,
      smoothing: 0.7,
      streamline: 0.85,
      easing: (t) => t,
      start: { taper: 0, cap: true },
      end: { taper: 0, cap: true },
      simulatePressure: !this.hasPressure,
      last: !!last,
    };
  }

  _computePathData(points, last) {
    const outlinePoints = getStroke(points, this._getStrokeOptions(last));
    return getSvgPathFromStroke(outlinePoints);
  }

  _renderFrame() {
    this._redrawAll();

    if (this.tool === 'blur' && this.blurStart && this.blurEnd) {
      const r = this._normalizeRect(this.blurStart, this.blurEnd);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([6, 4]);
      this.ctx.strokeRect(r.x, r.y, r.width, r.height);
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = 'rgba(100, 100, 100, 0.15)';
      this.ctx.fillRect(r.x, r.y, r.width, r.height);
      return;
    }

    if (this.currentStroke && this.currentStroke.points.length >= 2) {
      const pathData = this._computePathData(this.currentStroke.points, false);
      if (pathData) {
        this._fillPath(pathData, this.currentStroke.color);
      }
    }
  }

  _redrawAll() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);

    for (const stroke of this.strokes) {
      if (stroke.type === 'blur') {
        this.ctx.fillStyle = stroke.color;
        this.ctx.fillRect(stroke.x, stroke.y, stroke.width, stroke.height);
      } else {
        this._fillPath(stroke.pathData, stroke.color);
      }
    }
  }

  _fillPath(pathData, color) {
    const path = new Path2D(pathData);
    this.ctx.fillStyle = color;
    this.ctx.fill(path);
  }

  // --- Public API ---

  setColor(color) {
    this.color = color;
  }

  setStrokeWidth(width) {
    this.strokeWidth = width;
  }

  setTool(tool) {
    this.tool = tool;
  }

  undo() {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this._redrawAll();
    }
  }

  clearAll() {
    this.strokes = [];
    this._redrawAll();
  }

  setVisible(visible) {
    if (visible) {
      this._redrawAll();
    }
  }
}
