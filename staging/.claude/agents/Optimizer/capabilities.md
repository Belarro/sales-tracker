# Optimizer Agent - Capabilities & Routing Rules

## Quick Reference

**Primary Function**: Performance optimization and code efficiency
**Activation Keywords**: optimize, improve, refactor, performance, efficiency
**Default Team**: Optimizer + Refactorer + Developer
**Response Time**: <35 seconds to team assembly

## Routing Rules

### Trigger Patterns

```bash
route_pattern_optimizer() {
    local input="$1"

    # Optimization keywords
    if [[ "$input" =~ (optimize|optimization|improve|enhance|efficiency) ]]; then
        return 0  # Activate Optimizer
    fi

    # Refactoring keywords
    if [[ "$input" =~ (refactor|cleanup|prune|reduce|simplify) ]]; then
        return 0  # Activate Optimizer
    fi

    # Performance keywords
    if [[ "$input" =~ (performance|speed|faster|slow|latency) ]]; then
        # Only if optimization context (not debugging)
        if ! [[ "$input" =~ (bug|error|broken|fix) ]]; then
            return 0  # Activate Optimizer
        fi
    fi

    # Resource keywords
    if [[ "$input" =~ (memory|cpu|resource|footprint|usage) ]] && [[ "$input" =~ (optimize|reduce|improve) ]]; then
        return 0  # Activate Optimizer
    fi

    return 1  # Do not activate Optimizer
}
```

## Optimization Type Detection

### Code Optimization
**Patterns**: `optimize code`, `improve algorithm`, `refactor function`
**Team**: Optimizer + Refactorer + Developer
**Example**: "optimize the sorting algorithm"

### Performance Optimization
**Patterns**: `improve performance`, `speed up`, `reduce latency`
**Team**: Optimizer + Developer + Benchmarker
**Example**: "improve API response times"

### Memory Optimization
**Patterns**: `reduce memory`, `optimize memory usage`, `memory leak`
**Team**: Optimizer + Developer + Debugger
**Example**: "reduce memory footprint of caching layer"

### Database Optimization
**Patterns**: `optimize queries`, `database performance`, `slow queries`
**Team**: Optimizer + Developer + Database
**Example**: "optimize database query performance"

### Bundle Optimization
**Patterns**: `reduce bundle size`, `optimize build`, `code splitting`
**Team**: Optimizer + Developer + Refactorer
**Example**: "reduce JavaScript bundle size"

## Complexity Assessment

### Low Complexity
**Indicators**:
- Single function/method
- Clear inefficiency
- Standard optimization patterns
- Isolated component
- Quick wins

**Examples**:
- "optimize loop in validation function"
- "remove unused imports"
- "simplify conditional logic"

**Team**: Optimizer + Refactorer
**Estimated Time**: 1-3 hours

### Medium Complexity
**Indicators**:
- Multiple components
- Algorithm improvements
- Caching strategies
- Database optimization
- Build optimization
- Measurable targets

**Examples**:
- "optimize API endpoint performance"
- "improve database query efficiency"
- "reduce bundle size by 30%"
- "implement caching strategy"

**Team**: Optimizer + Refactorer + Developer + Benchmarker
**Estimated Time**: 1-3 days

### High Complexity
**Indicators**:
- System-wide optimization
- Architecture changes
- Distributed system performance
- Critical path optimization
- Scalability improvements
- Multi-dimensional gains

**Examples**:
- "comprehensive platform performance optimization"
- "optimize microservices architecture for scale"
- "system-wide memory usage reduction"

**Team**: Optimizer + Refactorer + Developer + Benchmarker + Architect
**Estimated Time**: 1-4 weeks

## Dynamic Team Selection

### Base Team
- **Optimizer**: Strategy and coordination
- **Refactorer**: Code restructuring
- **Developer**: Implementation

### Conditional Additions

#### Add Benchmarker When:
- Performance measurements critical
- Before/after comparisons needed
- Specific performance targets
- Validation required

