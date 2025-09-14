# Deployment Guide - DigitRecognizer

This guide covers deploying the DigitRecognizer web application to various platforms.

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- Git repository (GitHub, GitLab, or Bitbucket)

### Method 1: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd "/Users/sotiris/Github Projects/Numberly"
   vercel
   ```

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a static site

3. **Configure deployment**
   - Build Command: `echo "Static site - no build needed"`
   - Output Directory: `.` (root)
   - Install Command: (leave empty)

### Method 3: Drag & Drop

1. **Prepare for deployment**
   ```bash
   # Create deployment package
   zip -r digit-recognizer.zip . -x "*.git*" "node_modules/*" "training/__pycache__/*"
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Drag and drop the zip file
   - Vercel will automatically deploy

## 🌐 Other Deployment Options

### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod --dir .
   ```

### GitHub Pages

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)"

2. **Access your site**
   - URL: `https://yourusername.github.io/Numberly`

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

3. **Deploy**
   ```bash
   firebase deploy
   ```

## 📁 File Structure for Deployment

Ensure your deployment includes:

```
DigitRecognizer/
├── index.html              # Main application
├── test.html               # Testing page
├── styles/
│   └── main.css           # Styles
├── scripts/
│   ├── canvas.js          # Canvas functionality
│   ├── ml-model.js        # ML model handling
│   └── app.js             # Main app logic
├── models/                # ML models (if trained)
├── assets/                # Static assets
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── README.md              # Documentation
```

## 🔧 Environment Configuration

### Vercel Environment Variables

If you need environment variables:

1. **Via Vercel Dashboard**
   - Go to project settings
   - Add environment variables

2. **Via CLI**
   ```bash
   vercel env add VARIABLE_NAME
   ```

### Model Loading

The app will work in fallback mode if models aren't available. To include trained models:

1. **Train models locally**
   ```bash
   cd training
   python models_10.py
   ```

2. **Convert to TensorFlow.js**
   ```bash
   python convert_model.py
   ```

3. **Upload models to deployment**
   - Models will be in `models/` directory
   - Ensure they're included in deployment

## 🚀 Performance Optimization

### For Vercel

1. **Enable Edge Functions** (if needed)
   ```json
   {
     "functions": {
       "api/*.js": {
         "runtime": "nodejs18.x"
       }
     }
   }
   ```

2. **Optimize caching**
   - Static assets cached for 1 year
   - Models cached for 1 year
   - HTML cached for 1 hour

### General Optimizations

1. **Compress models**
   - Use TensorFlow.js model optimization
   - Consider quantization for smaller models

2. **CDN usage**
   - Vercel automatically provides global CDN
   - Models served from edge locations

## 🔍 Testing Deployment

### Local Testing

1. **Test with Vercel CLI**
   ```bash
   vercel dev
   ```

2. **Test production build**
   ```bash
   vercel build
   vercel start
   ```

### Production Testing

1. **Check all features**
   - Canvas drawing works
   - Model predictions work
   - Model switching works
   - Comparison mode works

2. **Performance testing**
   - Page load time
   - Model loading time
   - Prediction speed

## 🐛 Troubleshooting

### Common Issues

1. **Models not loading**
   - Check model paths in `ml-model.js`
   - Ensure models are in correct directory
   - Check CORS headers

2. **Canvas not working**
   - Check browser compatibility
   - Ensure HTTPS (required for some features)

3. **Slow loading**
   - Optimize model sizes
   - Use CDN for large files
   - Enable compression

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## 📊 Monitoring

### Vercel Analytics

1. **Enable Analytics**
   - Go to project settings
   - Enable Vercel Analytics

2. **Monitor performance**
   - Page views
   - Load times
   - Error rates

### Custom Monitoring

Add custom analytics:

```javascript
// Track model usage
function trackModelUsage(modelId, accuracy) {
  // Send to your analytics service
  console.log(`Model ${modelId} used with ${accuracy}% accuracy`);
}
```

## 🔄 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📝 Deployment Checklist

- [ ] All files committed to git
- [ ] Models trained and converted (optional)
- [ ] Environment variables set (if needed)
- [ ] Domain configured (if custom)
- [ ] Analytics enabled (optional)
- [ ] Performance tested
- [ ] Mobile compatibility tested
- [ ] Cross-browser testing completed

## 🎉 Post-Deployment

After successful deployment:

1. **Share your app**
   - Get the Vercel URL
   - Share with users
   - Add to portfolio

2. **Monitor usage**
   - Check analytics
   - Monitor performance
   - Gather user feedback

3. **Iterate**
   - Fix any issues
   - Add new features
   - Improve performance

Your DigitRecognizer app is now live and ready to use! 🚀
