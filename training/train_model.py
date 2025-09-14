"""
Digit Recognition Model Training Script
Trains a CNN model on MNIST dataset for handwritten digit recognition
"""

import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras import layers, models
from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import classification_report, confusion_matrix
import os

class DigitRecognizerTrainer:
    def __init__(self):
        self.model = None
        self.history = None
        self.x_train = None
        self.x_test = None
        self.y_train = None
        self.y_test = None
        
    def load_data(self):
        """Load and preprocess MNIST dataset"""
        print("Loading MNIST dataset...")
        
        # Load MNIST data
        (self.x_train, self.y_train), (self.x_test, self.y_test) = mnist.load_data()
        
        # Normalize pixel values to 0-1 range
        self.x_train = self.x_train.astype('float32') / 255.0
        self.x_test = self.x_test.astype('float32') / 255.0
        
        # Reshape data for CNN (add channel dimension)
        self.x_train = self.x_train.reshape(-1, 28, 28, 1)
        self.x_test = self.x_test.reshape(-1, 28, 28, 1)
        
        # Convert labels to categorical
        self.y_train = to_categorical(self.y_train, 10)
        self.y_test = to_categorical(self.y_test, 10)
        
        print(f"Training data shape: {self.x_train.shape}")
        print(f"Test data shape: {self.x_test.shape}")
        print(f"Training labels shape: {self.y_train.shape}")
        print(f"Test labels shape: {self.y_test.shape}")
        
    def create_model(self):
        """Create CNN model architecture"""
        print("Creating model architecture...")
        
        model = models.Sequential([
            # First convolutional block
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
            layers.BatchNormalization(),
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Second convolutional block
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Third convolutional block
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.25),
            
            # Dense layers
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(10, activation='softmax')
        ])
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        print("Model created successfully!")
        print(f"Total parameters: {model.count_params():,}")
        
        return model
    
    def train_model(self, epochs=10, batch_size=128, validation_split=0.1):
        """Train the model"""
        print(f"Starting training for {epochs} epochs...")
        
        # Data augmentation
        datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rotation_range=10,
            width_shift_range=0.1,
            height_shift_range=0.1,
            zoom_range=0.1
        )
        
        # Training callbacks
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=3,
                restore_best_weights=True
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=2,
                min_lr=0.0001
            )
        ]
        
        # Train model
        self.history = self.model.fit(
            datagen.flow(self.x_train, self.y_train, batch_size=batch_size),
            steps_per_epoch=len(self.x_train) // batch_size,
            epochs=epochs,
            validation_data=(self.x_test, self.y_test),
            callbacks=callbacks,
            verbose=1
        )
        
        print("Training completed!")
        
    def evaluate_model(self):
        """Evaluate model performance"""
        print("Evaluating model...")
        
        # Test accuracy
        test_loss, test_accuracy = self.model.evaluate(self.x_test, self.y_test, verbose=0)
        print(f"Test Accuracy: {test_accuracy:.4f}")
        print(f"Test Loss: {test_loss:.4f}")
        
        # Predictions
        y_pred = self.model.predict(self.x_test)
        y_pred_classes = np.argmax(y_pred, axis=1)
        y_true_classes = np.argmax(self.y_test, axis=1)
        
        # Classification report
        print("\nClassification Report:")
        print(classification_report(y_true_classes, y_pred_classes))
        
        # Confusion matrix
        cm = confusion_matrix(y_true_classes, y_pred_classes)
        print("\nConfusion Matrix:")
        print(cm)
        
        return test_accuracy, test_loss
    
    def plot_training_history(self):
        """Plot training history"""
        if self.history is None:
            print("No training history available")
            return
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Plot accuracy
        ax1.plot(self.history.history['accuracy'], label='Training Accuracy')
        ax1.plot(self.history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Plot loss
        ax2.plot(self.history.history['loss'], label='Training Loss')
        ax2.plot(self.history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
        
    def save_model(self, model_path='digit_recognizer_model'):
        """Save the trained model"""
        print(f"Saving model to {model_path}...")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save model
        self.model.save(f"{model_path}.h5")
        print(f"Model saved as {model_path}.h5")
        
        # Save model summary
        with open(f"{model_path}_summary.txt", 'w') as f:
            self.model.summary(print_fn=lambda x: f.write(x + '\n'))
        
        print(f"Model summary saved as {model_path}_summary.txt")
        
    def predict_sample(self, num_samples=5):
        """Make predictions on sample test images"""
        print(f"Making predictions on {num_samples} sample images...")
        
        # Get random samples
        indices = np.random.choice(len(self.x_test), num_samples, replace=False)
        sample_images = self.x_test[indices]
        sample_labels = np.argmax(self.y_test[indices], axis=1)
        
        # Make predictions
        predictions = self.model.predict(sample_images)
        predicted_classes = np.argmax(predictions, axis=1)
        
        # Display results
        fig, axes = plt.subplots(1, num_samples, figsize=(15, 3))
        if num_samples == 1:
            axes = [axes]
        
        for i, (img, true_label, pred_label, confidence) in enumerate(zip(
            sample_images, sample_labels, predicted_classes, 
            np.max(predictions, axis=1)
        )):
            axes[i].imshow(img.reshape(28, 28), cmap='gray')
            axes[i].set_title(f'True: {true_label}, Pred: {pred_label}\nConf: {confidence:.3f}')
            axes[i].axis('off')
        
        plt.tight_layout()
        plt.savefig('sample_predictions.png', dpi=300, bbox_inches='tight')
        plt.show()

def main():
    """Main training function"""
    print("=== Digit Recognition Model Training ===")
    
    # Initialize trainer
    trainer = DigitRecognizerTrainer()
    
    # Load data
    trainer.load_data()
    
    # Create model
    model = trainer.create_model()
    
    # Display model architecture
    model.summary()
    
    # Train model
    trainer.train_model(epochs=15, batch_size=128)
    
    # Evaluate model
    accuracy, loss = trainer.evaluate_model()
    
    # Plot training history
    trainer.plot_training_history()
    
    # Make sample predictions
    trainer.predict_sample(num_samples=10)
    
    # Save model
    trainer.save_model('models/digit_recognizer_model')
    
    print(f"\n=== Training Complete ===")
    print(f"Final Test Accuracy: {accuracy:.4f}")
    print(f"Final Test Loss: {loss:.4f}")
    print("Model saved successfully!")

if __name__ == "__main__":
    main()
