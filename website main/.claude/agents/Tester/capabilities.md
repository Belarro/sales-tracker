# Tester Agent - Capabilities & Routing Rules

## Quick Reference

**Primary Function**: Testing coordination and quality assurance
**Activation Keywords**: test, validate, verify, qa, quality, coverage
**Default Team**: Tester + Verifier
**Response Time**: <30 seconds to team assembly

## Routing Rules

### Trigger Patterns

```bash
route_pattern_tester() {
    local input="$1"

    # Testing action keywords
    if [[ "$input" =~ (test|testing|tests|tested) ]]; then
        return 0  # Activate Tester
    fi

    # Validation keywords
    if [[ "$input" =~ (validate|verify|check|ensure) ]]; then
        # Only if in QA context
        if [[ "$input" =~ (quality|qa|functionality|works|working) ]]; then
            return 0  # Activate Tester
        fi
    fi

    # QA keywords
    if [[ "$input" =~ (qa|quality|assurance|coverage|regression) ]]; then
        return 0  # Activate Tester
    fi

    return 1  # Do not activate Tester
}
```

## Test Type Detection

### Unit Testing
**Patterns**: `unit test`, `test function`, `test method`, `test class`
**Team**: Tester + Verifier
**Example**: "write unit tests for user validation"

### Integration Testing
**Patterns**: `integration test`, `test API`, `test endpoints`, `component test`
**Team**: Tester + Verifier + Developer
**Example**: "test integration between auth and user services"

### E2E Testing
**Patterns**: `e2e`, `end-to-end`, `user flow`, `journey`, `scenario`
**Team**: Tester + Verifier + User
**Example**: "test complete checkout flow end-to-end"

### Performance Testing
**Patterns**: `performance`, `load test`, `stress test`, `benchmark`
**Team**: Tester + Developer + Debugger
**Example**: "load test API with 1000 concurrent users"

### Security Testing
**Patterns**: `security test`, `penetration test`, `vulnerability`, `exploit`
**Team**: Tester + Verifier + Cryptographer
**Example**: "security test authentication system"

## Complexity Assessment

### Low Complexity
**Indicators**:
- Single function/method
- Unit test only
- Clear input/output
- No external dependencies

**Examples**:
- "test email validation function"
- "verify password strength checker"

**Team**: Tester + Verifier
**Estimated Time**: 1-2 hours

### Medium Complexity
**Indicators**:
- Multiple components
- Integration tests
- API testing
- Mock requirements
- Database interactions

**Examples**:
- "test user registration flow"
- "validate all API endpoints"
- "test payment processing integration"

**Team**: Tester + Verifier + Developer
**Estimated Time**: 4-8 hours

### High Complexity
**Indicators**:
- System-wide testing
- E2E scenarios
- Performance requirements
- Security testing
- Multiple integrations
- User acceptance

**Examples**:
- "comprehensive QA for entire application"
- "test real-time collaboration features"
- "performance and security audit"

**Team**: Tester + Verifier + Developer + Debugger + User
**Estimated Time**: 2-5 days

## Dynamic Team Selection

### Base Team
- **Tester**: Strategy and coordination
- **Verifier**: Validation and verification

### Conditional Additions

#### Add Developer When:
- Test implementation needed
- Custom test utilities required
- Mocking/stubbing complex
- Integration with CI/CD

#### Add Debugger When:
- Issues expected
- Performance investigation
- Complex failure analysis
- Root cause needed

#### Add User When:
- UAT required
- User flows being tested
- Acceptance criteria validation
- Usability feedback needed

#### Add Cryptographer When:
- Security testing
- Encryption validation
- Authentication testing
- Vulnerability assessment

## Testing Strategy Matrix

| Test Type | Coverage | Speed | Maintenance | When to Use |
|-----------|----------|-------|-------------|-------------|
| Unit | High | Fast | Low | Individual functions |
| Integration | Medium | Medium | Medium | Component interactions |
| E2E | Low | Slow | High | Critical user flows |
| Performance | N/A | Slow | Medium | Load/scalability |
| Security | Medium | Medium | Medium | Security-sensitive features |

## Test Coverage Rules

### Minimum Coverage by Component Type

