#!/bin/bash

# PDF Comparison Script
# Shows comparison between different PDF versions

PDF_DIR="/Users/joshkornreich/Documents/Projects/Contracts/TravelGuider/docs"

echo "=== PDF COMPARISON REPORT ==="
echo ""

echo "Available PDF files:"
ls -la "$PDF_DIR"/*.pdf | while read -r line; do
    filename=$(echo "$line" | awk '{print $9}' | xargs basename)
    size=$(echo "$line" | awk '{print $5}')
    modified=$(echo "$line" | awk '{print $6, $7, $8}')
    echo "  📄 $filename - $size bytes ($modified)"
done

echo ""
echo "=== OPTIMIZATION SUMMARY ==="
echo ""

if [ -f "$PDF_DIR/TECHNICAL_SPECIFICATION.pdf" ]; then
    orig_size=$(stat -f%z "$PDF_DIR/TECHNICAL_SPECIFICATION.pdf" 2>/dev/null || echo "0")
    echo "📊 Original PDF: $(numfmt --to=iec $orig_size)"
fi

if [ -f "$PDF_DIR/TECHNICAL_SPECIFICATION_FORMATTED.pdf" ]; then
    formatted_size=$(stat -f%z "$PDF_DIR/TECHNICAL_SPECIFICATION_FORMATTED.pdf" 2>/dev/null || echo "0")
    echo "📊 Formatted PDF: $(numfmt --to=iec $formatted_size)"
fi

if [ -f "$PDF_DIR/TECHNICAL_SPECIFICATION_PAGE_OPTIMIZED.pdf" ]; then
    optimized_size=$(stat -f%z "$PDF_DIR/TECHNICAL_SPECIFICATION_PAGE_OPTIMIZED.pdf" 2>/dev/null || echo "0")
    echo "📊 Page-Optimized PDF: $(numfmt --to=iec $optimized_size)"
fi

echo ""
echo "✅ OPTIMIZATION FEATURES IMPLEMENTED:"
echo "   • Advanced page break controls"
echo "   • Table of contents page fitting"
echo "   • Content grouping optimization"
echo "   • JSON block size-based breaking"
echo "   • Section numbering and navigation"
echo "   • Professional typography"
echo "   • Orphan/widow control"
echo "   • Smart code block handling"
echo ""

echo "🔧 RECOMMENDATION: Use TECHNICAL_SPECIFICATION_PAGE_OPTIMIZED.pdf for best results"