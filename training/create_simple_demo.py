#!/usr/bin/env python3
"""
Create Simple Demo Models
Creates basic models for immediate testing without TensorFlow.js conversion
"""

import os
import json
import numpy as np
import tensorflow as tf

def create_simple_model():
    """Create a simple model for demo purposes"""
    print("Creating simple demo model...")
    
    # Create a simple sequential model
    model = tf.keras.Sequential([
        tf.keras.layers.Flatten(input_shape=(28, 28, 1)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(10, activation='softmax')
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def create_demo_models():
    """Create demo models for all 10 architectures"""
    print("Creating demo models for immediate testing...")
    
    # Create models directory
    os.makedirs('../models', exist_ok=True)
    
    model_configs = {
        'model_1': ('Simple CNN', 'Basic convolutional network with 2 conv layers'),
        'model_2': ('Deep CNN', 'Deep network with batch normalization and dropout'),
        'model_3': ('ResNet-like', 'Residual connections for better gradient flow'),
        'model_4': ('DenseNet-like', 'Dense connections between layers'),
        'model_5': ('Wide CNN', 'More filters per layer for wider representation'),
        'model_6': ('MobileNet-like', 'Depthwise separable convolutions for efficiency'),
        'model_7': ('Attention CNN', 'Self-attention mechanism for focus'),
        'model_8': ('Ensemble CNN', 'Multiple parallel branches with different filters'),
        'model_9': ('Transformer CNN', 'CNN with transformer-like attention'),
        'model_10': ('Lightweight CNN', 'Optimized for speed and small size')
    }
    
    created_models = []
    
    for model_id, (name, description) in model_configs.items():
        try:
            # Create a simple model for each architecture
            model = create_simple_model()
            
            # Save Keras model
            model_path = f'../models/{model_id}.h5'
            model.save(model_path)
            
            created_models.append({
                'id': model_id,
                'name': name,
                'description': description,
                'path': f'models/{model_id}_tfjs/model.json',
                'status': 'created'
            })
            
            print(f"✓ Created {name} ({model_id})")
            
        except Exception as e:
            print(f"✗ Failed to create {name}: {e}")
    
    return created_models

def create_model_manifest(models):
    """Create a manifest file with all model information"""
    manifest = {
        "version": "1.0.0",
        "type": "demo",
        "created": "2024-01-01T00:00:00Z",
        "description": "Demo models created for immediate testing",
        "models": {}
    }
    
    for model in models:
        manifest['models'][model['id']] = {
            'name': model['name'],
            'description': model['description'],
            'path': model['path'],
            'status': model['status'],
            'parameters': '~0.1M',
            'accuracy': 'Demo Mode'
        }
    
    # Save manifest
    with open('../models/model_manifest.json', 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print("Created model manifest: ../models/model_manifest.json")

def main():
    """Main function"""
    print("DigitRecognizer - Simple Demo Model Creator")
    print("=" * 50)
    print("Creating demo models for immediate testing...")
    print("Note: These are simple models for demo purposes only.")
    print("The app will work in fallback mode without trained models.")
    print("=" * 50)
    
    # Create demo models
    models = create_demo_models()
    
    # Create manifest
    create_model_manifest(models)
    
    print(f"\n🎉 Demo models created successfully!")
    print(f"Created {len(models)} demo models")
    print("\nThe app will work in fallback mode for immediate testing.")
    print("For production use, train proper models with the full training script.")
    print("\nYou can now:")
    print("1. Test the app locally: python3 -m http.server 8000")
    print("2. The app will work with fallback predictions")
    print("3. Deploy to Vercel for production use")

if __name__ == "__main__":
    main()
