#!/bin/bash

# PDF Optimization Script for DocumentConverter Agent
# Optimizes markdown files for better PDF page layout

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"
STYLES_DIR="$AGENT_DIR/styles"

# Default values
INPUT_FILE=""
OUTPUT_FILE=""
STYLE="page-optimized"
ANALYZE=false
VERBOSE=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 [OPTIONS] INPUT_FILE [OUTPUT_FILE]"
    echo ""
    echo "OPTIONS:"
    echo "  -s, --style STYLE     CSS style to use (default: page-optimized)"
    echo "                        Available: clean-report, page-optimized"
    echo "  -a, --analyze         Run content analysis before conversion"
    echo "  -v, --verbose         Verbose output"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 document.md                    # Basic conversion"
    echo "  $0 -a document.md output.pdf      # With analysis"
    echo "  $0 -s clean-report doc.md         # Using clean-report style"
    echo ""
}

log() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v pandoc &> /dev/null; then
        error "pandoc is not installed. Please install it first."
    fi
    
    if ! command -v python3 &> /dev/null; then
        error "python3 is not installed. Please install it first."
    fi
    
    log "All dependencies are available"
}

analyze_content() {
    local input_file="$1"
    log "Analyzing content structure..."
    
    if [ -f "$SCRIPT_DIR/analyze_content.py" ]; then
        echo -e "${BLUE}=== CONTENT ANALYSIS ===${NC}"
        python3 "$SCRIPT_DIR/analyze_content.py" "$input_file"
        echo ""
    else
        warning "Content analysis script not found, skipping analysis"
    fi
}

preprocess_markdown() {
    local input_file="$1"
    local temp_file="$2"
    
    log "Preprocessing markdown for optimal page layout..."
    
    # Copy original file
    cp "$input_file" "$temp_file"
    
    # Add page break hints and CSS classes for better layout
    python3 -c "
import re
import sys

def optimize_markdown(content):
    # Add page break before major sections
    content = re.sub(r'^(## \d+\.)', r'\\newpage\n\n\\1', content, flags=re.MULTILINE)
    
    # Optimize large JSON blocks
    def add_json_class(match):
        json_content = match.group(0)
        line_count = json_content.count('\n')
        if line_count > 25:
            return '<!-- {.large-code} -->\n' + json_content
        else:
            return '<!-- {.keep-together} -->\n' + json_content
    
    content = re.sub(r'```json[\s\S]*?```', add_json_class, content)
    
    # Mark large tables
    def add_table_class(match):
        table_content = match.group(0)
        row_count = len([line for line in table_content.split('\n') if line.startswith('|') and '---' not in line])
        if row_count > 15:
            return '<!-- {.large-table} -->\n' + table_content
        else:
            return '<!-- {.small-table} -->\n' + table_content
    
    content = re.sub(r'\|.*\|\n\|[-\s\|]+\|\n(\|.*\|\n)+', add_table_class, content)
    
    return content

with open('$temp_file', 'r') as f:
    content = f.read()

optimized = optimize_markdown(content)

with open('$temp_file', 'w') as f:
    f.write(optimized)
"
    
    log "Markdown preprocessing completed"
}

convert_to_pdf() {
    local input_file="$1"
    local output_file="$2"
    local css_file="$STYLES_DIR/${STYLE}.css"
    
    if [ ! -f "$css_file" ]; then
        error "CSS file not found: $css_file"
    fi
    
    log "Converting to PDF with optimized layout..."
    log "Using CSS: $css_file"
    
    # Create temporary preprocessed file
    local temp_file="${input_file%.md}_temp.md"
    preprocess_markdown "$input_file" "$temp_file"
    
    # Pandoc conversion with optimization flags
    pandoc "$temp_file" \
        -o "$output_file" \
        --pdf-engine=weasyprint \
        --css="$css_file" \
        --toc \
        --toc-depth=3 \
        --number-sections \
        --metadata title="Technical Specification" \
        --metadata author="DocumentConverter Agent" \
        --metadata date="$(date '+%Y-%m-%d')" \
        --variable colorlinks=true \
        --variable linkcolor=blue \
        --variable urlcolor=blue \
        --variable toccolor=black \
        2>/dev/null || {
            warning "Some formatting warnings occurred, but PDF was generated"
        }
    
    # Clean up temporary file
    rm -f "$temp_file"
    
    if [ -f "$output_file" ]; then
        success "PDF generated successfully: $output_file"
        
        # Show file size
        local file_size=$(du -h "$output_file" | cut -f1)
        log "File size: $file_size"
    else
        error "PDF generation failed"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--style)
            STYLE="$2"
            shift 2
            ;;
        -a|--analyze)
            ANALYZE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            error "Unknown option: $1"
            ;;
        *)
            if [ -z "$INPUT_FILE" ]; then
                INPUT_FILE="$1"
            elif [ -z "$OUTPUT_FILE" ]; then
                OUTPUT_FILE="$1"
            else
                error "Too many arguments"
            fi
            shift
            ;;
    esac
done

# Validate input
if [ -z "$INPUT_FILE" ]; then
    error "Input file is required"
fi

if [ ! -f "$INPUT_FILE" ]; then
    error "Input file does not exist: $INPUT_FILE"
fi

# Set default output file if not specified
if [ -z "$OUTPUT_FILE" ]; then
    OUTPUT_FILE="${INPUT_FILE%.md}_optimized.pdf"
fi

# Check dependencies
check_dependencies

# Run content analysis if requested
if [ "$ANALYZE" = true ]; then
    analyze_content "$INPUT_FILE"
fi

# Convert to PDF
convert_to_pdf "$INPUT_FILE" "$OUTPUT_FILE"

success "PDF optimization completed!"
echo -e "${GREEN}Output:${NC} $OUTPUT_FILE"