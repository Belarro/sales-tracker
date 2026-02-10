# Hybrid Prototype Orchestrator

A complete autonomous prototype development system that integrates Claude Code Task tool parallelization with CollaborativeIntelligence sequential multi-agent workflows.

## Architecture

### Phase 1: Parallel Discovery (Task Tool)
Multiple specialized agents run concurrently to gather comprehensive project intelligence:
- **RepoScout**: Analyzes existing codebases and patterns
- **TechAnalyst**: Evaluates technologies and frameworks
- **RequirementsAnalyst**: Determines functional and non-functional requirements
- **SecurityAnalyst**: Identifies security considerations
- **UIDesigner**: Defines user experience requirements

### Phase 2: Knowledge Consolidation
Discovery results are aggregated into a unified context for sequential implementation.

### Phase 3: Sequential Implementation (CI Multi-Agent)
Specialized agents work sequentially, each building upon the previous:
- **Architect**: Creates system design and architecture
- **Developer(s)**: Implement core functionality
- **Tester**: Validates and ensures quality
- **Documentor**: Creates comprehensive documentation

## Features

### Autonomous Operation
- **Zero-Intervention Discovery**: Parallel agents gather all needed knowledge
- **Automatic Phase Transitions**: Seamless handoff between discovery and implementation
- **Self-Managing Permissions**: Dynamic auto-accept configuration for workspace
- **Progress Visibility**: Monitor workflow without interrupting autonomous operation

### Flexible Configuration
- **Template System**: Pre-configured workflows for common project types
- **Agent Customization**: Choose discovery and implementation agents based on needs
- **Workspace Management**: Automatic directory structure and permission setup
- **Timeout Controls**: Configurable time limits for autonomous operation

## Usage

### Quick Start
```bash
# Build the orchestrator
cargo build --release

# Create and launch autonomous prototype
./target/release/autonomous-prototype create \
  --name "MyAwesomeApp" \
  --workspace "/path/to/workspace" \
  --template web-app

# Monitor progress  
./target/release/autonomous-prototype monitor <session_id>
```

### Custom Configuration
```bash
# Custom agent selection
./target/release/autonomous-prototype create \
  --name "SpecialProject" \
  --workspace "/path/to/workspace" \
  --discovery "RepoScout,TechAnalyst,SecurityAnalyst" \
  --implementation "Architect,RustDeveloper,Tester" \
  --timeout 120
```

### Workspace Setup
```bash
# Prepare workspace with proper structure and permissions
./target/release/autonomous-prototype setup /path/to/workspace
```

## Templates

### Available Templates
- **web-app**: Full-stack web application with frontend, backend, and database
- **cli-tool**: Command-line tool with Rust development focus
- **api-service**: REST API service with comprehensive testing
- **data-pipeline**: Data processing and transformation workflows

### Custom Templates
Create JSON configuration files in `templates/` directory:
```json
{
  "project_name": "MyTemplate",
  "workspace_path": "/path/to/workspace",
  "discovery_agents": ["Agent1", "Agent2"],
  "implementation_agents": ["Agent3", "Agent4"],
  "auto_accept_patterns": ["/path/to/workspace"],
  "timeout_minutes": 120
}
```

## Integration

### Claude Code Task Tool
- Leverages Task tool for parallel agent execution
- Each discovery agent runs independently for maximum speed
- Results are aggregated for sequential phase handoff

### CollaborativeIntelligence Multi-Agent Sessions
- Uses existing CI `MultiAgent[Agent1,Agent2,...]` format
- Preserves agent context and memory across handoffs
- Builds upon established agent coordination protocols

### Auto-Accept Permissions
- Dynamically configures Claude Code settings for autonomous operation
- Workspace-specific permissions for safe autonomous file operations
- Automatic cleanup of temporary permissions after completion

## Benefits

### Speed + Depth
- **Parallel Discovery**: Multiple perspectives gathered simultaneously
- **Sequential Implementation**: Deep, iterative development with quality handoffs
- **Best of Both Worlds**: Fast research combined with thorough implementation

### Set-and-Forget Operation
- Launch prototype development and return to finished product
- No interruptions for permissions or decision-making
- Complete documentation and testing included automatically

### Quality Assurance
- Built-in testing and validation agents
- Code review and security analysis
- Comprehensive documentation generation

## Architecture Decisions

### Why Hybrid Approach?
- Pure parallel: Fast but lacks context continuity
- Pure sequential: Deep but slow for research phases  
- Hybrid: Combines speed of parallel research with depth of sequential implementation

### Integration Strategy
- Task tool agents run independently and return consolidated results
- CI multi-agent sessions provide context continuity and iterative refinement
- Knowledge aggregation layer bridges between the two systems

### Autonomous Operation Design
- Pre-configured auto-accept permissions for workspace isolation
- Progress artifacts provide visibility without interrupting workflow
- Timeout controls prevent runaway processes
- Error recovery and rollback capabilities

## Future Enhancements

- Real-time progress streaming
- Interactive oversight mode for critical decisions
- Learning from prototype outcomes to improve future workflows
- Integration with deployment and CI/CD systems
- Multi-workspace parallel prototyping