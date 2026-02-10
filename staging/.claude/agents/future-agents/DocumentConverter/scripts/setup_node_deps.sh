#!/bin/bash

# Setup Node.js dependencies for advanced PDF generation
# Installs Puppeteer and other required packages

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Setting up Node.js dependencies for DocumentConverter toolkit..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   brew install node"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create package.json if it doesn't exist
if [ ! -f "$AGENT_DIR/package.json" ]; then
    echo "📦 Creating package.json..."
    cat > "$AGENT_DIR/package.json" << 'EOF'
{
  "name": "documentconverter-toolkit",
  "version": "1.0.0",
  "description": "Advanced document conversion toolkit with HTML to PDF capabilities",
  "main": "scripts/html_to_pdf.js",
  "scripts": {
    "html-to-pdf": "node scripts/html_to_pdf.js",
    "md-to-web": "node scripts/markdown_to_web.js",
    "setup": "npm install",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "pdf",
    "html",
    "markdown",
    "puppeteer",
    "document-conversion"
  ],
  "author": "DocumentConverter Agent",
  "license": "MIT",
  "dependencies": {
    "puppeteer": "^21.0.0",
    "marked": "^9.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF
    echo "✅ package.json created"
fi

# Install dependencies
cd "$AGENT_DIR"
echo "📥 Installing Node.js dependencies..."
npm install

# Make scripts executable
chmod +x "$SCRIPT_DIR/html_to_pdf.js"
chmod +x "$SCRIPT_DIR/markdown_to_web.js"

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Available commands:"
echo "   node scripts/html_to_pdf.js <input.html> <output.pdf> [preset]"
echo "   node scripts/markdown_to_web.js <input.md> <output.html> [theme]"
echo ""
echo "🎯 Presets for HTML to PDF:"
echo "   pitchDeck     - Business pitch deck formatting"
echo "   technical     - Technical document formatting"  
echo "   presentation  - Landscape presentation format"
echo ""
echo "🎨 Themes for Markdown to Web:"
echo "   professional  - Professional document styling"
echo "   minimal       - Clean, minimal design"
echo "   presentation  - Presentation-focused layout"
echo ""

# Test installation
echo "🧪 Testing installation..."
if node -e "require('puppeteer'); console.log('✅ Puppeteer installed correctly')"; then
    echo "✅ All dependencies working correctly"
else
    echo "❌ Installation test failed"
    exit 1
fi

echo ""
echo "🚀 DocumentConverter toolkit is ready for advanced HTML to PDF conversion!"