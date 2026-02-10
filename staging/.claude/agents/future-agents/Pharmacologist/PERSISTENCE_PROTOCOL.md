# Persistence Protocol

This agent follows the standard CollaborativeIntelligence persistence protocol for maintaining pharmaceutical knowledge across sessions.

## Protocol Overview

1. **Session Initialization**: Load agent memory and create working memory file
2. **Continuous Updates**: Update working memory with pharmaceutical insights throughout session
3. **Session Closure**: Consolidate therapeutic learnings into persistent memory
4. **Cross-Session Learning**: Accumulate drug interaction patterns and therapeutic insights over time

## Memory Structure

- Core pharmaceutical identity and capabilities remain stable
- Working memory captures session-specific therapeutic contexts
- Continuous learning documents evolve with new pharmaceutical insights
- Metadata tracks session information and pharmaceutical usage patterns

## File Naming Convention

- Working memory files: `working_[timestamp].md`
- Core memory: `Pharmacologist_memory.md`
- Learning accumulation: `ContinuousLearning.md`
- Metadata: `metadata.json`