# Manager Scripts - Quick Reference Card

**Status**: ✅ Production-Ready (Audit Score: 92/100)
**Date**: 2025-10-10

---

## Create New Agent

```bash
cd /path/to/CollaborativeIntelligence

# Basic creation
./AGENTS/Manager/scripts/create-agent.sh AgentName "Agent role" "Description"

# Example
./AGENTS/Manager/scripts/create-agent.sh Validator "Input validation specialist" "Ensures data integrity"
```

**What it creates**:
- ✅ `{agent}-instructions.md` (TIER 1: Identity)
- ✅ `GLOBAL-CONTEXT.md` (TIER 2: Knowledge)
- ✅ `LOCAL-CONTEXT.md` (TIER 3: Context)
- ✅ `metadata.json` (Assembly metadata)
- ✅ `MEMORY.md` (Raw logging)
- ✅ `README.md` (Human docs)
- ✅ `~/.claude/agents/{agent}.md` (Assembled file)

**Next steps**:
1. Review `{agent}-instructions.md` and fill [TO BE FILLED] sections
2. Restart Claude Code
3. Test with `@agent-{name}`

---

## Migrate Existing Agent

```bash
# Preview changes (safe, no modifications)
./AGENTS/Manager/scripts/migrate-agent-format.sh AgentName --dry-run

# Migrate with backup (recommended)
./AGENTS/Manager/scripts/migrate-agent-format.sh AgentName --backup

# Migrate without backup (use with caution)
./AGENTS/Manager/scripts/migrate-agent-format.sh AgentName
```

**What it does**:
- Converts `README.md` → `{agent}-instructions.md`
- Converts `ContinuousLearning.md` → `GLOBAL-CONTEXT.md`
- Creates `metadata.json` and `LOCAL-CONTEXT.md`
- Creates timestamped backup (if `--backup` flag used)
- Assembles native agent file

**After migration**:
1. Review `{agent}-instructions.md` and complete [TO BE FILLED] sections
2. Review `GLOBAL-CONTEXT.md` and extract from old `ContinuousLearning.md`
3. Run `assemble-agent-file.sh AgentName` after edits
4. Restart Claude Code

---

## Validate Before Creation

```bash
# Check if agent name/role conflicts with existing agents
./AGENTS/Manager/scripts/validate-agent.sh AgentName "Agent role"
```

**What it checks**:
- ✅ Name format (alphanumeric, 3-30 chars)
- ✅ Role length (5-100 chars)
- ✅ Reserved names (Manager, System, Admin, Root, Test, Debug)
- ✅ String similarity (70% name, 60% role threshold)
- ✅ Semantic overlap (15 role categories: validation, documentation, analysis, etc.)

---

## Batch Create Agents

```bash
# Create config file
cat > batch-agents.json << 'EOF'
{
  "agents": [
    {
      "name": "Agent1",
      "role": "Agent 1 role",
      "description": "Agent 1 description"
    },
    {
      "name": "Agent2",
      "role": "Agent 2 role",
      "description": "Agent 2 description"
    }
  ]
}
EOF

# Run batch creation
./AGENTS/Manager/scripts/batch-create-agents.sh batch-agents.json
```

**What it does**:
- Parses JSON config
- Validates each agent
- Creates all agents
- Runs post-creation validation
- Generates comprehensive report

**Report includes**:
- Success count
- Validation warnings count
- Failed count
- Success rate percentage
- Remediation commands for failures

---

## Multi-Tier Architecture

### File Structure
```
AGENTS/{AgentName}/
├── {agent}-instructions.md   # TIER 1: Immutable Identity (assembled)
├── GLOBAL-CONTEXT.md          # TIER 2: Cross-Project Knowledge (assembled)
├── metadata.json              # Assembly metadata (for frontmatter)
├── MEMORY.md                  # Raw logging (NOT assembled)
├── README.md                  # Human documentation (NOT assembled)
└── Sessions/                  # Session logs (NOT assembled)

.claude/agents/{agent}/
└── LOCAL-CONTEXT.md           # TIER 3: Project Context (assembled)

~/.claude/agents/
└── {agent}.md                 # Assembled native file (Claude Code loads this)
```

### What Gets Assembled?
- ✅ `{agent}-instructions.md` → TIER 1
- ✅ `GLOBAL-CONTEXT.md` → TIER 2
- ✅ `LOCAL-CONTEXT.md` → TIER 3
- ✅ `metadata.json` → YAML frontmatter

### What Doesn't Get Assembled?
- ❌ `MEMORY.md` (raw logging only)
- ❌ `README.md` (human docs only)
- ❌ `Sessions/` (historical records only)

---

## Memory Update Flow

```
Agent does work in Claude Code
  ↓
PostToolUse hook → enhanced-memory-updater.sh
  ↓
Appends to MEMORY.md (raw log)
  ↓
auto-optimize-agent-memory-hook.sh detects change
  ↓
Invokes Mnemosyne agent for compression
  ↓
Extracts patterns → GLOBAL-CONTEXT.md (cross-project)
Extracts context → LOCAL-CONTEXT.md (project-specific)
  ↓
assemble-agent-file.sh rebuilds native file
  ↓
Restart Claude Code to load updated agent
```

---

## Common Commands

