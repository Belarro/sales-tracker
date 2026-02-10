# Builder Agent - Capabilities & Routing Rules

## Quick Reference

**Primary Function**: Development coordination and feature implementation
**Activation Keywords**: build, develop, implement, create, add, feature
**Default Team**: Developer + Architect + Tester
**Response Time**: <45 seconds to team assembly

## Routing Rules

### Trigger Patterns

Builder activates when user input matches these patterns:

#### Development Keywords
- `build`, `develop`, `implement`, `create`
- `add`, `make`, `construct`, `generate`
- `code`, `program`, `write`

#### Feature Keywords
- `feature`, `functionality`, `capability`
- `module`, `component`, `system`
- `application`, `app`, `service`
- `tool`, `utility`, `widget`

#### Action Patterns
- `build [feature name]`
- `implement [functionality]`
- `create [component]`
- `add [new feature]`
- `develop [application]`

### Pattern Matching Logic

```bash
# In agent-orchestrator.sh
route_pattern_builder() {
    local input="$1"

    # Build/develop action patterns
    if [[ "$input" =~ (build|develop|implement|create|add|make) ]]; then
        # Exclude if it's a fix/debug pattern (belongs to Fixer)
        if [[ "$input" =~ (fix|bug|error|debug) ]]; then
            return 1  # Not Builder, let Fixer handle
        fi
        return 0  # Activate Builder
    fi

    # Feature/application patterns
    if [[ "$input" =~ (feature|application|system|module|component) ]]; then
        return 0  # Activate Builder
    fi

    return 1  # Do not activate Builder
}
```

## Complexity Assessment Rules

### Low Complexity

**Indicators**:
- Single component/page
- Simple/basic/straightforward
- Standard UI patterns
- Minimal business logic
- No integration requirements

**Examples**:
- "create simple contact form"
- "add button to dashboard"
- "build basic profile page"

**Team Composition**: Developer + Tester

**Estimated Development**: 2-4 hours

### Medium Complexity

**Indicators**:
- Multiple components
- API integration
- Database operations
- Business logic required
- Authentication/authorization
- State management

**Examples**:
- "implement user registration flow"
- "build product catalog with search"
- "create admin dashboard"
- "add payment integration"

**Team Composition**: Developer + Architect + Tester + (conditional specialists)

**Estimated Development**: 1-3 days

### High Complexity

**Indicators**:
- System-wide architecture
- Multiple subsystems
- Real-time requirements
- High performance needs
- Scalability critical
- Security sensitive
- Complex integrations

**Examples**:
- "build microservices architecture"
- "implement real-time chat system"
- "create distributed job queue"
- "develop payment processing system"

**Team Composition**: Developer + Architect + Tester + UI + Backender + (additional specialists)

**Estimated Development**: 1-4 weeks

## Dynamic Team Selection

### Base Team (Always Included)
- **Developer**: Core implementation
- **Architect**: Design decisions
- **Tester**: Quality assurance

### Conditional Additions

#### Add UI When:
- Frontend/interface mentioned
- User experience focus
- Visual components
- Dashboard, page, view, component keywords

#### Add Designer When:
- UX/design explicitly mentioned
- Complex user flows
- Branding considerations
- Accessibility requirements

#### Add Backender When:
- API development
- Server-side logic
- Backend, service, endpoint keywords
- Business logic processing

#### Add Database When:
- Data modeling required
- Schema design needed
- Complex queries
- Data migration

#### Add Infrastructurer When:
- Deployment considerations
- Scaling requirements
- DevOps/CI/CD mentioned
- Infrastructure changes

## Feature Type Detection

### Frontend Features
**Pattern Detection**:
```bash
if [[ "$input" =~ (ui|interface|frontend|page|view|component|dashboard) ]]; then
    add_specialists="ui designer"
fi
```

**Examples**:
- "build user dashboard"
- "create product listing page"
- "implement navigation menu"

### Backend Features
**Pattern Detection**:
```bash
if [[ "$input" =~ (api|backend|server|service|endpoint|database) ]]; then
    add_specialists="backender database"
fi
```

**Examples**:
- "build REST API for users"
- "implement authentication service"
- "create background job processor"

### Full-Stack Features
**Pattern Detection**:
```bash
if [[ "$input" =~ (application|system|platform|full-stack|end-to-end) ]]; then
    add_specialists="ui backender designer database"
fi
```

**Examples**:
- "build e-commerce platform"
- "create project management system"
- "implement social network"

## Capability Matrix

| Capability | Developer | Architect | Tester | UI | Designer | Backender | Database |
|------------|-----------|-----------|--------|-------|----------|-----------|----------|
| Code implementation | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Architecture design | ⚠️ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ |
| Testing | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ |
| UI implementation | ⚠️ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| UX design | ❌ | ❌ | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| API development | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Data modeling | ❌ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ✅ |

Legend: ✅ Primary | ⚠️ Secondary | ❌ Not responsible

## Response Protocols

### Immediate Response (< 1 minute)
- Team assembly complete
- Requirements analysis initiated
- Technical approach outlined
- Development plan drafted

### Short-term Response (< 1 day)
- Architecture design complete (if needed)
- Development environment ready
- Initial implementation started
- First iteration deployed

### Delivery Target
- **Low complexity**: < 1 day
- **Medium complexity**: 1-3 days
- **High complexity**: 1-4 weeks

## Context Gathering

When Builder activates, it automatically gathers:

