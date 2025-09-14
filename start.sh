#!/bin/bash

# DigitRecognizer Launch Script
echo "🚀 Starting DigitRecognizer Web Application..."

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "🌐 Starting web server on http://localhost:8000"
    echo "📱 Open your browser and navigate to: http://localhost:8000"
    echo "🧪 Or test the application at: http://localhost:8000/test.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    echo "🌐 Starting web server on http://localhost:8000"
    echo "📱 Open your browser and navigate to: http://localhost:8000"
    echo "🧪 Or test the application at: http://localhost:8000/test.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    python -m http.server 8000
else
    echo "❌ Python not found. Please install Python 3 to run the web server."
    echo ""
    echo "Alternative options:"
    echo "1. Install Python 3 from https://python.org"
    echo "2. Use Node.js: npx serve ."
    echo "3. Use VS Code Live Server extension"
    echo "4. Simply open index.html in your browser"
    exit 1
fi
