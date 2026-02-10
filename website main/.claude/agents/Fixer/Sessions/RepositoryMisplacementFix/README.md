# Repository Misplacement Fix - CI Command Scripts

## Issue Summary
The Manager agent created command wrapper scripts in the CollaborativeIntelligence repository that belong in the CI repository.

## Affected Files
1. `ci-agent` - Agent management wrapper
2. `ci-session` - Session management wrapper

## Resolution
### Actions Taken
1. Identified the misplaced files through modification time analysis
2. Confirmed files belong in CI repository based on:
   - Use of `CI_REPO_PATH` environment variable
   - Reference to `ci-tools/cmd/` structure
   - Nature as command-line tools
3. Removed files from CollaborativeIntelligence repository

### What These Files Should Do
These wrapper scripts should be placed in the CI repository's `bin/` directory to provide command-line access to CI tools.

### Content Preserved for CI Repository
```bash
#!/bin/bash
# ci-agent - Agent management tool for Collaborative Intelligence
export CI_REPO_PATH="${CI_REPO_PATH:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
exec "$CI_REPO_PATH/ci-tools/cmd/agent.sh" "$@"
```

```bash
#!/bin/bash
# ci-session - Session management tool for Collaborative Intelligence
export CI_REPO_PATH="${CI_REPO_PATH:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
exec "$CI_REPO_PATH/ci-tools/cmd/session.sh" "$@"
```

## Recommendations
1. These scripts should be created in `../CI/bin/` directory
2. The Manager agent should be updated to understand repository boundaries
3. Topologist should be notified of this cross-repository confusion

## Impact
- No data loss - scripts preserved in this documentation
- CollaborativeIntelligence repository cleaned of misplaced files
- CI functionality remains intact in ci-tools directory