### From Project
- Framework and language
- Existing architecture patterns
- Code style and conventions
- Testing framework setup
- Available components/libraries

### From Git
- Current feature branch
- Recent development activity
- Team coding patterns
- CI/CD configuration

### From User
- Feature requirements
- Acceptance criteria (if provided)
- Technical preferences
- Timeline expectations

## Quality Standards

### Code Quality
- Follows project conventions
- Passes linting rules
- Proper error handling
- Clear variable naming
- Adequate comments

### Test Coverage
- Unit tests: 80%+ coverage
- Integration tests for APIs
- E2E tests for critical flows
- Edge case handling

### Documentation
- README updates
- API documentation
- Code comments
- Architecture diagrams (for complex features)

### Performance
- Load time benchmarks met
- Memory usage acceptable
- Database queries optimized
- Caching implemented where appropriate

## Development Workflow

### Phase 1: Planning (10-15% of time)
1. Requirements clarification
2. Architecture design
3. Task breakdown
4. Dependency identification
5. Risk assessment

### Phase 2: Implementation (50-60% of time)
1. Environment setup
2. Core functionality
3. Integration points
4. Error handling
5. Edge cases

### Phase 3: Testing (20-25% of time)
1. Unit tests
2. Integration tests
3. Manual testing
4. Performance testing
5. Security review

### Phase 4: Polish (10-15% of time)
1. Code review
2. Refactoring
3. Documentation
4. Deployment prep
5. Knowledge transfer

## Integration Examples

### Example 1: Simple Feature
```bash
User: "build contact form with name, email, message fields"

Builder Analysis:
- Keywords: build, form (frontend)
- Complexity: Low (single component)
- Team: developer, ui, tester

Output: [Builder]: Simple frontend feature identified -- Builder
        Complexity: Low
        Team: Developer, UI, Tester
        Approach: Create form component → Add validation → Style → Test
        Estimated: 3-4 hours
```

### Example 2: Medium Feature
```bash
User: "implement user authentication with JWT and refresh tokens"

Builder Analysis:
- Keywords: implement, authentication (backend + security)
- Complexity: Medium (auth + security)
- Team: developer, architect, backender, tester

Output: [Builder]: Authentication system development -- Builder
        Complexity: Medium
        Team: Developer, Architect, Backender, Tester
        Approach: Design flow → Backend API → Frontend integration → Security review
        Estimated: 2-3 days
```

### Example 3: Complex Application
```bash
User: "build real-time collaborative document editor"

Builder Analysis:
- Keywords: build, real-time, collaborative (complex system)
- Complexity: High (real-time + architecture)
- Team: developer, architect, backender, ui, tester, infrastructurer

Output: [Builder]: 🏗️ COMPLEX SYSTEM DEVELOPMENT 🏗️ -- Builder
        Complexity: High
        Team: Developer, Architect, Backender, UI, Tester, Infrastructurer
        Approach: WebSocket architecture → Backend service → Frontend editor → Sync logic → Performance optimization
        Estimated: 2-4 weeks
```

## Risk Assessment

### High-Risk Development
**Indicators**: payment, security, data-migration, real-time, scaling

**Additional Measures**:
- Extra architecture review
- Security specialist consultation
- Load testing
- Staged rollout plan

### Medium-Risk Development
**Indicators**: user-facing, API-breaking, database-schema

**Additional Measures**:
- Thorough testing
- Feature flags
- Rollback plan

### Low-Risk Development
**Indicators**: internal, isolated, reversible

**Additional Measures**:
- Standard testing
- Quick review

## Success Validation

Before marking feature as complete:
1. ✅ All requirements implemented
2. ✅ Tests written and passing
3. ✅ Code reviewed and approved
4. ✅ Documentation complete
5. ✅ Performance benchmarks met
6. ✅ Security review passed (if applicable)
7. ✅ Deployed to staging/production

## Learning and Improvement

After each development cycle, Builder updates:

### Feature Patterns Database
```json
{
  "feature_type": "authentication_system",
  "complexity": "medium",
  "team_used": ["developer", "architect", "backender", "tester"],
  "development_time": "2.5 days",
  "success": true,
  "tech_stack": ["nodejs", "jwt", "postgres"]
}
```

### Team Effectiveness Metrics
```json
{
  "team_composition": "developer+architect+tester",
  "success_rate": 0.88,
  "avg_dev_time": "2.1 days",
  "feature_types": ["medium_complexity"]
}
```

## Command Integration

### Builder-Specific Commands (Future Phase 2)
```bash
/build <description>            # Direct Builder activation
/build status                   # Current development status
/build history                  # Recent features built
/build patterns                 # Common feature patterns
```

### Current Phase 1 Integration
```bash
/team build <description>       # Routes to Builder
/team <description>             # Auto-routes if patterns match
```

## Performance Benchmarks

Target performance metrics:

- **Pattern Matching**: <10ms
- **Complexity Assessment**: <100ms
- **Team Selection**: <150ms
- **Total Routing Time**: <300ms
- **First Response**: <45s

## Error Handling

### When Builder Cannot Route
1. Check if Fixer should handle (bug/fix keywords)
2. Fall back to intent detection
3. Suggest manual team creation
4. Offer to clarify requirements

### When Requirements Unclear
1. Ask clarifying questions
2. Provide feature template
3. Suggest similar past features
4. Offer to start with MVP

---

**Version**: 1.0.0
**Last Updated**: 2025-09-30
**Integration Status**: Phase 1 Development