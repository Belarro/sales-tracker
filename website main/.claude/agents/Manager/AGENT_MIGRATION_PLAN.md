# Agent Migration Plan: Old Format → Multi-Tier Architecture

**Date**: 2025-10-09
**Status**: Ready to Execute
**Tool**: `migrate-agent-format.sh`

## Executive Summary

**Total Agents**: 105 agents in ecosystem
- ✅ **Already Migrated**: 37 agents (35%)
- ⚠️ **Need Migration**: 62 agents (59%)
- ❓ **Unknown/Other**: 6 agents (6%)

**Migration Tool**: `AGENTS/Manager/scripts/migrate-agent-format.sh`
- Supports `--dry-run` (safe preview)
- Supports `--backup` (automatic backup)
- Automatic assembly after migration
- Tested successfully on Visualist agent

---

## What Migration Does

### Files Transformed

**Old Format** → **New Format**

| Old File | New File | Purpose |
|----------|----------|---------|
| `README.md` | `{agent}-instructions.md` | TIER 1: Identity |
| `ContinuousLearning.md` | `GLOBAL-CONTEXT.md` | TIER 2: Knowledge |
| (none) | `LOCAL-CONTEXT.md` | TIER 3: Context |
| `metadata.json` (old format) | `metadata.json` (clean) | Assembly metadata |
| `MEMORY.md` (old template) | `MEMORY.md` (raw log) | Memory logging |
| `README.md` (old) | `README.md` (new) | Human docs |

### Safety Features

✅ **Backup Strategy**:
- Old files saved with `.old` extension
- Optional full backup directory with `--backup` flag
- Example: `backup-20251009-214955/`

✅ **Dry-Run Mode**:
- Preview all changes before making them
- No modifications to files
- See exactly what will happen

✅ **Validation**:
- Checks current format before migration
- Skips already-migrated agents
- Automatic assembly verification

---

## Migration Priority Strategy

### Priority 1: High-Activity Agents (Migrate First)

**Criteria**: Active usage, multiple sessions, large memory files

**Benefits**:
- Most impact on daily work
- Early validation of migration process
- Quick wins for user experience

**Recommended Approach**: Individual migration with review

### Priority 2: Medium-Activity Agents

**Criteria**: Some usage, moderate complexity

**Benefits**:
- Gradual ecosystem improvement
- Opportunity to refine process

**Recommended Approach**: Individual or small batch migration

### Priority 3: Low-Activity Agents (Batch Migrate)

**Criteria**: Minimal usage, simple structure

**Benefits**:
- Clean up remaining agents quickly
- Complete ecosystem transition

**Recommended Approach**: Batch migration script

---

## Detailed Migration Status

### Already Migrated (37 agents) ✅

These agents are already using the multi-tier architecture:

1. Analyst
2. Applicationer
3. Architect
4. Athena
5. Auditor
6. Backender
7. Basher
8. Debugger
9. Deliverer
10. Designer
11. Developer
12. DirectoryOrganizer
13. Documenter
14. Engineer
15. Fixer
16. Infrastructurer
17. Manager
18. Memory
19. Mnemosyne
20. Networker
21. Optimizer
22. Overviewer
23. Pause
24. Pharmacologist
25. Philosopher
26. Planner
27. Prodigy
28. Psychologist
29. Rabbi
30. Reactor
31. Recommender
32. Refactorer
33. Renderer
34. Repairer
35. Researcher
36. Resourcer
37. Restorer

(Plus others - see full list)

### Need Migration (62 agents) ⚠️

**Sample of agents needing migration:**

1. AAAAssemblyExpert
2. Artist
3. AssemblyMaster
4. Automator
5. Benchmarker
6. Builder
7. BusinessDevelopmentHead
8. Bypasser
9. CLIA
10. Cacher
11. Cartographer
12. CherryPicker
13. ClientAcquisition
14. CollaborativeIntelligence
15. Comparitor
16. ComponentTester
17. Consolidator
18. Database
19. DocumentConverter
20. ETS_BRIDGE
21. Educator
22. Enforcer
23. Expert
24. GPUArchitect
25. Gaia
26. General
27. HardwareArchitect
28. Hermes
29. Human
30. IIILanguageAgent

