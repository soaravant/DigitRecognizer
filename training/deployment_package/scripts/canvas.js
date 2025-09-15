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
        this.brushSize = 3;
        
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
            brushSizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
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
        // Return cropped, centered, scaled 200x200 grayscale array
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

        const TARGET = 200;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = TARGET;
        tempCanvas.height = TARGET;

        // Fit within TARGET with small margin (10%)
        const targetBox = Math.round(TARGET * 0.9);
        const scale = Math.min(targetBox / cropW, targetBox / cropH);
        const scaledW = Math.max(1, Math.round(cropW * scale));
        const scaledH = Math.max(1, Math.round(cropH * scale));
        const dx = Math.floor((TARGET - scaledW) / 2);
        const dy = Math.floor((TARGET - scaledH) / 2);

        // Fill white background; invert later
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, TARGET, TARGET);

        // Draw the cropped area scaled and centered
        tempCtx.drawImage(this.canvas, cropX, cropY, cropW, cropH, dx, dy, scaledW, scaledH);

        const scaledImageData = tempCtx.getImageData(0, 0, TARGET, TARGET);
        const data = this.preprocessImageData(scaledImageData);
        return { data, width: TARGET, height: TARGET };
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