**Business Logic**: 90%+ coverage
- Critical calculations
- Validation rules
- Business rules

**API Endpoints**: 85%+ coverage
- All routes tested
- Error cases covered
- Auth/permissions validated

**UI Components**: 70%+ coverage
- Component rendering
- User interactions
- State changes

**Utilities**: 95%+ coverage
- Pure functions
- Helper methods
- Data transformations

## Quality Gates

Tests must pass these gates:

1. ✅ **All Tests Pass**: 100% pass rate required
2. ✅ **Coverage Met**: Minimum thresholds achieved
3. ✅ **Performance**: Within acceptable limits
4. ✅ **Security**: No critical vulnerabilities
5. ✅ **Regression**: No existing functionality broken

## Test Execution Workflow

### Phase 1: Setup (10%)
- Test environment configuration
- Test data preparation
- Mock/stub setup
- Tool configuration

### Phase 2: Implementation (40%)
- Write test cases
- Implement test utilities
- Setup test fixtures
- Configure test runners

### Phase 3: Execution (30%)
- Run test suites
- Collect results
- Identify failures
- Document issues

### Phase 4: Validation (20%)
- Verify coverage
- Check quality metrics
- Validate against requirements
- Report findings

## Integration Examples

### Example 1: Simple Unit Test
```bash
User: "test the email validation function"

Tester Analysis:
- Type: Unit test
- Complexity: Low
- Team: tester, verifier

Output: [Tester]: Unit testing task identified -- Tester
        Test Type: Unit
        Team: Tester, Verifier
        Approach: Test cases for valid/invalid emails → Run → Coverage check
        Estimated: 1 hour
```

### Example 2: API Testing
```bash
User: "validate all user management API endpoints"

Tester Analysis:
- Type: Integration test
- Complexity: Medium
- Team: tester, verifier, developer

Output: [Tester]: API integration testing -- Tester
        Test Type: Integration
        Team: Tester, Verifier, Developer
        Approach: Endpoint tests → Auth validation → Error handling → Response validation
        Estimated: 6-8 hours
```

### Example 3: Comprehensive QA
```bash
User: "full QA for checkout flow including performance and security"

Tester Analysis:
- Type: E2E + Performance + Security
- Complexity: High
- Team: tester, verifier, developer, user, cryptographer

Output: [Tester]: 🧪 COMPREHENSIVE QA SUITE 🧪 -- Tester
        Test Types: E2E, Performance, Security
        Team: Tester, Verifier, Developer, User, Cryptographer
        Approach: E2E scenarios → Performance benchmarks → Security scan → UAT
        Estimated: 3-4 days
```

## Test Reporting

### Test Results Format
```
Test Summary:
✅ Passed: 145 tests
❌ Failed: 3 tests
⏭️  Skipped: 2 tests
📊 Coverage: 87.3%
⏱️  Duration: 2m 34s

Failed Tests:
1. User authentication with invalid token
2. Payment processing timeout handling
3. Database connection retry logic
```

### Quality Metrics
```
Quality Score: 8.7/10

Coverage: 87.3% (Target: 85%) ✅
Pass Rate: 97.9% (Target: 95%) ✅
Performance: 245ms avg (Target: 300ms) ✅
Bugs Found: 3 medium severity
```

## Common Test Patterns

### Authentication Testing
- Valid credentials
- Invalid credentials
- Token expiration
- Permission checks
- Session management

### API Testing
- Happy path
- Error responses
- Edge cases
- Rate limiting
- Input validation

### Data Validation
- Required fields
- Format validation
- Range validation
- Uniqueness constraints
- Business rules

## Performance Benchmarks

- **Pattern Matching**: <10ms
- **Strategy Selection**: <50ms
- **Team Assembly**: <100ms
- **Total Routing**: <200ms

## Error Handling

### When Tests Fail
1. Document failure details
2. Create bug reports
3. Coordinate with Fixer
4. Re-test after fixes
5. Update test cases

### When Coverage Insufficient
1. Identify untested code
2. Prioritize critical paths
3. Add missing tests
4. Re-run coverage analysis
5. Report improvements

---

**Version**: 1.0.0
**Last Updated**: 2025-09-30
**Integration Status**: Phase 1 Development