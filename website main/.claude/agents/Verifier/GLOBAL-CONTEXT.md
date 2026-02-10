# Verifier - Global Context

## Core Verification Frameworks (Cross-Project)

### 1. Multi-Layer Documentation Verification Protocol
**Validated In**: CI + TokenHunter + 2+ projects
**Evidence**: Hook system verification (92% accuracy), External integration verification (9/10 architecture), Documentation completeness (73/100 overall)

**Framework Steps**:
1. **Ground Truth Establishment**: Read actual config first (settings.json, actual files)
2. **Script Validation**: Verify claimed scripts exist and match paths
3. **Git History Cross-Reference**: Confirm dates against commits
4. **Complete Documentation Read**: Read all docs completely, no sampling
5. **Evidence Citation**: Line numbers, timestamps, file stats for all claims
6. **Gap Analysis**: Identify missing vs wrong information separately
7. **Cross-Reference Validation**: Consistency across multiple documentation files

**Key Insight**: Documentation can be 92% accurate yet critically incomplete (missing 25% of hooks). **Verify BOTH accuracy AND completeness independently**.

### 2. User Journey Verification Framework
**Validated In**: CI documentation verification
**Success Rate**: 73/100 overall user journey success prediction

**User Types & Paths**:
1. **New User**: Installation → First Use
2. **Troubleshooter**: Error → Resolution
3. **Developer**: Understanding → Contribution
4. **Integrator**: Requirements → Integration

**Verification Process**:
1. Identify distinct user types and expected paths
2. Map expected journey path per user type
3. Analyze available documents at each journey step
4. Verify completeness (can proceed?) vs accuracy (correct?)
5. Predict success probability from gap severity
6. Prioritize gaps by user impact (blocker vs inconvenience)
7. Cross-journey analysis for gaps affecting multiple user types

**Evidence Requirements**:
- Document all claims with file paths, line numbers, timestamps
- Record file stats for verification
- Classify gaps: Critical (blocks progress) vs High/Medium/Low

### 3. External Integration Verification Protocol
**Validated In**: CI + lamassu-labs TrustWrapper integration
**Score**: 9/10 architecture clarity, 6/10 replication feasibility

**Verification Layers**:
1. **Repository Existence Validation**: Verify all claimed external repos exist with exact paths
2. **Bridge Implementation Analysis**: Check import paths, fallback mechanisms, dependency handling
3. **Architecture Clarity Assessment**: Evaluate multi-repo boundary documentation
4. **Replication Feasibility Test**: Determine if integration can be recreated from docs
5. **Setup Completeness Check**: Identify missing installation/configuration steps
6. **Cross-Reference Validation**: Verify consistency across documentation files
7. **Misleading Content Detection**: Outdated/incorrect references identification

**Critical Finding**: External integrations can be architecturally well-documented (9/10) yet practically unreplicatable (6/10) due to missing setup instructions. **Verify BOTH architecture clarity AND replication completeness**.

### 4. Verification Commands Mastered (Cross-Project)

**Configuration Verification**:
```bash
cat .claude/settings.json
ls -lh .claude/settings.json
wc -l .claude/settings.json
```

**Script Verification**:
```bash
ls -lh interfaces/claude-bridge/scripts/[script-name].sh
wc -l interfaces/claude-bridge/scripts/[script-name].sh
grep -n "PATTERN" [script-name].sh
```

**Git History Verification**:
```bash
git log --follow [file]
git log --all --since="YYYY-MM-DD" --until="YYYY-MM-DD" --oneline
git show [commit] --stat
test -f [file]
```

**File Existence & Stats**:
```bash
ls -la [path]
ls -lh [path]/[file]
wc -l [file]
```

## Core Verification Methodologies (Cross-Project)

### Agent Verification Protocol
**Applicable to**: Any agent system validation

**Verification Aspects**:
1. **Identity Verification**: Confirm proper name, role, specialization
2. **Capability Testing**: Verify all claimed capabilities function as specified
3. **Response Format Validation**: Check compliance with system-wide formatting
4. **Memory Integrity**: Validate memory structure and knowledge retention
5. **Task Execution**: Verify commitment tracking and follow-through
6. **Collaboration Testing**: Test multi-agent interaction scenarios
7. **Edge Case Handling**: Verify behavior under unexpected conditions

### System Verification Framework
**Applicable to**: Any system component validation

**Verification Areas**:
1. **Component Integration**: Verify proper interaction between system parts
2. **Performance Measurement**: Benchmark against established baselines
3. **Security Validation**: Confirm proper security controls and protocols
4. **Error Handling**: Verify appropriate responses to error conditions
5. **Resource Management**: Validate efficient use of system resources
6. **State Management**: Confirm proper maintenance of system state
7. **Recovery Testing**: Verify system behavior after interruptions

### Documentation Verification Schema
**Applicable to**: Any technical documentation validation

**Verification Criteria**:
1. **Accuracy Validation**: Check technical correctness of all statements
2. **Completeness Assessment**: Verify all aspects properly documented
3. **Implementation Alignment**: Confirm documentation matches actual implementation
4. **Cross-Reference Integrity**: Validate all references point to correct information
5. **Clarity Evaluation**: Assess understandability and accessibility
6. **Format Compliance**: Verify adherence to documentation standards
7. **Version Compatibility**: Confirm documentation matches current system version

## Verification Metrics System (Universal)

**Applicable to**: Any verification activity

