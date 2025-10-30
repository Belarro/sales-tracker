# Analyzer Agent - Capabilities & Routing Rules

## Quick Reference

**Primary Function**: Analysis coordination and investigation
**Activation Keywords**: analyze, investigate, research, assess, examine
**Default Team**: Analyst + Researcher
**Response Time**: <40 seconds to team assembly

## Routing Rules

### Trigger Patterns

```bash
route_pattern_analyzer() {
    local input="$1"

    # Analysis keywords
    if [[ "$input" =~ (analyze|analysis|examine|investigate) ]]; then
        return 0  # Activate Analyzer
    fi

    # Research keywords
    if [[ "$input" =~ (research|study|assess|evaluate|review) ]]; then
        return 0  # Activate Analyzer
    fi

    # Insight keywords
    if [[ "$input" =~ (insight|pattern|trend|understand|explore) ]]; then
        return 0  # Activate Analyzer
    fi

    return 1  # Do not activate Analyzer
}
```

## Analysis Domain Detection

### Data Analysis
**Patterns**: `analyze data`, `metrics`, `statistics`, `trends`, `patterns`
**Team**: Analyst + Researcher
**Example**: "analyze user engagement metrics"

### System Analysis
**Patterns**: `analyze system`, `architecture`, `dependencies`, `structure`
**Team**: Analyst + Developer + Architect
**Example**: "analyze microservices architecture"

### Performance Analysis
**Patterns**: `performance`, `bottleneck`, `slow`, `optimize`, `speed`
**Team**: Analyst + Developer + Debugger
**Example**: "analyze application performance bottlenecks"

### Business Analysis
**Patterns**: `business impact`, `ROI`, `strategic`, `value`, `opportunity`
**Team**: Analyst + Researcher + Athena
**Example**: "analyze business impact of new feature"

### Security Analysis
**Patterns**: `security`, `vulnerability`, `threat`, `risk`, `compliance`
**Team**: Analyst + Cryptographer + Verifier
**Example**: "analyze security vulnerabilities"

## Complexity Assessment

### Low Complexity
**Indicators**:
- Single metric/dimension
- Clear data source
- Standard analysis
- Well-defined scope
- Quick turnaround expected

**Examples**:
- "analyze signup conversion rate"
- "check API response times"
- "review error logs from yesterday"

**Team**: Analyst + Researcher
**Estimated Time**: 1-3 hours

### Medium Complexity
**Indicators**:
- Multiple metrics/dimensions
- Cross-functional analysis
- Pattern recognition
- Moderate scope
- Some strategic implications

**Examples**:
- "analyze performance bottlenecks across services"
- "investigate why conversion dropped last week"
- "assess impact of recent deployment"

**Team**: Analyst + Researcher + Athena + (domain specialists)
**Estimated Time**: 4-8 hours

### High Complexity
**Indicators**:
- Comprehensive investigation
- System-wide analysis
- Strategic significance
- Multi-dimensional
- Architectural implications
- Requires deep expertise

**Examples**:
- "comprehensive analysis of system scalability"
- "investigate root causes of cascading failures"
- "strategic analysis of technology migration"

**Team**: Analyst + Researcher + Athena + Sage + (multiple specialists)
**Estimated Time**: 2-5 days

## Dynamic Team Selection

### Base Team
- **Analyst**: Core analysis capabilities
- **Researcher**: Deep investigation and context

### Conditional Additions

#### Add Athena When:
- Strategic insights needed
- Knowledge synthesis required
- System-wide perspective
- Medium+ complexity

#### Add Sage When:
- Wisdom integration needed
- Holistic understanding required
- High complexity only
- Philosophical implications

#### Add Developer When:
- Code analysis required
- Technical investigation
- Performance profiling
- System internals

#### Add Architect When:
- Architecture analysis
- System design evaluation
- Scalability assessment
- Technical strategy

#### Add Debugger When:
- Root cause analysis
- Issue investigation
- Performance debugging
- Failure analysis

## Analysis Framework

### 1. Define Objectives
- What question needs answering?
- What decisions will this inform?
- What's the scope?
- What's the timeline?

### 2. Gather Data
- Identify data sources
- Collect relevant metrics
- Gather context
- Document assumptions

### 3. Analyze
- Apply frameworks
- Identify patterns
- Test hypotheses
- Generate insights

### 4. Synthesize
- Integrate findings
- Draw conclusions
- Identify implications
- Formulate recommendations

### 5. Present
- Clear visualizations
- Actionable insights
- Supporting evidence
- Next steps

## Analysis Methodologies

### Quantitative Analysis
- Statistical analysis
- Trend analysis
- Correlation studies
- Comparative analysis
- Time series analysis

### Qualitative Analysis
- Pattern recognition
- Root cause analysis
- Impact assessment
- Risk analysis
- Opportunity identification