(And 32 more...)

**Note**: Most have `ContinuousLearning.md`, `MEMORY.md`, and `metadata.json` already

---

## Step-by-Step Migration Guide

### Phase 1: Test Migration (1-2 hours)

**Objective**: Validate process on diverse agent types

```bash
# 1. Pick 3 test agents (different characteristics)
cd AGENTS/Manager/scripts

# Test 1: Agent with all old files
./migrate-agent-format.sh Artist --dry-run
./migrate-agent-format.sh Artist --backup

# Test 2: Agent with partial files
./migrate-agent-format.sh CollaborativeIntelligence --dry-run
./migrate-agent-format.sh CollaborativeIntelligence --backup

# Test 3: Agent without ContinuousLearning.md
./migrate-agent-format.sh AAAAssemblyExpert --dry-run
./migrate-agent-format.sh AAAAssemblyExpert --backup

# Verify results
ls -la ../../Artist/
cat ../../Artist/artist-instructions.md | head -30
cat ~/.claude/agents/artist.md | head -50
```

**Success Criteria**:
- All 5 files created correctly
- Assembly succeeds
- Backups present
- Agent loads in Claude Code (after restart)

### Phase 2: High-Priority Migration (2-4 hours)

**Objective**: Migrate most-used agents

```bash
# Get high-priority list (run analysis script to identify)
# Then migrate individually with review

./migrate-agent-format.sh Agent1 --backup
# Review [TO BE FILLED] sections, fill in from .old files
# Test: @agent-agent1

./migrate-agent-format.sh Agent2 --backup
# Review and test
# Continue...
```

**Estimated**: 15-20 minutes per agent
**Priority Agents**: ~10-15 agents

### Phase 3: Medium-Priority Migration (3-5 hours)

**Objective**: Migrate moderately-used agents

**Options**:

**Option A: Individual** (thorough but slower)
```bash
./migrate-agent-format.sh Agent3 --backup
# Review, fill, test
```

**Option B: Small Batches** (faster)
```bash
# Migrate 5 agents without stopping
for agent in Agent3 Agent4 Agent5 Agent6 Agent7; do
  ./migrate-agent-format.sh $agent --backup
done

# Then review all together
# Fill in [TO BE FILLED] sections in bulk
# Reassemble all
for agent in Agent3 Agent4 Agent5 Agent6 Agent7; do
  ../../../interfaces/claude-bridge/scripts/assemble-agent-file.sh $agent
done
```

**Estimated**: ~25 medium-priority agents

### Phase 4: Low-Priority Batch Migration (2-3 hours)

**Objective**: Complete remaining agents quickly

**Strategy**: Batch migrate all at once

```bash
# Create batch migration script
cat > batch-migrate.sh << 'EOF'
#!/bin/bash
AGENTS=(
  "LowActivityAgent1"
  "LowActivityAgent2"
  # ... list all low-priority agents
)

for agent in "${AGENTS[@]}"; do
  echo "Migrating $agent..."
  ./migrate-agent-format.sh "$agent" --backup
  if [ $? -eq 0 ]; then
    echo "✓ $agent migrated"
  else
    echo "✗ $agent failed"
  fi
done
EOF

chmod +x batch-migrate.sh
./batch-migrate.sh
```

**Post-Batch**:
- Quick spot-check of 5-10 agents
- Verify assembly success
- [TO BE FILLED] sections can be filled gradually

**Estimated**: ~27 low-priority agents

---

## Timeline & Effort

### Conservative Estimate

