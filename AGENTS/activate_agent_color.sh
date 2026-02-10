#!/bin/bash

# Agent Color Activation Script
# Usage: source activate_agent_color.sh [AGENT_NAME]

# Function to get agent color
get_agent_color() {
    case "$1" in
        "Athena") echo "#003300" ;;
        "Master") echo "#001a00" ;;
        "Debugger") echo "#001133" ;;
        "Architect") echo "#000d26" ;;
        "SwiftSpecialist") echo "#191970" ;;
        "UI_UX_Specialist") echo "#2d1b69" ;;
        "Designer") echo "#1a0d33" ;;
        "Optimizer") echo "#301934" ;;
        "RepositoryTopologist") echo "#2d1a0d" ;;
        "TaskPlanner") echo "#331a00" ;;
        "Librarian") echo "#3c2415" ;;
        "SecurityAnalyst") echo "#330d0d" ;;
        "QualityAssurance") echo "#2d0a0a" ;;
        "FeatureAnalyst") echo "#722f37" ;;
        "Generalist") echo "#1a1a1a" ;;
        "DocumentationSpecialist") echo "#262626" ;;
        *) echo "" ;;
    esac
}

# Function to activate agent color
activate_agent_color() {
    local agent_name="$1"
    
    if [[ -z "$agent_name" ]]; then
        echo "Usage: activate_agent_color [AGENT_NAME]"
        return 1
    fi
    
    local color_code=$(get_agent_color "$agent_name")
    
    if [[ -z "$color_code" ]]; then
        echo "Unknown agent: $agent_name"
        echo "Available agents: Athena Master Debugger Architect SwiftSpecialist UI_UX_Specialist Designer Optimizer RepositoryTopologist TaskPlanner Librarian SecurityAnalyst QualityAssurance FeatureAnalyst Generalist DocumentationSpecialist"
        return 1
    fi
    
    # Apply terminal background color
    printf '\033]11;%s\007' "$color_code"
    
    # Set environment variables for app integration
    export CIA_CURRENT_AGENT="$agent_name"
    export CIA_BACKGROUND_COLOR="$color_code"
    export ACTIVE_AGENT="$agent_name"
    
    echo "Agent $agent_name activated with color: $color_code"
    echo "Environment variables set for app integration:"
    echo "  CIA_CURRENT_AGENT=$agent_name"
    echo "  CIA_BACKGROUND_COLOR=$color_code"
}

# Function to reset terminal color
reset_terminal_color() {
    printf '\033]111\007'
    echo "Terminal color reset to default"
}

# If script is called with argument, activate that agent's color
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    activate_agent_color "$1"
fi