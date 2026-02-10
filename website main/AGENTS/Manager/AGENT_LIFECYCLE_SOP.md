# Agent Lifecycle Management - Standard Operating Procedure

## MANDATORY PROTOCOLS

### Before ANY Agent Count Statement
1. **ALWAYS run live count verification:**
   ```bash
   ls -1 /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS | grep -v '\.md$' | grep -v '\.sh$' | grep -v '\.json$' | wc -l
   ```
2. **Update AGENTS.md header with current count**
3. **Never provide counts from memory or estimates**

### Agent Creation Protocol
1. **Pre-creation count verification**
2. **Create agent directory and files**
3. **Immediately update AGENTS.md count: OLD_COUNT + 1**
4. **Post-creation verification to confirm**

### Agent Deletion Protocol  
1. **Pre-deletion count verification**
2. **Remove agent directory**
3. **Immediately update AGENTS.md count: OLD_COUNT - 1**
4. **Post-deletion verification to confirm**

### Agent Registry Updates
1. **Always begin with live count**
2. **Update AGENTS.md entries**
3. **Update count header to match verified total**
4. **Never leave count mismatched**

## FAILURE ACCOUNTABILITY
- **Providing incorrect counts = INCOMPETENCE**
- **Not following verification protocol = FAILURE**
- **Leaving registry out of sync = NEGLIGENCE**

This SOP is now part of Manager's core competency requirements.