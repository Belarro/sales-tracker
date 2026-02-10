# Audit Framework

Perform comprehensive accuracy validation of a document across multiple verification dimensions.

Usage: Validate document accuracy including system functionality claims, external facts, mathematical calculations, and internal consistency.

## Multi-Dimensional Validation Framework

### 🔍 System Functionality Verification
- Validate claims about local system capabilities and features
- Cross-reference against actual file system, configurations, and code
- Verify tool availability and command functionality
- Check implementation status vs. claimed deployment

### 📊 Mathematical/Statistical Validation
- Verify all numerical calculations and statistical claims
- Check formula accuracy and mathematical reasoning
- Validate percentage calculations and metric derivations
- Identify unjustified or unproven quantitative assertions

### 🌐 External Fact Verification
- Cross-check factual claims against reliable sources
- Validate technical specifications and standards
- Verify library/framework version compatibility
- Check external system integration claims

### 📋 Internal Consistency Audit
- Identify contradictory statements within the document
- Check cross-reference accuracy and link validity
- Verify terminology consistency throughout
- Validate logical flow and argument coherence

### 🎯 Evidence-Based Assessment
- Require citations for all major claims
- Validate source credibility and recency
- Check evidence quality and relevance
- Identify unsupported assertions requiring validation

## Audit Process

1. **Parse Document Structure** - Extract claims, metrics, and assertions
2. **System Verification** - Validate local system and file claims
3. **Mathematical Check** - Verify all calculations and formulas
4. **Fact Verification** - Cross-check external claims and references
5. **Consistency Analysis** - Check internal logic and cross-references
6. **Evidence Evaluation** - Assess claim support and citation quality
7. **Generate Audit Report** - Comprehensive findings with severity ratings

## Output Format

### Validation Results
- ✅ **Validated Claims** - Confirmed accurate statements
- ⚠️ **Questionable Claims** - Requiring additional verification
- ❌ **Invalid Claims** - Demonstrably incorrect assertions
- 📊 **Statistical Summary** - Overall accuracy metrics
- 🔧 **Remediation Recommendations** - Specific correction guidance

## Detailed Validation Procedures

### System Functionality Verification

#### File System Claims
```bash
# Verify file existence
ls -la [path]
stat [file]
file [path]

# Check directory structure
find [dir] -type f -name "[pattern]"
tree [directory] -L [depth]

# Validate permissions
ls -la [file]
getfacl [file]
```

#### Code Implementation Claims
```bash
# Search for implementations
grep -r "function_name" --include="*.py"
ast-grep --pattern 'class $NAME { $$$ }'

# Verify dependencies
pip list | grep [package]
npm list [package]
cargo tree | grep [crate]
```

#### Configuration Validation
```bash
# JSON validation
jq . config.json
jsonlint config.json

# YAML validation
yaml-lint config.yml
yq eval . config.yml

# Environment checks
env | grep [VAR]
printenv [VAR]
```

### Mathematical/Statistical Validation

#### Calculation Verification
- Recalculate all formulas independently
- Verify units and conversions
- Check rounding and precision
- Validate statistical methods

#### Common Issues to Check
- Division by zero
- Overflow/underflow
- Unit mismatches
- Incorrect aggregations
- Statistical significance claims
- Sample size adequacy

### External Fact Verification

#### Source Hierarchy
1. Official documentation
2. Peer-reviewed publications
3. Industry standards
4. Reputable technical sources
5. Community consensus

#### Verification Methods
- Cross-reference multiple sources
- Check publication dates
- Verify author credentials
- Validate version compatibility
- Confirm technical specifications

### Internal Consistency Audit

#### Cross-Reference Validation
```markdown
- All internal links must resolve
- Section references must exist
- Figure/table numbers must match
- Cited sources must be listed
- Terminology must be consistent
```

#### Logic Flow Analysis
- Premise validity
- Argument structure
- Conclusion support
- Assumption identification
- Contradiction detection

### Evidence-Based Assessment

#### Citation Requirements
- Major claims need sources
- Statistics require references
- Technical specs need documentation
- External tools need links
- Methodologies need citations

#### Evidence Quality Criteria
- **High Quality**: Official docs, peer-reviewed, recent
- **Medium Quality**: Reputable sources, community validated
- **Low Quality**: Unofficial, outdated, unverified
- **Unacceptable**: No source, contradictory, unreliable

## Severity Classification

### Critical (P0)
- System-breaking inaccuracies
- Security vulnerabilities
- Data corruption risks
- Legal/compliance violations

### High (P1)
- Functional failures
- Major inconsistencies
- Significant calculation errors
- Missing critical evidence

### Medium (P2)
- Documentation mismatches
- Minor calculation errors
- Outdated references
- Inconsistent terminology

### Low (P3)
- Formatting issues
- Style inconsistencies
- Optional improvements
- Minor typos

### Info (P4)
- Suggestions
- Best practices
- Enhancement opportunities
- Future considerations

## Audit Report Template

```markdown
# Comprehensive Audit Report

## Document: [Name/Path]
## Date: [ISO Date]
## Auditor: Auditor Agent v1.0.0

## Executive Summary
- **Overall Accuracy Score**: [X]%
- **Total Claims Analyzed**: [N]
- **Validated Claims**: [N] ([X]%)
- **Issues Identified**: [N]
  - Critical: [N]
  - High: [N]
  - Medium: [N]
  - Low: [N]

## Detailed Findings

### System Functionality
[Detailed findings with evidence]

### Mathematical Accuracy
[Calculation verification results]

### External Facts
[Fact-checking outcomes]

### Internal Consistency
[Consistency analysis results]

### Evidence Quality
[Citation assessment]

## Critical Issues
[P0 issues requiring immediate attention]

## Recommendations

### Immediate Actions
1. [Critical fix]
2. [Security patch]
3. [Data correction]

### Short-term Improvements
1. [Documentation update]
2. [Calculation fix]
3. [Reference update]

### Long-term Enhancements
1. [Process improvement]
2. [Validation automation]
3. [Quality assurance]

## Evidence Appendix
[Supporting documentation, screenshots, logs]

## Validation Methodology
[Tools and techniques used]

---
Generated by Auditor Agent - CollaborativeIntelligence System
```

## Continuous Improvement

The audit framework continuously evolves through:
- Pattern recognition from previous audits
- Methodology refinement based on findings
- Tool enhancement for better detection
- Collaboration with other agents for comprehensive coverage

## Integration Notes

This framework integrates with:
- **Verifier**: For functional validation
- **Athena**: For historical context
- **Topologist**: For change tracking
- **Manager**: For issue escalation

The audit will generate a comprehensive validation report identifying accuracy issues, providing evidence-based corrections, and rating overall document reliability.