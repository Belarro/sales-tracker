# Persistence Protocol

This agent follows the standard CollaborativeIntelligence persistence protocol for maintaining memory across sessions.

## Protocol Overview

1. **Session Initialization**: Load agent memory and create working memory file
2. **Continuous Updates**: Update working memory throughout session
3. **Session Closure**: Consolidate learnings into persistent memory
4. **Cross-Session Learning**: Accumulate patterns and insights over time

## Memory Structure

- Core identity and capabilities remain stable
- Working memory captures session-specific context
- Continuous learning documents evolve with new insights
- Metadata tracks session information and usage patterns

## File Naming Convention

- Working memory files: `working_[timestamp].md`
- Core memory: `[AgentName]_memory.md`
- Learning accumulation: `ContinuousLearning.md`
- Metadata: `metadata.json`