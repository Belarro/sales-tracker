#!/usr/bin/env python3
"""
Content Analysis Script for PDF Optimization
Analyzes markdown content to optimize page layout and grouping
"""

import re
import sys
from typing import List, Dict, Tuple
from pathlib import Path

class ContentAnalyzer:
    def __init__(self, markdown_file: str):
        self.markdown_file = Path(markdown_file)
        self.content = self._read_content()
        self.sections = []
        self.toc_entries = []
        
    def _read_content(self) -> str:
        """Read the markdown content"""
        with open(self.markdown_file, 'r', encoding='utf-8') as f:
            return f.read()
    
    def analyze_structure(self) -> Dict:
        """Analyze document structure for optimal page layout"""
        sections = self._extract_sections()
        toc_analysis = self._analyze_toc()
        code_blocks = self._analyze_code_blocks()
        tables = self._analyze_tables()
        
        return {
            'sections': sections,
            'toc_analysis': toc_analysis,
            'code_blocks': code_blocks,
            'tables': tables,
            'recommendations': self._generate_recommendations(sections, code_blocks, tables)
        }
    
    def _extract_sections(self) -> List[Dict]:
        """Extract all sections with their content length"""
        sections = []
        lines = self.content.split('\n')
        current_section = None
        
        for i, line in enumerate(lines):
            # Match headers (# ## ### ####)
            header_match = re.match(r'^(#{1,6})\s+(.+)$', line)
            if header_match:
                # Save previous section
                if current_section:
                    current_section['end_line'] = i - 1
                    current_section['line_count'] = current_section['end_line'] - current_section['start_line']
                    sections.append(current_section)
                
                # Start new section
                level = len(header_match.group(1))
                title = header_match.group(2)
                current_section = {
                    'level': level,
                    'title': title,
                    'start_line': i,
                    'content_preview': line
                }
        
        # Don't forget the last section
        if current_section:
            current_section['end_line'] = len(lines) - 1
            current_section['line_count'] = current_section['end_line'] - current_section['start_line']
            sections.append(current_section)
        
        return sections
    
    def _analyze_toc(self) -> Dict:
        """Analyze table of contents for page fitting"""
        # Find TOC section
        toc_pattern = r'### 📖 Navigation Quick Links.*?(?=###|\n##|\Z)'
        toc_match = re.search(toc_pattern, self.content, re.DOTALL)
        
        if not toc_match:
            return {'exists': False}
        
        toc_content = toc_match.group(0)
        toc_lines = toc_content.count('\n')
        
        # Count entries
        entries = re.findall(r'- \*\*\[.*?\]\(.*?\)\*\*', toc_content)
        
        return {
            'exists': True,
            'line_count': toc_lines,
            'entry_count': len(entries),
            'estimated_pages': max(1, toc_lines // 45),  # ~45 lines per page
            'fits_one_page': toc_lines <= 45,
            'content': toc_content
        }
    
    def _analyze_code_blocks(self) -> List[Dict]:
        """Analyze code blocks for page break optimization"""
        code_blocks = []
        
        # Find all code blocks (both ``` and indented)
        fenced_pattern = r'```[\s\S]*?```'
        json_pattern = r'```json[\s\S]*?```'
        
        for match in re.finditer(fenced_pattern, self.content):
            content = match.group(0)
            line_count = content.count('\n')
            is_json = 'json' in content[:10].lower()
            
            code_blocks.append({
                'type': 'fenced',
                'language': 'json' if is_json else 'generic',
                'line_count': line_count,
                'char_count': len(content),
                'start_pos': match.start(),
                'end_pos': match.end(),
                'should_break': line_count > 30,  # Break if more than ~30 lines
                'keep_together': line_count <= 15  # Keep together if <= 15 lines
            })
        
        return code_blocks
    
    def _analyze_tables(self) -> List[Dict]:
        """Analyze tables for optimal page layout"""
        tables = []
        
        # Find markdown tables
        table_pattern = r'\|.*\|\n\|[-\s\|]+\|\n(\|.*\|\n)+'
        
        for match in re.finditer(table_pattern, self.content):
            content = match.group(0)
            lines = content.strip().split('\n')
            row_count = len([line for line in lines if line.startswith('|') and '---' not in line])
            
            tables.append({
                'row_count': row_count,
                'line_count': len(lines),
                'char_count': len(content),
                'start_pos': match.start(),
                'end_pos': match.end(),
                'should_break': row_count > 20,  # Break large tables
                'keep_together': row_count <= 10  # Keep small tables together
            })
        
        return tables
    
    def _generate_recommendations(self, sections: List[Dict], code_blocks: List[Dict], tables: List[Dict]) -> List[str]:
        """Generate optimization recommendations"""
        recommendations = []
        
        # Section analysis
        large_sections = [s for s in sections if s.get('line_count', 0) > 100]
        if large_sections:
            recommendations.append(f"Found {len(large_sections)} large sections that may need page break optimization")
        
        # Code block analysis
        large_code_blocks = [cb for cb in code_blocks if cb['should_break']]
        if large_code_blocks:
            recommendations.append(f"Found {len(large_code_blocks)} large code blocks that should allow page breaks")
        
        small_code_blocks = [cb for cb in code_blocks if cb['keep_together']]
        if small_code_blocks:
            recommendations.append(f"Found {len(small_code_blocks)} small code blocks that should be kept together")
        
        # Table analysis
        large_tables = [t for t in tables if t['should_break']]
        if large_tables:
            recommendations.append(f"Found {len(large_tables)} large tables that may need page breaks")
        
        return recommendations
    
    def generate_optimized_css_classes(self) -> str:
        """Generate CSS class annotations for content optimization"""
        css_annotations = []
        
        # Analyze and annotate content
        content_lines = self.content.split('\n')
        
        for i, line in enumerate(content_lines):
            # Detect large JSON blocks
            if '```json' in line.lower():
                # Count lines until closing ```
                json_lines = 0
                for j in range(i + 1, len(content_lines)):
                    if content_lines[j].strip() == '```':
                        break
                    json_lines += 1
                
                if json_lines > 20:
                    css_annotations.append(f"Line {i}: Add class 'large-code' for {json_lines}-line JSON block")
                else:
                    css_annotations.append(f"Line {i}: Add class 'keep-together' for {json_lines}-line JSON block")
        
        return '\n'.join(css_annotations)

def main():
    if len(sys.argv) != 2:
        print("Usage: python analyze_content.py <markdown_file>")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    
    if not Path(markdown_file).exists():
        print(f"Error: File {markdown_file} does not exist")
        sys.exit(1)
    
    analyzer = ContentAnalyzer(markdown_file)
    analysis = analyzer.analyze_structure()
    
    print("=== CONTENT ANALYSIS REPORT ===\n")
    
    print("SECTIONS:")
    for section in analysis['sections'][:10]:  # Show first 10 sections
        print(f"  Level {section['level']}: {section['title']} ({section.get('line_count', 0)} lines)")
    
    print(f"\nTOC ANALYSIS:")
    toc = analysis['toc_analysis']
    if toc['exists']:
        print(f"  Entries: {toc['entry_count']}")
        print(f"  Lines: {toc['line_count']}")
        print(f"  Fits one page: {toc['fits_one_page']}")
    else:
        print("  No TOC found")
    
    print(f"\nCODE BLOCKS: {len(analysis['code_blocks'])}")
    for i, cb in enumerate(analysis['code_blocks'][:5]):  # Show first 5
        print(f"  Block {i+1}: {cb['language']} ({cb['line_count']} lines) - {'BREAK' if cb['should_break'] else 'KEEP'}")
    
    print(f"\nTABLES: {len(analysis['tables'])}")
    for i, table in enumerate(analysis['tables'][:5]):  # Show first 5
        print(f"  Table {i+1}: {table['row_count']} rows - {'BREAK' if table['should_break'] else 'KEEP'}")
    
    print("\nRECOMMENDATIONS:")
    for rec in analysis['recommendations']:
        print(f"  - {rec}")
    
    print(f"\nCSS OPTIMIZATION SUGGESTIONS:")
    suggestions = analyzer.generate_optimized_css_classes()
    if suggestions:
        print(suggestions)
    else:
        print("  No specific CSS optimizations needed")

if __name__ == "__main__":
    main()