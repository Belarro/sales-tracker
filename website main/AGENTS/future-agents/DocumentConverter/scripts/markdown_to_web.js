#!/usr/bin/env node

/**
 * Markdown to Modern Web Converter
 * Converts markdown to styled HTML with modern design
 */

const fs = require('fs');
const path = require('path');
const marked = require('marked');

class MarkdownToWebConverter {
    constructor(options = {}) {
        this.options = {
            theme: 'professional',
            includeNav: true,
            responsive: true,
            animations: true,
            ...options
        };
        
        // Configure marked
        marked.setOptions({
            highlight: function(code, lang) {
                return `<pre><code class="language-${lang}">${code}</code></pre>`;
            },
            breaks: true,
            gfm: true
        });
    }

    async convertFile(inputPath, outputPath, options = {}) {
        const mergedOptions = { ...this.options, ...options };
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        const markdown = fs.readFileSync(inputPath, 'utf8');
        const html = await this.convertMarkdown(markdown, mergedOptions);
        
        fs.writeFileSync(outputPath, html);
        console.log(`✅ HTML generated: ${outputPath}`);
        
        return outputPath;
    }

    async convertMarkdown(markdown, options = {}) {
        const mergedOptions = { ...this.options, ...options };
        
        // Extract title and metadata
        const { title, content } = this.extractMetadata(markdown);
        
        // Convert markdown to HTML
        const bodyHTML = marked.parse(content);
        
        // Apply theme-specific processing
        const processedHTML = this.applyThemeProcessing(bodyHTML, mergedOptions);
        
        // Generate complete HTML document
        return this.generateHTMLDocument(title, processedHTML, mergedOptions);
    }