```bash
# Reassemble agent after editing source files
./interfaces/claude-bridge/scripts/assemble-agent-file.sh AgentName

# List all agents with old format
find AGENTS -name "README.md" -not -path "*/Sessions/*" | grep -v "{agent}-instructions.md"

# Check if agent is old or new format
ls AGENTS/AgentName/*-instructions.md 2>/dev/null && echo "New format" || echo "Old format"

# Verify assembled file exists
ls -lh ~/.claude/agents/agentname.md

# Check migration backup
ls -la AGENTS/AgentName/backup-*
```

---

## Troubleshooting

### Agent not loading in Claude Code?
1. Check assembled file exists: `ls ~/.claude/agents/{agent}.md`
2. Check YAML frontmatter: `head -10 ~/.claude/agents/{agent}.md`
3. Reassemble: `./interfaces/claude-bridge/scripts/assemble-agent-file.sh AgentName`
4. Restart Claude Code

### Migration failed?
1. Check backup exists: `ls AGENTS/AgentName/backup-*`
2. Review migration output for errors
3. Check all source files created:
   - `ls AGENTS/AgentName/{agent}-instructions.md`
   - `ls AGENTS/AgentName/GLOBAL-CONTEXT.md`
   - `ls .claude/agents/{agent}/LOCAL-CONTEXT.md`
   - `ls AGENTS/AgentName/metadata.json`

### Assembly failed?
1. Check source files exist (see above)
2. Check metadata.json is valid JSON: `jq . AGENTS/AgentName/metadata.json`
3. Check assembly script exists: `ls interfaces/claude-bridge/scripts/assemble-agent-file.sh`
4. Run assembly manually with error output: `./interfaces/claude-bridge/scripts/assemble-agent-file.sh AgentName`

### Validation warnings?
1. Review similar agents listed
2. Check if functional overlap is intentional
3. Consider merging agents if truly redundant
4. Override validation with `y` if unique value proposition exists

---

## Best Practices

### Creating Agents
1. ✅ Run validation BEFORE creation
2. ✅ Use descriptive names (CamelCase, starts with uppercase)
3. ✅ Provide clear role description (5-100 chars)
4. ✅ Review and complete [TO BE FILLED] sections immediately
5. ✅ Test agent with `@agent-{name}` after creation

### Migrating Agents
1. ✅ ALWAYS use `--backup` flag
2. ✅ Test with `--dry-run` first
3. ✅ Migrate high-activity agents first
4. ✅ Review [TO BE FILLED] sections and extract from old files
5. ✅ Reassemble after completing sections

### Batch Creation
1. ✅ Validate JSON config before running
2. ✅ Review batch report for failures
3. ✅ Fix validation warnings with remediation commands
4. ✅ Test each agent after batch creation

---

## File Locations

| File | Path | Purpose |
|------|------|---------|
| create-agent.sh | AGENTS/Manager/scripts/ | Create new agents |
| migrate-agent-format.sh | AGENTS/Manager/scripts/ | Migrate old agents |
| validate-agent.sh | AGENTS/Manager/scripts/ | Pre-creation validation |
| batch-create-agents.sh | AGENTS/Manager/scripts/ | Batch creation |
| assemble-agent-file.sh | interfaces/claude-bridge/scripts/ | Assembly |

---

## Documentation

- **Full Audit**: `AGENTS/Manager/MULTI_TIER_ARCHITECTURE_AUDIT_REPORT.md` (1,200+ lines)
- **Executive Summary**: `AGENTS/Manager/AUDIT_EXECUTIVE_SUMMARY.md` (Quick overview)
- **Quick Reference**: `AGENTS/Manager/QUICK_REFERENCE_CARD.md` (This file)
- **Manager README**: `AGENTS/Manager/README.md` (Comprehensive guide)
- **sdk-expert Review**: `AGENTS/Manager/MANAGER_NATIVE_AGENT_SYSTEM_REVIEW.md` (Original analysis)

---

## Version Info

**Scripts Version**: Multi-Tier Architecture (2025-10-09)
**Audit Date**: 2025-10-10
**Audit Score**: 92/100 ✅ Production-Ready
**Auditor**: Topologist

---

## Quick Examples

### Example 1: Create simple agent
```bash
./AGENTS/Manager/scripts/create-agent.sh Reporter "System reporting agent"
# Review AGENTS/Reporter/reporter-instructions.md
# Complete [TO BE FILLED] sections
# Restart Claude Code
# Test: @agent-reporter
```

### Example 2: Migrate existing agent
```bash
./AGENTS/Manager/scripts/migrate-agent-format.sh Validator --backup
# Check AGENTS/Validator/backup-* created
# Review AGENTS/Validator/validator-instructions.md
# Extract content from README.md.old
# Reassemble: ./interfaces/claude-bridge/scripts/assemble-agent-file.sh Validator
# Restart Claude Code
```

### Example 3: Batch create 5 agents
```bash
cat > agents-batch.json << 'EOF'
{
  "agents": [
    {"name": "Reporter", "role": "System reporting"},
    {"name": "Monitor", "role": "System monitoring"},
    {"name": "Logger", "role": "System logging"},
    {"name": "Auditor", "role": "System auditing"},
    {"name": "Tracker", "role": "System tracking"}
  ]
}
EOF

./AGENTS/Manager/scripts/batch-create-agents.sh agents-batch.json
# Review batch-creation-report-*.md
# Fix any validation warnings
# Restart Claude Code
```

---

**Need Help?** See full documentation or contact Topologist
