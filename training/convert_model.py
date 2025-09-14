"""
Model Conversion Script
Converts trained Keras model to TensorFlow.js format for web deployment
"""

import tensorflow as tf
import tensorflowjs as tfjs
import os
import argparse

def convert_keras_to_tfjs(keras_model_path, tfjs_model_path):
    """
    Convert Keras model to TensorFlow.js format
    
    Args:
        keras_model_path (str): Path to the Keras .h5 model file
        tfjs_model_path (str): Path where TensorFlow.js model will be saved
    """
    
    print(f"Loading Keras model from {keras_model_path}...")
    
    # Load the Keras model
    model = tf.keras.models.load_model(keras_model_path)
    
    print("Model loaded successfully!")
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
    
    # Create output directory if it doesn't exist
    os.makedirs(tfjs_model_path, exist_ok=True)
    
    print(f"Converting model to TensorFlow.js format...")
    
    # Convert to TensorFlow.js format
    tfjs.converters.save_keras_model(model, tfjs_model_path)
    
    print(f"Model converted successfully!")
    print(f"TensorFlow.js model saved to: {tfjs_model_path}")
    
    # List the generated files
    print("\nGenerated files:")
    for file in os.listdir(tfjs_model_path):
        file_path = os.path.join(tfjs_model_path, file)
        file_size = os.path.getsize(file_path)
        print(f"  - {file} ({file_size:,} bytes)")
    
    return True

def optimize_model_for_web(tfjs_model_path):
    """
    Optimize the TensorFlow.js model for web deployment
    
    Args:
        tfjs_model_path (str): Path to the TensorFlow.js model directory
    """
    
    print("Optimizing model for web deployment...")
    
    # This function could include additional optimizations like:
    # - Quantization
    # - Model pruning
    # - Weight compression
    
    # For now, we'll just report the model size
    total_size = 0
    for file in os.listdir(tfjs_model_path):
        file_path = os.path.join(tfjs_model_path, file)
        total_size += os.path.getsize(file_path)
    
    print(f"Total model size: {total_size:,} bytes ({total_size / 1024 / 1024:.2f} MB)")
    
    if total_size > 5 * 1024 * 1024:  # 5MB
        print("Warning: Model size is larger than 5MB. Consider optimization.")
    else:
        print("Model size is suitable for web deployment.")

def validate_model(tfjs_model_path):
    """
    Validate the converted TensorFlow.js model
    
    Args:
        tfjs_model_path (str): Path to the TensorFlow.js model directory
    """
    
    print("Validating TensorFlow.js model...")
    
    # Check if required files exist
    required_files = ['model.json']
    weight_files = [f for f in os.listdir(tfjs_model_path) if f.endswith('.bin')]
    
    if not weight_files:
        print("Error: No weight files found!")
        return False
    
    for file in required_files:
        file_path = os.path.join(tfjs_model_path, file)
        if not os.path.exists(file_path):
            print(f"Error: Required file {file} not found!")
            return False
    
    print("Model validation passed!")
    print(f"Found {len(weight_files)} weight file(s)")
    
    return True

def create_model_info(tfjs_model_path, keras_model_path):
    """
    Create a model info file with metadata
    
    Args:
        tfjs_model_path (str): Path to the TensorFlow.js model directory
        keras_model_path (str): Path to the original Keras model
    """
    
    print("Creating model info file...")
    
    # Load original model to get info
    model = tf.keras.models.load_model(keras_model_path)
    
    # Calculate model size
    total_size = 0
    for file in os.listdir(tfjs_model_path):
        file_path = os.path.join(tfjs_model_path, file)
        total_size += os.path.getsize(file_path)
    
    # Create info dictionary
    model_info = {
        "name": "Digit Recognizer Model",
        "description": "CNN model for handwritten digit recognition",
        "version": "1.0.0",
        "input_shape": model.input_shape,
        "output_shape": model.output_shape,
        "total_parameters": model.count_params(),
        "model_size_bytes": total_size,
        "model_size_mb": round(total_size / 1024 / 1024, 2),
        "framework": "TensorFlow.js",
        "training_dataset": "MNIST",
        "classes": list(range(10)),
        "class_names": [str(i) for i in range(10)],
        "created_date": tf.timestamp().numpy(),
        "files": os.listdir(tfjs_model_path)
    }
    
    # Save info to JSON file
    import json
    info_path = os.path.join(tfjs_model_path, "model_info.json")
    with open(info_path, 'w') as f:
        json.dump(model_info, f, indent=2, default=str)
    
    print(f"Model info saved to: {info_path}")
    
    return model_info

def main():
    """Main conversion function"""
    
    parser = argparse.ArgumentParser(description='Convert Keras model to TensorFlow.js format')
    parser.add_argument('--input', '-i', 
                       default='models/digit_recognizer_model.h5',
                       help='Path to input Keras model (.h5 file)')
    parser.add_argument('--output', '-o',
                       default='../models/digit-recognizer',
                       help='Path to output TensorFlow.js model directory')
    parser.add_argument('--validate', '-v', action='store_true',
                       help='Validate the converted model')
    parser.add_argument('--optimize', action='store_true',
                       help='Optimize model for web deployment')
    
    args = parser.parse_args()
    
    print("=== Keras to TensorFlow.js Model Conversion ===")
    
    # Check if input file exists
    if not os.path.exists(args.input):
        print(f"Error: Input file {args.input} not found!")
        return
    
    try:
        # Convert model
        success = convert_keras_to_tfjs(args.input, args.output)
        
        if not success:
            print("Conversion failed!")
            return
        
        # Create model info
        model_info = create_model_info(args.output, args.input)
        
        # Optimize if requested
        if args.optimize:
            optimize_model_for_web(args.output)
        
        # Validate if requested
        if args.validate:
            validate_model(args.output)
        
        print("\n=== Conversion Complete ===")
        print(f"Model successfully converted and saved to: {args.output}")
        print(f"Model size: {model_info['model_size_mb']} MB")
        print(f"Total parameters: {model_info['total_parameters']:,}")
        
        print("\nTo use in your web app:")
        print(f"1. Copy the model files to your web server")
        print(f"2. Update the model path in your JavaScript code")
        print(f"3. Load the model using: tf.loadLayersModel('{args.output}/model.json')")
        
    except Exception as e:
        print(f"Error during conversion: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
