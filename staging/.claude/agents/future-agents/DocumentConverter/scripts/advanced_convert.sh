#!/bin/bash

# Advanced Document Conversion Script
# Complete workflow: Markdown → HTML → PDF with business-quality output

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
INPUT_FILE=""
OUTPUT_FILE=""
WORKFLOW="auto"
PRESET="pitchDeck"
THEME="professional"
CLEANUP=true
VERBOSE=false

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
    echo "Usage: $0 [OPTIONS] INPUT_FILE [OUTPUT_FILE]"
    echo ""
    echo "Complete document conversion workflow with business-quality output"
    echo ""
    echo "OPTIONS:"
    echo "  -w, --workflow TYPE    Conversion workflow (auto|md-html-pdf|html-pdf)"
    echo "  -p, --preset PRESET    PDF preset (pitchDeck|technical|presentation)"
    echo "  -t, --theme THEME      HTML theme (professional|minimal|presentation)"
    echo "  -k, --keep-files       Keep intermediate files"
    echo "  -v, --verbose          Verbose output"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "WORKFLOWS:"
    echo "  auto         Auto-detect based on input file extension"
    echo "  md-html-pdf  Markdown → Modern HTML → Business PDF"
    echo "  html-pdf     HTML → Business PDF (direct conversion)"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 pitch-deck.md                    # Auto workflow"
    echo "  $0 -w md-html-pdf -p pitchDeck document.md output.pdf"
    echo "  $0 -w html-pdf -p technical website.html report.pdf"
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
    
    # Check basic tools
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Run: brew install node"
    fi
    
    if ! command -v pandoc &> /dev/null; then
        error "Pandoc is not installed. Run: brew install pandoc"
    fi
    
    # Check Node.js packages
    if [ ! -f "$AGENT_DIR/package.json" ]; then
        warning "Node.js packages not installed. Running setup..."
        "$SCRIPT_DIR/setup_node_deps.sh"
    fi
    
    log "All dependencies available"
}

detect_workflow() {
    local input_file="$1"
    local extension="${input_file##*.}"
    
    case "$extension" in
        md|markdown)
            echo "md-html-pdf"
            ;;
        html|htm)
            echo "html-pdf"
            ;;
        *)
            error "Unsupported file type: .$extension"
            ;;
    esac
}

convert_md_to_html() {
    local input_file="$1"
    local output_file="$2"
    local theme="$3"
    
    log "Converting Markdown to modern HTML..."
    
    cd "$AGENT_DIR"
    node scripts/markdown_to_web.js "$input_file" "$output_file" "$theme"
    
    if [ -f "$output_file" ]; then
        success "HTML generated: $output_file"
        return 0
    else
        error "HTML generation failed"
    fi
}

convert_html_to_pdf() {
    local input_file="$1"
    local output_file="$2"
    local preset="$3"
    
    log "Converting HTML to business-quality PDF..."
    
    cd "$AGENT_DIR"
    node scripts/html_to_pdf.js "$input_file" "$output_file" "$preset"
    
    if [ -f "$output_file" ]; then
        success "PDF generated: $output_file"
        return 0
    else
        error "PDF generation failed"
    fi
}

execute_workflow() {
    local input_file="$1"
    local output_file="$2"
    local workflow="$3"
    local preset="$4"
    local theme="$5"
    
    case "$workflow" in
        "md-html-pdf")
            log "Executing Markdown → HTML → PDF workflow"
            
            # Generate intermediate HTML file
            local html_file="${output_file%.pdf}_temp.html"
            
            # Step 1: Markdown to HTML
            convert_md_to_html "$input_file" "$html_file" "$theme"
            
            # Step 2: HTML to PDF
            convert_html_to_pdf "$html_file" "$output_file" "$preset"
            
            # Cleanup if requested
            if [ "$CLEANUP" = true ]; then
                rm -f "$html_file"
                log "Cleaned up intermediate files"
            else
                success "Intermediate HTML saved: $html_file"
            fi
            ;;
            
        "html-pdf")
            log "Executing HTML → PDF workflow"
            convert_html_to_pdf "$input_file" "$output_file" "$preset"
            ;;
            
        *)
            error "Unknown workflow: $workflow"
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--workflow)
            WORKFLOW="$2"
            shift 2
            ;;
        -p|--preset)
            PRESET="$2"
            shift 2
            ;;
        -t|--theme)
            THEME="$2"
            shift 2
            ;;
        -k|--keep-files)
            CLEANUP=false
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

# Auto-detect workflow if needed
if [ "$WORKFLOW" = "auto" ]; then
    WORKFLOW=$(detect_workflow "$INPUT_FILE")
    log "Auto-detected workflow: $WORKFLOW"
fi

# Set default output file if not specified
if [ -z "$OUTPUT_FILE" ]; then
    case "$WORKFLOW" in
        "md-html-pdf")
            OUTPUT_FILE="${INPUT_FILE%.md}_business.pdf"
            ;;
        "html-pdf")
            OUTPUT_FILE="${INPUT_FILE%.html}_business.pdf"
            ;;
    esac
fi

# Convert to absolute paths
INPUT_FILE=$(realpath "$INPUT_FILE")
OUTPUT_FILE=$(realpath "$OUTPUT_FILE")

echo ""
echo -e "${BLUE}🚀 DocumentConverter Advanced Workflow${NC}"
echo -e "${BLUE}======================================${NC}"
echo "Input:     $INPUT_FILE"
echo "Output:    $OUTPUT_FILE"
echo "Workflow:  $WORKFLOW"
echo "Preset:    $PRESET"
echo "Theme:     $THEME"
echo ""

# Check dependencies
check_dependencies

# Execute conversion workflow
execute_workflow "$INPUT_FILE" "$OUTPUT_FILE" "$WORKFLOW" "$PRESET" "$THEME"

# Show results
if [ -f "$OUTPUT_FILE" ]; then
    file_size=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    success "Conversion completed successfully!"
    echo -e "${GREEN}📄 Output file:${NC} $OUTPUT_FILE"
    echo -e "${GREEN}📊 File size:${NC} $file_size"
    echo ""
    
    # Offer to open the file
    read -p "Open the generated PDF? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$OUTPUT_FILE"
    fi
else
    error "Conversion failed - output file not found"
fi