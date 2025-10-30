# Memory Update Triggers Reference

This document provides detailed specifications for standardized memory update triggers that all agents must implement to maintain knowledge continuity and growth.

## Core Trigger Types

### 1. Session Completion Trigger

**When to Use:**
- After completing a significant session or interaction
- When implementation of a feature or capability is finished
- At the conclusion of a problem-solving session
- Following a major analysis or design session

**Required Actions:**
1. Create or update session directory with proper structure
2. Document key insights, decisions, and outcomes
3. Create/update metadata.json with relevant information
4. Extract principles for potential inclusion in ContinuousLearning.md
5. Link session to related work through cross-references

**Example Workflow:**
```
1. Complete implementation of feature X
2. Create Sessions/FeatureX/ directory
3. Document implementation details in README.md
4. Create metadata.json with relevant data
5. Extract key principles learned during implementation
6. Update ContinuousLearning.md if principles are significant
7. Add cross-references to related sessions
```

### 2. Innovation Threshold Trigger

**When to Use:**
- Upon discovering novel approaches or patterns
- When developing new methodologies or techniques
- After creating improved frameworks or models
- When significant efficiency or quality improvements are found

**Required Actions:**
1. Document the innovation with complete details
2. Analyze applications and limitations
3. Update ContinuousLearning.md with the new principle
4. Consider implications for related knowledge areas
5. Add cross-references to implementation examples

**Example Workflow:**
```
1. Discover more efficient approach to X
2. Document complete details including before/after comparison
3. Analyze contexts where approach is applicable
4. Update ContinuousLearning.md with principle
5. Consider implications for related processes
6. Add cross-references to implementation examples
```

### 3. Frequency-Based Updates

**When to Use:**
- After 3-5 significant interactions
- Weekly or bi-weekly for active agents
- Monthly for less active agents
- When accumulated insights reach critical mass

**Required Actions:**
1. Review recent sessions and interactions
2. Identify common patterns or principles
3. Batch update ContinuousLearning.md
4. Update short-term memory in MEMORY.md
5. Refresh contextual prompts and immediate next steps

**Example Workflow:**
```
1. Review the past week's sessions
2. Identify patterns across different interactions
3. Consolidate learnings into principle statements
4. Update ContinuousLearning.md with new patterns
5. Refresh short-term memory in MEMORY.md
6. Update contextual prompts for session resumption
```

### 4. Knowledge Gap Trigger

**When to Use:**
- When encountering missing or inconsistent documentation
- When unable to find necessary information
- When documentation contradicts practical experience
- When knowledge areas lack sufficient detail

**Required Actions:**
1. Identify the specific knowledge gap
2. Research to fill the gap with accurate information
3. Create or update documentation in appropriate location
4. Establish proper cross-references
5. Verify consistency with existing knowledge

**Example Workflow:**
```
1. Identify missing documentation for process X
2. Research to understand correct implementation
3. Create new documentation with complete details
4. Place in appropriate knowledge structure
5. Add cross-references to related information
6. Verify consistency with existing documentation
```

### 5. Session Transition Trigger

**When to Use:**
- Before switching to a different session or topic
- When concluding work on a specific feature or component
- Between different phases of a project
- When changing focus areas

**Required Actions:**
1. Summarize current session accomplishments and status
2. Document current state and remaining work
3. Update global Sessions directory with session summary
4. Update short-term memory with status changes
5. Create contextual prompts for future resumption

**Example Workflow:**
```
1. Conclude current work on Feature X
2. Document current state and remaining tasks
3. Update session README.md with summary
4. Update metadata.json with status change
5. Update short-term memory in MEMORY.md
6. Create contextual prompts for future resumption
```

## Specialized Update Triggers

### 6. Identity Evolution Trigger

**When to Use:**
- When agent's core purpose or responsibilities change
- Following significant capability expansion
- After role redefinition or specialization
- When fundamental approaches change

**Required Actions:**
1. Document the nature and rationale of the identity change
2. Update long-term memory in MEMORY.md
3. Revise guiding principles if necessary
4. Update core frameworks to reflect new identity
5. Ensure alignment across all knowledge structures

