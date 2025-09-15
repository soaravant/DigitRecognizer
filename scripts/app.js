/**
 * Main Application Logic
 * Coordinates between canvas drawing and ML prediction
 */

class DigitRecognizerApp {
    constructor() {
        this.canvasDrawer = null;
        this.mlModelHandler = null;
        this.isInitialized = false;
        this.predictionHistory = [];
        this.comparisonMode = false;
        this.currentModelId = null;
        
        // Initialize the application
        this.init();
    }
    
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application');
        }
    }
    
    async initializeApp() {
        try {
            console.log('Initializing DigitRecognizer App...');
            
            // Wait for components to be available
            await this.waitForComponents();
            
            // Initialize components
            this.canvasDrawer = window.canvasDrawer;
            this.mlModelHandler = window.mlModelHandler;
            
            if (!this.canvasDrawer || !this.mlModelHandler) {
                throw new Error('Required components not available');
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            this.isInitialized = true;
            console.log('App initialized successfully!');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize the application');
        }
    }
    
    async waitForComponents() {
        // Wait for canvas and ML model to be ready
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (attempts < maxAttempts) {
            if (window.canvasDrawer && window.mlModelHandler) {
                // Wait a bit more for ML model to load
                if (window.mlModelHandler.isModelLoaded) {
                    return;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Components not ready within timeout');
    }
    
    setupEventListeners() {
        // Set up any additional event listeners here
        // Most are already handled by individual components
        
        // Listen for model loading completion
        document.addEventListener('modelLoaded', () => {
            this.onModelLoaded();
        });
        
        // Listen for prediction errors
        document.addEventListener('predictionError', (e) => {
            this.onPredictionError(e.detail);
        });
    }
    
    initializeUI() {
        // Initialize UI elements
        this.updateModelStatus();
        this.setupKeyboardShortcuts();
        this.initializeModelSelector();
        this.setupComparisonToggle();
    }

    initializeModelSelector() {
        const modelGrid = document.getElementById('modelGrid');
        const modelInfo = document.getElementById('modelInfo');
        
        if (!modelGrid || !modelInfo) return;
        
        const availableModels = this.mlModelHandler.getAvailableModels();
        
        // Create model cards
        Object.entries(availableModels).forEach(([modelId, config]) => {
            const modelCard = document.createElement('div');
            modelCard.className = 'model-card';
            modelCard.dataset.modelId = modelId;
            
            modelCard.innerHTML = `
                <h4>${config.name}</h4>
                <div class="model-stats">
                    <div>${config.parameters}</div>
                    <div>${config.accuracy}</div>
                </div>
            `;
            
            modelCard.addEventListener('click', () => {
                this.selectModel(modelId);
            });
            
            modelGrid.appendChild(modelCard);
        });
        
        // Show model info
        this.updateModelInfo();

        // Auto-select currently loaded model, if any
        const defaultId = this.mlModelHandler.currentModelId;
        if (defaultId) {
            this.currentModelId = defaultId;
            const selectedCard = document.querySelector(`[data-model-id="${defaultId}"]`);
            if (selectedCard) selectedCard.classList.add('active');
            this.updateModelInfo();
            this.updateCurrentModelName();
        }
    }

    selectModel(modelId) {
        // Update UI
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const selectedCard = document.querySelector(`[data-model-id="${modelId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
        
        // Switch model
        if (this.mlModelHandler.switchModel(modelId)) {
            this.currentModelId = modelId;
            this.updateModelInfo();
            this.updateCurrentModelName();
            
            // Clear predictions when switching models
            this.clearPredictions();
            
            // If there's a drawing, make a new prediction
            if (this.canvasDrawer && this.canvasDrawer.hasDrawing()) {
                this.predictDigit();
            }
        }
    }

    updateModelInfo() {
        const modelInfo = document.getElementById('modelInfo');
        if (!modelInfo) return;
        
        if (this.currentModelId) {
            const config = this.mlModelHandler.getAvailableModels()[this.currentModelId];
            modelInfo.innerHTML = `
                <h4>${config.name}</h4>
                <p><strong>Description:</strong> ${config.description}</p>
                <p><strong>Parameters:</strong> ${config.parameters}</p>
                <p><strong>Accuracy:</strong> ${config.accuracy}</p>
            `;
        } else {
            modelInfo.innerHTML = ``;
        }
    }

    updateCurrentModelName() {
        const currentModelName = document.getElementById('currentModelName');
        if (currentModelName && this.currentModelId) {
            const config = this.mlModelHandler.getAvailableModels()[this.currentModelId];
            currentModelName.textContent = config.name;
        }
    }

    setupComparisonToggle() {
        // Setup tab functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab pane
                tabPanes.forEach(pane => pane.classList.remove('active'));
                const targetPane = document.getElementById(targetTab === 'single' ? 'singleModelView' : 'comparisonView');
                if (targetPane) {
                    targetPane.classList.add('active');
                }
                
                // Update comparison mode
                this.comparisonMode = targetTab === 'compare';
                
                // Load models for comparison if needed
                if (this.comparisonMode) {
                    this.loadAllModelsForComparison();
                    if (this.canvasDrawer && this.canvasDrawer.hasDrawing()) {
                        this.predictWithAllModels();
                    }
                }
            });
        });
    }


    async loadAllModelsForComparison() {
        try {
            await this.mlModelHandler.loadAllModels();
            console.log('All models loaded for comparison');
        } catch (error) {
            console.warn('Failed to load all models:', error);
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Clear canvas with 'c' key
            if (e.key === 'c' || e.key === 'C') {
                this.clearCanvas();
            }
            
            // Clear predictions with 'r' key
            if (e.key === 'r' || e.key === 'R') {
                this.clearPredictions();
            }
        });
    }
    
    async predictDigit() {
        if (!this.isInitialized || !this.canvasDrawer || !this.mlModelHandler) {
            return;
        }
        
        try {
            // Check if there's any drawing on the canvas
            if (!this.canvasDrawer.hasDrawing()) {
                this.clearPredictions();
                return;
            }
            
            // Get canvas data
            const processed = this.canvasDrawer.getCanvasData();
            this.updatePreprocessPreview(processed);
            
            if (this.comparisonMode) {
                // Make predictions with all models
                await this.predictWithAllModels();
            } else {
                // Make prediction with current model
                const result = await this.mlModelHandler.predict(imageData);
                
                // Update UI with results
                this.updatePredictionUI(result);
                
                // Add to history
                this.addToHistory(result);
            }
            
        } catch (error) {
            console.error('Prediction error:', error);
            this.onPredictionError(error);
        }
    }

    updatePreprocessPreview(processed) {
        const preview = document.getElementById('preprocessedPreview');
        if (!preview) return;
        const ctx = preview.getContext('2d');
        const w = processed.width || 28, h = processed.height || 28;
        const data = processed.data || processed;
        const imgData = ctx.createImageData(w, h);
        for (let i = 0; i < w * h; i++) {
            const v = Math.max(0, Math.min(255, Math.round(data[i] * 255)));
            // imageData is white-on-black after inversion; render white strokes on black
            imgData.data[i*4+0] = v;
            imgData.data[i*4+1] = v;
            imgData.data[i*4+2] = v;
            imgData.data[i*4+3] = 255;
        }
        // Put the 28x28 then scale to canvas (140x140)
        const off = document.createElement('canvas');
        off.width = w; off.height = h;
        off.getContext('2d').putImageData(imgData, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0,0,preview.width, preview.height);
        ctx.drawImage(off, 0, 0, preview.width, preview.height);
    }

    async predictWithAllModels() {
        if (!this.canvasDrawer || !this.canvasDrawer.hasDrawing()) {
            this.clearComparisonPredictions();
            return;
        }
        
        try {
            const imageData = this.canvasDrawer.getCanvasData();
            const results = await this.mlModelHandler.predictAllModels(imageData);
            
            this.updateComparisonUI(results);
            
        } catch (error) {
            console.error('Comparison prediction error:', error);
            this.onPredictionError(error);
        }
    }
    
    updatePredictionUI(result) {
        // Update main prediction display
        this.updateMainPrediction(result.topPrediction, result.confidence);
        
        // Update top 3 predictions
        this.updateTopPredictions(result.predictions.slice(0, 3));
        
        // Update confidence indicator
        this.updateConfidenceIndicator(result.confidence);
    }
    
    updateMainPrediction(prediction, confidence) {
        const digitElement = document.querySelector('.prediction-item .digit');
        const probabilityElement = document.querySelector('.prediction-item .probability');
        
        if (digitElement && probabilityElement) {
            // Add scale animation before updating
            digitElement.style.transform = 'scale(0.8)';
            digitElement.style.opacity = '0.5';
            
            setTimeout(() => {
                digitElement.textContent = prediction.digit;
                probabilityElement.textContent = `${(confidence * 100).toFixed(1)}%`;
                
                // Add enhanced animations
                digitElement.classList.add('scale-in');
                digitElement.style.transform = 'scale(1)';
                digitElement.style.opacity = '1';
                
                setTimeout(() => {
                    digitElement.classList.remove('scale-in');
                }, 600);
            }, 150);
        }
    }
    
    updateTopPredictions(predictions) {
        const predictionRows = document.querySelectorAll('.prediction-row');
        
        predictions.forEach((prediction, index) => {
            if (predictionRows[index]) {
                const digitElement = predictionRows[index].querySelector('.digit');
                const percentageElement = predictionRows[index].querySelector('.percentage');
                const probabilityFill = predictionRows[index].querySelector('.probability-fill');
                
                if (digitElement && percentageElement && probabilityFill) {
                    // Stagger the animations
                    setTimeout(() => {
                        digitElement.textContent = prediction.digit;
                        const percentage = (prediction.probability * 100).toFixed(1);
                        percentageElement.textContent = `${percentage}%`;
                        
                        // Animate the progress bar
                        probabilityFill.style.width = '0%';
                        setTimeout(() => {
                            probabilityFill.style.width = `${percentage}%`;
                        }, 100);
                        
                        // Enhanced blue color gradients per rank
                        if (index === 0) {
                            probabilityFill.style.background = 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #60a5fa 100%)';
                        } else if (index === 1) {
                            probabilityFill.style.background = 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #1e40af 100%)';
                        } else if (index === 2) {
                            probabilityFill.style.background = 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)';
                        }
                        
                        // Add staggered animations
                        predictionRows[index].classList.add('slide-in-left');
                        setTimeout(() => {
                            predictionRows[index].classList.remove('slide-in-left');
                        }, 600);
                    }, index * 100);
                }
            }
        });
    }
    
    updateConfidenceIndicator(confidence) {
        const confidenceFill = document.getElementById('confidenceFill');
        const confidenceText = document.getElementById('confidenceText');
        
        if (confidenceFill && confidenceText) {
            const percentage = (confidence * 100).toFixed(1);
            
            // Animate the confidence bar
            confidenceFill.style.width = '0%';
            setTimeout(() => {
                confidenceFill.style.width = `${percentage}%`;
            }, 200);
            
            confidenceText.textContent = `${percentage}%`;
            
            // Enhanced blue gradient colors based on confidence
            if (confidence > 0.8) {
                confidenceFill.style.background = 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #60a5fa 100%)';
                confidenceFill.style.boxShadow = '0 0 15px var(--accent-glow-strong)';
            } else if (confidence > 0.5) {
                confidenceFill.style.background = 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)';
                confidenceFill.style.boxShadow = '0 0 15px var(--accent-glow)';
            } else {
                confidenceFill.style.background = 'linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)';
                confidenceFill.style.boxShadow = '0 0 15px var(--accent-glow)';
            }
            
            // Add pulse animation for high confidence
            if (confidence > 0.9) {
                confidenceFill.classList.add('pulse');
                setTimeout(() => {
                    confidenceFill.classList.remove('pulse');
                }, 2000);
            }
        }
    }
    
    updateComparisonUI(results) {
        const comparisonContainer = document.getElementById('modelsComparison');
        if (!comparisonContainer) return;
        
        comparisonContainer.innerHTML = '';
        
        // Sort results by confidence
        const sortedResults = Object.entries(results).sort(
            (a, b) => b[1].confidence - a[1].confidence
        );
        
        sortedResults.forEach(([modelId, result], index) => {
            const card = document.createElement('div');
            card.className = 'model-comparison-card';
            
            const config = this.mlModelHandler.getAvailableModels()[modelId];
            const confidence = (result.confidence * 100).toFixed(1);
            const digit = result.topPrediction.digit;
            
            card.innerHTML = `
                <h4>${config.name}</h4>
                <div class="model-comparison-prediction">
                    <span class="digit">${digit}</span>
                    <span class="confidence">${confidence}%</span>
                </div>
                <div class="model-comparison-stats">
                    <div class="stat">Parameters: ${config.parameters}</div>
                    <div class="stat">Accuracy: ${config.accuracy}</div>
                    ${result.fallback ? '<div class="stat">Fallback Mode</div>' : ''}
                    ${result.error ? `<div class="stat error">Error: ${result.error}</div>` : ''}
                </div>
            `;
            
            // Add staggered animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            comparisonContainer.appendChild(card);
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s var(--easing)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.classList.add('fade-in');
            }, index * 100);
        });
    }

    clearComparisonPredictions() {
        const comparisonContainer = document.getElementById('modelsComparison');
        if (comparisonContainer) {
            comparisonContainer.innerHTML = '<p style="text-align: center; color: #94a3b8;">Draw a digit to see model comparisons</p>';
        }
    }

    clearPredictions() {
        if (this.comparisonMode) {
            this.clearComparisonPredictions();
            return;
        }
        
        // Clear main prediction
        const digitElement = document.querySelector('.prediction-item .digit');
        const probabilityElement = document.querySelector('.prediction-item .probability');
        
        if (digitElement && probabilityElement) {
            digitElement.textContent = '-';
            probabilityElement.textContent = '0%';
        }
        
        // Clear top predictions
        const predictionRows = document.querySelectorAll('.prediction-row');
        predictionRows.forEach(row => {
            const digitElement = row.querySelector('.digit');
            const percentageElement = row.querySelector('.percentage');
            const probabilityFill = row.querySelector('.probability-fill');
            
            if (digitElement && percentageElement && probabilityFill) {
                digitElement.textContent = '-';
                percentageElement.textContent = '0%';
                probabilityFill.style.width = '0%';
            }
        });
        
        // Clear confidence indicator
        const confidenceFill = document.getElementById('confidenceFill');
        const confidenceText = document.getElementById('confidenceText');
        
        if (confidenceFill && confidenceText) {
            confidenceFill.style.width = '0%';
            confidenceText.textContent = '0%';
        }
    }
    
    clearCanvas() {
        if (this.canvasDrawer) {
            this.canvasDrawer.clearCanvas();
        }
    }
    
    addToHistory(result) {
        this.predictionHistory.push({
            timestamp: new Date(),
            prediction: result.topPrediction,
            confidence: result.confidence,
            fallback: result.fallback || false
        });
        
        // Keep only last 50 predictions
        if (this.predictionHistory.length > 50) {
            this.predictionHistory = this.predictionHistory.slice(-50);
        }
    }
    
    getPredictionStats() {
        if (this.predictionHistory.length === 0) {
            return null;
        }
        
        const total = this.predictionHistory.length;
        const avgConfidence = this.predictionHistory.reduce((sum, p) => sum + p.confidence, 0) / total;
        const highConfidence = this.predictionHistory.filter(p => p.confidence > 0.8).length;
        
        return {
            totalPredictions: total,
            averageConfidence: avgConfidence,
            highConfidenceCount: highConfidence,
            highConfidencePercentage: (highConfidence / total) * 100
        };
    }
    
    updateModelStatus() {
        if (this.mlModelHandler) {
            const modelInfo = this.mlModelHandler.getModelInfo();
            console.log('Model Status:', modelInfo);
            
            // You could add a status indicator to the UI here
            if (modelInfo.fallback) {
                this.showInfo('Using fallback prediction mode. For better accuracy, please load a trained model.');
            }
        }
    }
    
    onModelLoaded() {
        console.log('Model loaded successfully!');
        this.updateModelStatus();
        // Sync current model selection in UI
        const loadedId = this.mlModelHandler.currentModelId;
        if (loadedId) {
            this.currentModelId = loadedId;
            document.querySelectorAll('.model-card').forEach(card => card.classList.remove('active'));
            const selectedCard = document.querySelector(`[data-model-id="${loadedId}"]`);
            if (selectedCard) selectedCard.classList.add('active');
            this.updateModelInfo();
            this.updateCurrentModelName();
        }
    }
    
    onPredictionError(error) {
        console.error('Prediction error:', error);
        this.showError('Prediction failed. Please try again.');
    }
    
    showError(message) {
        // Create or update error message
        let errorElement = document.getElementById('errorMessage');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'errorMessage';
            errorElement.className = 'error';
            document.querySelector('.container').insertBefore(errorElement, document.querySelector('.main-content'));
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    showInfo(message) {
        // Create or update info message
        let infoElement = document.getElementById('infoMessage');
        if (!infoElement) {
            infoElement = document.createElement('div');
            infoElement.id = 'infoMessage';
            infoElement.className = 'success';
            document.querySelector('.container').insertBefore(infoElement, document.querySelector('.main-content'));
        }
        
        infoElement.textContent = message;
        infoElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            infoElement.style.display = 'none';
        }, 5000);
    }
    
    showWelcomeMessage() {
        this.showInfo('Welcome to DigitRecognizer! Draw a digit on the canvas to get started.');
    }
    
    // Public methods for external access
    getAppInfo() {
        return {
            initialized: this.isInitialized,
            modelInfo: this.mlModelHandler ? this.mlModelHandler.getModelInfo() : null,
            stats: this.getPredictionStats()
        };
    }
    
    // Method to create a simple model for demonstration
    async createSimpleModel() {
        if (this.mlModelHandler) {
            await this.mlModelHandler.createSimpleModel();
            this.updateModelStatus();
        }
    }
}

// Initialize the main application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DigitRecognizerApp();
    
    // Add some global utility functions
    window.clearCanvas = () => window.app.clearCanvas();
    window.clearPredictions = () => window.app.clearPredictions();
    window.getAppInfo = () => window.app.getAppInfo();
    window.createSimpleModel = () => window.app.createSimpleModel();
});

// Add some helpful console commands
console.log('DigitRecognizer App loaded!');
console.log('Available commands:');
console.log('- clearCanvas() - Clear the drawing canvas');
console.log('- clearPredictions() - Clear prediction results');
console.log('- getAppInfo() - Get application information');
console.log('- createSimpleModel() - Create a simple model for demonstration');
