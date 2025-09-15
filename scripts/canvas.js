/**
 * Canvas Drawing Functionality
 * Handles mouse and touch events for drawing on the canvas
 */

class CanvasDrawer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.brushSize = 10;
        // Preprocessing options
        this.targetSize = 50;           // Final side length fed to models
        this.mnistCentering = true;     // Center-of-mass centering like MNIST
        this.fitRatio = 0.8;            // Fit digit within 80% of the target box (MNIST uses 20x20 in 28x28)
        
        // Set up canvas properties
        this.setupCanvas();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize brush size control
        this.initBrushControl();
    }
    
    setupCanvas() {
        // Set canvas size and style
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // Set drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = this.brushSize;
        
        // Fill with white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 0.5;
        
        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Reset stroke style for drawing
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = this.brushSize;
    }
    
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    initBrushControl() {
        const brushSizeSlider = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        
        if (brushSizeSlider && brushSizeValue) {
            // Initialize slider and label to current brush size
            try {
                brushSizeSlider.value = String(this.brushSize);
                brushSizeSlider.min = '10';
            } catch (e) {}
            brushSizeValue.textContent = this.brushSize;
            brushSizeSlider.addEventListener('input', (e) => {
                // Enforce minimum brush size of 10
                const val = Math.max(10, parseInt(e.target.value));
                if (val !== parseInt(e.target.value)) {
                    e.target.value = String(val);
                }
                this.brushSize = val;
                this.ctx.lineWidth = this.brushSize;
                brushSizeValue.textContent = this.brushSize;
            });
        }
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Start a new path
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        
        // Draw a small dot for single clicks
        this.ctx.arc(this.lastX, this.lastY, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Trigger prediction after a short delay
        this.triggerPrediction();
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        // Draw line from last position to current position
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        // Update last position
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Trigger prediction with debouncing
        this.triggerPrediction();
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.beginPath();
        }
    }
    
    handleTouch(e) {
        e.preventDefault();
        
        if (e.type === 'touchstart') {
            const pos = this.getTouchPos(e);
            this.lastX = pos.x;
            this.lastY = pos.y;
            this.isDrawing = true;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            
            // Draw a small dot for touch start
            this.ctx.arc(this.lastX, this.lastY, this.brushSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.triggerPrediction();
        } else if (e.type === 'touchmove' && this.isDrawing) {
            const pos = this.getTouchPos(e);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
            
            this.lastX = pos.x;
            this.lastY = pos.y;
            
            this.triggerPrediction();
        }
    }
    
    clearCanvas() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fill with white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset drawing properties
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = this.brushSize;
        
        // Clear predictions
        this.clearPredictions();
    }
    
    clearPredictions() {
        // This will be called by the main app to clear prediction displays
        if (window.app && window.app.clearPredictions) {
            window.app.clearPredictions();
        }
    }
    
    getCanvasData() {
        // MNIST-style preprocessing: crop → scale to fit → center by center-of-mass → normalize/invert
        const bounds = this.getDrawingBounds();
        const padding = 10;
        const srcX = Math.max(0, bounds.minX - padding);
        const srcY = Math.max(0, bounds.minY - padding);
        const srcW = Math.min(this.canvas.width, bounds.maxX + padding) - srcX;
        const srcH = Math.min(this.canvas.height, bounds.maxY + padding) - srcY;

        // If nothing drawn, fall back to whole canvas
        const cropX = isFinite(srcW) && srcW > 0 ? srcX : 0;
        const cropY = isFinite(srcH) && srcH > 0 ? srcY : 0;
        const cropW = isFinite(srcW) && srcW > 0 ? srcW : this.canvas.width;
        const cropH = isFinite(srcH) && srcH > 0 ? srcH : this.canvas.height;

        const TARGET = this.targetSize;
        const fitBox = Math.round(TARGET * this.fitRatio); // e.g., 40px inside 50px

        // Stage 1: scale the cropped digit to fit within fitBox while preserving aspect ratio
        const scaledW = Math.max(1, Math.round(cropW * Math.min(fitBox / cropW, fitBox / cropH)));
        const scaledH = Math.max(1, Math.round(cropH * Math.min(fitBox / cropW, fitBox / cropH)));

        // Draw centered onto a clean TARGET x TARGET canvas
        const base = document.createElement('canvas');
        base.width = TARGET; base.height = TARGET;
        const bctx = base.getContext('2d');
        bctx.fillStyle = '#ffffff';
        bctx.fillRect(0, 0, TARGET, TARGET);
        const dx = Math.floor((TARGET - scaledW) / 2);
        const dy = Math.floor((TARGET - scaledH) / 2);
        bctx.drawImage(this.canvas, cropX, cropY, cropW, cropH, dx, dy, scaledW, scaledH);

        // Optionally center by center-of-mass
        let working = base;
        if (this.mnistCentering) {
            const { cx, cy, mass } = this.computeCenterOfMass(working);
            // If there is mass, shift so mass center is at image center
            if (mass > 1e-6) {
                const tx = Math.round(TARGET / 2 - cx);
                const ty = Math.round(TARGET / 2 - cy);
                const shifted = document.createElement('canvas');
                shifted.width = TARGET; shifted.height = TARGET;
                const sctx = shifted.getContext('2d');
                sctx.fillStyle = '#ffffff';
                sctx.fillRect(0, 0, TARGET, TARGET);
                sctx.drawImage(working, tx, ty);
                working = shifted;
            }
        }

        const scaledImageData = working.getContext('2d').getImageData(0, 0, TARGET, TARGET);
        const data = this.preprocessImageData(scaledImageData);
        return { data, width: TARGET, height: TARGET };
    }

    computeCenterOfMass(canvas) {
        const ctx = canvas.getContext('2d');
        const { width: w, height: h } = canvas;
        const img = ctx.getImageData(0, 0, w, h);
        const d = img.data;
        let sum = 0, sumX = 0, sumY = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                // intensity: invert grayscale so strokes contribute positively
                const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
                const val = (255 - gray) / 255; // 0..1, larger means darker stroke
                if (val > 0) {
                    sum += val;
                    sumX += x * val;
                    sumY += y * val;
                }
            }
        }
        if (sum <= 0) return { cx: canvas.width / 2, cy: canvas.height / 2, mass: 0 };
        return { cx: sumX / sum, cy: sumY / sum, mass: sum };
    }
    
    preprocessImageData(imageData) {
        // Convert to grayscale and normalize, invert to white-on-black (MNIST style)
        const data = imageData.data;
        const out = new Float32Array((data.length / 4) | 0);
        let j = 0;
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            out[j++] = (255 - gray) / 255;
        }
        return out;
    }
    
    triggerPrediction() {
        // Debounce prediction calls to avoid too frequent predictions
        if (this.predictionTimeout) {
            clearTimeout(this.predictionTimeout);
        }
        
        this.predictionTimeout = setTimeout(() => {
            if (window.app && window.app.predictDigit) {
                window.app.predictDigit();
            }
        }, 300); // 300ms delay
    }
    
    // Method to check if canvas has any drawing
    hasDrawing() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Check if any pixel is not white (has drawing)
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
                return true;
            }
        }
        return false;
    }
    
    // Method to get drawing bounds for better preprocessing
    getDrawingBounds() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        let minX = this.canvas.width, minY = this.canvas.height;
        let maxX = 0, maxY = 0;
        
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const index = (y * this.canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // If pixel is not white (has drawing)
                if (r < 250 || g < 250 || b < 250) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        
        return {
            minX: Math.max(0, minX - 5),
            minY: Math.max(0, minY - 5),
            maxX: Math.min(this.canvas.width, maxX + 5),
            maxY: Math.min(this.canvas.height, maxY + 5)
        };
    }
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.canvasDrawer = new CanvasDrawer('drawingCanvas');
    
    // Bind clear button
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            window.canvasDrawer.clearCanvas();
        });
    }
});
