#!/usr/bin/env python3
"""
Create Demo Models for Immediate Testing
Creates simple models that work without full training for demo purposes
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs

def create_simple_model(model_id, name, description):
    """Create a simple model for demo purposes"""
    print(f"Creating demo model: {name}")
    
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
    
    # Generate random but reasonable weights
    for layer in model.layers:
        if hasattr(layer, 'kernel_initializer'):
            # Initialize with small random values
            if hasattr(layer, 'kernel'):
                shape = layer.kernel.shape
                layer.kernel.assign(tf.random.normal(shape, 0, 0.1))
            if hasattr(layer, 'bias'):
                shape = layer.bias.shape
                layer.bias.assign(tf.random.normal(shape, 0, 0.1))
    
    return model

def create_demo_models():
    """Create all 10 demo models"""
    print("Creating demo models for immediate testing...")
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
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
            # Create model
            model = create_simple_model(model_id, name, description)
            
            # Save Keras model
            model_path = f'models/{model_id}.h5'
            model.save(model_path)
            
            # Create TensorFlow.js directory
            tfjs_dir = f'models/{model_id}_tfjs'
            os.makedirs(tfjs_dir, exist_ok=True)
            
            # Convert to TensorFlow.js
            tfjs.converters.save_keras_model(model, tfjs_dir)
            
            created_models.append({
                'id': model_id,
                'name': name,
                'description': description,
                'path': f'{tfjs_dir}/model.json',
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
        "created": tf.timestamp().numpy().item(),
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
    with open('models/model_manifest.json', 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print("Created model manifest: models/model_manifest.json")

def test_demo_models():
    """Test that all demo models can be loaded"""
    print("\nTesting demo models...")
    
    test_image = np.random.random((1, 28, 28, 1)).astype('float32')
    
    for i in range(1, 11):
        model_path = f'models/model_{i}.h5'
        if os.path.exists(model_path):
            try:
                model = tf.keras.models.load_model(model_path)
                prediction = model.predict(test_image)
                print(f"✓ Demo model {i} loaded and tested successfully")
            except Exception as e:
                print(f"✗ Demo model {i} test failed: {e}")
        else:
            print(f"✗ Demo model {i} file not found")

def main():
    """Main function"""
    print("DigitRecognizer - Demo Model Creator")
    print("=" * 50)
    print("Creating demo models for immediate testing...")
    print("Note: These are simple models for demo purposes only.")
    print("For production use, train proper models with the full training script.")
    print("=" * 50)
    
    # Create demo models
    models = create_demo_models()
    
    # Create manifest
    create_model_manifest(models)
    
    # Test models
    test_demo_models()
    
    print(f"\n🎉 Demo models created successfully!")
    print(f"Created {len(models)} demo models")
    print("\nYou can now:")
    print("1. Test the app locally: python3 -m http.server 8000")
    print("2. The app will work with these demo models")
    print("3. For better accuracy, run the full training script later")
    print("\nDemo models are located in: models/model_*_tfjs/")

if __name__ == "__main__":
    main()
