#!/usr/bin/env node

/**
 * Advanced HTML to PDF Converter using Puppeteer
 * Optimized for business presentations and professional documents
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class HTMLToPDFConverter {
    constructor(options = {}) {
        this.options = {
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                top: '1cm',
                right: '1cm',
                bottom: '1.5cm',
                left: '1cm'
            },
            headerTemplate: `
                <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin-top: 0.5cm;">
                    <span class="title"></span>
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin-bottom: 0.5cm;">
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                </div>
            `,
            ...options
        };
    }

    async convertFile(inputPath, outputPath, customOptions = {}) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            
            // Set viewport for consistent rendering
            await page.setViewport({
                width: 1200,
                height: 800,
                deviceScaleFactor: 2
            });

            // Load the HTML file
            const htmlPath = path.resolve(inputPath);
            await page.goto(`file://${htmlPath}`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for any animations or dynamic content
            await page.waitForTimeout(2000);

            // Add print-specific styles
            await page.addStyleTag({
                content: this.getPrintCSS()
            });

            // Generate PDF with options
            const pdfOptions = {
                ...this.options,
                ...customOptions,
                path: outputPath
            };

            await page.pdf(pdfOptions);
            
            console.log(`✅ PDF generated successfully: ${outputPath}`);
            
            // Get file size
            const stats = fs.statSync(outputPath);
            console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            
            return outputPath;
            
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async convertHTMLString(htmlContent, outputPath, customOptions = {}) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            
            await page.setViewport({
                width: 1200,
                height: 800,
                deviceScaleFactor: 2
            });

            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });

            await page.waitForTimeout(2000);
            await page.addStyleTag({
                content: this.getPrintCSS()
            });

            const pdfOptions = {
                ...this.options,
                ...customOptions,
                path: outputPath
            };

            await page.pdf(pdfOptions);
            console.log(`✅ PDF generated from HTML string: ${outputPath}`);
            
            return outputPath;
            
        } catch (error) {
            console.error('❌ Error generating PDF from HTML string:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }

    getPrintCSS() {
        return `
            @media print {
                /* Hide scroll indicators and interactive elements */
                .scroll-indicator,
                .nav {
                    display: none !important;
                }
                
                /* Optimize sections for printing */
                .section {
                    page-break-inside: avoid;
                    margin-bottom: 2rem !important;
                }
                
                /* Hero section optimization */
                .hero {
                    height: 80vh !important;
                    page-break-after: always;
                }
                
                /* Card layouts for print */
                .problem-card,
                .feature-card,
                .team-card {
                    page-break-inside: avoid;
                    margin-bottom: 1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                }
                
                /* Financial chart adjustments */
                .financial-chart {
                    page-break-inside: avoid;
                    page-break-before: always;
                }
                
                /* Ensure good contrast for printing */
                .revenue-bar {
                    background: linear-gradient(180deg, #0066FF, #003D99) !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                /* Typography adjustments */
                .section-title {
                    color: #1A1A1A !important;
                }
                
                .hero h1,
                .hero .subtitle {
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                /* Background preservation */
                .hero,
                .solution,
                .cta {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                /* Grid adjustments for print */
                .problem-grid,
                .solution-features,
                .team-grid {
                    display: grid !important;
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 1rem !important;
                }
                
                /* Page break controls */
                .section-header {
                    page-break-after: avoid;
                }
                
                /* Ensure readability */
                body {
                    font-size: 11pt !important;
                    line-height: 1.4 !important;
                }
                
                /* Market stats grid for print */
                .market-stats {
                    display: grid !important;
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 1rem !important;
                }
            }
            
            /* Print-specific page breaks */
            .page-break-before {
                page-break-before: always;
            }
            
            .page-break-after {
                page-break-after: always;
            }
            
            .page-break-avoid {
                page-break-inside: avoid;
            }
        `;
    }

    // Preset configurations for different document types
    static getPresets() {
        return {
            pitchDeck: {
                format: 'A4',
                landscape: false,
                printBackground: true,
                displayHeaderFooter: true,
                margin: {
                    top: '1.5cm',
                    right: '1cm',
                    bottom: '2cm',
                    left: '1cm'
                },
                headerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin-top: 0.5cm; font-family: Inter, sans-serif;">
                        <strong>TravelGuider AI - Investment Pitch</strong>
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin-bottom: 0.5cm; font-family: Inter, sans-serif;">
                        <span style="margin-right: 2cm;">Confidential & Proprietary</span>
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                        <span style="margin-left: 2cm;">TravelGuider AI</span>
                    </div>
                `
            },
            
            technical: {
                format: 'A4',
                landscape: false,
                printBackground: true,
                displayHeaderFooter: true,
                margin: {
                    top: '2cm',
                    right: '2cm',
                    bottom: '2.5cm',
                    left: '2cm'
                },
                headerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin-top: 0.5cm; font-family: Inter, sans-serif; border-bottom: 1px solid #ddd; padding-bottom: 0.5cm;">
                        Technical Specification
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin-bottom: 0.5cm; font-family: Inter, sans-serif;">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                    </div>
                `
            },
            
            presentation: {
                format: 'A4',
                landscape: true,
                printBackground: true,
                displayHeaderFooter: false,
                margin: {
                    top: '1cm',
                    right: '1cm',
                    bottom: '1cm',
                    left: '1cm'
                }
            }
        };
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(`
Usage: node html_to_pdf.js <input.html> <output.pdf> [preset]

Presets:
  pitchDeck     - Business pitch deck formatting (default)
  technical     - Technical document formatting  
  presentation  - Landscape presentation format

Examples:
  node html_to_pdf.js pitch-deck.html pitch-deck.pdf pitchDeck
  node html_to_pdf.js document.html document.pdf technical
        `);
        process.exit(1);
    }

    const [inputPath, outputPath, preset = 'pitchDeck'] = args;
    
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ Input file not found: ${inputPath}`);
        process.exit(1);
    }

    const converter = new HTMLToPDFConverter();
    const presets = HTMLToPDFConverter.getPresets();
    const presetOptions = presets[preset] || presets.pitchDeck;

    try {
        console.log(`🚀 Converting ${inputPath} to ${outputPath} using ${preset} preset...`);
        await converter.convertFile(inputPath, outputPath, presetOptions);
        console.log(`✅ Conversion completed successfully!`);
    } catch (error) {
        console.error(`❌ Conversion failed:`, error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = HTMLToPDFConverter;

// Run CLI if called directly
if (require.main === module) {
    main().catch(console.error);
}