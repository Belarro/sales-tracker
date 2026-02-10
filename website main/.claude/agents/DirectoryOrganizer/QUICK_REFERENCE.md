# DirectoryOrganizer Quick Reference Guide

**Version**: 1.0
**Last Updated**: 2025-10-01
**Purpose**: Fast reference for directory organization tasks

---

## 🎯 Core Principles (Remember These!)

1. **Human-Centric Design** - Organize for intuition, not rigid rules
2. **Backup First** - Always create backups before major changes
3. **Preserve Integrity** - Never modify file contents during organization
4. **Iterative Improvement** - Make gradual changes, not disruptive overhauls
5. **Document Changes** - Track what was done and why

---

## ⚡ Quick Start Checklist

### Before Any Organization Task

```
[ ] 1. Create comprehensive backup
[ ] 2. Document current structure (screenshot or tree output)
[ ] 3. Identify critical files and dependencies
[ ] 4. Get user confirmation for major changes
[ ] 5. Verify backup integrity
```

### During Organization

```
[ ] 1. Work incrementally (one section at a time)
[ ] 2. Test each change before moving forward
[ ] 3. Monitor for broken links/references
[ ] 4. Preserve file permissions and timestamps
[ ] 5. Log all operations performed
```

### After Organization

```
[ ] 1. Verify all files accessible and uncorrupted
[ ] 2. Test critical workflows still function
[ ] 3. Document new structure and rationale
[ ] 4. Confirm backup restoration capability
[ ] 5. Collect user feedback on improvements
```

---

## 🛡️ Archive Safety System (v2.0)

**Automated Protection**: Claude Code hook prevents unsafe archival operations

### Safety Rules

1. **Agent Delegation**
   - Only DirectoryOrganizer should archive files
   - Other agents: signal "DirectoryOrganizer, please archive [file]"

2. **One-By-One Archival**
   - No batch operations (`mv *.md archive/`)
   - Each file must be archived individually
   - Ensures conscious decision for each file

3. **Read-Before-Archive**
   - Must read file content before archiving
   - Hook blocks operation if file not read in session

4. **Permanent Value Protection (Location-Aware)**
   - `/working/` + `permanent_value: yes` → Block (should go to /docs/)
   - `/docs/` + `permanent_value: yes` → Block (update metadata to `no` first)
   - Protects permanent docs while allowing outdated /docs/ archival

5. **Root Archive Preference**
   - Use root-level `/archive/` directory
   - Non-root archives generate warnings

6. **Critical Location Warnings**
   - MEMORY.md, CLAUDE.md, README.md trigger warnings
   - Allowed but requires intentionality

### What Triggers the Hook

```bash
# These operations are intercepted:
mv working/report.md archive/
cp docs/old-guide.md archive/reports/
git mv working/draft.md archive/2025/
```

### If Blocked

**Scenario 1 - Wrong Agent**:
```
🛡️ Archive Safety - Agent Delegation Required
Current Agent: Analyst

Action Required:
Signal: "DirectoryOrganizer, please archive [file]"
```

**Scenario 2 - Batch Operation**:
```
🛡️ Archive Safety Check Failed - Batch Operation
Files must be archived one at a time

Action Required:
Archive each file individually after reading
```

**Scenario 3 - File Not Read**:
```
🛡️ Archive Safety Check Failed
File not read in this session

Action Required:
1. Read file content
2. Verify no permanent value
3. Retry archive operation
```

