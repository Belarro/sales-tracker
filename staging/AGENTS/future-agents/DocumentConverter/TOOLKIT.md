# DocumentConverter Toolkit

## Framework Installation Strategy

### Primary Conversion Tools

#### 1. Pandoc (Recommended Primary)
```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt-get install pandoc

# Windows
choco install pandoc
```

#### 2. LaTeX Engine (For PDF Output)
```bash
# macOS
brew install --cask mactex-no-gui

# Ubuntu/Debian
sudo apt-get install texlive-latex-recommended texlive-fonts-recommended

# Windows
choco install miktex
```

#### 3. Alternative: wkhtmltopdf
```bash
# macOS
brew install --cask wkhtmltopdf

# Ubuntu/Debian
sudo apt-get install wkhtmltopdf

# Windows
choco install wkhtmltopdf
```

## Conversion Workflows

### Fast Markdown to PDF
1. **Basic Pandoc Method** (Fastest)
   ```bash
   pandoc input.md -o output.pdf
   ```

2. **With Basic Styling**
   ```bash
   pandoc input.md -o output.pdf --pdf-engine=xelatex -V geometry:margin=1in
   ```

3. **HTML Intermediate** (Fallback)
   ```bash
   pandoc input.md -o temp.html
   wkhtmltopdf temp.html output.pdf
   rm temp.html
   ```

### Installation Detection Script
```bash
#!/bin/bash
check_and_install() {
    local tool=$1
    local install_cmd=$2
    
    if ! command -v $tool &> /dev/null; then
        echo "Installing $tool..."
        eval $install_cmd
    else
        echo "$tool already installed"
    fi
}

# Check OS and install accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    check_and_install "pandoc" "brew install pandoc"
    check_and_install "xelatex" "brew install --cask mactex-no-gui"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    check_and_install "pandoc" "sudo apt-get update && sudo apt-get install -y pandoc"
    check_and_install "xelatex" "sudo apt-get install -y texlive-latex-recommended"
fi
```

## Conversion Options

### Quality vs Speed Matrix
- **Fastest**: Pandoc basic (no styling)
- **Balanced**: Pandoc with minimal LaTeX styling
- **Cleanest**: Pandoc with custom CSS/LaTeX template
- **Fallback**: HTML intermediate conversion

### Batch Processing Template
```bash
# Convert all markdown files in directory
for file in *.md; do
    pandoc "$file" -o "${file%.md}.pdf" --pdf-engine=xelatex
done
```

## Error Handling Strategies

### Common Issues and Solutions
1. **Missing LaTeX**: Fall back to HTML->PDF conversion
2. **Font Issues**: Use system fonts or install basic font packages
3. **Image Problems**: Ensure relative paths and supported formats
4. **Table Rendering**: Use Pandoc's table extensions

### Fallback Chain
1. Pandoc with XeLaTeX → 
2. Pandoc with PDFLaTeX → 
3. HTML intermediate with wkhtmltopdf → 
4. Python-based conversion (markdown2, weasyprint)

## Performance Optimization

### Speed Improvements
- Use XeLaTeX for faster processing
- Minimize LaTeX packages in templates
- Cache common templates
- Parallel processing for batch conversions

### Quality Improvements
- Custom CSS for HTML intermediate
- LaTeX templates for consistent styling
- Image optimization preprocessing
- Font embedding for portability

---

*Toolkit designed for reliable, fast document conversion*