### Core Metrics
- **Coverage Score**: Percentage of component aspects verified
- **Compliance Rate**: Degree of adherence to specifications
- **Defect Density**: Number of issues per component unit
- **Test Efficiency**: Ratio of issues found to verification effort
- **Verification Completeness**: Comprehensiveness of verification
- **Resolution Rate**: Speed and completeness of issue remediation
- **Regression Freedom**: Absence of previously fixed issues

## Active Verification Techniques (Cross-Project)

**Applicable to**: All verification scenarios

1. **Black Box Testing**: Evaluating functionality without knowledge of internals
2. **White Box Testing**: Inspecting internal structures alongside functionality
3. **Regression Testing**: Ensuring new changes don't break existing functionality
4. **Performance Testing**: Measuring system behavior under various conditions
5. **Compliance Testing**: Verifying adherence to established protocols
6. **Usability Testing**: Assessing ease of use and user experience
7. **Edge Case Testing**: Validating behavior under extreme or unusual conditions
8. **Integration Testing**: Confirming proper interaction between components

## Guiding Principles (Universal)

**Applicable to**: All verification work

1. **Methodical Verification**: Apply systematic approaches to all verification activities
2. **Evidence-Based Validation**: Base all conclusions on observable evidence and measurable results
3. **Comprehensive Coverage**: Verify all aspects of a component, not just obvious functionality
4. **Reproducibility**: Ensure verification procedures can be replicated consistently
5. **Independence**: Maintain objective evaluation separate from implementation bias
6. **Precision**: Clearly distinguish between facts, observations, and interpretations
7. **Continuous Improvement**: Regularly enhance verification methodologies based on experience

## Critical Distinctions (Learned Across Projects)

### Completeness ≠ Accuracy
**Must verify both independently**:
- Hook docs: 92% accurate, 75% complete (missing PreToolUse)
- External integration: 9/10 architecture clarity, 6/10 replication feasibility

### Documentation vs Reality
**Always verify actual system state**:
- Example: Docs described Rust (2605 lines examples), Reality: 19 Bash scripts
- Impact: Developer confusion, contribution blocked

### Architecture vs Setup
**Both required for successful replication**:
- Architecture can be perfect (9/10) while setup missing (6/10)
- Users understand system but cannot replicate

## Best Practices (Cross-Project)

### Verification Evidence Requirements
1. **File Path Citations**: Always include absolute paths
2. **Line Number References**: Cite specific line numbers for all claims
3. **Timestamps**: Record when files were verified (YYYY-MM-DD HH:MM)
4. **File Statistics**: Include line counts, sizes, modification dates
5. **Command Examples**: Show exact verification commands used
6. **Git References**: Include commit hashes for historical validation

### Gap Classification System
**Priority Levels**:
1. **CRITICAL**: Blocks user progress, must fix immediately
2. **HIGH**: Significant user friction, fix this week/month
3. **MEDIUM**: Inconvenience, fix when possible
4. **LOW**: Nice to have, future enhancement

**Gap Types**:
- Missing information (completeness gap)
- Incorrect information (accuracy gap)
- Outdated information (version gap)
- Misleading information (clarity gap)

### Quality Assessment Framework
**For any verification activity**:
- Document scope completely
- Sample randomly (avoid confirmation bias)
- Verify with actual files (Read + bash commands)
- Check git history for claimed commits
- Validate file paths and counts
- Document all evidence with line numbers
- Assess discrepancies (acceptable vs critical)
- Provide clear verification status

---

## File Organization Protocol (Validated: CollaborativeIntelligence)

**Pattern**: Strict file organization structure for multi-agent systems
**Validation**: Organizational health improved from 65% → 100%
**Implementation Date**: 2025-10-09

### The 3 Golden Rules

**Rule 1: Root Directory = 6 Files ONLY**
- ALLOWED: README.md, CLAUDE.md, CLAUDE.local.md, CHANGELOG.md, CONTRIBUTING.md, README_OPEN_SOURCE.md
- FORBIDDEN: All other files (session logs, reports, analysis docs)

**Rule 2: docs/ = MARKDOWN ONLY**
- ALLOWED: .md files, images in docs/assets/
- FORBIDDEN: .json, .py, .txt, .log files

**Rule 3: Three-Stage Lifecycle**
- working/ (draft) → docs/ (final) → archive/ (historical)

### Validation Before File Operations

CRITICAL: Always validate before creating files:
```bash
tools/organization/validate-file-organization.sh
```

### When Uncertain
Signal @DirectoryOrganizer for file placement guidance.

### Enforcement Status
- Layer 1: Education (ACTIVE via ci/CLAUDE.md)
- Layer 2: Validation (ACTIVE via validation tools)
- Layer 3: Prevention (Available via SDK hooks)
- Layer 4: Audit (Available via violation logging)

### Impact
- Organization health: 99.9% (↑ from 65%)
- Root violations: 0 (all resolved)
- Test pass rate: 100% (35/35 tests)

**References**:
- Rules: docs/organization/FILE_ORGANIZATION_RULES.md
- Quick Ref: docs/organization/QUICK_REFERENCE.md
- Enforcement: working/agent-development/organizational-enforcement.ts

---

**Global Context**: Cross-project patterns validated in 2+ projects
**Last Updated**: 2025-10-09
**Projects Validated**: CollaborativeIntelligence, TokenHunter, external integrations
**Organizational Enforcement**: ACTIVE (Phase 2 deployment)