**Scenario 4 - Permanent Value in /working/**:
```
🛡️ Archive Safety Check Failed
File has permanent_value: yes

Action Required:
Move to appropriate /docs/ location (not archive)
```

**Scenario 5 - Permanent Value in /docs/**:
```
🛡️ Archive Safety - Permanent Documentation Review Required
File in /docs/ with permanent_value: yes

Action Required:
1. Update metadata: permanent_value: no
2. Add note explaining why no longer permanent
3. Retry archive operation
```

### Override (Not Recommended)

If you're certain the hook is incorrect:
```bash
# Temporarily disable (use with extreme caution)
# Edit .claude/settings.json and comment out PreToolUse hook
# OR use git mv which may not trigger bash hook
```

### Benefits

- ✅ Prevents accidental content loss
- ✅ Enforces one-by-one review workflow
- ✅ Protects important documentation (location-aware)
- ✅ Centralizes archival expertise to DirectoryOrganizer
- ✅ Encourages root-level /archive directory
- ✅ Educational feedback with clear guidance

**Hook Location**: `.claude/hooks/archive-safety.py` (v2.0)
**Configuration Guide**: `ARCHIVE_SAFETY_CONFIGURATION_GUIDE.md`
**Delegation Protocol**: `/docs/development/AGENT_ARCHIVE_DELEGATION_PROTOCOL.md`

---

## 📁 Standard Directory Hierarchy

### Nuru-AI Standard Template (✅ Recommended for Nuru-AI Projects)

**For projects in the Nuru-AI organization, use this structure:**

```
project-name/                      # lowercase-with-hyphens
├── CLAUDE.md                      # Project AI instructions (MANDATORY)
├── README.md                      # Project overview (MANDATORY)
├── .gitignore                     # Git ignore rules (MANDATORY)
├── requirements.txt               # Dependencies (MANDATORY if applicable)
├── src/                          # Source code
├── docs/                         # Documentation (MARKDOWN ONLY)
│   ├── README.md
│   ├── adrs/                     # Architectural Decision Records
│   ├── architecture/             # System design
│   ├── business/                 # Business docs
│   ├── compliance/               # Standards & audit
│   ├── guides/                   # Operational guides
│   ├── operations/               # Infrastructure
│   ├── reports/                  # MARKDOWN ONLY reports
│   │   ├── analysis/
│   │   ├── deployment/
│   │   ├── implementation/
│   │   ├── monitoring/
│   │   ├── testing/
│   │   └── validation/
│   └── security/                 # Security docs
├── tools/                        # Project-specific tools
├── tests/                        # Test files
├── archive/                      # Historical content
│   ├── data/                     # Archived data (.json, etc.)
│   └── logs/                     # Historical logs
└── working/                      # Work-in-progress
```

**Critical Rules**:
- ✅ Lowercase directories with hyphens
- ✅ MARKDOWN ONLY in `docs/` (no .json, .py, .txt)
- ✅ Data files → `archive/data/`
- ✅ Scripts → `tools/analysis/`
- ✅ Reference: Nuru-AI PROJECT_STRUCTURE_STANDARDS.md v3.0

### Alternative Template (Visual Priority - Personal Projects Only)

**⚠️ Do NOT use for Nuru-AI projects** - Use Nuru-AI Standard Template above

```
ProjectRoot/
├── 00-IMPORTANT/           # Critical, frequently accessed
├── 01-ACTIVE/             # Current work items
├── 02-RESOURCES/          # Reference materials
├── 03-TEMPLATES/          # Reusable boilerplates
├── 04-DOCUMENTATION/      # Guides and specs
├── 05-ARCHIVE/           # Historical items
├── 06-INBOX/             # Temporary holding area
└── 99-SYSTEM/            # Configuration files
```

**Use for**: Personal projects requiring visual sorting priority

### Development Project Template

```
project/
├── src/                   # Source code
├── tests/                # Test files
├── config/               # Configuration
├── docs/                 # Documentation
├── scripts/              # Automation scripts
├── build/                # Build outputs (gitignored)
└── data/                 # Data files
```

### CollaborativeIntelligence Knowledge Template

```
knowledge/
├── docs/                 # Permanent reference (long-term value)
├── working/              # Active work artifacts (temporary)
└── archive/              # Historical completed work
```

---

## 🏷️ File Naming Convention Quick Guide

### Pattern: `YYYY-MM-DD_description_version-status.ext`

**Examples:**
```
✅ 2025-10-01_meeting-notes_team-sync.md
✅ 2025-Q4_budget_draft-v2.xlsx
✅ user-authentication_v2.3_final.pdf
✅ homepage-design_2025-09-30_approved.fig

❌ file1.doc
❌ new file.doc
❌ final FINAL version (3).doc
❌ untitled.txt
```

### Naming Rules

1. **Use dates** - ISO format (YYYY-MM-DD) or quarters (2025-Q4)
2. **Be descriptive** - Name should explain content without opening
3. **Use hyphens/underscores** - Separate words clearly (avoid spaces)
4. **Include version** - For iterative content (v1, v2, draft, final)
5. **Add status** - When relevant (draft, review, approved, archived)

---

## 🔍 Common Tasks Quick Reference

### 1. Cleanup Messy Directory

```bash
# Step 1: Analyze current state
ls -lhR > directory-structure-before.txt
du -sh * | sort -h

# Step 2: Identify duplicates
find . -type f -exec md5 {} + | sort | uniq -w32 -dD

# Step 3: Create backup
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# Step 4: Organize (manual or scripted)
# Step 5: Verify
ls -lhR > directory-structure-after.txt
diff directory-structure-before.txt directory-structure-after.txt
```

### 2. Remove Duplicate Files

```bash
# Find duplicates by size and content
fdupes -r . > duplicates-report.txt

# Review and delete (CAREFUL!)
fdupes -r -d .  # Interactive deletion

# Or: Move duplicates to review folder
mkdir duplicates-review
# ... move duplicates for manual review
```

### 3. Archive Old Files

```bash
# Find files older than 1 year
find . -type f -mtime +365 -ls > old-files.txt

# Create archive structure
mkdir -p archive/$(date +%Y)

# Move old files (BACKUP FIRST!)
find . -type f -mtime +365 -exec mv {} archive/$(date +%Y)/ \;
```

### 4. Standardize File Names

```bash
# Convert spaces to hyphens
for file in *\ *; do mv "$file" "${file// /-}"; done

# Add date prefix to files without dates
for file in *.md; do mv "$file" "$(date +%Y-%m-%d)_$file"; done

# Lowercase all extensions
for file in *.JPG; do mv "$file" "${file%.JPG}.jpg"; done
```

---

## 📊 Document Lifecycle Management

### When to Move Documents

| From | To | Condition |
|------|-----|-----------|
| `working/` | `docs/` | Content finalized, has long-term value |
| `working/` | `archive/` | Work completed, historical value only |
| `docs/` | `archive/` | Outdated but historically significant |
| `inbox/` | `working/` | Ready for active work |
| `inbox/` | `archive/` | No longer relevant |

### Quality Gates for Promotion (`working/` → `docs/`)

```
[ ] Content complete and finalized
[ ] All links functional and appropriate
[ ] Proper formatting and structure
[ ] Clear value for future reference
[ ] Target audience identified
[ ] No sensitive/temporary information
```

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This

1. **Over-organize** - 7+ hierarchy levels = confusion
2. **Destroy project character** - Preserve creative elements, ASCII art, unique voice
3. **Skip backups** - One command can delete everything
4. **Ignore workflows** - Organization that conflicts with tools breaks productivity
5. **Rigid categorization** - Allow flexibility for exceptions
6. **Generic naming** - "file1.doc" tells you nothing
7. **Batch delete without review** - Always review before permanent deletion

### ✅ Do This Instead

1. **Keep it simple** - 2-4 levels usually sufficient
2. **Enhance identity** - Update paths, preserve personality
3. **Backup everything** - Automated, tested, verified
4. **Respect workflows** - Organize around how people actually work
5. **Flexible rules** - Guidelines, not laws
6. **Descriptive naming** - "2025-Q4-budget-final.xlsx"
7. **Review → Move → Archive** - Three-stage deletion process

---

## 🔧 Troubleshooting

### Problem: Can't find files after organization

**Solution:**
1. Check backup location
2. Review operation log
3. Use `find` command with old file name
4. Restore from backup if needed
5. Create better documentation for new structure

### Problem: Broken links/references

**Solution:**
1. Identify affected files
2. Update relative paths in configurations
3. Use `grep -r "old/path"` to find references
4. Document path migrations
5. Test all critical workflows

### Problem: Organization degraded over time

**Solution:**
1. Schedule periodic maintenance (monthly/quarterly)
2. Create clear rules for new content
3. Automate common organization tasks
4. Monitor for anti-patterns
5. Quick cleanup sessions (15 min/week)

### Problem: Team not following new structure

**Solution:**
1. Simplify organization (reduce complexity)
2. Create visual guides/README files
3. Provide training/examples
4. Make rules intuitive, not arbitrary
5. Gather feedback and adapt

---

## 📏 Quality Validation Checklist

### Post-Organization Validation

```
[ ] All files accessible at expected locations
[ ] Critical workflows tested and functional
[ ] File permissions/ownership preserved
[ ] No broken symbolic links
[ ] Backup restoration tested and working
[ ] Documentation updated with new structure
[ ] User feedback collected (if applicable)
[ ] Performance impact acceptable
[ ] Naming conventions consistently applied
[ ] Archive properly labeled and dated
```

---

## 🎓 Advanced Tips

### 1. Use `.gitkeep` for Empty Directories

```bash
# Git doesn't track empty directories
# Add .gitkeep to preserve structure
find . -type d -empty -exec touch {}/.gitkeep \;
```

### 2. Generate Directory Tree Diagrams

```bash
# Install tree: brew install tree (macOS)
tree -L 3 -I 'node_modules|.git' > structure.txt
```

### 3. Batch Operations with `fd` and `rg`

```bash
# Modern alternatives to find/grep
fd -t f -e md  # Find all markdown files
rg "TODO" --files-with-matches  # Find files containing TODO
```

### 4. Automate Cleanup with Scripts

Create a `cleanup.sh` script for regular maintenance:
```bash
#!/bin/bash
# Remove temp files
find . -name "*.tmp" -delete
find . -name ".DS_Store" -delete
# Archive old files
find . -mtime +365 -exec mv {} archive/$(date +%Y)/ \;
```

### 5. Monitor Directory Health

```bash
# Watch directory size
watch -n 60 'du -sh * | sort -h'

# Track file count by type
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -n
```

---

## 📞 When to Use DirectoryOrganizer

### Activate DirectoryOrganizer For:

- ✅ Directory cleanup and organization tasks
- ✅ Cluttered or confusing directory structures
- ✅ New project setup and structure creation
- ✅ File system migration or consolidation
- ✅ Workspace optimization and productivity
- ✅ Establishing naming conventions
- ✅ Duplicate removal and storage optimization
- ✅ Creating user-friendly navigation

### Don't Use DirectoryOrganizer For:

- ❌ Code refactoring (use Refactorer agent)
- ❌ Content editing (use appropriate content agents)
- ❌ Database organization (use specialized tools)
- ❌ Network file systems requiring special permissions
- ❌ Real-time synchronized directories (cloud storage conflicts)

---

## 📚 Additional Resources

### Internal Documentation
- **Full Memory**: `AGENTS/DirectoryOrganizer/MEMORY.md`
- **Safety Protocols**: `AGENTS/DirectoryOrganizer/PERSISTENCE_PROTOCOL.md`
- **Learning Log**: `AGENTS/DirectoryOrganizer/CONTINUOUS_LEARNING.md`
- **Architecture Analysis**: `AGENTS/DirectoryOrganizer/MEMORY_ARCHITECTURE_ANALYSIS.md` (if available)

### CI System Integration
- **Knowledge Organization Standards**: See MEMORY.md lines 16-48
- **Sprint Completion Patterns**: See MEMORY.md lines 44-48
- **BRAIN Batch Loading**: See CONTINUOUS_LEARNING.md lines 376-392

### Tools & Commands
- `tree` - Directory structure visualization
- `fdupes` - Duplicate file finder
- `fd` - Modern find alternative
- `rg` (ripgrep) - Fast grep alternative
- `ncdu` - NCurses disk usage analyzer

---

**Quick Reference Version**: 1.0
**Maintained By**: DirectoryOrganizer Agent
**Last Updated**: 2025-10-01
**Feedback**: Submit improvements to CONTINUOUS_LEARNING.md
