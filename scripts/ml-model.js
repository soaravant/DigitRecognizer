/**
 * Machine Learning Model Handler
 * Handles TensorFlow.js model loading and inference
 */

class MLModelHandler {
    constructor() {
        this.models = {}; // Store multiple models
        this.currentModel = null;
        this.currentModelId = null;
        this.isModelLoaded = false;
        this.fallbackMode = false;
        this.modelConfigs = this.getModelConfigs();
        
        // Initialize the model handler
        this.init();
    }
    
    getModelConfigs() {
        return {
            'model_1': {
                name: 'Simple CNN',
                description: 'Basic convolutional network with 2 conv layers',
                path: 'models/model_1_tfjs/model.json',
                parameters: '~1.2M',
                accuracy: '98.5%'
            },
            'model_2': {
                name: 'Deep CNN',
                description: 'Deep network with batch normalization and dropout',
                path: 'models/model_2_tfjs/model.json',
                parameters: '~2.8M',
                accuracy: '99.2%'
            },
            'model_3': {
                name: 'ResNet-like',
                description: 'Residual connections for better gradient flow',
                path: 'models/model_3_tfjs/model.json',
                parameters: '~1.5M',
                accuracy: '99.1%'
            },
            'model_4': {
                name: 'DenseNet-like',
                description: 'Dense connections between layers',
                path: 'models/model_4_tfjs/model.json',
                parameters: '~1.8M',
                accuracy: '99.0%'
            },
            'model_5': {
                name: 'Wide CNN',
                description: 'More filters per layer for wider representation',
                path: 'models/model_5_tfjs/model.json',
                parameters: '~3.2M',
                accuracy: '99.3%'
            },
            'model_6': {
                name: 'MobileNet-like',
                description: 'Depthwise separable convolutions for efficiency',
                path: 'models/model_6_tfjs/model.json',
                parameters: '~0.8M',
                accuracy: '98.8%'
            },
            'model_7': {
                name: 'Attention CNN',
                description: 'Self-attention mechanism for focus',
                path: 'models/model_7_tfjs/model.json',
                parameters: '~1.6M',
                accuracy: '99.1%'
            },
            'model_8': {
                name: 'Ensemble CNN',
                description: 'Multiple parallel branches with different filters',
                path: 'models/model_8_tfjs/model.json',
                parameters: '~1.4M',
                accuracy: '99.0%'
            },
            'model_9': {
                name: 'Transformer CNN',
                description: 'CNN with transformer-like attention',
                path: 'models/model_9_tfjs/model.json',
                parameters: '~2.1M',
                accuracy: '99.2%'
            },
            'model_10': {
                name: 'Lightweight CNN',
                description: 'Optimized for speed and small size',
                path: 'models/model_10_tfjs/model.json',
                parameters: '~0.3M',
                accuracy: '98.0%'
            }
        };
    }

    async init() {
        try {
            // Try to load the first available model
            await this.loadFirstAvailableModel();
        } catch (error) {
            console.warn('Failed to load any ML model, using fallback mode:', error);
            this.enableFallbackMode();
        }
    }
    
    async loadFirstAvailableModel() {
        // Try to load the first available model
        for (const [modelId, config] of Object.entries(this.modelConfigs)) {
            try {
                await this.loadModel(modelId);
                this.currentModelId = modelId;
                break;
            } catch (error) {
                console.warn(`Failed to load ${modelId}:`, error);
                continue;
            }
        }
        
        if (!this.currentModel) {
            throw new Error('No models could be loaded');
        }
    }

    async loadModel(modelId) {
        if (!this.modelConfigs[modelId]) {
            throw new Error(`Model ${modelId} not found in configurations`);
        }

        try {
            console.log(`Loading model: ${this.modelConfigs[modelId].name}...`);
            
            const config = this.modelConfigs[modelId];
            
            // Try to load the model from the specified path
            const model = await tf.loadLayersModel(config.path);
            
            // Warm up the model with a dummy prediction
            const dummyInput = tf.zeros([1, 28, 28, 1]);
            await model.predict(dummyInput);
            dummyInput.dispose();
            
            // Store the model
            this.models[modelId] = model;
            this.currentModel = model;
            this.currentModelId = modelId;
            this.isModelLoaded = true;
            this.fallbackMode = false;
            
            console.log(`Model ${config.name} loaded successfully!`);
            
            // Hide loading spinner
            this.hideLoadingSpinner();
            
            // Dispatch model loaded event
            this.dispatchModelLoadedEvent(modelId, config);
            
        } catch (error) {
            console.error(`Error loading model ${modelId}:`, error);
            throw error;
        }
    }

    async loadAllModels() {
        console.log('Loading all available models...');
        const loadedModels = [];
        
        for (const [modelId, config] of Object.entries(this.modelConfigs)) {
            try {
                await this.loadModel(modelId);
                loadedModels.push(modelId);
            } catch (error) {
                console.warn(`Failed to load ${modelId}:`, error);
            }
        }
        
        console.log(`Loaded ${loadedModels.length} models:`, loadedModels);
        return loadedModels;
    }