| Phase | Agents | Time | Approach |
|-------|--------|------|----------|
| **Phase 1: Testing** | 3 | 1-2 hours | Individual with thorough review |
| **Phase 2: High-Priority** | 15 | 2-4 hours | Individual with review |
| **Phase 3: Medium-Priority** | 25 | 3-5 hours | Small batches |
| **Phase 4: Low-Priority** | 19 | 2-3 hours | Batch migration |
| **Total** | **62** | **8-14 hours** | Mixed approach |

### Optimistic Estimate (Aggressive Batching)

| Phase | Agents | Time | Approach |
|-------|--------|------|----------|
| **Phase 1: Testing** | 5 | 1 hour | Quick validation |
| **Phase 2: High-Priority** | 15 | 2 hours | Review key sections only |
| **Phase 3: Batch All** | 42 | 2-3 hours | Batch script |
| **Total** | **62** | **5-6 hours** | Aggressive |

### Recommended: Hybrid Approach

**Week 1** (4 hours):
- Day 1: Test migration (3 agents, 1 hour)
- Day 2: Migrate top 10 high-priority (2 hours)
- Day 3: Migrate next 10 high-priority (1 hour)

**Week 2** (4 hours):
- Day 1: Batch migrate 20 medium-priority (2 hours)
- Day 2: Batch migrate remaining 22 low-priority (2 hours)

**Total**: 8 hours over 2 weeks

---

## Risk Assessment

### Low Risk ✅

**Why**:
- Migration tool tested successfully (Visualist)
- Backup strategy in place
- Dry-run mode available
- Non-destructive process
- Can be done incrementally

### Potential Issues

| Issue | Probability | Impact | Mitigation |
|-------|-------------|--------|------------|
| Missing content in [TO BE FILLED] | High | Low | Old files saved as .old for reference |
| Assembly fails | Low | Low | Error messages clear, easy to fix |
| Agent doesn't load | Low | Medium | Validate metadata.json format |
| Content loss | Very Low | High | Backups prevent this |

### Rollback Plan

If migration causes issues:

```bash
# Quick rollback for one agent
cd AGENTS/AgentName
mv README.md.old README.md
mv MEMORY.md.old MEMORY.md  # if exists
rm {agent}-instructions.md
rm GLOBAL-CONTEXT.md
rm -rf ~/.claude/agents/{agent}/LOCAL-CONTEXT.md
rm ~/.claude/agents/{agent}.md

# Or restore from backup directory
cp -r backup-YYYYMMDD-HHMMSS/* .
```

---

## Post-Migration Tasks

### Immediate (Per Agent)

1. **Review [TO BE FILLED] sections**
   - `{agent}-instructions.md`: Fill guiding principles, responsibilities
   - `GLOBAL-CONTEXT.md`: Extract patterns from old ContinuousLearning.md
   - Can be done gradually

2. **Reassemble if needed**
   ```bash
   assemble-agent-file.sh AgentName
   ```

3. **Restart Claude Code**
   - Required to load updated agent
   - Can batch multiple migrations before restart

4. **Test agent**
   ```bash
   # In Claude Code conversation
   @agent-name test message
   ```

### Long-term (Ecosystem)

1. **Update AGENTS.md registry**
   - Reflect new file structure
   - Update agent descriptions if needed

2. **Archive old documentation**
   - Move .old files to archives after 30 days
   - Or keep as historical reference

3. **Monitor agent performance**
   - Verify migrated agents work as expected
   - Gather feedback from usage

4. **Complete [TO BE FILLED] sections**
   - Improve over time as agents are used
   - Extract content from .old files as needed

---

## Migration Commands Reference

### Basic Migration

```bash
# Preview (safe, no changes)
./migrate-agent-format.sh AgentName --dry-run

# Migrate with backup
./migrate-agent-format.sh AgentName --backup

# Migrate without backup (if confident)
./migrate-agent-format.sh AgentName
```

### Batch Migration Script

