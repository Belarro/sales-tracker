# Quick Agent Switching Guide

## Fast Switching Commands

### CIA Interface (Internal)
```bash
# Quick switch during session
cia ci switch Athena         # Switch to Athena (dark green)
cia ci switch Debugger       # Switch to Debugger (dark blue)
cia ci switch Designer       # Switch to Designer (dark purple)
cia ci switch Fixer          # Switch to Fixer (dark red)
cia ci switch Optimizer      # Switch to Optimizer (deep violet)

# Reset colors
cia ci reset-color           # Reset to default background
```

### External CI Interface
```bash
# Quick switch during session  
ci agent switch Athena       # Switch to Athena (dark green)
ci agent switch Debugger     # Switch to Debugger (dark blue)
ci agent switch Designer     # Switch to Designer (dark purple)
ci agent switch Fixer        # Switch to Fixer (dark red)
ci agent switch Optimizer    # Switch to Optimizer (deep violet)

# Reset colors
ci agent reset-color         # Reset to default background
```

## Common Agent Shortcuts

### Development Workflow
```bash
# Problem solving sequence
ci agent switch Debugger     # Identify issues (dark blue)
ci agent switch Fixer        # Fix problems (dark red)
ci agent switch Optimizer    # Optimize solution (deep violet)
ci agent switch Tester       # Validate fixes (dark red)
```

### Design Workflow
```bash
# Design and UI sequence
ci agent switch Designer     # Design concepts (dark purple)
ci agent switch UI           # User interface (dark purple)
ci agent switch UX           # User experience (dark purple)
ci agent switch Renderer     # Visual implementation (TBD)
```

### Architecture Workflow
```bash
# System planning sequence
ci agent switch Architect    # System design (dark blue)
ci agent switch Planner      # Task planning (dark brown)
ci agent switch Engineer     # Implementation (dark gray)
ci agent switch Verifier     # Validation (dark red)
```

### Infrastructure Workflow
```bash
# Performance and optimization sequence
ci agent switch Cacher       # Caching optimization (steel blue)
ci agent switch Optimizer    # Performance tuning (deep violet)
ci agent switch SysAdmin     # System management (TBD)
ci agent switch Metalist     # Hardware coordination (TBD)
```

## Session State Tracking

The system automatically tracks:
- **Current active agent**: Stored in `/tmp/ci_current_agent.txt`
- **Terminal colors**: Applied automatically on switch
- **Session history**: Window title updates
- **Context switching**: Brief agent profile display

## Quick Reference

| Agent | Color | Use Case |
|-------|-------|----------|
| Athena | Dark Green | Knowledge & Memory |
| Debugger | Dark Blue | Problem Analysis |
| Designer | Dark Purple | UI/UX Design |
| Fixer | Dark Red | Problem Resolution |
| Optimizer | Deep Violet | Performance |
| Architect | Dark Blue | System Design |
| Planner | Dark Brown | Task Planning |
| Engineer | Dark Gray | Implementation |
| Cacher | Steel Blue | Caching Optimization |

## Tips for Fast Switching

1. **Visual Confirmation**: Background color changes immediately
2. **Brief Context**: Each switch shows agent profile summary
3. **Session Persistence**: Current agent remembered across commands
4. **Window Titles**: Terminal title updates to show active agent
5. **Quick Reset**: Reset colors when switching contexts

## Integration with Claude Code

When using with Claude Code sessions:
```bash
# Load initial agent with color
ci load Athena

# Quick switch during conversation
ci agent switch Debugger     # Background turns dark blue
ci agent switch Designer     # Background turns dark purple
ci agent switch Athena       # Background returns to dark green

# Reset when done
ci agent reset-color         # Clean slate
```

The color system provides immediate visual feedback for which agent context you're operating in, making multi-agent sessions much more manageable.