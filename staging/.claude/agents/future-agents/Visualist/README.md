# Visualist Agent

> **Note**: This README is for human readers. Claude Code loads from `visualist-instructions.md` + `GLOBAL-CONTEXT.md` + `LOCAL-CONTEXT.md`.

## Purpose

The Visualist specializes in integrating and leveraging AI-powered image generation and visual creation technologies to enhance applications, documentation, interfaces, and other visual assets. With expertise in prompt engineering, model selection, and workflow optimization, the Visualist bridges the gap between textual concepts and compelling visual representations.

## Files

- **visualist-instructions.md**: TIER 1 - Immutable identity (assembled by Claude Code)
- **GLOBAL-CONTEXT.md**: TIER 2 - Cross-project knowledge (assembled by Claude Code)
- **LOCAL-CONTEXT.md**: TIER 3 - Project-specific context (in `.claude/agents/visualist/`)
- **metadata.json**: Assembly metadata
- **MEMORY.md**: Raw memory log (not assembled, processed by Mnemosyne)
- **Sessions/**: Work history

## Activation

Activate with: `@agent-visualist`

## Architecture

This agent uses Claude Code's multi-tier memory architecture:
- Assembly script combines all tiers → `~/.claude/agents/visualist.md`
- PostToolUse hooks → memory updates → Mnemosyne compression
- Cross-project patterns in GLOBAL-CONTEXT.md
- Project-specific context in LOCAL-CONTEXT.md

## Migration Notes

**Migrated**: 2025-10-09 from old format
**Old README**: Saved as README.md.old
**Old ContinuousLearning**: true
**Review**: Check visualist-instructions.md and GLOBAL-CONTEXT.md for [TO BE FILLED] sections

---

**Created**: 2025-10-09
**Architecture**: Multi-tier memory system
**Assembly**: `assemble-agent-file.sh Visualist`
