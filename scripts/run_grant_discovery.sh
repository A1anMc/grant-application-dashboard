#!/bin/bash

echo "🚀 Shadow Goose Entertainment - Australian Grant Discovery System"
echo "================================================================"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Install required packages if needed
echo "📦 Installing required Python packages..."
pip3 install --quiet aiohttp beautifulsoup4 lxml requests python-dateutil pandas numpy

echo ""
echo "🔍 Running Australian Grant Discovery..."
echo ""

# Run the demo grant discovery
python3 demo_grant_discovery.py

echo ""
echo "📁 Generated Files:"
ls -la *.csv *.json 2>/dev/null | grep -E '\.(csv|json)$' || echo "No output files found"

echo ""
echo "✨ Grant Discovery Complete!"
echo ""
echo "🌐 To view the interactive dashboard:"
echo "   1. Open your browser to http://localhost:5173/?demo=true"
echo "   2. Navigate to 'Grant Discovery' in the menu"
echo ""
echo "📄 Data files have been saved to:"
echo "   • australian_grants_demo.csv - Spreadsheet format"
echo "   • australian_grants_demo.json - JSON format"
echo "" 