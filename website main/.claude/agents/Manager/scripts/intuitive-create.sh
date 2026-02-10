#!/bin/bash

# Intuitive Agent Creation Script
# Creates agents from minimal prompts by inferring details

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${1:-/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence}"
AGENTS_DIR="$BASE_DIR/AGENTS"
STREAMLINER_SCRIPT="$AGENTS_DIR/Streamliner/scripts/create-agent.sh"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to extract keywords and infer agent properties
infer_agent_properties() {
    local prompt="$1"
    local prompt_lower=$(echo "$prompt" | tr '[:upper:]' '[:lower:]')
    
    # Extract agent name (first capitalized word or main noun)
    local name=""
    if [[ "$prompt" =~ ^([A-Z][a-zA-Z]+) ]]; then
        name="${BASH_REMATCH[1]}"
    else
        # Try to extract from phrases like "create a/an X agent"
        if [[ "$prompt_lower" =~ (create|make|build)\ (a|an)\ ([a-z]+)\ (agent|specialist)? ]]; then
            name="${BASH_REMATCH[3]}"
            name="$(echo "$name" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
        else
            # Extract the most significant noun
            name=$(echo "$prompt" | grep -oE '[A-Za-z]+' | grep -E '^[A-Z]' | head -1)
            if [[ -z "$name" ]]; then
                name=$(echo "$prompt" | grep -oE '[A-Za-z]+' | awk 'length > 4' | head -1)
                name="$(echo "$name" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
            fi
        fi
    fi
    
    # Infer role and expertise from keywords
    local role=""
    local expertise=""
    local focus=""
    local perspective=""
    
    # Keywords to role/expertise mapping
    if [[ "$prompt_lower" =~ (design|ui|ux|interface|visual|aesthetic) ]]; then
        role="${name:-Designer} - Visual Design and Interface Specialist"
        expertise="UI/UX design, visual aesthetics, design systems"
        focus="Creating beautiful, functional interfaces"
        perspective="How can we create elegant designs that enhance user experience?"
    elif [[ "$prompt_lower" =~ (test|qa|quality|bug|validation) ]]; then
        role="${name:-Tester} - Testing and Quality Assurance Specialist"
        expertise="Test automation, quality validation, bug detection"
        focus="Ensuring system reliability and correctness"
        perspective="How can we validate this works correctly in all scenarios?"
    elif [[ "$prompt_lower" =~ (secure|security|pentest|vulnerability) ]]; then
        role="${name:-Security} - Security Analysis and Protection Specialist"
        expertise="Security auditing, vulnerability detection, protection strategies"
        focus="Ensuring system security and data protection"
        perspective="How can we protect against security vulnerabilities?"
    elif [[ "$prompt_lower" =~ (document|docs|writing|explain) ]]; then
        role="${name:-Documenter} - Documentation and Technical Writing Specialist"
        expertise="Technical writing, API documentation, user guides"
        focus="Making complex systems understandable"
        perspective="How can we explain this clearly to all audiences?"
    elif [[ "$prompt_lower" =~ (performance|optimize|speed|efficiency) ]]; then
        role="${name:-Optimizer} - Performance Optimization Specialist"
        expertise="Performance analysis, optimization strategies, efficiency improvements"
        focus="Making systems faster and more efficient"
        perspective="How can we optimize this for maximum performance?"
    elif [[ "$prompt_lower" =~ (learn|ai|ml|model|intelligence) ]]; then
        role="${name:-Learner} - Machine Learning and AI Specialist"
        expertise="Machine learning, AI models, learning systems"
        focus="Implementing intelligent learning capabilities"
        perspective="How can systems learn and adapt from experience?"
    elif [[ "$prompt_lower" =~ (data|database|storage|analytics) ]]; then
        role="${name:-DataExpert} - Data Management and Analytics Specialist"
        expertise="Data architecture, analytics, storage optimization"
        focus="Managing and analyzing data effectively"
        perspective="How can we derive insights from data?"
    elif [[ "$prompt_lower" =~ (deploy|devops|ci|cd|pipeline) ]]; then
        role="${name:-Deployer} - Deployment and DevOps Specialist"
        expertise="CI/CD pipelines, deployment strategies, infrastructure"
        focus="Streamlining deployment and operations"
        perspective="How can we deploy and operate systems efficiently?"
    elif [[ "$prompt_lower" =~ (monitor|observability|metrics|logging) ]]; then
        role="${name:-Monitor} - System Monitoring and Observability Specialist"
        expertise="Monitoring systems, metrics collection, alerting"
        focus="Ensuring system visibility and health"
        perspective="How can we maintain complete system awareness?"
    elif [[ "$prompt_lower" =~ (communicate|integrate|api|bridge) ]]; then
        role="${name:-Integrator} - System Integration and Communication Specialist"
        expertise="API design, system integration, protocol bridging"
        focus="Connecting systems and enabling communication"
        perspective="How can systems communicate effectively?"
    else
        # Generic inference based on name
        role="${name} - ${name} Specialist"
        expertise="Domain expertise in ${name,} operations"
        focus="Providing specialized ${name,} capabilities"
        perspective="How can we leverage ${name,} expertise effectively?"
    fi
    
    # Extract custom details from parentheses or quotes
    if [[ "$prompt" =~ \(([^)]+)\) ]]; then
        local custom="${BASH_REMATCH[1]}"
        expertise="$expertise, $custom"
    fi
    
    if [[ "$prompt" =~ \"([^\"]+)\" ]]; then
        perspective="${BASH_REMATCH[1]}"
    fi
    
    echo "$name|$role|$expertise|$focus|$perspective"
}

# Function to validate prompt
validate_prompt() {
    local prompt="$1"
    
    if [[ -z "$prompt" ]]; then
        echo -e "${RED}Error: No prompt provided${NC}"
        return 1
    fi
    
    if [[ ${#prompt} -lt 3 ]]; then
        echo -e "${RED}Error: Prompt too short (minimum 3 characters)${NC}"
        return 1
    fi
    
    return 0
}

# Function to create agent from minimal prompt
create_from_prompt() {
    local prompt="$1"
    
    echo -e "${BLUE}Analyzing prompt: ${NC}$prompt"
    
    # Validate prompt
    if ! validate_prompt "$prompt"; then
        exit 1
    fi
    
    # Infer properties
    local props=$(infer_agent_properties "$prompt")
    IFS='|' read -r name role expertise focus perspective <<< "$props"
    
    # Validate name
    if [[ -z "$name" ]]; then
        echo -e "${RED}Error: Could not infer agent name from prompt${NC}"
        echo -e "${YELLOW}Try using a capitalized name or clearer description${NC}"
        exit 1
    fi
    
    # Check if agent exists
    if [[ -d "$AGENTS_DIR/$name" ]]; then
        echo -e "${YELLOW}Agent '$name' already exists${NC}"
        read -p "Update existing agent? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
    
    echo -e "${GREEN}Creating agent with inferred properties:${NC}"
    echo -e "  Name: ${BLUE}$name${NC}"
    echo -e "  Role: ${BLUE}$role${NC}"
    echo -e "  Expertise: ${BLUE}$expertise${NC}"
    echo -e "  Focus: ${BLUE}$focus${NC}"
    echo -e "  Perspective: ${BLUE}$perspective${NC}"
    
    read -p "Proceed with creation? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
    
    # Create using Streamliner script if available
    if [[ -x "$STREAMLINER_SCRIPT" ]]; then
        echo -e "${GREEN}Using Streamliner for optimized creation...${NC}"
        "$STREAMLINER_SCRIPT" "$name" "$role" "$focus" "$perspective"
    else
        echo -e "${YELLOW}Streamliner not available, using manual creation...${NC}"
        # Manual creation fallback
        mkdir -p "$AGENTS_DIR/$name/Sessions"
        
        # Create README.md
        cat > "$AGENTS_DIR/$name/README.md" << EOF
# $role

## Core Identity

As $name, I specialize in $expertise. My focus is on $focus, always approaching challenges with the perspective: "$perspective"

## Primary Responsibilities

- Core tasks related to $expertise
- $focus optimization and improvement
- Collaborative support for related domains
- Continuous learning and adaptation

## Operational Workflow

1. **Analysis Phase**
   - Understand requirements and context
   - Identify key challenges and opportunities
   - Plan approach based on expertise

2. **Implementation Phase**
   - Apply specialized knowledge
   - Execute with focus on quality
   - Maintain clear communication

3. **Validation Phase**
   - Verify results meet requirements
   - Ensure quality standards
   - Document learnings

## Activation Protocol

Activate me when:
- $name expertise is required
- Tasks involve $focus
- Specialized $expertise knowledge is needed

## Collaboration Interfaces

I work closely with other agents to provide comprehensive solutions, particularly in areas requiring $expertise.

## Success Metrics

- Quality of $name-related outcomes
- Efficiency in task completion
- Positive impact on system capabilities
- Knowledge growth and adaptation

---

Last Updated: $(date '+%B %Y')
EOF

        # Create MEMORY.md
        cat > "$AGENTS_DIR/$name/MEMORY.md" << EOF
# $name Memory Architecture

## Long-Term Memory: Core Identity

### Fundamental Purpose
I exist to provide expert $expertise capabilities, focusing on $focus. My approach is guided by the perspective: "$perspective"

### Guiding Principles
1. Excellence in $name domain
2. Continuous learning and improvement
3. Collaborative problem-solving
4. Quality-focused execution
5. Clear communication

### Core Frameworks
- $name best practices
- Domain-specific methodologies
- Quality assurance protocols
- Collaboration patterns

## Short-Term Memory: Current Initiatives

### Active Focus Areas
1. Initial capability establishment
2. Integration with existing systems
3. Best practice documentation
4. Workflow optimization

### Immediate Next Steps
1. Complete initial setup
2. Document core capabilities
3. Establish collaboration protocols
4. Begin knowledge accumulation

### Contextual Prompts for Session Resumption
- Review current $name tasks
- Check for pending requests
- Analyze recent learnings
- Plan next improvements

---

Last Updated: $(date '+%B %Y')
EOF

        # Create ContinuousLearning.md
        cat > "$AGENTS_DIR/$name/ContinuousLearning.md" << EOF
# $name Continuous Learning

This document captures evolving knowledge and insights in the $name domain.

## Domain-Specific Patterns

### $name Best Practices
- Core principles and methodologies
- Common patterns and solutions
- Optimization strategies
- Quality guidelines

## Lessons Learned

### Initial Observations
- Key insights from early operations
- Effective approaches discovered
- Challenges encountered and solutions

## Evolution of Approaches

The $name methodology continues to evolve based on:
- Practical experience
- User feedback
- System requirements
- Technological advances

---

Last Updated: $(date '+%B %Y')
EOF

        # Create Sessions/README.md
        cat > "$AGENTS_DIR/$name/Sessions/README.md" << EOF
# $name Sessions

This directory contains interaction records for the $name agent.

## Session Structure

Each session is organized in its own subdirectory with appropriate documentation.

## Active Sessions

*No active sessions yet*

---

Last Updated: $(date '+%B %Y')
EOF
    fi
    
    echo -e "${GREEN}Agent '$name' created successfully!${NC}"
    
    # Update AGENTS.md
    echo -e "${BLUE}Updating AGENTS.md...${NC}"
    $SCRIPT_DIR/update-agents-md.sh "$name"
}

# Main function
main() {
    if [[ $# -eq 0 ]]; then
        cat << EOF
${GREEN}Intuitive Agent Creator${NC}

Create agents from minimal prompts. The system will infer:
- Agent name
- Role and expertise
- Focus area
- Guiding perspective

${YELLOW}Usage:${NC}
  $0 "prompt"
  $0 "AgentName for specific purpose"
  $0 "create a testing specialist"
  $0 "Designer (UI/UX focus)"
  $0 'Security agent "How can we protect our systems?"'

${BLUE}Examples:${NC}
  $0 "Designer"                          # Creates a design specialist
  $0 "create a performance optimizer"    # Creates Optimizer agent
  $0 "Security specialist"               # Creates Security agent
  $0 'Translator "How can we bridge language barriers?"'

${YELLOW}Tips:${NC}
- Use capitalized names for clarity
- Include keywords like: design, test, security, performance
- Add details in parentheses or quotes
- The system learns from context and keywords

EOF
        exit 0
    fi
    
    # Join all arguments as the prompt
    local prompt="$*"
    create_from_prompt "$prompt"
}

main "$@"