#### Add Architect When:
- Architecture changes needed
- System-wide optimization
- Scalability concerns
- Design patterns involved

#### Add Debugger When:
- Memory leaks suspected
- Profiling needed
- Root cause unclear
- Resource issues

#### Add Database When:
- Query optimization
- Schema improvements
- Index optimization
- Database performance

## Optimization Strategies

### Algorithm Optimization
**Approach**: Replace O(n²) with O(n log n) or O(n)
**Example**: Use hash map instead of nested loops
**Impact**: 10-100x improvement possible

### Caching
**Approach**: Store computed results
**Example**: Redis for API responses, memoization for functions
**Impact**: 2-50x improvement

### Lazy Loading
**Approach**: Defer loading until needed
**Example**: Code splitting, image lazy loading
**Impact**: Reduced initial load time

### Database Indexing
**Approach**: Add indexes on frequently queried fields
**Example**: Index on user_id for user lookups
**Impact**: 10-1000x query speedup

### Code Splitting
**Approach**: Break bundle into smaller chunks
**Example**: Route-based splitting in SPAs
**Impact**: 30-70% bundle size reduction

### Dead Code Elimination
**Approach**: Remove unused code
**Example**: Tree shaking, unused imports
**Impact**: 10-30% size reduction

## Capability Matrix

| Capability | Optimizer | Refactorer | Developer | Benchmarker | Architect | Database |
|------------|-----------|------------|-----------|-------------|-----------|----------|
| Strategy | ✅ | ❌ | ❌ | ❌ | ⚠️ | ❌ |
| Refactoring | ⚠️ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Implementation | ❌ | ⚠️ | ✅ | ❌ | ❌ | ⚠️ |
| Benchmarking | ⚠️ | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Architecture | ⚠️ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Query optimization | ❌ | ❌ | ⚠️ | ❌ | ❌ | ✅ |

Legend: ✅ Primary | ⚠️ Secondary | ❌ Not responsible

## Optimization Workflow

### Phase 1: Baseline (15%)
- Measure current performance
- Identify bottlenecks
- Profile resource usage
- Set improvement targets

### Phase 2: Strategy (15%)
- Analyze optimization opportunities
- Prioritize by impact
- Plan implementation
- Assess risks

### Phase 3: Implementation (50%)
- Apply optimizations
- Refactor code
- Add caching
- Improve algorithms
- Remove dead code

### Phase 4: Validation (20%)
- Benchmark improvements
- Verify no regressions
- Measure resource usage
- Document changes

## Integration Examples

### Example 1: Simple Function Optimization
```bash
User: "optimize the user filtering function"

Optimizer Analysis:
- Type: Code optimization
- Complexity: Low
- Team: optimizer, refactorer, developer

Output: [Optimizer]: Function optimization task -- Optimizer
        Type: Algorithm
        Team: Optimizer, Refactorer, Developer
        Approach: Profile → Identify O(n²) loop → Use hash map → Benchmark
        Expected Gain: 10-50x speedup
        Estimated: 2 hours
```

### Example 2: API Performance
```bash
User: "improve API response times from 800ms to under 200ms"

Optimizer Analysis:
- Type: Performance optimization
- Complexity: Medium
- Team: optimizer, refactorer, developer, benchmarker

Output: [Optimizer]: API performance optimization -- Optimizer
        Type: Performance (API)
        Team: Optimizer, Refactorer, Developer, Benchmarker
        Target: 800ms → <200ms (75% improvement)
        Approach: Profile endpoints → Add caching → Optimize queries → Benchmark
        Estimated: 2 days
```

### Example 3: System-Wide Optimization
```bash
User: "comprehensive performance optimization across entire platform"

Optimizer Analysis:
- Type: System-wide
- Complexity: High
- Team: optimizer, refactorer, developer, benchmarker, architect

Output: [Optimizer]: ⚡ COMPREHENSIVE OPTIMIZATION ⚡ -- Optimizer
        Type: System-wide performance
        Team: Optimizer, Refactorer, Developer, Benchmarker, Architect
        Scope: Full platform
        Approach: System profiling → Architecture review → Bottleneck elimination → Code optimization → Caching strategy → Bundle optimization → Validation
        Estimated: 2-3 weeks
```

