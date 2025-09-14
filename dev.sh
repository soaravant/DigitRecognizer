#!/bin/bash

# Numberly Development Server with Auto-Reload
# This script starts the development server with automatic browser reload

echo "🚀 Starting Numberly Development Server with Auto-Reload"
echo "=========================================================="

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Make the dev server executable
chmod +x simple_dev_server.py

# Start the development server
echo "🌐 Starting server with auto-reload..."
python3 simple_dev_server.py
