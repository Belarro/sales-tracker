#!/bin/bash

# Quick Agent Creator - Ultra-minimal interface
# Examples:
#   quick-agent Designer
#   quick-agent "test specialist"
#   quick-agent performance

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTUITIVE_SCRIPT="$SCRIPT_DIR/intuitive-create.sh"

# Ultra-quick creation with smart defaults
if [[ $# -eq 0 ]]; then
    echo "Usage: quick-agent <name or description>"
    echo "Examples:"
    echo "  quick-agent Designer"
    echo "  quick-agent \"security expert\""
    echo "  quick-agent tester"
    exit 0
fi

# Pass through to intuitive creator with auto-confirm
yes "y" | "$INTUITIVE_SCRIPT" "$@" 2>/dev/null || "$INTUITIVE_SCRIPT" "$@"