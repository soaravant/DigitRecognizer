# Numberly - Handwritten Digit Recognition Web App

A modern web application that uses machine learning to recognize handwritten digits in real-time. Draw numbers on a 200x200px canvas and watch AI predict them instantly using TensorFlow.js with 10 different model architectures for comparison.

![DigitRecognizer Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=DigitRecognizer+Demo)

## 🚀 Features

- **Interactive Canvas**: Draw digits with mouse or touch input
- **Real-time Recognition**: Instant AI predictions as you draw
- **10 Model Architectures**: Compare different AI models side-by-side
- **Model Comparison**: Switch between single model view and comparison mode
- **Modern UI**: Beautiful, responsive three-pane layout
- **Multiple Predictions**: See top 3 predictions with confidence scores
- **Mobile Friendly**: Works on desktop, tablet, and mobile devices
- **Fallback Mode**: Works even without trained models
- **Brush Controls**: Adjustable brush size for different line thickness
- **Auto-Reload Development**: Automatic browser refresh during development

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Machine Learning**: TensorFlow.js
- **Canvas API**: HTML5 Canvas for drawing
- **Model Training**: Python, TensorFlow/Keras
- **Styling**: CSS Grid, Flexbox, CSS Animations

## 📁 Project Structure

```
DigitRecognizer/
├── index.html                 # Main HTML file
├── styles/
│   └── main.css              # Main stylesheet
├── scripts/
│   ├── canvas.js             # Canvas drawing functionality
│   ├── ml-model.js           # TensorFlow.js model handling
│   └── app.js                # Main application logic
├── models/
│   └── digit-recognizer.json # Pre-trained model (TensorFlow.js format)
├── training/
│   ├── train_model.py        # Python script to train the model
│   ├── convert_model.py      # Script to convert model to TensorFlow.js
│   └── requirements.txt      # Python dependencies
├── assets/
│   └── images/               # Static images/icons
├── README.md                 # This file
└── plan.md                   # Detailed implementation plan
```

## 🚀 Quick Start

### Development Mode (Recommended)
```bash
# Start development server with auto-reload
./dev.sh

# Or use npm script
npm run dev

# Or run directly
python3 simple_dev_server.py
```

The development server will:
- Start on http://localhost:8000
- Automatically open your browser
- Watch for file changes and reload the browser
- Show console messages when files change

### Option 1: Use the Web App (No Training Required)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/DigitRecognizer.git
   cd DigitRecognizer
   ```

2. **Open in browser**
   ```bash
   # Using Python's built-in server
   python -m http.server 8000
   
   # Or using Node.js
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **Start drawing!**
   - The app will work in fallback mode without a trained model
   - Draw digits on the canvas and see predictions

### Option 2: Train Your Own Model

1. **Set up Python environment**
   ```bash
   cd training
   pip install -r requirements.txt
   ```

2. **Train the model**
   ```bash
   python train_model.py
   ```

3. **Convert to TensorFlow.js format**
   ```bash
   python convert_model.py --input models/digit_recognizer_model.h5 --output ../models/digit-recognizer
   ```

4. **Run the web app**
   ```bash
   cd ..
   python -m http.server 8000
   ```

## 🎯 How to Use

1. **Draw a digit**: Use your mouse or touch to draw a number (0-9) on the canvas
2. **See predictions**: Watch real-time AI predictions with confidence scores
3. **Clear canvas**: Click the "Clear Canvas" button or press 'C' key
4. **Adjust brush**: Use the brush size slider for different line thickness
5. **View details**: See top 3 predictions with probability bars

## 🧠 Machine Learning Details

### Model Architecture
- **Type**: Convolutional Neural Network (CNN)
- **Input**: 28x28 grayscale images
- **Output**: 10 classes (digits 0-9)
- **Architecture**:
  - 3 Convolutional blocks with Batch Normalization
  - MaxPooling and Dropout for regularization
  - Dense layers with dropout
  - Softmax output layer

### Training Details
- **Dataset**: MNIST (60,000 training, 10,000 test images)
- **Data Augmentation**: Rotation, shifting, zooming
- **Optimizer**: Adam
- **Loss Function**: Categorical Crossentropy
- **Callbacks**: Early stopping, learning rate reduction

### Performance
- **Accuracy**: >99% on MNIST test set
- **Model Size**: <5MB (optimized for web)
- **Inference Time**: <100ms on modern browsers

## 🔧 Development

### Prerequisites
- Modern web browser with WebGL support
- Python 3.7+ (for training)
- Node.js (optional, for development server)

### Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/yourusername/DigitRecognizer.git
   cd DigitRecognizer
   ```

2. **Start development server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using VS Code Live Server extension
   # Right-click index.html -> "Open with Live Server"
   ```

3. **Open browser**
   ```
   http://localhost:8000
   ```

### Training Your Own Model

1. **Install dependencies**
   ```bash
   cd training
   pip install -r requirements.txt
   ```

2. **Train model**
   ```bash
   python train_model.py
   ```

3. **Convert to web format**
   ```bash
   python convert_model.py
   ```

4. **Test the model**
   ```bash
   cd ..
   python -m http.server 8000
   ```

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Styling
Edit `styles/main.css` to customize:
- Colors and themes
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

### Model
Modify `training/train_model.py` to:
- Change model architecture
- Adjust training parameters
- Add data augmentation
- Experiment with different optimizers

### Canvas
Update `scripts/canvas.js` to:
- Change canvas size
- Modify brush behavior
- Add drawing tools
- Implement undo/redo

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:

- **GitHub Pages**: Push to `gh-pages` branch
- **Netlify**: Connect GitHub repository
- **Vercel**: Import project
- **Firebase Hosting**: Use Firebase CLI

### Example: GitHub Pages
```bash
# Build and deploy
git add .
git commit -m "Deploy DigitRecognizer"
git push origin main

# Enable GitHub Pages in repository settings
# Set source to main branch
```

### Example: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

## 🧪 Testing

### Manual Testing
1. Test drawing on different devices
2. Verify predictions are reasonable
3. Check responsive design
4. Test keyboard shortcuts

### Browser Testing
- Test in multiple browsers
- Check mobile responsiveness
- Verify touch events work
- Test with different screen sizes

## 📊 Performance Optimization

### Model Optimization
- Use model quantization
- Implement model pruning
- Optimize for mobile devices
- Use WebGL acceleration

### Web Optimization
- Enable gzip compression
- Use CDN for model files
- Implement lazy loading
- Optimize images and assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MNIST Dataset**: Yann LeCun, Corinna Cortes, Christopher Burges
- **TensorFlow.js**: Google's machine learning library for JavaScript
- **TensorFlow**: Google's open-source machine learning platform
- **CSS Grid**: Modern CSS layout system
- **HTML5 Canvas**: For drawing functionality

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/DigitRecognizer/issues) page
2. Create a new issue with detailed description
3. Include browser version and error messages
4. Provide steps to reproduce the problem

## 🔮 Future Enhancements

- [ ] Multi-digit recognition
- [ ] Custom model training interface
- [ ] Real-time collaboration
- [ ] Mobile app version
- [ ] API for external applications
- [ ] Advanced drawing tools
- [ ] Prediction history and analytics
- [ ] Model comparison features

## 📈 Roadmap

### Version 1.1
- [ ] Improved model accuracy
- [ ] Better mobile experience
- [ ] Performance optimizations

### Version 1.2
- [ ] Multi-digit support
- [ ] Custom training interface
- [ ] Export/import functionality

### Version 2.0
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] API integration

---

**Made with ❤️ and TensorFlow.js**

*Draw, predict, and explore the world of machine learning in your browser!*
