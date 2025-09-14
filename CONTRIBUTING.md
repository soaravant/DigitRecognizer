# Contributing to DigitRecognizer

Thank you for your interest in contributing to DigitRecognizer! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (for development server)
- Python 3.7+ (for model training)
- Git
- Modern web browser

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/DigitRecognizer.git
   cd DigitRecognizer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🛠️ Development

### Project Structure
```
DigitRecognizer/
├── index.html              # Main application
├── styles/                 # CSS styles
├── scripts/                # JavaScript modules
├── training/               # Python training scripts
├── models/                 # ML model files
└── .github/                # GitHub workflows and templates
```

### Code Style
- Use ES6+ JavaScript features
- Follow existing code formatting
- Add comments for complex logic
- Use meaningful variable names

### Testing
- Test on multiple browsers
- Test mobile responsiveness
- Verify model predictions work
- Check error handling

## 🧠 Machine Learning

### Adding New Models
1. Create model architecture in `training/models_10.py`
2. Add model configuration in `scripts/ml-model.js`
3. Update model selector UI
4. Test model loading and predictions

### Training Models
```bash
cd training
pip install -r requirements.txt
python train_all_models.py
```

## 🎨 UI/UX Improvements

### Design Guidelines
- Maintain modern, clean aesthetic
- Ensure mobile responsiveness
- Use consistent color scheme
- Add smooth animations

### Canvas Improvements
- Enhance drawing experience
- Add new brush options
- Improve touch support
- Add drawing tools

## 🐛 Bug Reports

When reporting bugs, please include:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## ✨ Feature Requests

For new features, please:
- Check existing issues first
- Describe the use case
- Explain the benefit
- Consider implementation complexity

## 📝 Pull Requests

### Before Submitting
- [ ] Test your changes thoroughly
- [ ] Update documentation if needed
- [ ] Ensure code follows style guidelines
- [ ] Add tests for new functionality

### PR Process
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request
5. Address review feedback

## 🚀 Deployment

### Vercel Deployment
The project is configured for automatic deployment to Vercel:
- Push to main branch triggers deployment
- Requires VERCEL_TOKEN, ORG_ID, and PROJECT_ID secrets

### Manual Deployment
```bash
npm run deploy
```

## 📚 Documentation

### Updating Documentation
- Keep README.md current
- Update DEPLOYMENT.md for deployment changes
- Add inline code comments
- Update API documentation

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow GitHub's community guidelines

### Communication
- Use clear, descriptive commit messages
- Provide context in pull requests
- Ask questions when unsure
- Share knowledge and insights

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

## 📋 Development Checklist

### Before Committing
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors
- [ ] Mobile responsive

### Before PR
- [ ] Feature works as expected
- [ ] No breaking changes
- [ ] Performance acceptable
- [ ] Security considerations addressed
- [ ] Ready for review

## 🎯 Roadmap

### Current Priorities
- Improve model accuracy
- Add more model architectures
- Enhance mobile experience
- Add analytics and insights

### Future Ideas
- Multi-digit recognition
- Custom model training
- Real-time collaboration
- Mobile app version

## 📞 Getting Help

- Check existing issues and discussions
- Create a new issue for questions
- Join our community discussions
- Review documentation and examples

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to DigitRecognizer! 🎉
