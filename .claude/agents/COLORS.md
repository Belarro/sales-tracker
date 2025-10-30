# Agent Terminal Colors

## Color Constants for Agent Loading Sequences

This file defines 16 carefully selected dark colors for agent terminal backgrounds. Each agent is assigned a specific color to create visual identity during activation.

### Color Definitions

```bash
# Tested Working Greens
DARK_GREEN_1="#003300"      # Agent: Athena
DARK_GREEN_2="#001a00"      # Agent: Master

# Deep Blues
DARK_BLUE_1="#001133"       # Agent: Debugger
DARK_BLUE_2="#000d26"       # Agent: Architect
NAVY_BLUE="#191970"         # Agent: SwiftSpecialist

# Rich Purples
DARK_PURPLE_1="#2d1b69"     # Agent: UI_UX_Specialist
DARK_PURPLE_2="#1a0d33"     # Agent: Designer
DEEP_VIOLET="#301934"       # Agent: Optimizer

# Warm Browns
DARK_BROWN_1="#2d1a0d"      # Agent: RepositoryTopologist
DARK_BROWN_2="#331a00"      # Agent: TaskPlanner
COFFEE_BROWN="#3c2415"      # Agent: Librarian

# Deep Reds
DARK_RED_1="#330d0d"        # Agent: SecurityAnalyst
DARK_RED_2="#2d0a0a"        # Agent: QualityAssurance
BURGUNDY="#722f37"          # Agent: FeatureAnalyst

# Cool Grays
DARK_GRAY_1="#1a1a1a"       # Agent: Generalist
CHARCOAL="#262626"          # Agent: DocumentationSpecialist
```

### Usage Instructions

Each agent should apply their assigned color during activation using:
```bash
printf '\033]11;${COLOR_CODE}\007'
```

### Agent Color Mapping

| Agent | Color Code | Color Name |
|-------|------------|------------|
| Athena | #003300 | Dark Green 1 |
| Master | #001a00 | Dark Green 2 |
| Debugger | #001133 | Dark Blue 1 |
| Architect | #000d26 | Dark Blue 2 |
| SwiftSpecialist | #191970 | Navy Blue |
| UI_UX_Specialist | #2d1b69 | Dark Purple 1 |
| Designer | #1a0d33 | Dark Purple 2 |
| Optimizer | #301934 | Deep Violet |
| RepositoryTopologist | #2d1a0d | Dark Brown 1 |
| TaskPlanner | #331a00 | Dark Brown 2 |
| Librarian | #3c2415 | Coffee Brown |
| SecurityAnalyst | #330d0d | Dark Red 1 |
| QualityAssurance | #2d0a0a | Dark Red 2 |
| FeatureAnalyst | #722f37 | Burgundy |
| Generalist | #1a1a1a | Dark Gray 1 |
| DocumentationSpecialist | #262626 | Charcoal |

### Implementation Example

```bash
# In agent activation script
AGENT_COLOR="#003300"  # Athena's color
printf '\033]11;${AGENT_COLOR}\007'
echo "Agent Athena activated with terminal color: Dark Green 1"
```

### Color Testing

To test any color:
```bash
printf '\033]11;#HEXCODE\007'
```

To reset to default:
```bash
printf '\033]111\007'
```