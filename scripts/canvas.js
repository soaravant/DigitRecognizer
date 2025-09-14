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
        this.canvas.width = 300;
        this.canvas.height = 300;
        
        // Set drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = this.brushSize;
        
        // Fill with white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle grid (optional)
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#f0f0f0';
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
        
        // Redraw grid
        this.drawGrid();
        
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
        // Return the canvas image data as a 28x28 grayscale array
        // This is what we'll send to the ML model
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        return this.preprocessImageData(imageData);
    }
    
    preprocessImageData(imageData) {
        // Convert canvas to 28x28 grayscale for MNIST model
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = 28;
        tempCanvas.height = 28;
        
        // Draw the original canvas scaled down to 28x28
        tempCtx.drawImage(this.canvas, 0, 0, 28, 28);
        
        // Get the 28x28 image data
        const scaledImageData = tempCtx.getImageData(0, 0, 28, 28);
        const data = scaledImageData.data;
        
        // Convert to grayscale and normalize
        const grayscale = [];
        for (let i = 0; i < data.length; i += 4) {
            // Convert RGB to grayscale using luminance formula
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            // Normalize to 0-1 range and invert (MNIST expects white digits on black background)
            grayscale.push((255 - gray) / 255);
        }
        
        return grayscale;
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