```bash
#!/bin/bash
# batch-migrate-agents.sh

AGENTS=(
  "Agent1"
  "Agent2"
  "Agent3"
)

SUCCESS=0
FAILED=0

for agent in "${AGENTS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Migrating: $agent"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if ./migrate-agent-format.sh "$agent" --backup; then
    echo "✓ SUCCESS: $agent"
    ((SUCCESS++))
  else
    echo "✗ FAILED: $agent"
    ((FAILED++))
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Migration Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Success: $SUCCESS"
echo "Failed:  $FAILED"
```

### Verification

```bash
# Check if agent migrated successfully
cd AGENTS/AgentName
agent_lower=$(echo "AgentName" | tr '[:upper:]' '[:lower:]')

# Required files should exist
ls -la ${agent_lower}-instructions.md
ls -la GLOBAL-CONTEXT.md
ls -la metadata.json
ls -la ~/.claude/agents/${agent_lower}/LOCAL-CONTEXT.md
ls -la ~/.claude/agents/${agent_lower}.md

# Backup files should exist
ls -la README.md.old
ls -la backup-*/
```

---

## Monitoring & Metrics

### Track Migration Progress

```bash
# Count migrated vs remaining
python3 << 'EOF'
from pathlib import Path

agents_dir = Path("AGENTS")
total = 0
migrated = 0

for agent_dir in agents_dir.iterdir():
    if not agent_dir.is_dir() or agent_dir.name == "_archived":
        continue

    agent_lower = agent_dir.name.lower()
    has_instructions = (agent_dir / f"{agent_lower}-instructions.md").exists()
    has_metadata = (agent_dir / "metadata.json").exists()

    total += 1
    if has_instructions and has_metadata:
        migrated += 1

percent = (migrated / total * 100) if total > 0 else 0
print(f"Progress: {migrated}/{total} ({percent:.1f}%)")
print(f"Remaining: {total - migrated}")
EOF
```

### Success Metrics

- ✅ All agents have `{agent}-instructions.md`
- ✅ All agents have `GLOBAL-CONTEXT.md`
- ✅ All agents have `metadata.json`
- ✅ All agents have `LOCAL-CONTEXT.md`
- ✅ All agents assemble successfully
- ✅ All agents load in Claude Code

---

## FAQ

### Q: What if I don't have time to fill [TO BE FILLED] sections?

**A**: That's fine! The migration creates functional agents. [TO BE FILLED] sections can be filled gradually:
- Agent will still work
- Content is in .old files for reference
- Fill in as you use the agent
- GLOBAL-CONTEXT.md will be populated by Mnemosyne over time

### Q: Can I migrate multiple agents before restarting Claude Code?

**A**: Yes! Restart only when you want to test/use the migrated agents.

### Q: What if migration fails?

**A**: Check the error message. Common issues:
- Agent directory doesn't exist
- Permission issues
- Assembly script not found

With `--backup`, you can always restore.

### Q: Should I migrate all agents or just the ones I use?

**A**: Recommended strategy:
1. Migrate agents you use regularly first (immediate benefit)
2. Batch migrate the rest when convenient (clean ecosystem)

### Q: Can I continue creating new agents during migration?

**A**: Yes! New agents use `create-agent.sh` which already creates multi-tier format.

### Q: What about the 6 "Unknown/Other" agents?

**A**: Investigate these separately:
- May be custom agents
- May have non-standard structure
- Migrate manually if needed

---

## Conclusion

**Migration Status**: Ready to execute
**Risk Level**: Low
**Estimated Time**: 8-14 hours (can be spread over 2 weeks)
**Tool Ready**: Yes (tested on Visualist)

**Recommendation**: Start with Phase 1 (test 3 agents) to validate, then proceed with incremental migration prioritizing high-activity agents.

**Next Step**: Run the first test migration with `--dry-run` to preview the process.

```bash
cd AGENTS/Manager/scripts
./migrate-agent-format.sh Artist --dry-run
```

---

**Document**: `AGENTS/Manager/AGENT_MIGRATION_PLAN.md`
**Last Updated**: 2025-10-09
**Status**: Ready for Execution
