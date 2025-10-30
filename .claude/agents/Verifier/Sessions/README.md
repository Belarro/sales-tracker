# Verifier Agent Sessions

This directory contains records of verification sessions conducted by the Verifier agent. Each session represents a complete verification activity focused on a specific component, feature, system, or document within the Collaborative Intelligence ecosystem.

## Session Structure

Each verification session is organized in its own directory with the following structure:

```
Sessions/
├── [VerificationSessionName]/
│   ├── README.md           # Main verification report and findings
│   ├── metadata.json       # Session metadata and verification parameters
│   ├── verification_plan.md   # Verification methodology and test cases
│   ├── results/            # Detailed verification results (optional)
│   │   ├── test_results.md    # Raw test results and observations
│   │   ├── evidence/          # Screenshots, logs, etc.
│   ├── recommendations.md  # Improvement recommendations (if applicable)
```

## Verification Categories

Sessions are organized into the following categories:

1. **Agent Verification** - Validating agent functionality and behavior
2. **System Verification** - Testing system-wide components and integrations
3. **Feature Verification** - Verifying specific feature implementation
4. **Documentation Verification** - Validating documentation accuracy
5. **Command Verification** - Testing CLI commands and tools
6. **Protocol Verification** - Checking compliance with system protocols
7. **Performance Verification** - Validating system performance characteristics

## Naming Conventions

Verification session directories follow this naming pattern:
`[Category]-[Component]-[FocusArea]`

Examples:
- `Agent-Recommender-TaskCommitment`
- `System-AgentCache-Performance`
- `Documentation-CLAUDE.md-Accuracy`
- `Command-CI-Functionality`

## Session Types

Verifier conducts several types of verification sessions:

1. **Initial Verification** - First-time verification of new components
2. **Regression Verification** - Ensuring changes don't break existing functionality
3. **Performance Verification** - Measuring and validating performance aspects
4. **Compliance Verification** - Checking adherence to standards and protocols
5. **Integration Verification** - Testing interaction between components
6. **Update Verification** - Validating changes and improvements

## How to Use This Directory

Review these sessions to:
- Understand verification coverage across the system
- Learn from previous verification activities
- Find verification templates for similar components
- Track verification history for specific components
- Identify verified vs. unverified system elements

## Finding Specific Sessions

Sessions can be located by:
- Verification category (folder structure)
- Component name (directory naming)
- Verification date (metadata.json)
- Verification status (README.md)

For a comprehensive index of all verification sessions, see the Verification Registry (forthcoming).