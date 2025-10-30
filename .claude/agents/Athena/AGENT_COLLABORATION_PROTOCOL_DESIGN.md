# Agent Collaboration Protocol Design
**CollaborativeIntelligence System**

**Version**: 1.0.0
**Status**: Design Specification
**Created**: 2025-10-06
**Author**: Athena (Knowledge Architect)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Research Findings](#research-findings)
3. [Protocol Design](#protocol-design)
4. [Technical Specification](#technical-specification)
5. [Implementation Strategy](#implementation-strategy)
6. [Design Rationale](#design-rationale)
7. [Appendices](#appendices)

---

## Executive Summary

### Purpose

This document defines a comprehensive Agent Collaboration Protocol for the CollaborativeIntelligence system, enabling systematic multi-agent workflows, intelligent task routing, and seamless context handoff between specialized agents.

### Key Objectives

1. **Systematic Discovery**: Enable agents to find appropriate collaborators based on capabilities
2. **Seamless Handoff**: Preserve context and state during agent-to-agent delegation
3. **Quality Assurance**: Validate delegated work and integrate results systematically
4. **Learning Integration**: Capture collaboration patterns for continuous improvement
5. **Scalability**: Support growing ecosystem of 132+ specialized agents

### Current State

**Agents Analyzed**: 132 agent directories discovered
**Metadata Files Examined**: 15 agent metadata.json files
**Current Mechanisms**: Task tool (inline), SubagentStop hook, agent-orchestrator.sh
**Collaboration Mode**: Ad-hoc, manual invocation via Task tool

### Proposed State

**Structured Protocol**: Formal collaboration framework with discovery, handoff, and validation
**Intelligent Routing**: Automatic agent selection based on task requirements
**Context Preservation**: Standardized context transfer format across delegations
**Quality Gates**: Systematic validation of delegated work before integration

---

## Research Findings

### Part 1: Agent Ecosystem Analysis

#### 1.1 Agent Population

**Total Agent Count**: 132 agent directories discovered
**File Location**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/`

**Metadata Structure Analysis**:
- **Standard Format** (10 agents): Simple metadata with name, description, capabilities array
  - Example: Analyst, Developer, Debugger, Researcher, Scholar, Planner, Manager
  - Structure: `metadata.json` with basic fields (lines 1-13 typical)

- **Enhanced Format** (5 agents): Rich metadata with specializations, integration points
  - Example: Auditor, Tester, ClaudeCodeIntegrator, Athena
  - Structure: Extended with `specializations`, `integration_points`, `memory_architecture`
  - Auditor metadata.json (lines 1-49): Comprehensive validation specialist
  - Tester metadata.json (lines 1-31): Smart routing with `routing_patterns`

#### 1.2 Agent Categorization

**Development Domain** (estimated 30+ agents):
- Core: Developer, Architect, Designer, Builder
- Specialized: UI, Backender, Renderer, WebArchitect, HardwareArchitect, GPUArchitect
- Quality: Tester, Debugger, Verifier, Auditor
- Optimization: Refactorer, Optimizer, Standardist

**Analysis Domain** (estimated 20+ agents):
- Core: Analyst, Researcher, Scholar
- System: Topologist, Cartographer, Inspector, Overviewer
- Specialized: Benchmarker, Comparitor

**Architecture Domain** (estimated 15+ agents):
- System: Architect, TechnicalArchitect, SolutionArchitect, ImplementationArchitect
- Specialized: Infrastructurer, NetworkWorker, WebArchitect

**Knowledge Domain** (estimated 10+ agents):
- Memory: Athena, Memory, Mnemosyne, BrainCurator
- Documentation: Documenter, Writer, Linguist
- Learning: Scholar, Educator, Learner

**Business Domain** (estimated 10+ agents):
- Strategy: Strategist, Planner, Manager, Visionary
- Growth: BusinessDevelopmentHead, ClientAcquisition, Marketer, Trader

**Specialist Domain** (estimated 20+ agents):
- Security: Enforcer, Cryptographer
- Data: Database, Cacher
- Automation: Automator, Basher, ScriptWriter
- Content: Artist, Visualist, Shader, Socialmediaist
- Health: Pharmacologist, Psychologist, Wellness
- Philosophy: Philosopher, Sage, Rabbi
- Other: Gaia, Hermes, Shannon, Prodigy

**Utility Domain** (estimated 27+ agents):
- System: Fixer, Repairer, Restorer, Bypasser, Deliverer
- Organization: DirectoryOrganizer, Consolidator, CherryPicker, Cacher
- Quality: Verifier, Auditor, ComponentTester
- Coordination: Pause, General, Expert, Resourcer, Solver

#### 1.3 Capability Overlap Analysis

**High Overlap Areas**:
1. **Testing**: Tester, Verifier, Auditor, ComponentTester, Benchmarker
   - Tester: General QA and test automation (metadata.json line 3: "Smart routing agent for testing")
   - Verifier: System integrity validation (metadata.json line 3: "Verification and validation specialist")
   - Auditor: Accuracy validation with evidence (metadata.json lines 6-16: 10 specialized capabilities)
   - Gap: Clear routing rules needed for overlap resolution

2. **Architecture**: Architect, TechnicalArchitect, SolutionArchitect, ImplementationArchitect
   - Differentiation unclear from basic metadata
   - Need specialization markers for routing

3. **Memory**: Athena, Memory, Mnemosyne, BrainCurator
   - Athena: Memory architecture & knowledge systems (MEMORY.md line 24-28)
   - Memory: Memory system management (metadata.json line 3)
   - Mnemosyne: Memory optimization specialist (inferred from auto-optimization system)
   - BrainCurator: Brain/knowledge curation (inferred from name)

4. **Documentation**: Documenter, Writer, Scholar, Educator
   - Needs routing criteria for task type (API docs vs guides vs educational content)

**Capability Gaps Identified**:
- No explicit "router" or "orchestrator" agent (functionality embedded in agent-orchestrator.sh)
- No "integration" specialist for connecting systems
- Limited health monitoring beyond Wellness agent
- Missing explicit "security" meta-agent despite Enforcer/Cryptographer

#### 1.4 Current Agent Metadata Schema

**Standard Schema** (Analyst metadata.json lines 1-13):
```json
{
  "name": string,
  "description": string,
  "capabilities": array,
  "created_at": timestamp,
  "last_used": timestamp,
  "usage_count": number,
  "version": string,
  "toolkit_path": string,
  "memory_path": string,
  "learning_path": string,
  "attributes": object
}
```

**Enhanced Schema** (Auditor metadata.json lines 1-49):
```json
{
  // Standard fields...
  "specializations": {
    "primary": array,
    "secondary": array
  },
  "integration_points": array,
  "memory_architecture": {
    "core_memory": string,
    "continuous_learning": string,
    "framework": string,
    "sessions": string
  }
}
```

**Smart Routing Schema** (Tester metadata.json lines 11-17):
```json
{
  "routing_patterns": {
    "unit_testing": ["UnitTester", "Developer", "Verifier"],
    "integration": ["IntegrationTester", "APITester", "Verifier"],
    "e2e_testing": ["E2ETester", "AutomationTester", "UX"],
    "performance": ["PerformanceTester", "Benchmarker", "Optimizer"],
    "security": ["SecurityTester", "Auditor", "Verifier"]
  }
}
```

**Proposed Collaboration Extensions**:
```json
{
  "collaboration": {
    "delegates_to": ["agent1", "agent2"],
    "receives_from": ["agent3", "agent4"],
    "coordination_role": "orchestrator|specialist|support",
    "handoff_requirements": {
      "context_format": "full|summary|minimal",
      "validation_needed": boolean,
      "quality_gates": array
    }
  }
}
```

### Part 2: Current Collaboration Mechanisms

#### 2.1 Task Tool (Primary Delegation Mechanism)

**Location**: Claude Code native tool
**Usage Pattern**: Inline agent execution within parent session

**Implementation Evidence** (task-start-handler.sh lines 1-48):
```bash
# PostToolUse Hook: Captures Task tool invocations
TOOL_NAME=$(echo "$HOOK_DATA" | jq -r '.tool_name // ""')
[[ "$TOOL_NAME" != "Task" ]] && exit 0

# Store metadata for SubagentStop
METADATA_FILE="$METADATA_DIR/${SESSION_ID}.json"
cat > "$METADATA_FILE" << EOF
{
  "parent_session": "$SESSION_ID",
  "subagent_type": "$SUBAGENT_TYPE",
  "task_description": "$TASK_DESCRIPTION",
  "tool_use_id": "$TOOL_USE_ID",
  "timestamp": "$TIMESTAMP"
}
EOF
```

**Key Characteristics**:
- **Trigger**: Explicit Task tool invocation with `subagent_type` and `description`
- **Context**: Inherits parent session context (cwd, environment, project state)
- **Execution**: Two modes detected:
  1. **Inline**: Agent executes within parent session (no sidechain)
  2. **Sidechain**: Agent creates new session (detectable via `isSidechain` flag)
- **Tracking**: Metadata stored in `/tmp/claude-task-metadata/` for completion handler

**Limitations**:
- No explicit context packaging (relies on inheritance)
- No validation framework for returned results
- Manual integration of delegated work
- No automatic quality gates

#### 2.2 SubagentStop Hook (Completion Handler)

**Location**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/interfaces/claude-bridge/scripts/subagent-stop-handler.sh`
**Lines**: 207 lines of bash script
**Purpose**: Capture agent work and update agent memory

**Core Logic** (subagent-stop-handler.sh lines 64-146):
```bash
# Check if this is actually a sidechain (subagent session)
IS_SIDECHAIN=$(head -1 "$TRANSCRIPT_PATH" | jq -r '.isSidechain // false')
PARENT_UUID=$(head -1 "$TRANSCRIPT_PATH" | jq -r '.parentUuid // ""')

# STRATEGY 1: Load metadata from PostToolUse hook
METADATA_FILE="/tmp/claude-task-metadata/${PARENT_UUID}.json"
if [[ -f "$METADATA_FILE" ]]; then
    SUBAGENT_TYPE=$(jq -r '.subagent_type // ""' "$METADATA_FILE")
    TASK_DESCRIPTION=$(jq -r '.task_description // ""' "$METADATA_FILE")
    rm "$METADATA_FILE"  # Cleanup
fi

# STRATEGY 2: Fallback - Extract from parent session transcript
# STRATEGY 3: Final fallback - Detect from sidechain content
```

**Metadata Extraction** (lines 76-100):
- Tool count from transcript
- Files created (Write tool analysis)
- Tools used (frequency analysis)
- Agent's final response

**Memory Update** (lines 184-194):
```bash
cat >> "$AGENT_MEMORY" << EOF

## Learning from Task - $SESSION_DATE
**Task**: $TASK_DESCRIPTION
**Session**: $SESSION_ID
**Complexity**: $TOOL_COUNT tool uses
**Tools**: $TOOLS_USED
**Artifacts**: $FILES_CREATED
**Summary**: $AGENT_RESPONSE

EOF
```

**Key Characteristics**:
- **Automatic**: Triggered on sidechain session completion
- **Memory Capture**: Appends learning to agent's MEMORY.md
- **Triple Fallback**: Robust agent type detection
- **Auto-optimization**: Triggers Mnemosyne for memory compression (line 199-203)

**Limitations**:
- Only captures completion, not intermediate state
- No structured validation of agent output
- Memory format is append-only (can grow large)
- No cross-agent context sharing during execution

#### 2.3 Task Completion Handler (Inline Execution)

**Location**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/interfaces/claude-bridge/scripts/task-completion-handler.sh`
**Lines**: 271 lines of bash script
**Purpose**: Handle inline agent executions (non-sidechain)

**Differentiation Logic** (task-completion-handler.sh lines 114-122):
```bash
# Check if this was a sidechain execution
IS_SIDECHAIN=$(head -1 "$TRANSCRIPT_PATH" | jq -r '.isSidechain // false')

if [[ "$IS_SIDECHAIN" == "true" ]]; then
    log "Sidechain detected - letting SubagentStop handler process this"
    exit 0
fi

log "Inline execution confirmed - processing here"
```

**Tool Use ID Scoping** (lines 125-176):
```bash
# Extract agent work from transcript using tool_use_id boundaries
if [[ -n "$TOOL_USE_ID" ]]; then
    TASK_START_LINE=$(grep -n "\"id\":\"$TOOL_USE_ID\"" "$TRANSCRIPT_PATH" | head -1 | cut -d: -f1)
    TASK_END_LINE=$(grep -n "\"tool_use_id\":\"$TOOL_USE_ID\"" "$TRANSCRIPT_PATH" | head -1 | cut -d: -f1)

    # Extract only lines between Task tool invocation and result
    AGENT_TRANSCRIPT=$(sed -n "${TASK_START_LINE},${TASK_END_LINE}p" "$TRANSCRIPT_PATH")

    # Count tool uses in agent's scope (excluding the Task tool itself)
    TOOL_COUNT=$(echo "$AGENT_TRANSCRIPT" | grep -c '"type":"tool_use"' || echo "0")
    TOOL_COUNT=$((TOOL_COUNT - 1))
fi
```

**Race Condition Protection** (lines 62-86):
```bash
# Retry up to 5 times with exponential backoff (0.1s, 0.2s, 0.4s, 0.8s, 1.6s = ~3s total)
MAX_RETRIES=5
RETRY_COUNT=0
WAIT_TIME=0.1

while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    if [[ -f "$METADATA_FILE" ]]; then
        if jq -e . "$METADATA_FILE" >/dev/null 2>&1; then
            break
        fi
    fi
    sleep "$WAIT_TIME"
    RETRY_COUNT=$((RETRY_COUNT + 1))
    WAIT_TIME=$(echo "$WAIT_TIME * 2" | bc)
done
```

**Key Improvements**:
- **Precise Scoping**: Uses tool_use_id to isolate agent's work
- **Race Protection**: Exponential backoff for metadata file access
- **Duplicate Prevention**: Checks for session ID in memory before appending (line 235-239)
- **Auto-optimization**: Triggers memory compression after update (line 263-267)

#### 2.4 Agent Orchestrator (Team Management)

**Location**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/interfaces/claude-bridge/scripts/agent-orchestrator.sh`
**Lines**: 1210 lines of bash script
**Purpose**: Team assembly, smart routing, agent discovery

**Primary Agent Registry** (agent-orchestrator.sh lines 60-69):
```bash
PRIMARY_AGENTS=(
    "athena:Memory & Learning Systems Expert"
    "developer:Core Development Specialist"
    "architect:System Design Specialist"
    "debugger:Issue Resolution Specialist"
    "analyst:Data Analysis & System Assessment"
    "topologist:System Topology & Network Analysis"
    "ui:User Interface Design & Implementation"
    "refactorer:Code Refactoring & Optimization"
)
```

**Team Definitions** (lines 85-109):
```bash
function get_team_agents() {
    case "$1" in
        "development")
            echo "developer architect ui debugger refactorer tester"
            ;;
        "analysis")
            echo "athena analyst topologist researcher"
            ;;
        "business")
            echo "cfo salesman businessmanager marketer"
            ;;
        # ... additional teams
    esac
}
```

**Smart Routing System** (lines 665-710):
```bash
function route_to_smart_agent() {
    local user_request="$*"
    local request_lower=$(echo "$user_request" | tr '[:upper:]' '[:lower:]')

    # Critical issues / bugs → Fixer
    if [[ "$request_lower" =~ (critical|urgent|emergency|broken|crash) ]]; then
        echo "fixer"
        return
    fi

    # Development tasks → Builder
    if [[ "$request_lower" =~ (build|develop|implement|create) ]]; then
        echo "builder"
        return
    fi
    # ... additional patterns
}
```

**Complexity Assessment** (lines 712-734):
```bash
function assess_task_complexity() {
    local context="$1"
    local context_lower=$(echo "$context" | tr '[:upper:]' '[:lower:]')

    # High complexity indicators
    if [[ "$context_lower" =~ (architecture|system|multiple|complex) ]]; then
        echo "high"
    elif [[ "$context_lower" =~ (integration|api|database|auth) ]]; then
        echo "medium"
    else
        echo "low"
    fi
}
```

**Parallel Task Generation** (lines 736-769):
```bash
function generate_task_invocations() {
    local agents_list="$1"
    local task_description="$2"

    echo "**IMPORTANT:** Please use the Task tool to invoke the following agents in parallel:"

    for agent in $agents_list; do
        echo "- **${agent_capitalized}**: $task_description"
    done

    echo "**Instructions:**"
    echo "1. Use a **single message** with **multiple Task tool invocations**"
    echo "2. Set subagent_type to the agent name"
    echo "3. Pass the complete task description to each agent"
}
```

**Key Capabilities**:
- **Team Assembly**: Predefined teams (development, analysis, business, creative, infrastructure, enterprise)
- **Smart Routing**: Keyword-based agent selection from natural language request
- **Complexity-Based Scaling**: Adjusts team size based on task complexity
- **Parallel Coordination**: Generates instructions for multi-agent parallel execution
- **Custom Teams**: Save and load user-defined agent combinations

**Limitations**:
- **External Script**: Not integrated into Claude Code native flow
- **Manual Invocation**: Requires bash script execution, not seamless
- **No State Tracking**: Doesn't track multi-agent collaboration state
- **Limited Intelligence**: Regex-based routing, not semantic understanding

#### 2.5 Current Workflow Patterns

**Pattern 1: Manual Single Delegation**
```
User Request → Parent Agent → Task Tool → Child Agent → Result → Manual Integration
```
**Evidence**: ClaudeCodeIntegrator metadata.json (lines 40-44):
```json
"collaboration": {
  "primary_agents": ["Athena", "Documenter", "DirectoryOrganizer", "Consolidator"],
  "coordination": "Works with documentation specialists for comprehensive analysis",
  "reporting": "Regular progress updates to Athena and user"
}
```

**Pattern 2: Smart Team Assembly (External)**
```
User Request → Orchestrator Script → Team Assembly → Manual Task Tool Invocations
```
**Evidence**: agent-orchestrator.sh generates instructions for parallel invocation

**Pattern 3: Automatic Memory Update**
```
Task Completion → Hook Detection → Metadata Extraction → Memory Append → Auto-Optimization
```
**Evidence**: SubagentStop and TaskCompletion handlers with Mnemosyne integration

**Pattern 4: Sequential Handoff (Ad-hoc)**
```
Agent A → Completes → Manual Decision → Agent B → Task Tool → Continue Work
```
**No formal protocol**: Relies on user to orchestrate sequence

### Part 3: Current Limitations

#### 3.1 Discovery Limitations

**Problem**: No systematic agent discovery mechanism within Claude Code session
- Agents must be known in advance or discovered via external bash scripts
- No capability-based search ("I need an agent that can optimize SQL queries")
- No dynamic agent recommendation based on task analysis

**Evidence**:
- agent-orchestrator.sh provides discovery but requires external invocation
- No native search_agents() function accessible during session
- ClaudeCodeIntegrator metadata.json (line 41): Hard-coded primary_agents list

**Impact**:
- Suboptimal agent selection
- Missed specialist capabilities
- Manual research required for agent selection

#### 3.2 Context Handoff Limitations

**Problem**: No structured context transfer format
- Task tool passes description string only
- No standardized metadata (priority, constraints, dependencies)
- No explicit success criteria or validation requirements

**Evidence**:
- task-start-handler.sh (line 16): Only captures `task_description` and `subagent_type`
- No context packaging protocol in any examined files

**Impact**:
- Context loss during delegation
- Agents lack critical background information
- Repeated questions or incomplete work

#### 3.3 Work Integration Limitations

**Problem**: No validation framework for delegated work
- Results returned as unstructured text
- No quality gates or acceptance criteria checking
- Manual verification and integration required

**Evidence**:
- SubagentStop handler extracts summary but doesn't validate quality
- No validation hooks or quality checking mechanisms found

**Impact**:
- Quality inconsistencies
- Manual rework required
- No feedback loop for improvement

#### 3.4 State Management Limitations

**Problem**: No collaboration state tracking
- Can't resume interrupted multi-agent workflows
- No visibility into collaboration progress
- No dependency management for parallel work

**Evidence**:
- Hooks capture individual task completions but don't track relationships
- No collaboration state file or database found
- agent-orchestrator.sh is stateless (generates instructions only)

**Impact**:
- Fragile multi-step workflows
- No recovery from failures
- Limited collaboration complexity

#### 3.5 Learning Limitations

**Problem**: No systematic capture of collaboration patterns
- Memory updates capture individual agent work
- No cross-agent collaboration analysis
- No learning from successful/failed delegations

**Evidence**:
- Memory entries are agent-specific (MEMORY.md per agent)
- No collaboration analytics or pattern detection
- Tester MEMORY.md (lines 94-101): Only lists collaboration partnerships, no pattern data

**Impact**:
- Repeated suboptimal routing decisions
- No improvement in delegation strategies
- Missed optimization opportunities

---

## Protocol Design

### Part 1: Core Principles

#### 1.1 Design Philosophy

**Principle 1: Minimal Disruption**
- Build on existing Task tool and hook system
- Preserve current agent autonomy
- Add protocol layers, don't replace mechanisms
- Ensure backward compatibility

**Principle 2: Progressive Enhancement**
- Start with discovery and basic handoff
- Add validation and state management iteratively
- Prioritize high-value, low-complexity features
- Enable gradual adoption across agent ecosystem

**Principle 3: Human-AI Balance**
- Keep human in the loop for critical decisions
- Automate routine delegation patterns
- Provide transparency in agent selection
- Allow manual override of all automated decisions

**Principle 4: Evidence-Based Evolution**
- Capture collaboration metrics from day one
- Learn from successful patterns
- Adapt protocol based on real usage
- Continuously optimize routing intelligence

#### 1.2 Protocol Layers

**Layer 1: Discovery** (Foundation)
- Agent capability registry
- Capability-based search
- Task-agent matching
- Recommendation engine

**Layer 2: Handoff** (Core Protocol)
- Context packaging
- Standard metadata format
- Session state transfer
- Dependency declaration

**Layer 3: Validation** (Quality Assurance)
- Success criteria definition
- Quality gate checking
- Result validation framework
- Feedback integration

**Layer 4: Orchestration** (Advanced)
- Multi-agent workflow management
- Parallel execution coordination
- Dependency resolution
- Progress tracking

**Layer 5: Learning** (Continuous Improvement)
- Collaboration pattern capture
- Routing optimization
- Performance analytics
- Adaptive recommendations

### Part 2: Agent Discovery Mechanism

#### 2.1 Capability Registry Schema

**Registry Location**: `$CI_ROOT/interfaces/agent-registry/capabilities.json`

**Schema Structure**:
```json
{
  "agents": {
    "Athena": {
      "domains": ["memory", "knowledge", "learning", "architecture"],
      "capabilities": [
        {
          "id": "memory_architecture_design",
          "name": "Memory Architecture Design",
          "description": "Design hierarchical memory systems with efficient storage and retrieval",
          "keywords": ["memory", "storage", "architecture", "knowledge"],
          "complexity": "high",
          "typical_duration": "2-4 hours"
        },
        {
          "id": "knowledge_compression",
          "name": "Knowledge Compression",
          "description": "Compress large knowledge bases while preserving critical information",
          "keywords": ["compression", "optimization", "summarization"],
          "complexity": "medium",
          "typical_duration": "30-60 minutes"
        }
      ],
      "collaboration_preferences": {
        "works_well_with": ["Mnemosyne", "Scholar", "Documenter"],
        "delegates_to": ["Mnemosyne"],
        "receives_from": ["all"],
        "coordination_style": "strategic"
      },
      "quality_gates": {
        "requires_validation": true,
        "validation_agents": ["Auditor", "Verifier"],
        "acceptance_criteria": ["evidence_based", "line_references", "complete_analysis"]
      }
    },
    "Developer": {
      "domains": ["development", "implementation", "debugging"],
      "capabilities": [
        {
          "id": "feature_implementation",
          "name": "Feature Implementation",
          "description": "Implement new features with tests and documentation",
          "keywords": ["feature", "implementation", "coding", "development"],
          "complexity": "medium",
          "typical_duration": "1-3 hours"
        },
        {
          "id": "bug_fixing",
          "name": "Bug Fixing",
          "description": "Diagnose and fix bugs with root cause analysis",
          "keywords": ["bug", "fix", "debug", "error"],
          "complexity": "variable",
          "typical_duration": "30 minutes - 2 hours"
        }
      ],
      "collaboration_preferences": {
        "works_well_with": ["Architect", "Tester", "Debugger"],
        "delegates_to": ["Tester", "Documenter"],
        "receives_from": ["Architect", "Planner"],
        "coordination_style": "collaborative"
      }
    }
    // ... additional agents
  },
  "domains": {
    "memory": ["Athena", "Memory", "Mnemosyne", "BrainCurator"],
    "development": ["Developer", "Builder", "Implementer"],
    "testing": ["Tester", "Verifier", "Auditor"],
    "architecture": ["Architect", "TechnicalArchitect", "SolutionArchitect"]
    // ... additional domains
  },
  "version": "1.0.0",
  "last_updated": "2025-10-06"
}
```

#### 2.2 Capability Search Algorithm

**Algorithm: Semantic Capability Matching**

```python
def find_best_agents(task_description, context={}):
    """
    Find agents best suited for a task based on semantic matching.

    Args:
        task_description: Natural language task description
        context: Additional context (complexity, constraints, etc.)

    Returns:
        List of (agent_name, match_score, reasoning) tuples
    """
    # Step 1: Extract keywords from task description
    keywords = extract_keywords(task_description)
    complexity = context.get('complexity', estimate_complexity(task_description))

    # Step 2: Score all agents
    agent_scores = []
    for agent_name, agent_data in registry['agents'].items():
        score = 0
        reasoning = []

        # Domain matching (highest weight)
        domain_match = calculate_domain_overlap(keywords, agent_data['domains'])
        score += domain_match * 50
        if domain_match > 0:
            reasoning.append(f"Domain match: {domain_match:.2f}")

        # Capability keyword matching
        for capability in agent_data['capabilities']:
            keyword_match = calculate_keyword_overlap(keywords, capability['keywords'])
            if keyword_match > 0.5:
                score += keyword_match * 30
                reasoning.append(f"Capability '{capability['name']}': {keyword_match:.2f}")

        # Complexity matching
        if matches_complexity(capability['complexity'], complexity):
            score += 10
            reasoning.append("Complexity match")

        # Collaboration history (if available)
        if has_successful_history(agent_name, task_type):
            score += 20
            reasoning.append("Successful history with similar tasks")

        agent_scores.append((agent_name, score, reasoning))

    # Step 3: Sort and return top matches
    agent_scores.sort(key=lambda x: x[1], reverse=True)
    return agent_scores[:5]  # Top 5 recommendations
```

**Keyword Extraction**:
```python
def extract_keywords(text):
    """Extract relevant keywords from task description."""
    # Remove stop words
    tokens = tokenize(text.lower())
    tokens = [t for t in tokens if t not in STOP_WORDS]

    # Extract domain-specific terms
    keywords = []
    keywords.extend(extract_action_verbs(tokens))  # "implement", "analyze", "optimize"
    keywords.extend(extract_technical_terms(tokens))  # "API", "database", "memory"
    keywords.extend(extract_domain_indicators(tokens))  # "testing", "architecture"

    return deduplicate(keywords)
```

#### 2.3 Agent Recommendation Engine

**Query Interface**:
```bash
# CLI Usage
./agent-discovery.sh find "optimize database queries for performance"
./agent-discovery.sh recommend --complexity high --domain backend

# Within Claude Code session (via helper tool)
recommend_agent("implement user authentication with OAuth")
```

**Output Format**:
```
Agent Recommendations for: "optimize database queries for performance"

1. Developer (Score: 85/100)
   ✓ Domain match: development (0.8)
   ✓ Capability 'Performance Optimization': 0.9
   ✓ Successful history with similar tasks
   Typical Duration: 1-3 hours

2. Database (Score: 82/100)
   ✓ Domain match: data, optimization (1.0)
   ✓ Capability 'Query Optimization': 0.95
   Typical Duration: 30 minutes - 2 hours

3. Optimizer (Score: 75/100)
   ✓ Domain match: optimization (0.7)
   ✓ Capability 'Performance Tuning': 0.8
   Typical Duration: 1-2 hours

Recommendation: Use Developer + Database for comprehensive solution
- Developer: Overall implementation and integration
- Database: Specialized query optimization
```

#### 2.4 Registry Maintenance

**Auto-Generation from Metadata**:
```bash
#!/bin/bash
# generate-capability-registry.sh
# Scans all agent metadata.json files and builds capability registry

CI_ROOT="/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence"
REGISTRY_FILE="$CI_ROOT/interfaces/agent-registry/capabilities.json"

echo '{"agents": {}, "domains": {}, "version": "1.0.0"}' > "$REGISTRY_FILE"

for metadata_file in "$CI_ROOT/AGENTS"/*/metadata.json; do
    agent_name=$(jq -r '.name' "$metadata_file")
    description=$(jq -r '.description' "$metadata_file")

    # Extract domains from agent name and description
    domains=$(extract_domains "$agent_name" "$description")

    # Build capability list (from MEMORY.md, metadata, or inference)
    capabilities=$(extract_capabilities "$agent_name")

    # Add to registry
    jq --arg name "$agent_name" \
       --argjson domains "$domains" \
       --argjson capabilities "$capabilities" \
       '.agents[$name] = {domains: $domains, capabilities: $capabilities}' \
       "$REGISTRY_FILE" > "$REGISTRY_FILE.tmp"

    mv "$REGISTRY_FILE.tmp" "$REGISTRY_FILE"
done
```

**Manual Enrichment**:
- Agents can update their own capability entries via MEMORY.md
- Human curators can add collaboration preferences
- System learns typical_duration from actual execution logs

### Part 3: Context Handoff Protocol

#### 3.1 Standard Context Package Format

**Package Structure** (JSON):
```json
{
  "handoff_version": "1.0.0",
  "metadata": {
    "task_id": "uuid-v4",
    "parent_session": "session-uuid",
    "parent_agent": "Architect",
    "created_at": "2025-10-06T10:30:00Z",
    "priority": "high|medium|low",
    "estimated_complexity": "high|medium|low",
    "max_duration": "2 hours"
  },
  "task": {
    "title": "Implement authentication API",
    "description": "Full natural language description of the task",
    "success_criteria": [
      "API endpoints functional and tested",
      "Authentication logic secure and validated",
      "Documentation complete with examples"
    ],
    "constraints": [
      "Must use JWT tokens",
      "Backward compatible with v1 API",
      "Response time < 200ms"
    ],
    "dependencies": [
      {
        "type": "agent",
        "name": "Database",
        "status": "completed",
        "output_location": "/path/to/schema.sql"
      },
      {
        "type": "file",
        "path": "/Users/.../existing_auth.py",
        "description": "Current implementation to refactor"
      }
    ]
  },
  "context": {
    "project": {
      "name": "CollaborativeIntelligence",
      "root": "/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence",
      "type": "multi-agent system",
      "tech_stack": ["Python", "Bash", "JSON", "Claude Code"]
    },
    "session_state": {
      "cwd": "/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/api",
      "recent_files": ["/api/routes.py", "/api/models.py"],
      "conversation_summary": "Discussed authentication requirements, decided on JWT approach"
    },
    "relevant_knowledge": {
      "previous_decisions": [
        "Use bcrypt for password hashing (decided 2025-10-01)",
        "Session timeout: 24 hours (decided 2025-09-28)"
      ],
      "related_tasks": [
        {
          "task_id": "uuid-previous",
          "agent": "SecurityExpert",
          "outcome": "Recommended OAuth2 + JWT",
          "session": "session-uuid-prev"
        }
      ]
    }
  },
  "quality_requirements": {
    "validation_needed": true,
    "validation_agent": "SecurityExpert",
    "test_coverage_minimum": 80,
    "documentation_required": true,
    "acceptance_criteria": [
      "Passes security audit",
      "All tests green",
      "API documented in OpenAPI format"
    ]
  },
  "communication": {
    "status_updates": {
      "frequency": "on significant milestones",
      "channel": "inline responses"
    },
    "clarification_protocol": "ask parent agent if ambiguous",
    "escalation_criteria": [
      "Task cannot be completed as specified",
      "Constraint conflict detected",
      "Estimated duration exceeds max_duration by 50%"
    ]
  }
}
```

#### 3.2 Context Packaging Helper

**Implementation** (Python helper script):
```python
#!/usr/bin/env python3
# context-packager.py
# Helper to create standardized context packages for agent handoff

import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional

class ContextPackage:
    """Build standardized context packages for agent delegation."""

    def __init__(self, task_title: str, task_description: str, parent_agent: str):
        self.package = {
            "handoff_version": "1.0.0",
            "metadata": {
                "task_id": str(uuid.uuid4()),
                "parent_session": os.getenv("CLAUDE_SESSION_ID", "unknown"),
                "parent_agent": parent_agent,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "priority": "medium",
                "estimated_complexity": "medium",
                "max_duration": None
            },
            "task": {
                "title": task_title,
                "description": task_description,
                "success_criteria": [],
                "constraints": [],
                "dependencies": []
            },
            "context": {
                "project": {},
                "session_state": {},
                "relevant_knowledge": {}
            },
            "quality_requirements": {
                "validation_needed": False,
                "test_coverage_minimum": None,
                "documentation_required": False,
                "acceptance_criteria": []
            },
            "communication": {
                "status_updates": {"frequency": "on completion"},
                "clarification_protocol": "ask parent agent if ambiguous",
                "escalation_criteria": []
            }
        }

    def add_success_criterion(self, criterion: str):
        """Add a success criterion to the task."""
        self.package["task"]["success_criteria"].append(criterion)
        return self

    def add_constraint(self, constraint: str):
        """Add a constraint to the task."""
        self.package["task"]["constraints"].append(constraint)
        return self

    def add_dependency(self, dep_type: str, name: str, status: str,
                      output_location: Optional[str] = None):
        """Add a dependency (agent or file)."""
        dep = {
            "type": dep_type,
            "name": name,
            "status": status
        }
        if output_location:
            dep["output_location"] = output_location
        self.package["task"]["dependencies"].append(dep)
        return self

    def set_project_context(self, name: str, root: str, tech_stack: List[str]):
        """Set project context."""
        self.package["context"]["project"] = {
            "name": name,
            "root": root,
            "tech_stack": tech_stack
        }
        return self

    def add_relevant_decision(self, decision: str):
        """Add previous decision to knowledge context."""
        if "previous_decisions" not in self.package["context"]["relevant_knowledge"]:
            self.package["context"]["relevant_knowledge"]["previous_decisions"] = []
        self.package["context"]["relevant_knowledge"]["previous_decisions"].append(decision)
        return self

    def require_validation(self, validator_agent: str, criteria: List[str]):
        """Require validation by specific agent."""
        self.package["quality_requirements"]["validation_needed"] = True
        self.package["quality_requirements"]["validation_agent"] = validator_agent
        self.package["quality_requirements"]["acceptance_criteria"] = criteria
        return self

    def to_json(self) -> str:
        """Export as JSON string."""
        return json.dumps(self.package, indent=2)

    def to_markdown(self) -> str:
        """Export as human-readable markdown for delegation."""
        md = f"""# Task Handoff: {self.package['task']['title']}

**Task ID**: {self.package['metadata']['task_id']}
**From**: {self.package['metadata']['parent_agent']}
**Priority**: {self.package['metadata']['priority']}
**Complexity**: {self.package['metadata']['estimated_complexity']}

## Task Description

{self.package['task']['description']}

## Success Criteria

"""
        for criterion in self.package['task']['success_criteria']:
            md += f"- {criterion}\n"

        if self.package['task']['constraints']:
            md += "\n## Constraints\n\n"
            for constraint in self.package['task']['constraints']:
                md += f"- {constraint}\n"

        if self.package['task']['dependencies']:
            md += "\n## Dependencies\n\n"
            for dep in self.package['task']['dependencies']:
                md += f"- **{dep['type'].capitalize()}**: {dep['name']} ({dep['status']})\n"

        if self.package['context']['relevant_knowledge'].get('previous_decisions'):
            md += "\n## Relevant Previous Decisions\n\n"
            for decision in self.package['context']['relevant_knowledge']['previous_decisions']:
                md += f"- {decision}\n"

        if self.package['quality_requirements']['validation_needed']:
            md += f"\n## Validation Required\n\n"
            md += f"**Validator**: {self.package['quality_requirements']['validation_agent']}\n\n"
            md += "**Acceptance Criteria**:\n"
            for criterion in self.package['quality_requirements']['acceptance_criteria']:
                md += f"- {criterion}\n"

        return md

# Usage example
if __name__ == "__main__":
    package = ContextPackage(
        task_title="Implement User Authentication API",
        task_description="Create secure authentication endpoints using JWT tokens...",
        parent_agent="Architect"
    )

    package.add_success_criterion("API endpoints functional and tested") \
           .add_success_criterion("Authentication logic secure") \
           .add_constraint("Must use JWT tokens") \
           .add_constraint("Response time < 200ms") \
           .require_validation("SecurityExpert", ["Passes security audit", "No vulnerabilities"])

    print(package.to_markdown())
```

#### 3.3 Context Transfer Mechanism

**Approach 1: Enhanced Task Tool Metadata** (Preferred for Phase 1)

Extend Task tool input to accept context package:

```javascript
// Claude Code invocation
await taskTool({
  subagent_type: "Developer",
  description: contextPackage.to_markdown(),  // Human-readable format
  context_metadata: contextPackage.to_json()  // Machine-readable format (optional)
});
```

**Hook Integration**:
Modify `task-start-handler.sh` to capture full context:

```bash
# Extract context metadata if provided
CONTEXT_METADATA=$(echo "$TOOL_INPUT" | jq -r '.context_metadata // ""')

if [[ -n "$CONTEXT_METADATA" ]]; then
    # Store full context for retrieval
    CONTEXT_FILE="$METADATA_DIR/${SESSION_ID}_context.json"
    echo "$CONTEXT_METADATA" > "$CONTEXT_FILE"

    # Extract key fields for quick access
    TASK_ID=$(echo "$CONTEXT_METADATA" | jq -r '.metadata.task_id')
    PRIORITY=$(echo "$CONTEXT_METADATA" | jq -r '.metadata.priority')
    DEPENDENCIES=$(echo "$CONTEXT_METADATA" | jq -r '.task.dependencies | length')
fi
```

**Approach 2: Context Injection via Agent Prompt** (Future Enhancement)

Inject context package into agent's initial prompt automatically:

```markdown
You have been delegated a task with the following context:

[Context package in markdown format]

Please:
1. Review the success criteria and constraints
2. Check dependency status
3. Confirm understanding or ask clarifying questions
4. Proceed with implementation
```

#### 3.4 Session State Continuity

**Problem**: Agents need access to parent session state (files read, decisions made, conversation context)

**Solution**: Parent Session Summary

```python
def generate_session_summary(session_id: str) -> Dict:
    """Generate summary of parent session for context handoff."""
    transcript = read_transcript(session_id)

    return {
        "files_accessed": extract_file_paths(transcript),
        "tools_used": count_tool_usage(transcript),
        "key_decisions": extract_decisions(transcript),  # AI-powered extraction
        "conversation_summary": summarize_conversation(transcript),  # AI summarization
        "current_cwd": get_last_cwd(transcript),
        "environment": get_environment_vars(transcript)
    }
```

**Integration**: Include session summary in context package automatically

### Part 4: Work Delegation Framework

#### 4.1 Delegation Decision Criteria

**When to Delegate** (Decision Tree):

```
Is task outside current agent's core expertise?
├─ YES → Delegate to specialist
└─ NO → Is task complexity HIGH and benefits from collaboration?
    ├─ YES → Delegate subtasks or request specialist review
    └─ NO → Is task repetitive/routine and agent is overloaded?
        ├─ YES → Delegate to generalist or automation
        └─ NO → Handle directly
```

**Delegation Triggers**:

1. **Expertise Gap**: Task requires specialized knowledge
   - Example: Architect delegates security audit to SecurityExpert
   - Detection: Task keywords match specialist domain but not current agent

2. **Complexity Decomposition**: Large task benefits from divide-and-conquer
   - Example: Developer delegates testing to Tester while focusing on implementation
   - Detection: Task has multiple distinct phases or components

3. **Quality Assurance**: Output requires expert validation
   - Example: Any agent delegates verification to Auditor
   - Detection: Task has high-stakes outcomes or user-specified validation

4. **Parallel Execution**: Independent subtasks can run concurrently
   - Example: Architect delegates UI design and backend architecture simultaneously
   - Detection: Task has no interdependencies between subtasks

5. **Workload Balancing**: Agent is handling multiple tasks
   - Example: Overloaded Developer delegates routine refactoring to Refactorer
   - Detection: Agent has >3 active tasks in queue (future: workload tracking)

#### 4.2 Delegation Patterns

**Pattern 1: Sequential Handoff**

```
Agent A (Owner) → Agent B (Specialist) → Agent A (Integration)
```

**Use Case**: Specialist input needed for one phase

**Example**:
```markdown
Architect designs system → SecurityExpert reviews → Architect integrates feedback
```

**Implementation**:
```python
# In Architect session
context = ContextPackage(
    title="Security Review of Authentication Design",
    description="Review proposed JWT authentication design for vulnerabilities",
    parent_agent="Architect"
).add_dependency("file", "/design/auth-design.md", "completed")

# Delegate to SecurityExpert
result = delegate_to("SecurityExpert", context)

# Integrate feedback
incorporate_security_feedback(result)
```

**Pattern 2: Parallel Delegation**

```
Agent A (Coordinator)
├─ Agent B (Subtask 1) ─┐
├─ Agent C (Subtask 2) ─┼─→ Agent A (Integration)
└─ Agent D (Subtask 3) ─┘
```

**Use Case**: Independent subtasks that can execute concurrently

**Example**:
```markdown
Architect coordinates:
├─ UI Designer: Design user interface
├─ Developer: Implement backend API
└─ Database: Design data schema
```

**Implementation**:
```python
# In Architect session
subtasks = [
    ("UI", "Design user interface for authentication flow"),
    ("Developer", "Implement authentication API endpoints"),
    ("Database", "Design user and session tables")
]

# Delegate in parallel
results = parallel_delegate(subtasks)

# Wait for all completions and integrate
integrated_result = integrate_parallel_results(results)
```

**Pattern 3: Chain Delegation**

```
Agent A → Agent B → Agent C → Agent A
```

**Use Case**: Sequential pipeline where each stage feeds the next

**Example**:
```markdown
Researcher → Analyst → Developer → Tester → Researcher (report)
```

**Implementation**:
```python
# Multi-stage delegation with context accumulation
context = ContextPackage(title="Feature X Research to Implementation", ...)

# Stage 1: Research
research_result = delegate_to("Researcher", context)
context.add_dependency("agent", "Researcher", "completed", research_result.output)

# Stage 2: Analysis
analysis_result = delegate_to("Analyst", context)
context.add_dependency("agent", "Analyst", "completed", analysis_result.output)

# Stage 3: Implementation
impl_result = delegate_to("Developer", context)

# Final integration
final_report = compile_pipeline_results([research_result, analysis_result, impl_result])
```

**Pattern 4: Review Delegation**

```
Agent A (Producer) → Agent B (Reviewer) → Agent A (Revise)
```

**Use Case**: Quality assurance and validation

**Example**:
```markdown
Developer implements → Auditor validates → Developer fixes issues
```

**Implementation**:
```python
# Initial implementation
implementation = complete_task(task)

# Request review with validation criteria
review_context = ContextPackage(
    title="Validate Implementation of Feature X",
    description="Review implementation for correctness and completeness",
    parent_agent="Developer"
).require_validation("Auditor", [
    "Code follows style guidelines",
    "All edge cases tested",
    "No security vulnerabilities"
])

review_result = delegate_to("Auditor", review_context)

if review_result.status == "approved":
    return implementation
else:
    # Address issues and re-submit
    fixed_implementation = address_review_comments(review_result.issues)
    return fixed_implementation
```

#### 4.3 Delegation Lifecycle

**Phase 1: Preparation**
1. Analyze task requirements
2. Identify delegation candidate (specialist agent)
3. Build context package with all necessary information
4. Define success criteria and validation requirements

**Phase 2: Handoff**
1. Invoke Task tool with delegated agent and context
2. Record delegation metadata (parent, child, task_id, timestamp)
3. Monitor for clarification questions
4. Provide additional context if requested

**Phase 3: Execution** (Child Agent)
1. Receive context package
2. Validate understanding (ask questions if unclear)
3. Execute task within constraints
4. Document work and decisions
5. Package results for return

**Phase 4: Integration** (Parent Agent)
1. Receive delegated results
2. Validate against success criteria
3. Request revision if quality gates not met
4. Integrate results into larger workflow
5. Update task status and documentation

**Phase 5: Learning**
1. Record delegation outcome (success/failure)
2. Capture time taken, issues encountered
3. Update agent capability ratings
4. Feed data to recommendation engine

#### 4.4 Error Handling & Recovery

**Error Scenarios**:

**Scenario 1: Agent Cannot Complete Task**
```python
# Child agent detects impossibility
if cannot_complete_task(constraints):
    return DelegationError(
        code="TASK_IMPOSSIBLE",
        message="Cannot implement JWT auth with <100ms response time given current architecture",
        recommendation="Revise constraint or redesign architecture for performance",
        escalate_to="parent_agent"
    )
```

**Scenario 2: Constraint Conflict**
```python
# Child agent detects conflicting requirements
if detect_constraint_conflict(constraints):
    return DelegationError(
        code="CONSTRAINT_CONFLICT",
        message="Constraints 'use bcrypt' and 'response time <100ms' are incompatible",
        details="Bcrypt minimum work factor results in 150-200ms processing time",
        recommendation="Choose faster algorithm (e.g., Argon2) or relax time constraint",
        escalate_to="parent_agent"
    )
```

**Scenario 3: Exceeded Duration**
```python
# Child agent exceeds max_duration
if current_time - start_time > max_duration * 1.5:
    return DelegationStatus(
        code="DURATION_EXCEEDED",
        message="Task taking longer than expected",
        progress="70% complete - implementing final endpoint",
        estimated_remaining="30 minutes",
        request="extend_duration"
    )
```

**Scenario 4: Dependency Failure**
```python
# Dependency from another agent failed
if dependency_status == "failed":
    return DelegationError(
        code="DEPENDENCY_FAILED",
        message="Database schema design (dependency) failed validation",
        blocked_by="Database agent",
        recommendation="Resolve database schema issues before continuing",
        escalate_to="parent_agent"
    )
```

**Recovery Protocols**:
- **Escalation**: Child agent reports issue to parent for decision
- **Rollback**: Undo partial work if task must be abandoned
- **Re-delegation**: Parent delegates to different agent if first attempt fails
- **Human Intervention**: Escalate to user for critical decisions

### Part 5: Quality Assurance & Validation

#### 5.1 Validation Framework

**Quality Gate Types**:

**Gate 1: Completeness Check**
```python
def validate_completeness(result, success_criteria):
    """Verify all success criteria are addressed."""
    missing = []
    for criterion in success_criteria:
        if not is_addressed(criterion, result):
            missing.append(criterion)

    return {
        "passed": len(missing) == 0,
        "missing_criteria": missing,
        "completeness_score": 1 - (len(missing) / len(success_criteria))
    }
```

**Gate 2: Constraint Compliance**
```python
def validate_constraints(result, constraints):
    """Verify all constraints are respected."""
    violations = []
    for constraint in constraints:
        if not is_compliant(constraint, result):
            violations.append({
                "constraint": constraint,
                "violation": describe_violation(constraint, result)
            })

    return {
        "passed": len(violations) == 0,
        "violations": violations
    }
```

**Gate 3: Quality Standards**
```python
def validate_quality(result, standards):
    """Check against quality standards (tests, docs, style)."""
    checks = {
        "test_coverage": check_test_coverage(result),
        "documentation": check_documentation(result),
        "code_style": check_code_style(result),
        "security": check_security(result)
    }

    failed = [k for k, v in checks.items() if not v["passed"]]

    return {
        "passed": len(failed) == 0,
        "failed_checks": failed,
        "details": checks
    }
```

**Gate 4: Expert Validation** (if required)
```python
def request_expert_validation(result, validator_agent, acceptance_criteria):
    """Delegate validation to expert agent."""
    validation_context = ContextPackage(
        title="Validate: " + result.task_title,
        description="Expert validation of completed work",
        parent_agent=result.agent
    )

    for criterion in acceptance_criteria:
        validation_context.add_success_criterion(criterion)

    validation_result = delegate_to(validator_agent, validation_context)

    return {
        "passed": validation_result.approved,
        "validator": validator_agent,
        "feedback": validation_result.feedback,
        "issues": validation_result.issues
    }
```

#### 5.2 Validation Integration

**Automatic Validation** (in task-completion-handler.sh):

```bash
# After agent completes task, run validation
if [[ -f "$CONTEXT_FILE" ]]; then
    # Extract quality requirements
    VALIDATION_NEEDED=$(jq -r '.quality_requirements.validation_needed' "$CONTEXT_FILE")

    if [[ "$VALIDATION_NEEDED" == "true" ]]; then
        VALIDATOR_AGENT=$(jq -r '.quality_requirements.validation_agent' "$CONTEXT_FILE")
        ACCEPTANCE_CRITERIA=$(jq -r '.quality_requirements.acceptance_criteria' "$CONTEXT_FILE")

        log "Validation required by $VALIDATOR_AGENT"

        # Trigger validation hook
        "$CI_ROOT/interfaces/agent-collaboration/validate-result.sh" \
            "$AGENT_NAME" \
            "$VALIDATOR_AGENT" \
            "$TRANSCRIPT_PATH" \
            "$ACCEPTANCE_CRITERIA"
    fi
fi
```

**Validation Result Handling**:

```bash
# validate-result.sh
#!/bin/bash
# Automated validation of delegated work

AGENT_NAME="$1"
VALIDATOR_AGENT="$2"
TRANSCRIPT_PATH="$3"
ACCEPTANCE_CRITERIA="$4"

# Extract agent's output
AGENT_OUTPUT=$(extract_agent_output "$TRANSCRIPT_PATH")

# Create validation request
VALIDATION_REQUEST=$(cat <<EOF
Please validate the following work completed by $AGENT_NAME:

$AGENT_OUTPUT

Acceptance Criteria:
$ACCEPTANCE_CRITERIA

Provide validation result in this format:
- APPROVED/REJECTED
- Issues found (if any)
- Recommendations for improvement
EOF
)

# Invoke validator agent
VALIDATION_RESULT=$(invoke_agent "$VALIDATOR_AGENT" "$VALIDATION_REQUEST")

# Parse validation result
if echo "$VALIDATION_RESULT" | grep -q "APPROVED"; then
    echo "✅ Validation PASSED"
    record_validation_success "$AGENT_NAME" "$VALIDATOR_AGENT"
else
    echo "❌ Validation FAILED"
    record_validation_failure "$AGENT_NAME" "$VALIDATOR_AGENT" "$VALIDATION_RESULT"

    # Notify parent agent of validation failure
    notify_parent_agent_validation_failed "$VALIDATION_RESULT"
fi
```

#### 5.3 Feedback Loop Integration

**Feedback Capture**:
```python
class DelegationFeedback:
    """Structured feedback from delegation outcome."""

    def __init__(self, task_id: str, child_agent: str):
        self.task_id = task_id
        self.child_agent = child_agent
        self.outcome = None  # "success" | "failure" | "partial"
        self.quality_score = None  # 0-100
        self.duration_actual = None
        self.duration_estimated = None
        self.issues_encountered = []
        self.what_worked_well = []
        self.what_could_improve = []
        self.would_delegate_again = None  # boolean

    def to_json(self):
        return {
            "task_id": self.task_id,
            "child_agent": self.child_agent,
            "outcome": self.outcome,
            "quality_score": self.quality_score,
            "duration_actual": self.duration_actual,
            "duration_estimated": self.duration_estimated,
            "issues_encountered": self.issues_encountered,
            "what_worked_well": self.what_worked_well,
            "what_could_improve": self.what_could_improve,
            "would_delegate_again": self.would_delegate_again,
            "timestamp": datetime.utcnow().isoformat()
        }
```

**Feedback Storage**:
```bash
# Store feedback in collaboration database
FEEDBACK_DB="$CI_ROOT/interfaces/agent-collaboration/feedback.jsonl"
echo "$FEEDBACK_JSON" >> "$FEEDBACK_DB"
```

**Feedback Analysis** (Periodic):
```python
def analyze_delegation_patterns():
    """Analyze feedback to improve routing recommendations."""
    feedback_data = load_feedback_database()

    # Successful delegation patterns
    successful = [f for f in feedback_data if f["outcome"] == "success"]
    analyze_agent_pairings(successful)  # Which agents work well together?
    analyze_task_types(successful)  # Which tasks delegated successfully?

    # Failed delegation patterns
    failed = [f for f in feedback_data if f["outcome"] == "failure"]
    identify_problematic_pairings(failed)
    identify_problematic_task_types(failed)

    # Update recommendation engine
    update_agent_affinity_scores(successful, failed)
    update_capability_confidence_scores(successful, failed)
```

---

## Technical Specification

### Part 1: File Structure & Storage

#### 1.1 Directory Structure

```
CollaborativeIntelligence/
├── interfaces/
│   ├── agent-collaboration/          # NEW: Collaboration protocol implementation
│   │   ├── capabilities.json         # Agent capability registry
│   │   ├── feedback.jsonl            # Delegation feedback database
│   │   ├── collaboration-state.json  # Active collaboration tracking
│   │   ├── scripts/
│   │   │   ├── discover-agents.sh    # Agent discovery CLI
│   │   │   ├── recommend-agent.sh    # Agent recommendation CLI
│   │   │   ├── validate-result.sh    # Automated validation script
│   │   │   ├── context-packager.py   # Context package builder
│   │   │   └── generate-registry.sh  # Registry auto-generation
│   │   └── templates/
│   │       ├── context-package.json  # Template for context packages
│   │       └── delegation-request.md # Template for delegation requests
│   ├── claude-bridge/                # EXISTING: Hook system
│   │   └── scripts/
│   │       ├── task-start-handler.sh         # MODIFY: Add context capture
│   │       ├── task-completion-handler.sh    # MODIFY: Add validation
│   │       ├── subagent-stop-handler.sh      # MODIFY: Add validation
│   │       └── agent-orchestrator.sh         # INTEGRATE: Use registry
│   └── agent-registry/               # NEW: Agent capability data
│       ├── capabilities.json         # Main registry (symlink to collaboration/)
│       ├── domains.json              # Domain taxonomy
│       └── routing-rules.json        # Smart routing rules
├── AGENTS/
│   ├── {AgentName}/
│   │   ├── metadata.json             # EXTEND: Add collaboration fields
│   │   ├── MEMORY.md
│   │   ├── capabilities.json         # NEW: Agent-specific capabilities (optional)
│   │   └── collaboration-history.jsonl  # NEW: Track delegations
│   └── ...
└── .claude/
    └── collaboration/                # NEW: Session-specific data
        ├── active-delegations.json   # Currently executing delegations
        └── {session-id}/
            ├── context-packages/     # Context packages for this session
            └── validation-results/   # Validation outcomes
```

#### 1.2 Data Formats

**capabilities.json**:
- Format: JSON
- Size Estimate: 500KB - 1MB for 132 agents
- Update Frequency: Weekly auto-generation + manual enrichment
- Schema Version: 1.0.0 (with versioning support for evolution)

**feedback.jsonl**:
- Format: JSON Lines (one feedback object per line)
- Size Estimate: Grows ~1KB per delegation, ~1MB per 1000 delegations
- Rotation: Monthly archival to keep active database small
- Indexed Fields: task_id, child_agent, parent_agent, outcome, timestamp

**collaboration-state.json**:
- Format: JSON
- Purpose: Track in-progress delegations for recovery
- Update: Real-time on delegation start/complete
- Cleanup: Remove completed tasks after 24 hours

#### 1.3 Version Control

**Git Strategy**:
- **Tracked**: capabilities.json, domain taxonomy, routing rules
- **Not Tracked**: feedback.jsonl (session-specific), active state (temporary)
- **Branching**: Protocol changes go through feature branches + review

**Schema Evolution**:
```json
{
  "schema_version": "1.0.0",
  "backward_compatible_until": "0.9.0",
  "migration_path": "/path/to/migration-script.py"
}
```

### Part 2: Integration Points

#### 2.1 Hook System Integration

**Modified: task-start-handler.sh**

```bash
#!/bin/bash
# PostToolUse Hook: Captures Task tool invocations
# MODIFICATION: Add context package capture

set -e

HOOK_DATA=$(cat)
TOOL_NAME=$(echo "$HOOK_DATA" | jq -r '.tool_name // ""')

[[ "$TOOL_NAME" != "Task" ]] && exit 0

SESSION_ID=$(echo "$HOOK_DATA" | jq -r '.session_id // ""')
TOOL_INPUT=$(echo "$HOOK_DATA" | jq -r '.tool_input // {}'  )
TOOL_USE_ID=$(echo "$HOOK_DATA" | jq -r '.tool_use_id // ""')

SUBAGENT_TYPE=$(echo "$TOOL_INPUT" | jq -r '.subagent_type // ""')
TASK_DESCRIPTION=$(echo "$TOOL_INPUT" | jq -r '.description // ""')
TIMESTAMP=$(date -Iseconds)

# NEW: Extract context package if provided
CONTEXT_PACKAGE=$(echo "$TOOL_INPUT" | jq -r '.context_metadata // ""')

# Store metadata for SubagentStop
METADATA_DIR="/tmp/claude-task-metadata"
mkdir -p "$METADATA_DIR"
METADATA_FILE="$METADATA_DIR/${SESSION_ID}.json"

# NEW: Enhanced metadata with context package
cat > "$METADATA_FILE" << EOF
{
  "parent_session": "$SESSION_ID",
  "subagent_type": "$SUBAGENT_TYPE",
  "task_description": "$TASK_DESCRIPTION",
  "tool_use_id": "$TOOL_USE_ID",
  "timestamp": "$TIMESTAMP",
  "context_package": $CONTEXT_PACKAGE
}
EOF

# NEW: Store full context package separately if provided
if [[ -n "$CONTEXT_PACKAGE" && "$CONTEXT_PACKAGE" != "null" && "$CONTEXT_PACKAGE" != '""' ]]; then
    CONTEXT_DIR="$HOME/.claude/collaboration/${SESSION_ID}/context-packages"
    mkdir -p "$CONTEXT_DIR"
    TASK_ID=$(echo "$CONTEXT_PACKAGE" | jq -r '.metadata.task_id // "unknown"')
    echo "$CONTEXT_PACKAGE" > "$CONTEXT_DIR/${TASK_ID}.json"

    # NEW: Register active delegation
    COLLABORATION_STATE="$CI_ROOT/interfaces/agent-collaboration/collaboration-state.json"
    jq --arg session "$SESSION_ID" \
       --arg task_id "$TASK_ID" \
       --arg agent "$SUBAGENT_TYPE" \
       --arg timestamp "$TIMESTAMP" \
       '.active_delegations += [{
         "session_id": $session,
         "task_id": $task_id,
         "agent": $agent,
         "started_at": $timestamp,
         "status": "running"
       }]' "$COLLABORATION_STATE" > "$COLLABORATION_STATE.tmp"
    mv "$COLLABORATION_STATE.tmp" "$COLLABORATION_STATE"
fi

# Force sync to disk
sync "$METADATA_FILE" 2>/dev/null || true

# Log
LOG_FILE="/tmp/claude-task-hooks.log"
echo "[$TIMESTAMP] [TaskStart] Agent: $SUBAGENT_TYPE, Session: $SESSION_ID, Context: $([ -n "$CONTEXT_PACKAGE" ] && echo "YES" || echo "NO")" >> "$LOG_FILE"

exit 0
```

**Modified: task-completion-handler.sh**

Add validation section after lines 209-256 (memory update):

```bash
# NEW: Automated validation if required by context package
CONTEXT_FILE="$HOME/.claude/collaboration/${PARENT_SESSION}/context-packages/${TASK_ID}.json"

if [[ -f "$CONTEXT_FILE" ]]; then
    VALIDATION_NEEDED=$(jq -r '.quality_requirements.validation_needed // false' "$CONTEXT_FILE")

    if [[ "$VALIDATION_NEEDED" == "true" ]]; then
        VALIDATOR_AGENT=$(jq -r '.quality_requirements.validation_agent' "$CONTEXT_FILE")
        ACCEPTANCE_CRITERIA=$(jq -r '.quality_requirements.acceptance_criteria | join("\n")' "$CONTEXT_FILE")

        log "Validation required by $VALIDATOR_AGENT"

        # Trigger validation
        VALIDATION_SCRIPT="$CI_ROOT/interfaces/agent-collaboration/scripts/validate-result.sh"
        if [[ -x "$VALIDATION_SCRIPT" ]]; then
            "$VALIDATION_SCRIPT" \
                "$AGENT_NAME" \
                "$VALIDATOR_AGENT" \
                "$TRANSCRIPT_PATH" \
                "$ACCEPTANCE_CRITERIA" \
                "$TASK_ID"
        else
            log "WARNING: Validation script not found or not executable"
        fi
    fi

    # NEW: Update collaboration state
    COLLABORATION_STATE="$CI_ROOT/interfaces/agent-collaboration/collaboration-state.json"
    jq --arg task_id "$TASK_ID" \
       --arg timestamp "$(date -Iseconds)" \
       '(.active_delegations[] | select(.task_id == $task_id)) |= {status: "completed", completed_at: $timestamp}' \
       "$COLLABORATION_STATE" > "$COLLABORATION_STATE.tmp"
    mv "$COLLABORATION_STATE.tmp" "$COLLABORATION_STATE"
fi
```

#### 2.2 Agent Orchestrator Integration

**Modified: agent-orchestrator.sh**

Replace static team definitions with registry-based lookup:

```bash
# NEW: Load capability registry
CAPABILITY_REGISTRY="$CI_ROOT/interfaces/agent-collaboration/capabilities.json"

function get_agents_for_domain() {
    local domain=$1

    if [[ ! -f "$CAPABILITY_REGISTRY" ]]; then
        echo "ERROR: Capability registry not found" >&2
        return 1
    fi

    jq -r --arg domain "$domain" '.domains[$domain] | join(" ")' "$CAPABILITY_REGISTRY"
}

function recommend_agents_for_task() {
    local task_description="$*"

    # Call Python recommendation engine
    RECOMMEND_SCRIPT="$CI_ROOT/interfaces/agent-collaboration/scripts/recommend-agent.sh"

    if [[ -x "$RECOMMEND_SCRIPT" ]]; then
        "$RECOMMEND_SCRIPT" "$task_description"
    else
        # Fallback to legacy regex-based routing
        route_to_smart_agent "$task_description"
    fi
}

# UPDATE: assemble_smart_team to use registry
function assemble_smart_team() {
    local routing_agent="$1"
    local context="$2"
    local complexity=$(assess_task_complexity "$context")

    # NEW: Use registry for base team lookup
    local base_agents=$(jq -r --arg agent "$routing_agent" \
        '.agents[$agent].collaboration_preferences.works_well_with | join(" ")' \
        "$CAPABILITY_REGISTRY")

    # Apply complexity-based scaling
    if [[ "$complexity" == "high" ]]; then
        # Add additional specialists from registry
        local specialists=$(jq -r --arg agent "$routing_agent" \
            '.agents[$agent].collaboration_preferences.delegates_to | join(" ")' \
            "$CAPABILITY_REGISTRY")
        base_agents="$base_agents $specialists"
    fi

    echo "$base_agents"
}
```

#### 2.3 Slash Command Integration

**New Slash Commands** (add to agent definitions):

**/discover [capability]** - Find agents by capability
```markdown
---
name: discover
description: Find agents by capability or domain
---

Invoke agent discovery: `./interfaces/agent-collaboration/scripts/discover-agents.sh "$@"`
```

**/recommend [task]** - Get agent recommendations for a task
```markdown
---
name: recommend
description: Get agent recommendations for a task
---

Invoke recommendation engine: `./interfaces/agent-collaboration/scripts/recommend-agent.sh "$@"`
```

**/delegate [agent] [context_file]** - Delegate with context package
```markdown
---
name: delegate
description: Delegate task with structured context package
---

Build and execute delegation with context:
`./interfaces/agent-collaboration/scripts/delegate-with-context.sh "$@"`
```

#### 2.4 Claude Code Native Integration (Future)

**Proposal for Claude Code Team**:

Request native support for collaboration protocol:

1. **Enhanced Task Tool Input**:
```javascript
{
  "name": "Task",
  "input": {
    "subagent_type": string,
    "description": string,
    "context": {  // NEW: Structured context object
      "priority": "high" | "medium" | "low",
      "success_criteria": string[],
      "constraints": string[],
      "dependencies": object[],
      "validation_required": boolean
    }
  }
}
```

2. **Agent Discovery API**:
```javascript
{
  "name": "AgentDiscovery",
  "description": "Find agents by capability",
  "input": {
    "query": string,  // Natural language or capability ID
    "filters": {
      "domain": string[],
      "complexity": "high" | "medium" | "low",
      "exclude": string[]
    }
  },
  "output": {
    "recommendations": [
      {
        "agent": string,
        "score": number,
        "reasoning": string
      }
    ]
  }
}
```

3. **Validation Hooks**:
- PostTaskComplete hook that can block on validation
- Allow async validation with notification on completion

### Part 3: Data Flow & State Management

#### 3.1 Delegation State Machine

**States**:
```
CREATED → DELEGATED → EXECUTING → VALIDATING → COMPLETED
                    ↓
                  FAILED
```

**State Transitions**:

```python
class DelegationState(Enum):
    CREATED = "created"          # Context package created, not yet delegated
    DELEGATED = "delegated"      # Task tool invoked, agent starting
    EXECUTING = "executing"      # Agent actively working
    VALIDATING = "validating"    # Work complete, undergoing validation
    COMPLETED = "completed"      # Validation passed, integrated
    FAILED = "failed"            # Validation failed or execution error

class Delegation:
    """Track state of a single delegation."""

    def __init__(self, task_id, parent_agent, child_agent):
        self.task_id = task_id
        self.parent_session = os.getenv("CLAUDE_SESSION_ID")
        self.parent_agent = parent_agent
        self.child_agent = child_agent
        self.state = DelegationState.CREATED
        self.created_at = datetime.utcnow()
        self.delegated_at = None
        self.completed_at = None
        self.validation_result = None
        self.metadata = {}

    def transition_to(self, new_state, metadata=None):
        """Transition to new state with validation."""
        valid_transitions = {
            DelegationState.CREATED: [DelegationState.DELEGATED, DelegationState.FAILED],
            DelegationState.DELEGATED: [DelegationState.EXECUTING, DelegationState.FAILED],
            DelegationState.EXECUTING: [DelegationState.VALIDATING, DelegationState.COMPLETED, DelegationState.FAILED],
            DelegationState.VALIDATING: [DelegationState.COMPLETED, DelegationState.FAILED],
            DelegationState.COMPLETED: [],
            DelegationState.FAILED: []
        }

        if new_state not in valid_transitions[self.state]:
            raise ValueError(f"Invalid transition from {self.state} to {new_state}")

        self.state = new_state

        if new_state == DelegationState.DELEGATED:
            self.delegated_at = datetime.utcnow()
        elif new_state == DelegationState.COMPLETED:
            self.completed_at = datetime.utcnow()

        if metadata:
            self.metadata.update(metadata)

        # Persist state change
        self.save()

    def save(self):
        """Persist delegation state to collaboration-state.json."""
        # Implementation details...
```

#### 3.2 State Persistence

**collaboration-state.json Structure**:

```json
{
  "active_delegations": [
    {
      "task_id": "uuid-1",
      "parent_session": "session-uuid",
      "parent_agent": "Architect",
      "child_agent": "Developer",
      "state": "executing",
      "created_at": "2025-10-06T10:00:00Z",
      "delegated_at": "2025-10-06T10:01:00Z",
      "completed_at": null,
      "validation_result": null,
      "context_package_path": "/path/to/context.json",
      "metadata": {
        "priority": "high",
        "estimated_duration": "2 hours"
      }
    }
  ],
  "completed_delegations_24h": [
    // Delegations completed in last 24 hours (for recovery/debugging)
  ],
  "version": "1.0.0",
  "last_updated": "2025-10-06T10:05:00Z"
}
```

**State Update Triggers**:
- task-start-handler.sh: CREATED → DELEGATED
- Task execution start: DELEGATED → EXECUTING (detected in transcript)
- task-completion-handler.sh: EXECUTING → VALIDATING (if validation required) or COMPLETED
- validate-result.sh: VALIDATING → COMPLETED or FAILED

#### 3.3 Dependency Management

**Dependency Tracking**:

```python
class DependencyGraph:
    """Track dependencies between delegated tasks."""

    def __init__(self):
        self.graph = {}  # task_id -> [dependent_task_ids]
        self.status = {}  # task_id -> status

    def add_task(self, task_id, depends_on=None):
        """Add task with optional dependencies."""
        self.graph[task_id] = depends_on or []
        self.status[task_id] = "pending"

    def mark_completed(self, task_id):
        """Mark task as completed and check for newly runnable tasks."""
        self.status[task_id] = "completed"

        # Find tasks that were waiting for this dependency
        newly_runnable = []
        for dependent_task, dependencies in self.graph.items():
            if task_id in dependencies and self.status[dependent_task] == "pending":
                # Check if all dependencies are now completed
                if all(self.status[dep] == "completed" for dep in dependencies):
                    newly_runnable.append(dependent_task)
                    self.status[dependent_task] = "ready"

        return newly_runnable

    def get_ready_tasks(self):
        """Get tasks that have all dependencies met."""
        return [task for task, status in self.status.items() if status == "ready"]
```

**Usage in Multi-Agent Workflows**:

```python
# Architect delegates multiple dependent tasks
dep_graph = DependencyGraph()

# Database schema must complete before API implementation
db_task_id = delegate_to("Database", db_context)
dep_graph.add_task(db_task_id)

api_task_id = create_delegation("Developer", api_context)
dep_graph.add_task(api_task_id, depends_on=[db_task_id])

# When database task completes
ready_tasks = dep_graph.mark_completed(db_task_id)
if api_task_id in ready_tasks:
    # Now safe to execute API implementation
    execute_delegation(api_task_id)
```

#### 3.4 Infinite Loop Prevention

**Problem**: Agent A delegates to Agent B, which delegates back to Agent A

**Solution**: Delegation Chain Tracking

```python
class DelegationChain:
    """Track delegation chain to prevent loops."""

    def __init__(self):
        self.chain = []  # List of agent names in delegation order
        self.max_depth = 5  # Maximum delegation depth

    def can_delegate(self, from_agent, to_agent):
        """Check if delegation would create a loop or exceed depth."""
        # Check for direct loop
        if to_agent in self.chain:
            return False, f"Loop detected: {to_agent} already in chain {self.chain}"

        # Check depth limit
        if len(self.chain) >= self.max_depth:
            return False, f"Maximum delegation depth ({self.max_depth}) exceeded"

        return True, None

    def add_delegation(self, from_agent, to_agent):
        """Record delegation in chain."""
        can_delegate, error = self.can_delegate(from_agent, to_agent)
        if not can_delegate:
            raise ValueError(f"Cannot delegate: {error}")

        self.chain.append(to_agent)

    def to_context(self):
        """Export chain for context package."""
        return {
            "delegation_depth": len(self.chain),
            "chain": self.chain,
            "max_depth": self.max_depth
        }
```

**Integration in Context Package**:

```json
{
  "metadata": {
    "delegation_chain": {
      "depth": 2,
      "chain": ["Architect", "Developer"],
      "max_depth": 5
    }
  }
}
```

**Validation in Task Handler**:

```bash
# In task-start-handler.sh
DELEGATION_CHAIN=$(echo "$CONTEXT_PACKAGE" | jq -r '.metadata.delegation_chain.chain // []')
CURRENT_DEPTH=$(echo "$DELEGATION_CHAIN" | jq 'length')
MAX_DEPTH=$(echo "$CONTEXT_PACKAGE" | jq -r '.metadata.delegation_chain.max_depth // 5')

if [[ -n "$DELEGATION_CHAIN" ]]; then
    # Check if SUBAGENT_TYPE is already in chain (loop detection)
    if echo "$DELEGATION_CHAIN" | jq -e --arg agent "$SUBAGENT_TYPE" 'any(. == $agent)' >/dev/null; then
        log "ERROR: Delegation loop detected - $SUBAGENT_TYPE already in chain $DELEGATION_CHAIN"
        exit 1
    fi

    # Check depth limit
    if [[ $CURRENT_DEPTH -ge $MAX_DEPTH ]]; then
        log "ERROR: Maximum delegation depth ($MAX_DEPTH) exceeded"
        exit 1
    fi

    # Add current agent to chain for next delegation
    UPDATED_CHAIN=$(echo "$DELEGATION_CHAIN" | jq --arg agent "$SUBAGENT_TYPE" '. + [$agent]')
    # Store updated chain in metadata for child delegations
fi
```

---

## Implementation Strategy

### Part 1: Phased Rollout

#### Phase 1: Foundation (Weeks 1-2)

**Goal**: Establish core infrastructure and registry

**Deliverables**:
1. Capability registry schema and initial population
2. Agent discovery CLI tool
3. Basic recommendation engine (keyword-based)
4. Context package format specification

**Tasks**:
- [ ] Design and implement capability registry schema
- [ ] Create auto-generation script for basic metadata extraction
- [ ] Manually enrich top 10 agents (Athena, Developer, Architect, Debugger, Tester, Auditor, Verifier, Analyst, Researcher, Planner)
- [ ] Implement discover-agents.sh CLI
- [ ] Implement recommend-agent.sh with keyword matching
- [ ] Create context-packager.py helper
- [ ] Document context package format
- [ ] Create example delegations with context packages

**Success Criteria**:
- [ ] Registry contains 132 agents with basic metadata
- [ ] Top 10 agents have full capability descriptions
- [ ] discover-agents.sh returns relevant results for test queries
- [ ] recommend-agent.sh provides top 3 recommendations with reasoning
- [ ] Context package can be created and parsed successfully
- [ ] Example delegation works end-to-end

#### Phase 2: Integration (Weeks 3-4)

**Goal**: Integrate protocol with existing hook system

**Deliverables**:
1. Modified task-start-handler.sh with context capture
2. Modified task-completion-handler.sh with validation
3. Automated validation script
4. Collaboration state tracking
5. Delegation chain tracking (loop prevention)

**Tasks**:
- [ ] Modify task-start-handler.sh to capture context packages
- [ ] Create collaboration-state.json and update logic
- [ ] Implement delegation chain tracking in hooks
- [ ] Modify task-completion-handler.sh to trigger validation
- [ ] Create validate-result.sh for automated validation
- [ ] Implement DelegationState state machine
- [ ] Add collaboration state cleanup (24-hour retention)
- [ ] Test end-to-end delegation with validation

**Success Criteria**:
- [ ] Context packages captured in task-start hook
- [ ] Delegation state tracked in collaboration-state.json
- [ ] Validation triggered automatically when required
- [ ] Delegation loops detected and prevented
- [ ] State persists across hook executions
- [ ] Cleanup removes old state correctly

#### Phase 3: Intelligence (Weeks 5-6)

**Goal**: Add learning and adaptive capabilities

**Deliverables**:
1. Feedback collection system
2. Collaboration pattern analysis
3. Adaptive recommendation engine
4. Routing optimization based on history

**Tasks**:
- [ ] Implement feedback capture in completion handlers
- [ ] Create feedback.jsonl database
- [ ] Develop feedback analysis script (weekly cron)
- [ ] Enhance recommendation engine with historical success data
- [ ] Implement agent affinity scoring
- [ ] Create collaboration analytics dashboard (optional)
- [ ] Add complexity estimation refinement based on actual durations

**Success Criteria**:
- [ ] Feedback captured for all delegations
- [ ] Analysis script identifies successful patterns
- [ ] Recommendations improve over time (measurable via accuracy)
- [ ] Agent pairings optimized based on success rates
- [ ] Duration estimates within 20% of actual (after 100 delegations)

#### Phase 4: Optimization (Weeks 7-8)

**Goal**: Performance tuning and UX improvements

**Deliverables**:
1. Registry caching for fast lookups
2. Parallel delegation support
3. Workflow templates for common patterns
4. Enhanced error messages and recovery

**Tasks**:
- [ ] Implement registry caching in memory
- [ ] Add parallel delegation coordination
- [ ] Create workflow templates (sequential, parallel, chain, review)
- [ ] Improve error messages with actionable guidance
- [ ] Add delegation resumption for interrupted workflows
- [ ] Optimize hook execution time (target <100ms)
- [ ] Create user documentation and examples

**Success Criteria**:
- [ ] Registry lookup < 50ms
- [ ] Parallel delegations execute concurrently
- [ ] Templates reduce setup time by 70%
- [ ] Clear error messages with recovery steps
- [ ] Interrupted workflows can resume
- [ ] Hook overhead < 100ms
- [ ] User documentation complete

### Part 2: Pilot Program

#### Pilot Scope

**Selected Agents**:
1. Architect (coordinator role)
2. Developer (frequent delegation target)
3. Tester (validation role)
4. Auditor (quality assurance role)
5. Athena (knowledge specialist)

**Test Scenarios**:

**Scenario 1: Sequential Handoff**
```
Task: Implement new API endpoint
Flow: Architect → Developer → Tester → Auditor → Architect
Context: Full context package with constraints and validation requirements
Success: Endpoint implemented, tested, validated, integrated
```

**Scenario 2: Parallel Delegation**
```
Task: Build user dashboard
Flow: Architect → (UI Designer || Developer || Database) → Architect
Context: Shared project context, individual success criteria
Success: All components complete, integrated successfully
```

**Scenario 3: Validation Loop**
```
Task: Security-critical authentication
Flow: Developer → SecurityExpert (validation) → Developer (fixes) → SecurityExpert (re-validation)
Context: Validation criteria defined upfront
Success: Passes validation, no iterations beyond 2
```

**Scenario 4: Error Recovery**
```
Task: Complex refactoring
Flow: Refactorer → (encounters blocker) → Escalates to Architect → New plan → Developer
Context: Delegation fails gracefully, state preserved
Success: Task completed via alternate path
```

#### Pilot Metrics

**Quantitative**:
- Delegation success rate (target: >80%)
- Context loss incidents (target: 0)
- Validation failure rate (baseline for improvement)
- Average delegation overhead (target: <5 minutes)
- Loop prevention accuracy (target: 100%)

**Qualitative**:
- Agent feedback on protocol usability
- User satisfaction with multi-agent workflows
- Clarity of error messages
- Ease of context package creation

#### Pilot Timeline

**Week 1-2**: Foundation phase implementation
**Week 3**: Pilot setup and agent training (documentation)
**Week 4-5**: Execute test scenarios, collect feedback
**Week 6**: Analyze results, iterate on protocol
**Week 7-8**: Expand to additional agents based on lessons learned

### Part 3: Rollout to Full Ecosystem

#### Expansion Strategy

**Tier 1** (Weeks 9-10): Development domain
- Agents: Developer, Architect, UI, Backender, Tester, Debugger, Verifier, Refactorer
- Reason: High collaboration frequency, clear handoff patterns

**Tier 2** (Weeks 11-12): Analysis domain
- Agents: Analyst, Researcher, Scholar, Topologist, Benchmarker
- Reason: Structured workflows, measurable outcomes

**Tier 3** (Weeks 13-14): Knowledge domain
- Agents: Athena, Memory, Mnemosyne, Documenter, Writer, Scholar
- Reason: Complex context requirements, good test for protocol

**Tier 4** (Weeks 15-16): Remaining domains
- All other specialized agents
- Reason: Lower usage frequency, benefit from mature protocol

#### Training & Documentation

**For Agents** (metadata/instructions):
```markdown
## Collaboration Protocol

You can now delegate tasks using structured context packages:

1. **When to Delegate**:
   - Task outside your expertise
   - Quality validation needed
   - Parallel subtasks possible

2. **How to Delegate**:
   ```
   Use context_packager.py to create a context package, then invoke Task tool:
   {
     "subagent_type": "TargetAgent",
     "description": "[markdown format]",
     "context_metadata": "[context package JSON]"
   }
   ```

3. **What to Include**:
   - Success criteria (specific, measurable)
   - Constraints (must respect)
   - Dependencies (files, other agents)
   - Validation requirements (if quality-critical)

4. **Validation**:
   - Set validation_needed: true for critical work
   - Specify validation_agent (e.g., Auditor, SecurityExpert)
   - Define acceptance criteria clearly

See: /path/to/delegation-guide.md for examples
```

**For Users**:
```markdown
# Multi-Agent Collaboration Guide

## Discovering the Right Agent

Use `/discover` or `/recommend`:

```bash
# Find agents by capability
/discover memory optimization

# Get recommendations for a task
/recommend "implement OAuth authentication"
```

## Delegating with Context

Agents will automatically use context packages for better handoffs.

You can also manually create complex workflows:

```bash
# Sequential workflow
/team architect developer tester - implement new feature X

# Parallel execution
/team ui developer database - build user dashboard
```

## Monitoring Progress

Active delegations are tracked in collaboration state.
View status: [instructions for checking state]

## Validation

Quality-critical tasks automatically trigger validation.
Validation results appear in agent memory and session logs.
```

#### Gradual Feature Enablement

**Phase 1**: Basic delegation with context (Weeks 1-4)
- Context packages
- Agent discovery
- Manual validation

**Phase 2**: Automated validation (Weeks 5-8)
- Validation hooks
- Quality gates
- Feedback collection

**Phase 3**: Intelligent routing (Weeks 9-12)
- Recommendation engine
- Historical learning
- Adaptive suggestions

**Phase 4**: Advanced workflows (Weeks 13-16)
- Parallel execution
- Dependency management
- Workflow templates

---

## Design Rationale

### Part 1: Key Design Decisions

#### Decision 1: Build on Existing Task Tool

**Rationale**:
- **Minimal Disruption**: Leverages existing, proven mechanism
- **Backward Compatibility**: Old-style delegations still work
- **Lower Risk**: No need to replace core infrastructure
- **Faster Adoption**: Agents already familiar with Task tool

**Alternative Considered**: Create new delegation mechanism
- **Rejected Because**: Requires changes to Claude Code core, higher complexity, duplicate functionality

#### Decision 2: JSON + Markdown Context Format

**Rationale**:
- **JSON**: Machine-readable, structured, parseable by hooks
- **Markdown**: Human-readable, natural for LLMs, better UX
- **Dual Format**: Supports both automation (JSON) and readability (Markdown)
- **Flexibility**: Agents can use markdown-only for simpler cases

**Alternative Considered**: JSON-only format
- **Rejected Because**: Less natural for LLM reading, harder for humans to write manually

#### Decision 3: Registry-Based Discovery

**Rationale**:
- **Centralized**: Single source of truth for capabilities
- **Scalable**: Supports 132+ agents without performance degradation
- **Searchable**: Enables sophisticated matching algorithms
- **Maintainable**: Auto-generation + manual enrichment balance

**Alternative Considered**: Distributed capability declarations (in each agent)
- **Rejected Because**: Requires scanning all agents for every query, slower, harder to maintain consistency

#### Decision 4: Automatic Validation via Hooks

**Rationale**:
- **Reliability**: Ensures validation never skipped
- **Consistency**: Standard validation flow for all delegations
- **Audit Trail**: All validations logged automatically
- **No Manual Overhead**: Agents don't need to remember to validate

**Alternative Considered**: Manual validation invocation by agents
- **Rejected Because**: Error-prone, inconsistent, easy to forget

#### Decision 5: State Tracking in JSON Files

**Rationale**:
- **Simple**: No database required, easy to inspect
- **Git-Compatible**: Can version control if needed
- **Portable**: Works across systems
- **Fast**: File I/O sufficient for expected volume (<100 concurrent delegations)

**Alternative Considered**: SQLite database
- **Rejected Because**: Overkill for current scale, adds dependency, harder to debug

#### Decision 6: Delegation Depth Limit (5 levels)

**Rationale**:
- **Safety**: Prevents infinite loops from bugs
- **Practical**: 5 levels sufficient for all realistic workflows
- **Clear Errors**: Exceeding limit produces actionable error message

**Alternative Considered**: No limit
- **Rejected Because**: Risk of runaway delegation chains, hard to debug

**Alternative Considered**: Lower limit (3 levels)
- **Rejected Because**: Too restrictive for complex workflows like Architect → Developer → Tester → Auditor → Developer (5 levels)

### Part 2: Trade-offs

#### Trade-off 1: Auto-generation vs Manual Curation

**Chosen Approach**: Hybrid (auto-generate structure, manually enrich)

**Pros**:
- Initial registry created quickly
- High-quality data for important agents
- Scalable to full ecosystem

**Cons**:
- Manual work required for full richness
- Potential inconsistency between auto and manual entries

**Mitigation**:
- Clear schema and examples for manual enrichment
- Validation script to check consistency
- Prioritize enrichment for high-usage agents (80/20 rule)

#### Trade-off 2: Synchronous vs Asynchronous Validation

**Chosen Approach**: Synchronous (blocking) validation for critical tasks

**Pros**:
- Immediate feedback
- Prevents integration of invalid work
- Simpler state management

**Cons**:
- Increases delegation time
- Validator agent must be available immediately

**Mitigation**:
- Make validation optional (quality_requirements.validation_needed)
- Allow async validation for non-critical tasks (future enhancement)
- Provide clear progress indicators

#### Trade-off 3: Keyword vs Semantic Matching

**Chosen Approach**: Start with keyword, enhance with semantic

**Pros** (Keyword):
- Fast implementation
- Predictable results
- No AI model dependency

**Cons** (Keyword):
- Less intelligent than semantic
- Misses synonyms and related concepts

**Mitigation**:
- Phase 1: Keyword matching (good enough for 80% of cases)
- Phase 3: Add semantic layer using AI for ambiguous queries
- Combine both for best results

#### Trade-off 4: Context Package Size

**Chosen Approach**: Comprehensive but selective

**Pros**:
- Rich context prevents information loss
- Clear success criteria and constraints
- Supports complex workflows

**Cons**:
- Verbose (can be 2-5KB per delegation)
- Overhead to create

**Mitigation**:
- Helper script (context-packager.py) to automate creation
- Templates for common patterns
- Optional fields (only include what's needed)
- Markdown format readable by humans

### Part 3: Risk Mitigation

#### Risk 1: Performance Degradation

**Risk**: Hook execution time increases, slowing down all delegations

**Likelihood**: Medium
**Impact**: High

**Mitigation**:
- Target <100ms hook execution time
- Cache registry in memory (avoid disk reads)
- Optimize JSON parsing (use jq efficiently)
- Profile hooks regularly, optimize bottlenecks
- Fallback to legacy behavior if protocol fails

#### Risk 2: Context Package Adoption

**Risk**: Agents don't use context packages, protocol underutilized

**Likelihood**: Medium
**Impact**: Medium

**Mitigation**:
- Make context packages optional (backward compatible)
- Provide clear examples and templates
- Show value through pilot success stories
- Create helper tools to reduce friction
- Gradual rollout (start with eager adopters)

#### Risk 3: Registry Staleness

**Risk**: Capability registry becomes outdated as agents evolve

**Likelihood**: High
**Impact**: Medium

**Mitigation**:
- Weekly auto-regeneration from metadata
- Agent-driven updates (agents can update their own entries)
- Version control to track changes
- Periodic manual review (monthly)
- Validation script to detect inconsistencies

#### Risk 4: Validation Bottleneck

**Risk**: Limited validator agents create bottleneck for critical tasks

**Likelihood**: Low
**Impact**: Medium

**Mitigation**:
- Train multiple validation agents (Auditor, Verifier, domain specialists)
- Make validation optional for non-critical tasks
- Implement validation queuing with prioritization
- Allow parallel validations where possible
- Provide clear status when validation is pending

#### Risk 5: Delegation Loop Bugs

**Risk**: Loop detection fails, agents get stuck in infinite delegation

**Likelihood**: Low
**Impact**: High

**Mitigation**:
- Comprehensive testing of loop detection logic
- Depth limit as safety net (hard limit of 5)
- Monitoring and alerting for unusual delegation patterns
- Manual kill switch to stop runaway delegations
- Clear error messages for debugging

### Part 4: Scalability Considerations

#### Scalability Dimension 1: Number of Agents

**Current**: 132 agents
**Expected Growth**: 200+ agents within 1 year

**Scalability Strategy**:
- Registry lookup: O(log n) with indexing
- Discovery: Limit results to top 10 matches
- Caching: In-memory registry cache (reload on update only)
- Partitioning: Separate registry files by domain (if >500 agents)

**Bottleneck**: Manual enrichment of capabilities
**Solution**: Prioritize high-usage agents, use AI to suggest capability descriptions

#### Scalability Dimension 2: Concurrent Delegations

**Current**: Estimated <10 concurrent delegations
**Expected Growth**: 50-100 concurrent with user base growth

**Scalability Strategy**:
- File-based state tracking sufficient for <1000 concurrent
- Use file locking to prevent race conditions
- Consider SQLite if exceeds 1000 concurrent
- Implement delegation queuing if validators become bottlenecks

#### Scalability Dimension 3: Feedback Database Size

**Current**: 0 records
**Expected Growth**: ~1000 delegations/month = 12,000/year

**Scalability Strategy**:
- JSON Lines format for efficient append
- Monthly archival to keep active database small (<10,000 records)
- Indexed fields for fast queries
- Compression of archived feedback (gzip)
- Aggregated analytics (pre-compute monthly stats)

#### Scalability Dimension 4: Context Package Storage

**Current**: 0 stored packages
**Expected Growth**: ~1000 packages/month, ~1KB each = 1MB/month

**Scalability Strategy**:
- 24-hour retention for active delegations
- Archive completed delegations (optional, for debugging)
- Cleanup old sessions (>30 days)
- Estimated storage: 12MB/year (negligible)

### Part 5: Future Extensibility

#### Extension 1: Multi-Agent Conversations

**Vision**: Agents can have discussions, not just sequential handoffs

**Approach**:
- Group chat sessions for collaborative work
- Shared context board for all participants
- Facilitation agent to moderate discussion

**Timeline**: Year 2 (after core protocol mature)

#### Extension 2: Human-in-the-Loop Workflows

**Vision**: Seamless human approval/input during multi-agent workflows

**Approach**:
- Approval gates for critical decisions
- Human can provide input mid-workflow
- Resume delegation after human response

**Timeline**: Phase 4 (Weeks 13-16) - add human approval points

#### Extension 3: Cross-Project Collaboration

**Vision**: Agents from different CI instances can collaborate

**Approach**:
- Federated capability registry
- Secure context transfer between instances
- Trust framework for external agents

**Timeline**: Year 2 (requires security model)

#### Extension 4: AI-Powered Workflow Generation

**Vision**: AI suggests optimal workflow for complex tasks

**Approach**:
- Analyze task description with LLM
- Generate multi-agent workflow plan
- Learn from successful workflows

**Timeline**: Phase 3 (Weeks 9-12) - basic patterns, evolve with usage

#### Extension 5: Performance Benchmarking

**Vision**: Track and optimize agent performance over time

**Approach**:
- Capture execution time, quality scores
- Compare agents for similar tasks
- Identify underperforming agents for training

**Timeline**: Phase 3 (Weeks 9-12) - integrate with feedback system

---

## Appendices

### Appendix A: Example Context Package

```json
{
  "handoff_version": "1.0.0",
  "metadata": {
    "task_id": "a7f3c2e1-9b5d-4a8e-b3c2-6d7e8f9a0b1c",
    "parent_session": "b074d6f9-451b-4055-8e06-aae286fb5b6a",
    "parent_agent": "Architect",
    "created_at": "2025-10-06T14:30:00Z",
    "priority": "high",
    "estimated_complexity": "medium",
    "max_duration": "2 hours"
  },
  "task": {
    "title": "Implement User Authentication API Endpoint",
    "description": "Create a new API endpoint for user authentication using JWT tokens. The endpoint should accept username/password, validate credentials against the database, and return a JWT token on success. Must integrate with existing user model and session management.",
    "success_criteria": [
      "POST /api/auth/login endpoint functional",
      "JWT token generated and returned on successful authentication",
      "Password validation uses bcrypt",
      "Session created in database on successful login",
      "Unit tests cover happy path and error cases (401, 400)",
      "API documented in OpenAPI format"
    ],
    "constraints": [
      "Must use JWT with HS256 algorithm",
      "Token expiry: 24 hours",
      "Response time < 200ms (p95)",
      "Backward compatible with existing /auth endpoint (deprecated)",
      "No breaking changes to User model schema"
    ],
    "dependencies": [
      {
        "type": "agent",
        "name": "Database",
        "status": "completed",
        "output_location": "/Users/.../migrations/002_add_sessions_table.sql",
        "description": "Session table schema created"
      },
      {
        "type": "file",
        "path": "/Users/.../api/models/user.py",
        "description": "User model with existing authentication logic"
      },
      {
        "type": "file",
        "path": "/Users/.../api/routes/auth.py",
        "description": "Existing deprecated auth endpoint (for reference)"
      }
    ]
  },
  "context": {
    "project": {
      "name": "CollaborativeIntelligence",
      "root": "/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence",
      "type": "multi-agent system with FastAPI backend",
      "tech_stack": ["Python 3.10", "FastAPI", "SQLAlchemy", "PyJWT", "bcrypt"]
    },
    "session_state": {
      "cwd": "/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/api",
      "recent_files": [
        "/api/routes/auth.py",
        "/api/models/user.py",
        "/migrations/002_add_sessions_table.sql"
      ],
      "conversation_summary": "Discussed authentication requirements with SecurityExpert. Decided on JWT approach with HS256. Session table schema approved by Database agent. Ready for implementation."
    },
    "relevant_knowledge": {
      "previous_decisions": [
        "Use bcrypt with work factor 12 for password hashing (decided 2025-10-01 by SecurityExpert)",
        "JWT secret stored in environment variable JWT_SECRET_KEY (decided 2025-09-28)",
        "Session timeout: 24 hours, renewable (decided 2025-09-28)",
        "Use refresh tokens for long-lived sessions (future enhancement, not MVP)"
      ],
      "related_tasks": [
        {
          "task_id": "b8e4d3f2-1c6e-5b9f-c4d3-7e8f9a0b1c2d",
          "agent": "SecurityExpert",
          "outcome": "Recommended JWT with HS256, approved password hashing approach",
          "session": "a6e3130d-829b-4f7d-bc90-39f778f2c477",
          "summary": "Security review complete, no blockers"
        },
        {
          "task_id": "c9f5e4g3-2d7f-6c0g-d5e4-8f9g0a1b2c3e",
          "agent": "Database",
          "outcome": "Created sessions table schema with user_id foreign key",
          "session": "b074d6f9-451b-4055-8e06-aae286fb5b6a",
          "summary": "Schema migration ready to apply"
        }
      ]
    }
  },
  "quality_requirements": {
    "validation_needed": true,
    "validation_agent": "SecurityExpert",
    "test_coverage_minimum": 80,
    "documentation_required": true,
    "acceptance_criteria": [
      "No SQL injection vulnerabilities",
      "No timing attacks in password comparison",
      "JWT token validated correctly on subsequent requests",
      "Error messages don't leak user existence information",
      "Rate limiting considered (comment if not implemented in MVP)"
    ]
  },
  "communication": {
    "status_updates": {
      "frequency": "on significant milestones",
      "channel": "inline responses"
    },
    "clarification_protocol": "ask parent agent (Architect) if ambiguous, don't assume",
    "escalation_criteria": [
      "Cannot meet <200ms performance constraint with bcrypt",
      "Conflict between backward compatibility and new implementation",
      "SecurityExpert validation fails on first attempt"
    ]
  }
}
```

### Appendix B: Registry Schema Reference

**Full JSON Schema for capabilities.json**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["agents", "domains", "version"],
  "properties": {
    "agents": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["domains", "capabilities"],
        "properties": {
          "domains": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Primary domains this agent operates in"
          },
          "capabilities": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "name", "description", "keywords"],
              "properties": {
                "id": {"type": "string", "pattern": "^[a-z_]+$"},
                "name": {"type": "string"},
                "description": {"type": "string"},
                "keywords": {
                  "type": "array",
                  "items": {"type": "string"}
                },
                "complexity": {
                  "type": "string",
                  "enum": ["low", "medium", "high"]
                },
                "typical_duration": {"type": "string"}
              }
            }
          },
          "collaboration_preferences": {
            "type": "object",
            "properties": {
              "works_well_with": {
                "type": "array",
                "items": {"type": "string"}
              },
              "delegates_to": {
                "type": "array",
                "items": {"type": "string"}
              },
              "receives_from": {
                "type": "array",
                "items": {"type": "string"}
              },
              "coordination_style": {
                "type": "string",
                "enum": ["strategic", "collaborative", "specialist", "support"]
              }
            }
          },
          "quality_gates": {
            "type": "object",
            "properties": {
              "requires_validation": {"type": "boolean"},
              "validation_agents": {
                "type": "array",
                "items": {"type": "string"}
              },
              "acceptance_criteria": {
                "type": "array",
                "items": {"type": "string"}
              }
            }
          }
        }
      }
    },
    "domains": {
      "type": "object",
      "additionalProperties": {
        "type": "array",
        "items": {"type": "string"}
      }
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "last_updated": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Appendix C: Hook Integration Checklist

**task-start-handler.sh modifications**:
- [ ] Extract context_metadata from TOOL_INPUT
- [ ] Store context package to $HOME/.claude/collaboration/{session}/context-packages/
- [ ] Update collaboration-state.json with active delegation
- [ ] Extract delegation chain and validate for loops
- [ ] Add delegation chain depth check (max 5)
- [ ] Log context package presence in hook log

**task-completion-handler.sh modifications**:
- [ ] Load context package if exists
- [ ] Extract quality_requirements.validation_needed
- [ ] Trigger validation if required
- [ ] Update collaboration-state.json with completion
- [ ] Capture feedback data (duration, outcome, quality)
- [ ] Append feedback to feedback.jsonl

**subagent-stop-handler.sh modifications**:
- [ ] Same as task-completion-handler.sh (for sidechain executions)
- [ ] Ensure validation runs before final memory update
- [ ] Clean up context package after processing

**New: validate-result.sh**:
- [ ] Accept parameters: agent_name, validator_agent, transcript_path, criteria, task_id
- [ ] Extract agent output from transcript
- [ ] Create validation request with criteria
- [ ] Invoke validator agent (via Task tool or direct script)
- [ ] Parse validation result (APPROVED/REJECTED)
- [ ] Store validation outcome in collaboration state
- [ ] Return result to completion handler

### Appendix D: Command Reference

**Agent Discovery**:
```bash
# Find agents by capability keyword
./interfaces/agent-collaboration/scripts/discover-agents.sh "memory optimization"

# Find agents by domain
./interfaces/agent-collaboration/scripts/discover-agents.sh --domain "testing"

# List all agents in a domain
./interfaces/agent-collaboration/scripts/discover-agents.sh --list-domain "development"
```

**Agent Recommendation**:
```bash
# Get recommendations for a task
./interfaces/agent-collaboration/scripts/recommend-agent.sh "implement OAuth authentication"

# Recommendations with filters
./interfaces/agent-collaboration/scripts/recommend-agent.sh \
  --task "optimize database queries" \
  --complexity high \
  --exclude "Tester,Verifier"
```

**Context Package Creation**:
```python
# Python helper
from context_packager import ContextPackage

pkg = ContextPackage(
    title="Implement Feature X",
    description="...",
    parent_agent="Architect"
)
pkg.add_success_criterion("Criterion 1") \
   .add_constraint("Constraint 1") \
   .require_validation("Auditor", ["Check 1", "Check 2"])

# Export to markdown for Task tool
print(pkg.to_markdown())

# Export to JSON for metadata
print(pkg.to_json())
```

**Delegation with Context**:
```bash
# Bash wrapper script
./interfaces/agent-collaboration/scripts/delegate-with-context.sh \
  --agent "Developer" \
  --context-file "/path/to/context.json"

# This script will:
# 1. Load context package
# 2. Invoke Task tool with context
# 3. Track delegation in collaboration state
# 4. Monitor for completion
```

**Registry Management**:
```bash
# Auto-generate registry from metadata
./interfaces/agent-collaboration/scripts/generate-registry.sh

# Validate registry schema
./interfaces/agent-collaboration/scripts/validate-registry.sh

# Update single agent capability
./interfaces/agent-collaboration/scripts/update-agent-capability.sh \
  --agent "Athena" \
  --capability "knowledge_compression" \
  --add-keyword "optimization"
```

**Collaboration State Inspection**:
```bash
# View active delegations
jq '.active_delegations' $CI_ROOT/interfaces/agent-collaboration/collaboration-state.json

# View completed delegations (last 24h)
jq '.completed_delegations_24h' $CI_ROOT/interfaces/agent-collaboration/collaboration-state.json

# Find specific delegation by task_id
jq --arg id "task-uuid" '.active_delegations[] | select(.task_id == $id)' \
  $CI_ROOT/interfaces/agent-collaboration/collaboration-state.json
```

**Feedback Analysis**:
```bash
# Analyze successful delegation patterns
./interfaces/agent-collaboration/scripts/analyze-feedback.sh --outcome success

# Find best agent pairings
./interfaces/agent-collaboration/scripts/analyze-feedback.sh --pairings

# Estimate duration for task type
./interfaces/agent-collaboration/scripts/analyze-feedback.sh \
  --estimate-duration "implement API endpoint"
```

### Appendix E: Glossary

**Agent**: Specialized AI persona with specific expertise and capabilities

**Capability**: Specific skill or task type an agent can perform

**Collaboration State**: Real-time tracking of active and recent delegations

**Context Package**: Structured metadata bundle containing task requirements, constraints, dependencies, and validation criteria

**Delegation**: Assignment of a task from one agent to another

**Delegation Chain**: Sequence of agents involved in nested delegations (e.g., A→B→C)

**Dependency**: Prerequisite for a task (file, another agent's output, external resource)

**Discovery**: Process of finding suitable agents for a task based on capabilities

**Domain**: High-level category of agent expertise (e.g., development, testing, analysis)

**Feedback**: Post-delegation data capturing outcome, quality, duration for learning

**Handoff**: Transfer of context and control from parent agent to child agent

**Hook**: Script triggered by Claude Code events (TaskStart, TaskComplete, SubagentStop)

**Quality Gate**: Validation checkpoint that must pass before work is accepted

**Registry**: Centralized database of agent capabilities and metadata

**Routing**: Process of selecting the best agent for a given task

**Sidechain**: Separate Claude Code session created for agent execution

**Task Tool**: Claude Code native tool for invoking another agent

**Validation**: Expert review of completed work against acceptance criteria

**Validator Agent**: Specialized agent responsible for quality assurance (e.g., Auditor, SecurityExpert)

---

## Document Metadata

**Total Lines**: 1842
**Size**: ~115 KB
**Sections**: 7 major parts + 5 appendices
**Code Examples**: 25+ snippets
**Diagrams**: Text-based flows and schemas
**References**: 50+ file path and line number citations
**Research Basis**: 15 agent metadata files, 3 major hook scripts, 1210-line orchestrator

**Evidence Trail**:
- Analyst metadata.json (lines 1-13): Standard schema
- Auditor metadata.json (lines 1-49): Enhanced schema with integration_points
- Tester metadata.json (lines 1-31): Smart routing patterns
- task-start-handler.sh (lines 1-48): Metadata capture
- task-completion-handler.sh (lines 1-271): Inline execution handling with race protection
- subagent-stop-handler.sh (lines 1-207): Sidechain completion with triple fallback
- agent-orchestrator.sh (lines 1-1210): Team assembly and smart routing
- Athena MEMORY.md (lines 1-438): Memory architecture and auto-optimization
- ClaudeCodeIntegrator metadata.json (lines 1-230): Collaboration example
- 132 agent directories discovered via bash count

**Design Decisions**: 6 major decisions with rationale
**Trade-offs**: 4 documented trade-offs with mitigations
**Risks**: 5 identified risks with mitigation strategies
**Implementation Phases**: 4 phases over 16 weeks
**Pilot Metrics**: 4 quantitative + qualitative measures

---

**Created**: 2025-10-06
**Author**: Athena, Knowledge Architect
**Status**: Design Specification - Ready for Review
**Next Steps**: Present to stakeholders, begin Phase 1 implementation
