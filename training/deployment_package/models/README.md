# Models Directory

This directory contains the machine learning models for the DigitRecognizer application.

## Files

- `demo-model.json` - Demo model topology (for testing without training)
- `digit-recognizer.json` - Main trained model (created after training)
- `*.weights.bin` - Model weight files (binary format)

## Getting Started

### Option 1: Use Demo Mode
The application will automatically fall back to a heuristic-based prediction system if no trained model is found. This allows you to test the interface immediately.

### Option 2: Train Your Own Model
1. Run the training script:
   ```bash
   cd training
   python train_model.py
   ```

2. Convert to TensorFlow.js format:
   ```bash
   python convert_model.py
   ```

3. The converted model files will be placed in this directory.

## Model Information

- **Input**: 28x28 grayscale images
- **Output**: 10 classes (digits 0-9)
- **Format**: TensorFlow.js Layers Model
- **Size**: <5MB (optimized for web)

## Notes

- The demo model is a simple placeholder and will not provide accurate predictions
- For best results, train your own model using the provided training scripts
- Model files are automatically loaded by the application
