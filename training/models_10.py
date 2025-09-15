"""
10 Different Model Architectures for Digit Recognition
Creates and trains 10 different neural network architectures for comparison
"""

import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import classification_report, confusion_matrix
import os
import json
from datetime import datetime

class ModelTrainer:
    def __init__(self):
        self.models = {}
        self.histories = {}
        self.results = {}
        self.x_train = None
        self.x_test = None
        self.y_train = None
        self.y_test = None
        self.image_size = 50
        
    def load_data(self):
        """Load and preprocess MNIST dataset"""
        print("Loading MNIST dataset...")
        
        (self.x_train, self.y_train), (self.x_test, self.y_test) = mnist.load_data()
        
        # Normalize pixel values to 0-1 range
        self.x_train = self.x_train.astype('float32') / 255.0
        self.x_test = self.x_test.astype('float32') / 255.0
        
        # Reshape data for CNN (add channel dimension)
        self.x_train = self.x_train.reshape(-1, 28, 28, 1)
        self.x_test = self.x_test.reshape(-1, 28, 28, 1)
        
        # Resize to 50x50 to match app input
        self.x_train = tf.image.resize(self.x_train, [self.image_size, self.image_size], method='bilinear').numpy()
        self.x_test = tf.image.resize(self.x_test, [self.image_size, self.image_size], method='bilinear').numpy()
        
        # Convert labels to categorical
        self.y_train = to_categorical(self.y_train, 10)
        self.y_test = to_categorical(self.y_test, 10)
        
        print(f"Training data shape: {self.x_train.shape}")
        print(f"Test data shape: {self.x_test.shape}")
        
    def create_model_1_simple_cnn(self):
        """Model 1: Simple CNN - Basic convolutional network"""
        model = models.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(self.image_size, self.image_size, 1)),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Flatten(),
            layers.Dense(128, activation='relu'),
            layers.Dense(10, activation='softmax')
        ])
        return model, "Simple CNN"
    
    def create_model_2_deep_cnn(self):
        """Model 2: Deep CNN - More layers with batch normalization"""
        model = models.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(self.image_size, self.image_size, 1)),
            layers.BatchNormalization(),
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.25),
            
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(10, activation='softmax')
        ])
        return model, "Deep CNN"
    
    def create_model_3_resnet_like(self):
        """Model 3: ResNet-like - Residual connections"""
        inputs = layers.Input(shape=(self.image_size, self.image_size, 1))
        
        # Initial convolution
        x = layers.Conv2D(32, (3, 3), padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        # Residual block 1
        residual = x
        x = layers.Conv2D(32, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(32, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Add()([x, residual])
        x = layers.Activation('relu')(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Residual block 2
        residual = layers.Conv2D(64, (1, 1))(x)  # Adjust dimensions
        x = layers.Conv2D(64, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(64, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Add()([x, residual])
        x = layers.Activation('relu')(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Global average pooling and dense layers
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(10, activation='softmax')(x)
        
        model = models.Model(inputs, x)
        return model, "ResNet-like"
    
    def create_model_4_dense_net(self):
        """Model 4: DenseNet-like - Dense connections"""
        inputs = layers.Input(shape=(self.image_size, self.image_size, 1))
        
        # Initial convolution
        x = layers.Conv2D(32, (3, 3), padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        # Dense block 1
        x1 = layers.Conv2D(32, (3, 3), padding='same')(x)
        x1 = layers.BatchNormalization()(x1)
        x1 = layers.Activation('relu')(x1)
        x = layers.Concatenate()([x, x1])
        
        x2 = layers.Conv2D(32, (3, 3), padding='same')(x)
        x2 = layers.BatchNormalization()(x2)
        x2 = layers.Activation('relu')(x2)
        x = layers.Concatenate()([x, x2])
        
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Dense block 2
        x3 = layers.Conv2D(64, (3, 3), padding='same')(x)
        x3 = layers.BatchNormalization()(x3)
        x3 = layers.Activation('relu')(x3)
        x = layers.Concatenate()([x, x3])
        
        x4 = layers.Conv2D(64, (3, 3), padding='same')(x)
        x4 = layers.BatchNormalization()(x4)
        x4 = layers.Activation('relu')(x4)
        x = layers.Concatenate()([x, x4])
        
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(10, activation='softmax')(x)
        
        model = models.Model(inputs, x)
        return model, "DenseNet-like"
    
    def create_model_5_wide_cnn(self):
        """Model 5: Wide CNN - More filters per layer"""
        model = models.Sequential([
            layers.Conv2D(64, (3, 3), activation='relu', input_shape=(self.image_size, self.image_size, 1)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            
            layers.Conv2D(256, (3, 3), activation='relu'),
            layers.Conv2D(256, (3, 3), activation='relu'),
            
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.Dense(256, activation='relu'),
            layers.Dense(10, activation='softmax')
        ])
        return model, "Wide CNN"
    
    def create_model_6_mobile_net(self):
        """Model 6: MobileNet-like - Depthwise separable convolutions"""
        inputs = layers.Input(shape=(self.image_size, self.image_size, 1))
        
        # Depthwise separable convolution
        x = layers.DepthwiseConv2D((3, 3), padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(32, (1, 1))(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Another depthwise separable convolution
        x = layers.DepthwiseConv2D((3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(64, (1, 1))(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        x = layers.MaxPooling2D((2, 2))(x)
        
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(10, activation='softmax')(x)
        
        model = models.Model(inputs, x)
        return model, "MobileNet-like"
    
    def create_model_7_attention_cnn(self):
        """Model 7: CNN with Attention - Self-attention mechanism"""
        inputs = layers.Input(shape=(self.image_size, self.image_size, 1))
        
        # Feature extraction
        x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Attention mechanism (simplified)
        attention = layers.Conv2D(1, (1, 1), activation='sigmoid')(x)
        x = layers.Multiply()([x, attention])
        
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(10, activation='softmax')(x)
        
        model = models.Model(inputs, x)
        return model, "Attention CNN"
    
    def create_model_8_ensemble_cnn(self):
        """Model 8: Ensemble CNN - Multiple parallel branches"""
        inputs = layers.Input(shape=(self.image_size, self.image_size, 1))
        
        # Branch 1: Small filters
        branch1 = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
        branch1 = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(branch1)
        branch1 = layers.MaxPooling2D((2, 2))(branch1)
        branch1 = layers.GlobalAveragePooling2D()(branch1)
        
        # Branch 2: Large filters
        branch2 = layers.Conv2D(32, (5, 5), activation='relu', padding='same')(inputs)
        branch2 = layers.Conv2D(32, (5, 5), activation='relu', padding='same')(branch2)
        branch2 = layers.MaxPooling2D((2, 2))(branch2)
        branch2 = layers.GlobalAveragePooling2D()(branch2)
        
        # Branch 3: 1x1 convolutions
        branch3 = layers.Conv2D(32, (1, 1), activation='relu')(inputs)
        branch3 = layers.Conv2D(32, (1, 1), activation='relu')(branch3)
        branch3 = layers.GlobalAveragePooling2D()(branch3)
        
        # Concatenate branches
        x = layers.Concatenate()([branch1, branch2, branch3])
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(10, activation='softmax')(x)
        
        model = models.Model(inputs, x)
        return model, "Ensemble CNN"
    
    def create_model_9_transformer_cnn(self):
        """Model 9: CNN with Transformer-like attention"""
        inputs = layers.Input(shape=(self.image_size, self.image_size, 1))
        
        # CNN feature extraction
        x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = layers.MaxPooling2D((2, 2))(x)
        
        # Reshape for attention
        batch_size = tf.shape(x)[0]
        height, width, channels = x.shape[1], x.shape[2], x.shape[3]
        x_flat = layers.Reshape((height * width, channels))(x)
        
        # Multi-head attention (simplified)
        attention = layers.MultiHeadAttention(num_heads=4, key_dim=channels)
        x_attended = attention(x_flat, x_flat)
        x_attended = layers.Add()([x_flat, x_attended])
        x_attended = layers.LayerNormalization()(x_attended)
        
        # Global average pooling
        x = layers.GlobalAveragePooling1D()(x_attended)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(10, activation='softmax')(x)
        
        model = models.Model(inputs, x)
        return model, "Transformer CNN"
    
    def create_model_10_lightweight_cnn(self):
        """Model 10: Lightweight CNN - Optimized for speed"""
        model = models.Sequential([
            layers.Conv2D(16, (3, 3), activation='relu', input_shape=(self.image_size, self.image_size, 1)),
            layers.MaxPooling2D((2, 2)),
            
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            
            layers.Conv2D(64, (3, 3), activation='relu'),
            
            layers.Flatten(),
            layers.Dense(64, activation='relu'),
            layers.Dense(10, activation='softmax')
        ])
        return model, "Lightweight CNN"
    
    def create_all_models(self):
        """Create all 10 models"""
        model_creators = [
            self.create_model_1_simple_cnn,
            self.create_model_2_deep_cnn,
            self.create_model_3_resnet_like,
            self.create_model_4_dense_net,
            self.create_model_5_wide_cnn,
            self.create_model_6_mobile_net,
            self.create_model_7_attention_cnn,
            self.create_model_8_ensemble_cnn,
            self.create_model_9_transformer_cnn,
            self.create_model_10_lightweight_cnn
        ]
        
        for i, creator in enumerate(model_creators, 1):
            model, name = creator()
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            self.models[f"model_{i}"] = {
                'model': model,
                'name': name,
                'id': f"model_{i}"
            }
            print(f"Created {name} (Model {i})")
    
    def train_model(self, model_id, epochs=10, batch_size=128):
        """Train a specific model"""
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        
        model_info = self.models[model_id]
        model = model_info['model']
        name = model_info['name']
        
        print(f"\nTraining {name}...")
        
        # Data augmentation
        datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rotation_range=10,
            width_shift_range=0.1,
            height_shift_range=0.1,
            zoom_range=0.1
        )
        
        # Callbacks
        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=3,
                restore_best_weights=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=2,
                min_lr=0.0001
            )
        ]
        
        # Train
        history = model.fit(
            datagen.flow(self.x_train, self.y_train, batch_size=batch_size),
            steps_per_epoch=len(self.x_train) // batch_size,
            epochs=epochs,
            validation_data=(self.x_test, self.y_test),
            callbacks=callbacks_list,
            verbose=0
        )
        
        self.histories[model_id] = history
        
        # Evaluate
        test_loss, test_accuracy = model.evaluate(self.x_test, self.y_test, verbose=0)
        
        self.results[model_id] = {
            'test_accuracy': test_accuracy,
            'test_loss': test_loss,
            'name': name,
            'parameters': model.count_params()
        }
        
        print(f"{name} - Test Accuracy: {test_accuracy:.4f}, Parameters: {model.count_params():,}")
        
        return history
    
    def train_all_models(self, epochs=10):
        """Train all models"""
        print("Training all 10 models...")
        
        for model_id in self.models.keys():
            try:
                self.train_model(model_id, epochs=epochs)
            except Exception as e:
                print(f"Error training {model_id}: {e}")
                continue
        
        print("\nTraining completed!")
        self.print_results()
    
    def print_results(self):
        """Print training results"""
        print("\n" + "="*60)
        print("TRAINING RESULTS SUMMARY")
        print("="*60)
        
        # Sort by accuracy
        sorted_results = sorted(
            self.results.items(),
            key=lambda x: x[1]['test_accuracy'],
            reverse=True
        )
        
        for i, (model_id, result) in enumerate(sorted_results, 1):
            print(f"{i:2d}. {result['name']:<20} | "
                  f"Accuracy: {result['test_accuracy']:.4f} | "
                  f"Parameters: {result['parameters']:,}")
        
        print("="*60)
    
    def save_all_models(self, base_path='models'):
        """Save all trained models"""
        os.makedirs(base_path, exist_ok=True)
        
        for model_id, model_info in self.models.items():
            model = model_info['model']
            name = model_info['name']
            
            # Save Keras model
            model_path = os.path.join(base_path, f"{model_id}.h5")
            model.save(model_path)
            print(f"Saved {name} to {model_path}")
        
        # Save results summary
        results_path = os.path.join(base_path, 'training_results.json')
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        print(f"Results saved to {results_path}")
    
    def plot_comparison(self):
        """Plot comparison of all models"""
        if not self.histories:
            print("No training histories available")
            return
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Plot accuracies
        for model_id, history in self.histories.items():
            name = self.models[model_id]['name']
            ax1.plot(history.history['val_accuracy'], label=name, alpha=0.7)
        
        ax1.set_title('Validation Accuracy Comparison')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax1.grid(True)
        
        # Plot losses
        for model_id, history in self.histories.items():
            name = self.models[model_id]['name']
            ax2.plot(history.history['val_loss'], label=name, alpha=0.7)
        
        ax2.set_title('Validation Loss Comparison')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig('model_comparison.png', dpi=300, bbox_inches='tight')
        plt.show()

def main():
    """Main training function"""
    print("=== Training 10 Different Model Architectures ===")
    
    trainer = ModelTrainer()
    
    # Load data
    trainer.load_data()
    
    # Create all models
    trainer.create_all_models()
    
    # Train all models
    trainer.train_all_models(epochs=15)
    
    # Save models
    trainer.save_all_models()
    
    # Plot comparison
    trainer.plot_comparison()
    
    print("\n=== Training Complete ===")
    print("All 10 models have been trained and saved!")
    print("Check the 'models' directory for saved models.")

if __name__ == "__main__":
    main()