**Example Workflow:**
```
1. Document change in agent responsibilities
2. Update foundational purpose in MEMORY.md
3. Revise guiding principles to align with new purpose
4. Update core frameworks for new responsibilities
5. Verify alignment in all knowledge structures
6. Update README.md to reflect identity changes
```

### 7. Cross-Agent Knowledge Trigger

**When to Use:**
- When knowledge has implications for multiple agents
- After discovering broadly applicable principles
- When developing shared methodologies or frameworks
- Following ecosystem-wide changes

**Required Actions:**
1. Document the knowledge with clear, generalizable language
2. Identify all agents affected by the knowledge
3. Create cross-references in affected agents' knowledge structures
4. Consider updating global knowledge repositories
5. Notify relevant oversight agents

**Example Workflow:**
```
1. Discover principle applicable to multiple agents
2. Document with clear, generalizable language
3. Identify all agents that should incorporate this knowledge
4. Create knowledge transfer documentation
5. Update affected agents' knowledge structures
6. Add cross-references to implementation sources
7. Notify oversight agents about the knowledge transfer
```

### 8. Quality Improvement Trigger

**When to Use:**
- When identifying documentation quality issues
- After detecting inconsistencies or contradictions
- When knowledge organization could be improved
- Following structural changes to documentation standards

**Required Actions:**
1. Identify specific quality issues or improvement opportunities
2. Plan restructuring or enhancement approach
3. Implement changes while preserving all knowledge
4. Verify improved organization and accessibility
5. Document quality improvements made

**Example Workflow:**
```
1. Identify poorly organized knowledge area
2. Plan improved structure and organization
3. Create backup of existing documentation
4. Implement restructuring while preserving all knowledge
5. Verify improved organization and accessibility
6. Document quality improvements made
```

## Implementation Guidelines

### Trigger Implementation Process

For all agents implementing standardized update triggers:

1. Create a triggers reference in agent's knowledge base
2. Document agent-specific examples for each trigger type
3. Establish monitoring mechanisms for trigger detection
4. Implement update workflows for each trigger type
5. Document trigger history for future reference

### Monitoring and Enforcement

To ensure proper trigger implementation:

1. Regular audits of agent knowledge structures
2. Verification of trigger-based updates
3. Quality assessment of update outcomes
4. Documentation of trigger effectiveness
5. Improvement of trigger definitions based on experience

### Customizing Triggers for Specific Agents

While maintaining standardization, agents may need customized triggers:

1. Identify specialized knowledge domains requiring unique triggers
2. Document agent-specific trigger definitions
3. Ensure alignment with standard trigger framework
4. Test effectiveness of specialized triggers
5. Share successful customizations for potential standardization

## Measuring Trigger Effectiveness

Evaluate the impact of standardized triggers using these metrics:

1. **Knowledge Currency**: Percentage of up-to-date information
2. **Update Frequency**: Number of triggered updates per time period
3. **Knowledge Growth**: New principles identified through triggers
4. **Consistency Improvement**: Reduction in contradictions and inconsistencies
5. **Cross-Reference Density**: Increase in knowledge connections

Track these metrics to assess the effectiveness of the trigger system and identify opportunities for improvement.

## Example Trigger Analysis

| Trigger Type | Frequency | Knowledge Impact | Implementation Quality |
|--------------|-----------|------------------|------------------------|
| Session Completion | High | Medium | Medium-High |
| Innovation Threshold | Low | High | High |
| Frequency-Based | Medium | Medium | Medium |
| Knowledge Gap | Medium | Medium-High | Medium |
| Session Transition | High | Low-Medium | Medium |
| Identity Evolution | Very Low | Very High | High |
| Cross-Agent Knowledge | Low | High | Medium-Low |
| Quality Improvement | Low | Medium | High |

---

This reference document provides the foundation for implementing standardized memory update triggers across all agents in the Collaborative Intelligence System. By following these guidelines, agents will maintain knowledge currency and facilitate continuous improvement through systematic learning processes.