### Systems Thinking
- Holistic perspective
- Interconnections
- Feedback loops
- Emergent properties
- Long-term implications

## Capability Matrix

| Capability | Analyst | Researcher | Athena | Sage | Developer | Architect |
|------------|---------|------------|--------|------|-----------|-----------|
| Data analysis | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | ❌ |
| Research | ⚠️ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Strategic insight | ⚠️ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| Technical analysis | ⚠️ | ❌ | ⚠️ | ❌ | ✅ | ✅ |
| Synthesis | ⚠️ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| Architecture | ❌ | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |

Legend: ✅ Primary | ⚠️ Secondary | ❌ Not responsible

## Investigation Workflow

### Phase 1: Scoping (15%)
- Define objectives
- Identify stakeholders
- Determine scope
- Plan approach

### Phase 2: Data Collection (25%)
- Gather metrics
- Collect logs
- Interview stakeholders
- Document context

### Phase 3: Analysis (40%)
- Apply frameworks
- Identify patterns
- Test hypotheses
- Generate insights

### Phase 4: Synthesis (20%)
- Integrate findings
- Draw conclusions
- Formulate recommendations
- Prepare presentation

## Integration Examples

### Example 1: Simple Metrics Analysis
```bash
User: "analyze daily active users for last month"

Analyzer Analysis:
- Domain: Data analysis
- Complexity: Low
- Team: analyst, researcher

Output: [Analyzer]: Simple metrics analysis -- Analyzer
        Domain: Data
        Team: Analyst, Researcher
        Approach: Pull DAU data → Calculate trends → Identify patterns → Report
        Estimated: 2 hours
```

### Example 2: Performance Investigation
```bash
User: "investigate why API response times increased 200%"

Analyzer Analysis:
- Domain: Performance analysis
- Complexity: Medium
- Team: analyst, developer, debugger

Output: [Analyzer]: Performance investigation -- Analyzer
        Domain: Performance
        Team: Analyst, Developer, Debugger
        Approach: Profile endpoints → Identify bottlenecks → Root cause → Recommendations
        Estimated: 6 hours
```

### Example 3: Strategic Analysis
```bash
User: "comprehensive analysis of migrating to microservices"

Analyzer Analysis:
- Domain: Business + Technical + Strategic
- Complexity: High
- Team: analyst, researcher, athena, sage, architect, developer

Output: [Analyzer]: 🔍 STRATEGIC ANALYSIS 🔍 -- Analyzer
        Domain: Multi-dimensional (Technical, Business, Strategic)
        Team: Analyst, Researcher, Athena, Sage, Architect, Developer
        Approach: Current assessment → Technical feasibility → Cost-benefit → Risk analysis → Strategic fit → Recommendations
        Estimated: 3-5 days
```

## Deliverable Formats

### Quick Analysis
- Executive summary (1 paragraph)
- Key findings (3-5 bullets)
- Recommendation (1 action)

### Standard Analysis
- Executive summary
- Methodology
- Findings with visualizations
- Conclusions
- Recommendations
- Next steps

### Comprehensive Analysis
- Executive summary
- Background and context
- Detailed methodology
- Findings (multiple sections)
- Data visualizations
- Implications analysis
- Risk assessment
- Recommendations
- Implementation roadmap
- Appendices

## Quality Criteria

Analysis must meet:
1. ✅ **Objective-driven**: Answers the key questions
2. ✅ **Evidence-based**: Supported by data
3. ✅ **Actionable**: Provides clear recommendations
4. ✅ **Accurate**: Findings are correct
5. ✅ **Clear**: Well-communicated and understandable
6. ✅ **Timely**: Delivered within expected timeframe

## Learning and Improvement

### Pattern Recognition
Store recurring patterns:
```json
{
  "pattern": "slow_api_after_deployment",
  "indicators": ["response_time_spike", "recent_deploy"],
  "common_causes": ["db_migration", "memory_leak", "cache_miss"],
  "success_rate": 0.85
}
```

### Analysis Effectiveness
Track analysis quality:
```json
{
  "analysis_type": "performance_investigation",
  "team_used": ["analyst", "developer", "debugger"],
  "time_spent": "5 hours",
  "insights_quality": 9.2,
  "actionability": 8.8
}
```

## Performance Benchmarks

- **Pattern Matching**: <10ms
- **Domain Detection**: <50ms
- **Team Selection**: <100ms
- **Total Routing**: <250ms

## Error Handling

### When Objectives Unclear
1. Ask clarifying questions
2. Propose analysis framework
3. Suggest similar past analyses
4. Offer scoping session

### When Data Unavailable
1. Identify data gaps
2. Suggest alternatives
3. Propose proxy metrics
4. Plan data collection

---

**Version**: 1.0.0
**Last Updated**: 2025-09-30
**Integration Status**: Phase 1 Development