    extractMetadata(markdown) {
        const lines = markdown.split('\n');
        let title = 'Document';
        let contentStart = 0;

        // Look for first H1 as title
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('# ')) {
                title = line.substring(2).trim();
                contentStart = i;
                break;
            }
        }

        const content = lines.slice(contentStart).join('\n');
        return { title, content };
    }

    applyThemeProcessing(html, options) {
        let processed = html;

        // Add classes for styling
        processed = processed.replace(/<h1>/g, '<h1 class="main-title">');
        processed = processed.replace(/<h2>/g, '<h2 class="section-title">');
        processed = processed.replace(/<h3>/g, '<h3 class="subsection-title">');
        processed = processed.replace(/<table>/g, '<table class="data-table">');
        processed = processed.replace(/<blockquote>/g, '<blockquote class="highlight-quote">');
        processed = processed.replace(/<code>/g, '<code class="inline-code">');
        processed = processed.replace(/<pre><code/g, '<pre><code class="code-block"');

        // Wrap sections
        processed = this.wrapSections(processed);
        
        return processed;
    }

    wrapSections(html) {
        // Split by H2 headers to create sections
        const sections = html.split(/(<h2[^>]*>.*?<\/h2>)/);
        let wrapped = '';
        let inSection = false;

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            
            if (section.match(/<h2[^>]*>/)) {
                if (inSection) {
                    wrapped += '</section>';
                }
                wrapped += '<section class="content-section">' + section;
                inSection = true;
            } else if (section.trim()) {
                wrapped += section;
            }
        }
        
        if (inSection) {
            wrapped += '</section>';
        }
        
        return wrapped;
    }

    generateHTMLDocument(title, content, options) {
        const css = this.generateCSS(options.theme);
        const navigation = options.includeNav ? this.generateNavigation(content) : '';
        const scripts = this.generateScripts(options);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>${css}</style>
</head>
<body>
    ${navigation}
    <main class="main-content">
        <div class="container">
            ${content}
        </div>
    </main>
    <script>${scripts}</script>
</body>
</html>`;
    }

    generateNavigation(content) {
        // Extract headings for navigation
        const headings = content.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/g) || [];
        
        if (headings.length === 0) return '';

        const navItems = headings.map((heading, index) => {
            const level = heading.match(/h([2-3])/)[1];
            const text = heading.replace(/<[^>]*>/g, '').trim();
            const id = `section-${index}`;
            
            return `<li class="nav-item nav-level-${level}">
                <a href="#${id}" class="nav-link">${text}</a>
            </li>`;
        }).join('');

        return `
        <nav class="document-nav">
            <div class="nav-container">
                <div class="nav-brand">📄 ${this.options.title || 'Document'}</div>
                <ul class="nav-menu">${navItems}</ul>
            </div>
        </nav>`;
    }

    generateCSS(theme) {
        const baseCSS = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            :root {
                --primary: #0066FF;
                --primary-dark: #003D99;
                --secondary: #FF6B35;
                --text-dark: #1A1A1A;
                --text-medium: #4A4A4A;
                --text-light: #6B7280;
                --background: #FFFFFF;
                --surface: #F8FAFC;
                --border: #E5E7EB;
                --success: #10B981;
                --warning: #F59E0B;
            }

            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.6;
                color: var(--text-dark);
                background: var(--background);
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
            }

            .main-content {
                padding-top: 2rem;
            }

            .content-section {
                margin: 3rem 0;
                padding: 2rem 0;
            }

            .main-title {
                font-size: 3rem;
                font-weight: 900;
                color: var(--primary);
                margin-bottom: 1rem;
                text-align: center;
            }

            .section-title {
                font-size: 2.5rem;
                font-weight: 800;
                color: var(--text-dark);
                margin: 2rem 0 1.5rem 0;
                padding-bottom: 0.5rem;
                border-bottom: 3px solid var(--primary);
            }

            .subsection-title {
                font-size: 1.8rem;
                font-weight: 700;
                color: var(--primary-dark);
                margin: 1.5rem 0 1rem 0;
            }

            p {
                margin: 1rem 0;
                line-height: 1.7;
            }

            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            }

            .data-table th {
                background: var(--primary);
                color: white;
                padding: 1rem;
                text-align: left;
                font-weight: 600;
            }

            .data-table td {
                padding: 1rem;
                border-bottom: 1px solid var(--border);
            }

            .data-table tbody tr:hover {
                background: var(--surface);
            }

            .highlight-quote {
                background: var(--surface);
                border-left: 4px solid var(--primary);
                padding: 1.5rem;
                margin: 2rem 0;
                border-radius: 0 8px 8px 0;
                font-style: italic;
            }

            .inline-code {
                background: var(--surface);
                padding: 0.2rem 0.4rem;
                border-radius: 4px;
                font-family: 'SF Mono', Monaco, monospace;
                font-size: 0.9em;
                color: var(--secondary);
            }

            .code-block {
                background: var(--surface);
                padding: 1.5rem;
                border-radius: 8px;
                border: 1px solid var(--border);
                overflow-x: auto;
                font-family: 'SF Mono', Monaco, monospace;
                font-size: 0.9rem;
                line-height: 1.5;
            }

            ul, ol {
                margin: 1rem 0;
                padding-left: 2rem;
            }

            li {
                margin: 0.5rem 0;
            }

            a {
                color: var(--primary);
                text-decoration: none;
                font-weight: 500;
            }

            a:hover {
                text-decoration: underline;
            }

            .document-nav {
                position: fixed;
                top: 0;
                width: 100%;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                z-index: 1000;
                padding: 1rem 0;
                border-bottom: 1px solid var(--border);
            }

            .nav-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .nav-brand {
                font-size: 1.2rem;
                font-weight: 700;
                color: var(--primary);
            }

            .nav-menu {
                display: flex;
                list-style: none;
                gap: 2rem;
            }

            .nav-link {
                color: var(--text-medium);
                font-weight: 500;
                transition: color 0.3s ease;
            }

            .nav-link:hover {
                color: var(--primary);
            }

            @media (max-width: 768px) {
                .nav-menu {
                    display: none;
                }
                
                .main-title {
                    font-size: 2rem;
                }
                
                .section-title {
                    font-size: 1.8rem;
                }
                
                .container {
                    padding: 0 1rem;
                }
            }
        `;

        return baseCSS;
    }

    generateScripts(options) {
        return `
            // Smooth scrolling for navigation
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            // Auto-generate IDs for headings
            document.querySelectorAll('h2, h3').forEach((heading, index) => {
                if (!heading.id) {
                    heading.id = 'section-' + index;
                }
            });

            // Table of contents highlighting
            const headings = document.querySelectorAll('h2, h3');
            const navLinks = document.querySelectorAll('.nav-link');

            function updateActiveNav() {
                let current = '';
                headings.forEach(heading => {
                    const rect = heading.getBoundingClientRect();
                    if (rect.top <= 100) {
                        current = heading.id;
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });
            }

            window.addEventListener('scroll', updateActiveNav);
            updateActiveNav();
        `;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(`
Usage: node markdown_to_web.js <input.md> <output.html> [theme]

Themes:
  professional  - Professional document styling (default)
  minimal       - Clean, minimal design
  presentation  - Presentation-focused layout

Examples:
  node markdown_to_web.js document.md document.html
  node markdown_to_web.js pitch.md pitch.html presentation
        `);
        process.exit(1);
    }

    const [inputPath, outputPath, theme = 'professional'] = args;
    
    const converter = new MarkdownToWebConverter({
        theme,
        includeNav: true,
        responsive: true,
        animations: true
    });

    try {
        console.log(`🚀 Converting ${inputPath} to ${outputPath}...`);
        await converter.convertFile(inputPath, outputPath);
        console.log(`✅ Conversion completed successfully!`);
    } catch (error) {
        console.error(`❌ Conversion failed:`, error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = MarkdownToWebConverter;

// Run CLI if called directly
if (require.main === module) {
    main().catch(console.error);
}