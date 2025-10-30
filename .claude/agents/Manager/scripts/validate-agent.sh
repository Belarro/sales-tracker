#!/bin/bash

# Agent Validation Script
# Validates agent structure, naming, and similarity before creation
# Usage: ./validate-agent.sh <agent_name> <agent_role> [--check-similarity]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parse arguments
AGENT_NAME="$1"
AGENT_ROLE="$2"
CHECK_SIMILARITY=false

if [ "$3" = "--check-similarity" ]; then
    CHECK_SIMILARITY=true
fi

# Validation functions
validate_name() {
    local name="$1"
    
    # Check if name is empty
    if [ -z "$name" ]; then
        echo -e "${RED}Error: Agent name cannot be empty${NC}"
        return 1
    fi
    
    # Check name format (must start with letter, alphanumeric only)
    if [[ ! "$name" =~ ^[A-Za-z][A-Za-z0-9]*$ ]]; then
        echo -e "${RED}Error: Agent name must start with a letter and contain only alphanumeric characters${NC}"
        echo -e "${YELLOW}Invalid characters found in: $name${NC}"
        return 1
    fi
    
    # Check name length
    if [ ${#name} -lt 3 ] || [ ${#name} -gt 30 ]; then
        echo -e "${RED}Error: Agent name must be between 3 and 30 characters${NC}"
        return 1
    fi
    
    # Check against reserved names
    RESERVED_NAMES=("Manager" "System" "Admin" "Root" "Test" "Debug")
    for reserved in "${RESERVED_NAMES[@]}"; do
        if [ "$name" = "$reserved" ]; then
            echo -e "${YELLOW}Warning: '$name' is a reserved name${NC}"
            return 2
        fi
    done
    
    echo -e "${GREEN}✓ Name validation passed${NC}"
    return 0
}

validate_role() {
    local role="$1"
    
    # Check if role is empty
    if [ -z "$role" ]; then
        echo -e "${RED}Error: Agent role cannot be empty${NC}"
        return 1
    fi
    
    # Check role length
    if [ ${#role} -lt 5 ] || [ ${#role} -gt 100 ]; then
        echo -e "${RED}Error: Agent role must be between 5 and 100 characters${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Role validation passed${NC}"
    return 0
}

check_existing() {
    local name="$1"
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local ci_root="$(cd "$script_dir/../../.." && pwd)"
    local agent_dir="$ci_root/AGENTS/$name"

    if [ -d "$agent_dir" ]; then
        echo -e "${RED}Error: Agent '$name' already exists at $agent_dir${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ No existing agent with name '$name'${NC}"
    return 0
}

check_similarity() {
    local name="$1"
    local role="$2"
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local ci_root="$(cd "$script_dir/../../.." && pwd)"
    local agents_dir="$ci_root/AGENTS"

    echo -e "${BLUE}Checking for similar agents...${NC}"

    # Update agent index
    local index_script="$agents_dir/Manager/generate-index.sh"
    if [ -x "$index_script" ]; then
        "$index_script" > /dev/null 2>&1
    fi

    # Use Python for advanced similarity check with semantic detection
    python3 << EOF
import os
import re
from difflib import SequenceMatcher

def similarity(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

# Semantic role groups for detecting functional overlap
ROLE_SYNONYMS = {
    'validation': ['validator', 'checker', 'verifier', 'tester', 'quality', 'assurance'],
    'documentation': ['documenter', 'writer', 'recorder', 'scribe', 'note', 'documentation'],
    'analysis': ['analyst', 'analyzer', 'researcher', 'investigator', 'examiner', 'inspector'],
    'development': ['developer', 'coder', 'programmer', 'engineer', 'builder', 'implementer'],
    'architecture': ['architect', 'designer', 'planner', 'modeler', 'structural'],
    'debugging': ['debugger', 'fixer', 'troubleshooter', 'resolver', 'repair'],
    'management': ['manager', 'coordinator', 'organizer', 'director', 'overseer'],
    'optimization': ['optimizer', 'enhancer', 'improver', 'refiner', 'performance'],
    'testing': ['tester', 'qa', 'quality', 'validator', 'checker', 'test'],
    'integration': ['integrator', 'connector', 'bridge', 'interfacer', 'linker'],
    'security': ['security', 'guardian', 'protector', 'defender', 'firewall'],
    'automation': ['automator', 'automater', 'scripting', 'workflow', 'orchestrator'],
    'visualization': ['visualizer', 'visualist', 'graphics', 'renderer', 'display'],
    'memory': ['memory', 'mnemosyne', 'storage', 'knowledge', 'retention'],
    'network': ['networker', 'networking', 'connectivity', 'communication', 'protocol'],
}

def detect_semantic_overlap(name1, role1, name2, role2):
    """Detect if two agents serve similar purposes based on semantic keywords"""
    text1 = (name1 + ' ' + role1).lower()
    text2 = (name2 + ' ' + role2).lower()

    for category, keywords in ROLE_SYNONYMS.items():
        matches1 = sum(1 for kw in keywords if kw in text1)
        matches2 = sum(1 for kw in keywords if kw in text2)

        if matches1 >= 1 and matches2 >= 1:
            return True, category, matches1 + matches2

    return False, None, 0

agents_dir = "$agents_dir"
new_name = "$name"
new_role = "$role"

similar_agents = []

# Check all existing agents
for agent_dir in os.listdir(agents_dir):
    if not os.path.isdir(os.path.join(agents_dir, agent_dir)):
        continue

    # Skip non-agent directories
    if agent_dir in ['templates', 'scripts', '_archived']:
        continue

    # Check name similarity (string-based)
    name_sim = similarity(new_name, agent_dir)
    if name_sim > 0.7:
        similar_agents.append({
            'name': agent_dir,
            'type': 'name',
            'similarity': name_sim,
            'detection': 'string-based'
        })

    # Check role similarity (if README exists)
    readme_path = os.path.join(agents_dir, agent_dir, 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r') as f:
            content = f.read()
            # Extract role/purpose from README
            role_match = re.search(r'##\s*(?:Purpose|Role|Core Identity).*?\n(.+)', content, re.IGNORECASE | re.DOTALL)
            if role_match:
                existing_role = role_match.group(1).strip()

                # String-based role similarity
                role_sim = similarity(new_role, existing_role)
                if role_sim > 0.6:
                    similar_agents.append({
                        'name': agent_dir,
                        'type': 'role',
                        'similarity': role_sim,
                        'role': existing_role[:100],
                        'detection': 'string-based'
                    })

                # Semantic role similarity
                has_overlap, category, match_count = detect_semantic_overlap(
                    new_name, new_role, agent_dir, existing_role
                )
                if has_overlap:
                    # Calculate semantic similarity score based on matches
                    semantic_sim = min(0.65 + (match_count * 0.05), 0.95)
                    similar_agents.append({
                        'name': agent_dir,
                        'type': 'semantic',
                        'similarity': semantic_sim,
                        'category': category,
                        'role': existing_role[:100],
                        'detection': 'semantic'
                    })

# Remove duplicates (keep highest similarity per agent)
unique_agents = {}
for agent in similar_agents:
    name = agent['name']
    if name not in unique_agents or agent['similarity'] > unique_agents[name]['similarity']:
        unique_agents[name] = agent

similar_agents = list(unique_agents.values())

# Sort by similarity
similar_agents.sort(key=lambda x: x['similarity'], reverse=True)

# Display results
if similar_agents:
    print(f"Found {len(similar_agents)} similar agent(s):")
    for agent in similar_agents[:5]:  # Show top 5
        sim_percent = int(agent['similarity'] * 100)
        if agent['type'] == 'name':
            print(f"  - {agent['name']} (name similarity: {sim_percent}%, {agent['detection']})")
        elif agent['type'] == 'semantic':
            print(f"  - {agent['name']} (semantic overlap: {sim_percent}%, category: {agent['category']})")
            print(f"    Role: {agent['role']}")
        else:
            print(f"  - {agent['name']} (role similarity: {sim_percent}%, {agent['detection']})")
            print(f"    Role: {agent['role']}")

    # High similarity warning
    if similar_agents[0]['similarity'] > 0.8:
        print(f"\033[1;33mWarning: Very high similarity detected with {similar_agents[0]['name']}\033[0m")
        exit(2)
else:
    print("\033[0;32m✓ No similar agents found\033[0m")
EOF
    
    return $?
}

# Main validation
echo -e "${BLUE}Validating agent configuration...${NC}"
echo ""

# Check if arguments provided
if [ -z "$AGENT_NAME" ] || [ -z "$AGENT_ROLE" ]; then
    echo "Usage: $0 <agent_name> <agent_role> [--check-similarity]"
    exit 1
fi

# Run validations
VALIDATION_PASSED=true

# Validate name
if ! validate_name "$AGENT_NAME"; then
    VALIDATION_PASSED=false
fi

# Validate role
if ! validate_role "$AGENT_ROLE"; then
    VALIDATION_PASSED=false
fi

# Check existing
if ! check_existing "$AGENT_NAME"; then
    VALIDATION_PASSED=false
fi

# Check similarity if requested
if [ "$CHECK_SIMILARITY" = true ]; then
    if ! check_similarity "$AGENT_NAME" "$AGENT_ROLE"; then
        if [ $? -eq 2 ]; then
            echo -e "${YELLOW}Consider reviewing similar agents before proceeding${NC}"
        else
            VALIDATION_PASSED=false
        fi
    fi
fi

# Final result
echo ""
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✓ All validations passed${NC}"
    echo -e "${GREEN}Agent '$AGENT_NAME' can be created${NC}"
    exit 0
else
    echo -e "${RED}✗ Validation failed${NC}"
    echo -e "${RED}Please address the issues above before creating the agent${NC}"
    exit 1
fi