# Repository Restructuring Testing Plan

This document outlines the testing strategy to verify the repository restructuring was successful and did not break existing functionality.

## Testing Goals

1. Verify all files were successfully relocated
2. Ensure file references and imports are updated correctly
3. Confirm core system functionality continues to work
4. Validate documentation contains correct path references
5. Ensure build and CI processes continue to function

## Pre-Restructuring Baseline

Before executing the restructuring, establish baseline functionality:

1. **System Functionality**
   - Record which agents are working
   - Document key CLI commands and expected outputs
   - Note build time and success/failure status

2. **Reference Inventory**
   - Create list of file count by type
   - Document important import patterns
   - Identify critical path references

## Test Phases

### Phase 1: File Integrity Tests

**Goal**: Ensure all files are present in the new structure

**Tests**:
1. **File Count Validation**
   ```bash
   # Compare file counts before and after restructuring
   find . -type f -not -path "*/node_modules/*" -not -path "*/target/*" -not -path "*/.git/*" | wc -l
   ```

2. **File Content Validation**
   ```bash
   # Check for unexpected binary changes
   git diff --stat
   ```

3. **Directory Structure Validation**
   ```bash
   # Verify expected directories exist
   ls -la src docs scripts config templates projects lib tests data knowledge-registry sessions Kanji
   ```

### Phase 2: Reference Validation

**Goal**: Ensure references are updated correctly

**Tests**:
1. **Path Reference Scan**
   ```bash
   # Look for old path references
   grep -r "BENCHMARKS/" --include="*.md" --include="*.js" --include="*.ts" --include="*.rs" .
   grep -r "Documentation/" --include="*.md" --include="*.js" --include="*.ts" --include="*.rs" .
   # Repeat for all renamed directories
   ```

2. **Import Validation**
   ```bash
   # Check for broken imports in code
   find . -name "*.js" -o -name "*.ts" -o -name "*.rs" | xargs grep -l "import" | xargs grep -l "from"
   ```

3. **Link Validation in Documentation**
   ```bash
   # Check for broken links in markdown files
   find . -name "*.md" | xargs grep -l "(" | xargs grep -l ")"
   ```

### Phase 3: Functionality Tests

**Goal**: Ensure system continues to work

**Tests**:
1. **Agent Activation Tests**
   - Activate key agents (Athena, Developer, etc.)
   - Verify memory access and proper function

2. **CLI Command Tests**
   - Test essential CLI commands
   - Verify expected outputs

3. **Build Verification**
   ```bash
   # Test builds for various components
   cd ci-rust-minimal && cargo build
   cd ../agent_cache && cargo build
   # Add other build commands as appropriate
   ```

### Phase 4: Integration Tests

**Goal**: Ensure the entire system works together

**Tests**:
1. **End-to-End Workflow Tests**
   - Execute sample workflows crossing multiple components
   - Verify complete processes work as expected

2. **Documentation Integration Tests**
   - Follow documentation tutorials to verify instructions work with new structure

3. **Agent Collaboration Tests**
   - Test workflows involving multiple agents
   - Verify cross-agent communication and references

## Testing Checklist

Use this checklist to verify all aspects of the restructuring:

### File Structure Checks
- [ ] All directories created according to plan
- [ ] No unexpected empty directories
- [ ] No duplicate files in old and new locations
- [ ] File permissions maintained

### Reference Checks
- [ ] No references to old directory paths
- [ ] Imports work properly in code files
- [ ] Documentation links resolve correctly
- [ ] Configuration files updated with new paths

### Functionality Checks
- [ ] CLI commands work as expected
- [ ] Agents activate correctly
- [ ] Memory systems function properly
- [ ] Build processes complete successfully

### Integration Checks
- [ ] End-to-end workflows function
- [ ] Cross-component interactions work
- [ ] Documentation reflects actual structure

## Issue Resolution

When issues are identified:

1. Document the issue in detail
2. Determine if it's a missing file or a reference issue
3. Apply targeted fixes using scripts or manual edits
4. Re-test the specific functionality
5. Document the resolution approach

## Post-Restructuring Verification

After the restructuring is complete:

1. Run the full test suite
2. Compare against pre-restructuring baseline
3. Document any anomalies or performance changes
4. Verify system with a fresh clone of the repository

## Reporting

Create a final testing report including:

1. Summary of tests performed
2. Issues discovered and their resolutions
3. Overall assessment of restructuring success
4. Recommendations for future improvements

This testing plan will help ensure a smooth transition to the new repository structure and minimize disruption to development workflows.