## Performance Targets

### Response Times
- **API**: <200ms p95
- **Page Load**: <2s first contentful paint
- **Interaction**: <100ms to interactive

### Resource Usage
- **Memory**: Reduce by 20-50%
- **CPU**: Reduce by 15-40%
- **Bundle Size**: Reduce by 30-60%

### Throughput
- **Requests**: +50-200% capacity
- **Concurrent Users**: +100% support
- **Data Processing**: +2-10x speed

## Measurement & Validation

### Performance Metrics
```
Baseline Performance:
- API Response Time: 847ms (p95)
- Memory Usage: 512MB
- Bundle Size: 2.3MB
- CPU Usage: 68%

After Optimization:
- API Response Time: 178ms (p95) ✅ 79% improvement
- Memory Usage: 298MB ✅ 42% reduction
- Bundle Size: 1.1MB ✅ 52% reduction
- CPU Usage: 42% ✅ 38% reduction
```

### Regression Testing
- ✅ All tests pass
- ✅ No functionality broken
- ✅ Performance maintained under load
- ✅ Edge cases handled

## Common Optimization Patterns

### N+1 Query Problem
**Issue**: Multiple database queries in loop
**Solution**: Batch queries, use joins, eager loading
**Gain**: 10-100x faster

### Unnecessary Re-renders
**Issue**: React components re-rendering too often
**Solution**: useMemo, useCallback, React.memo
**Gain**: 2-5x faster UI

### Large Bundle
**Issue**: Loading too much JavaScript upfront
**Solution**: Code splitting, lazy loading, tree shaking
**Gain**: 30-70% size reduction

### Inefficient Loops
**Issue**: Nested loops causing O(n²) complexity
**Solution**: Hash maps, sorting, better algorithms
**Gain**: 10-1000x faster

### Missing Indexes
**Issue**: Database doing full table scans
**Solution**: Add appropriate indexes
**Gain**: 10-1000x faster queries

### No Caching
**Issue**: Recomputing same values repeatedly
**Solution**: Memoization, Redis, CDN
**Gain**: 5-50x faster

## Quality Standards

### Code Quality
- ✅ Maintains or improves readability
- ✅ No increase in complexity
- ✅ Proper error handling preserved
- ✅ Tests updated and passing

### Performance Gains
- ✅ Measurable improvement (>20%)
- ✅ Validated with benchmarks
- ✅ No regressions in other areas
- ✅ Sustainable under load

### Documentation
- ✅ Changes documented
- ✅ Performance metrics recorded
- ✅ Trade-offs explained
- ✅ Monitoring added

## Learning and Improvement

### Optimization Effectiveness
```json
{
  "optimization_type": "api_caching",
  "target": "user_profile_endpoint",
  "baseline": "847ms",
  "optimized": "178ms",
  "improvement": "79%",
  "effort": "4 hours",
  "roi": "high"
}
```

### Pattern Library
```json
{
  "pattern": "add_redis_caching",
  "applies_to": ["api_endpoints", "computed_values"],
  "typical_gain": "5-20x",
  "complexity": "medium",
  "success_rate": 0.92
}
```

## Performance Benchmarks

- **Pattern Matching**: <10ms
- **Type Detection**: <50ms
- **Team Selection**: <100ms
- **Total Routing**: <200ms

## Error Handling

### When Targets Unrealistic
1. Explain constraints
2. Propose achievable goals
3. Break into phases
4. Suggest alternatives

### When Optimization Not Possible
1. Document reasons
2. Suggest architecture changes
3. Recommend hardware scaling
4. Provide workarounds

---

**Version**: 1.0.0
**Last Updated**: 2025-09-30
**Integration Status**: Phase 1 Development