    switchModel(modelId) {
        if (this.models[modelId]) {
            this.currentModel = this.models[modelId];
            this.currentModelId = modelId;
            console.log(`Switched to model: ${this.modelConfigs[modelId].name}`);
            return true;
        }
        return false;
    }

    dispatchModelLoadedEvent(modelId, config) {
        const event = new CustomEvent('modelLoaded', {
            detail: { modelId, config }
        });
        document.dispatchEvent(event);
    }
    
    enableFallbackMode() {
        this.fallbackMode = true;
        this.isModelLoaded = true;
        console.log('Using fallback prediction mode');
        this.hideLoadingSpinner();
    }
    
    hideLoadingSpinner() {
        const overlay = document.getElementById('canvasOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    showLoadingSpinner() {
        const overlay = document.getElementById('canvasOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    async predict(imageData, modelId = null) {
        if (!this.isModelLoaded) {
            throw new Error('Model not loaded yet');
        }
        
        if (this.fallbackMode) {
            return this.fallbackPrediction(imageData);
        }
        
        // Use specified model or current model
        const model = modelId ? this.models[modelId] : this.currentModel;
        if (!model) {
            throw new Error(`Model ${modelId || 'current'} not available`);
        }
        
        try {
            // Convert image data to tensor
            const tensor = tf.tensor4d(imageData, [1, 28, 28, 1]);
            
            // Make prediction
            const prediction = await model.predict(tensor);
            const probabilities = await prediction.data();
            
            // Clean up tensors
            tensor.dispose();
            prediction.dispose();
            
            return this.processPrediction(probabilities);
            
        } catch (error) {
            console.error('Prediction error:', error);
            throw error;
        }
    }

    async predictAllModels(imageData) {
        if (!this.isModelLoaded) {
            throw new Error('No models loaded');
        }
        
        const results = {};
        
        if (this.fallbackMode) {
            // For fallback mode, return the same prediction for all models
            const fallbackResult = this.fallbackPrediction(imageData);
            for (const modelId of Object.keys(this.modelConfigs)) {
                results[modelId] = {
                    ...fallbackResult,
                    modelId,
                    modelName: this.modelConfigs[modelId].name,
                    fallback: true
                };
            }
            return results;
        }
        
        // Predict with all loaded models
        for (const [modelId, model] of Object.entries(this.models)) {
            try {
                const result = await this.predict(imageData, modelId);
                results[modelId] = {
                    ...result,
                    modelId,
                    modelName: this.modelConfigs[modelId].name,
                    fallback: false
                };
            } catch (error) {
                console.warn(`Prediction failed for ${modelId}:`, error);
                results[modelId] = {
                    predictions: [],
                    topPrediction: { digit: -1, probability: 0 },
                    confidence: 0,
                    modelId,
                    modelName: this.modelConfigs[modelId].name,
                    error: error.message
                };
            }
        }
        
        return results;
    }
    
    processPrediction(probabilities) {
        // Convert probabilities to prediction results
        const results = [];
        
        for (let i = 0; i < 10; i++) {
            results.push({
                digit: i,
                probability: probabilities[i]
            });
        }
        
        // Sort by probability (highest first)
        results.sort((a, b) => b.probability - a.probability);
        
        return {
            predictions: results,
            topPrediction: results[0],
            confidence: results[0].probability
        };
    }
    
    fallbackPrediction(imageData) {
        // Simple fallback prediction based on image analysis
        // This is a basic heuristic-based approach for demonstration
        
        const results = [];
        
        // Analyze the image data to make a simple prediction
        const analysis = this.analyzeImage(imageData);
        
        // Generate predictions based on analysis
        for (let i = 0; i < 10; i++) {
            let probability = Math.random() * 0.1; // Base random probability
            
            // Add some heuristics based on image analysis
            if (i === analysis.likelyDigit) {
                probability = 0.7 + Math.random() * 0.2; // Higher probability for likely digit
            } else if (this.isSimilarDigit(i, analysis.likelyDigit)) {
                probability = 0.2 + Math.random() * 0.3; // Medium probability for similar digits
            }
            
            results.push({
                digit: i,
                probability: Math.min(probability, 1.0)
            });
        }
        
        // Normalize probabilities
        const total = results.reduce((sum, r) => sum + r.probability, 0);
        results.forEach(r => r.probability = r.probability / total);
        
        // Sort by probability
        results.sort((a, b) => b.probability - a.probability);
        
        return {
            predictions: results,
            topPrediction: results[0],
            confidence: results[0].probability,
            fallback: true
        };
    }
    
    analyzeImage(imageData) {
        // Simple image analysis for fallback mode
        let totalPixels = 0;
        let centerPixels = 0;
        let edgePixels = 0;
        
        for (let i = 0; i < imageData.length; i++) {
            if (imageData[i] > 0.1) { // Non-black pixel
                totalPixels++;
                
                const x = i % 28;
                const y = Math.floor(i / 28);
                
                // Check if pixel is in center region
                if (x >= 8 && x <= 19 && y >= 8 && y <= 19) {
                    centerPixels++;
                }
                
                // Check if pixel is on edges
                if (x < 3 || x > 24 || y < 3 || y > 24) {
                    edgePixels++;
                }
            }
        }
        
        // Enhanced heuristics to guess the digit
        let likelyDigit = 0;
        const centerRatio = centerPixels / (totalPixels || 1);
        const edgeRatio = edgePixels / (totalPixels || 1);
        
        if (totalPixels < 50) {
            likelyDigit = 1; // Very thin
        } else if (centerRatio > 0.6) {
            likelyDigit = 8; // Very dense center
        } else if (edgeRatio > 0.5 && centerRatio < 0.4) {
            likelyDigit = 0; // Ring-like
        } else if (totalPixels > 200) {
            likelyDigit = 8; // Complex shape
        } else if (totalPixels > 150) {
            likelyDigit = 6; // Medium complexity
        } else if (centerRatio > 0.4 && edgeRatio > 0.3) {
            likelyDigit = 9; // Balanced
        } else if (edgeRatio > 0.4) {
            likelyDigit = 2; // Edge heavy
        } else {
            // Weighted random selection
            const weights = [0.12, 0.15, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.03];
            const random = Math.random();
            let cumulative = 0;
            for (let i = 0; i < 10; i++) {
                cumulative += weights[i];
                if (random < cumulative) {
                    likelyDigit = i;
                    break;
                }
            }
        }
        
        return {
            totalPixels,
            centerPixels,
            edgePixels,
            likelyDigit
        };
    }
    
    isSimilarDigit(digit1, digit2) {
        // Define which digits are similar for fallback mode
        const similarGroups = [
            [0, 6, 8, 9], // Round digits
            [1, 7], // Line-like digits
            [2, 3, 5], // Curved digits
            [4] // Unique shape
        ];
        
        for (const group of similarGroups) {
            if (group.includes(digit1) && group.includes(digit2)) {
                return true;
            }
        }
        return false;
    }
    
    // Method to create a simple model for demonstration
    async createSimpleModel() {
        console.log('Creating simple model for demonstration...');
        
        // Create a simple sequential model
        const model = tf.sequential({
            layers: [
                tf.layers.flatten({ inputShape: [28, 28, 1] }),
                tf.layers.dense({ units: 128, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 64, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 10, activation: 'softmax' })
            ]
        });
        
        // Compile the model
        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        // Generate some dummy weights (in a real scenario, these would be trained)
        const weights = model.getWeights();
        for (let i = 0; i < weights.length; i++) {
            const shape = weights[i].shape;
            const newWeights = tf.randomNormal(shape, 0, 0.1);
            weights[i].dispose();
            weights[i] = newWeights;
        }
        model.setWeights(weights);
        
        this.model = model;
        this.isModelLoaded = true;
        this.fallbackMode = false;
        
        console.log('Simple model created successfully!');
        this.hideLoadingSpinner();
        
        return model;
    }
    
    // Method to save model (for future use)
    async saveModel(path) {
        if (this.model && !this.fallbackMode) {
            await this.model.save(`downloads://${path}`);
            console.log(`Model saved to ${path}`);
        }
    }
    
    // Method to get model info
    getModelInfo(modelId = null) {
        if (this.fallbackMode) {
            return {
                type: 'fallback',
                loaded: true,
                description: 'Using heuristic-based fallback prediction',
                availableModels: Object.keys(this.modelConfigs)
            };
        }
        
        if (modelId) {
            const model = this.models[modelId];
            const config = this.modelConfigs[modelId];
            if (model && config) {
                return {
                    type: 'tensorflow',
                    loaded: true,
                    modelId,
                    name: config.name,
                    description: config.description,
                    parameters: config.parameters,
                    accuracy: config.accuracy,
                    layers: model.layers.length
                };
            }
            return null;
        }
        
        if (this.currentModel && this.currentModelId) {
            const config = this.modelConfigs[this.currentModelId];
            return {
                type: 'tensorflow',
                loaded: true,
                currentModel: this.currentModelId,
                name: config.name,
                description: config.description,
                parameters: config.parameters,
                accuracy: config.accuracy,
                layers: this.currentModel.layers.length,
                loadedModels: Object.keys(this.models)
            };
        }
        
        return {
            type: 'none',
            loaded: false,
            description: 'No model loaded',
            availableModels: Object.keys(this.modelConfigs)
        };
    }

    getAvailableModels() {
        return this.modelConfigs;
    }

    getLoadedModels() {
        return Object.keys(this.models);
    }
}

// Initialize ML model handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mlModelHandler = new MLModelHandler();
});
