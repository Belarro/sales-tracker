# Agent Cache System Enhancement for Response Format Enforcement

## Overview

This document outlines the proposed enhancements to the Agent Cache System to properly enforce the standardized response format requirements. The goal is to ensure all agents consistently use both the required prefix `[AGENT_NAME]:` and suffix `-- [AGENT_NAME]` in their responses.

## Current State

The current agent cache system:
- Successfully tracks and manages agent activations
- Correctly updates terminal titles when agents are activated
- Does not fully enforce the response format standard
- Does not validate agent responses for format compliance

## Proposed Enhancements

### 1. Agent Cache Configuration Extension

Add response format specifications to the agent cache configuration:

```rust
/// Configuration for the Agent Cache System
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCacheConfig {
    // Existing fields...
    pub cache_dir: PathBuf,
    pub persistence_interval: Duration,
    pub max_entries_per_agent: usize,
    
    // New response format fields
    pub response_format: ResponseFormatConfig,
}

/// Configuration for standardized response format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseFormatConfig {
    /// Format for response prefix, e.g. "[{agent_name}]:"
    pub prefix_template: String,
    
    /// Format for response suffix, e.g. "-- [{agent_name}]"
    pub suffix_template: String,
    
    /// Whether to enforce the format
    pub enforce: bool,
    
    /// Action to take when format is incorrect
    pub enforcement_level: EnforcementLevel,
}

/// How strictly to enforce format
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EnforcementLevel {
    /// Just log violations
    LogOnly,
    
    /// Warn in output but allow
    WarnUser,
    
    /// Automatically correct format
    AutoCorrect,
    
    /// Reject non-compliant responses
    Reject,
}
```

### 2. Format Validation Functionality

Add a response validator to check format compliance:

```rust
impl AgentCacheManager {
    // ...existing methods...
    
    /// Validate agent response format
    pub fn validate_response_format(&self, agent_name: &str, response: &str) -> ValidationResult {
        let config = &self.config.response_format;
        if !config.enforce {
            return ValidationResult::Valid;
        }
        
        // Replace {agent_name} with actual agent name
        let expected_prefix = config.prefix_template.replace("{agent_name}", agent_name);
        let expected_suffix = config.suffix_template.replace("{agent_name}", agent_name);
        
        let has_prefix = response.trim_start().starts_with(&expected_prefix);
        let has_suffix = response.trim_end().ends_with(&expected_suffix);
        
        match (has_prefix, has_suffix) {
            (true, true) => ValidationResult::Valid,
            (false, true) => ValidationResult::MissingPrefix(expected_prefix),
            (true, false) => ValidationResult::MissingSuffix(expected_suffix),
            (false, false) => ValidationResult::MissingBoth {
                prefix: expected_prefix,
                suffix: expected_suffix,
            },
        }
    }
    
    /// Apply format enforcement based on configuration
    pub fn enforce_response_format(&self, agent_name: &str, response: &str) -> String {
        let validation = self.validate_response_format(agent_name, response);
        if let ValidationResult::Valid = validation {
            return response.to_string();
        }
        
        match self.config.response_format.enforcement_level {
            EnforcementLevel::LogOnly => {
                // Log the format violation but return unchanged
                if let Ok(mut logger) = self.logger.lock() {
                    logger.log_format_violation(agent_name, &validation);
                }
                response.to_string()
            },
            EnforcementLevel::WarnUser => {
                // Add warning message and return
                let warning = format!("\n[WARNING: Response format non-compliant: {}]", validation);
                format!("{}{}", response, warning)
            },
            EnforcementLevel::AutoCorrect => {
                // Automatically correct the format
                self.auto_correct_format(agent_name, response, validation)
            },
            EnforcementLevel::Reject => {
                // Return error message instead of non-compliant response
                format!("[ERROR: Agent response rejected due to non-compliant format. Expected: {}]", validation)
            },
        }
    }
    
    /// Auto-correct the response format
    fn auto_correct_format(&self, agent_name: &str, response: &str, validation: ValidationResult) -> String {
        let config = &self.config.response_format;
        let expected_prefix = config.prefix_template.replace("{agent_name}", agent_name);
        let expected_suffix = config.suffix_template.replace("{agent_name}", agent_name);
        
        match validation {
            ValidationResult::Valid => response.to_string(),
            ValidationResult::MissingPrefix(prefix) => {
                format!("{} {}", prefix, response.trim_start())
            },
            ValidationResult::MissingSuffix(suffix) => {
                format!("{} {}", response.trim_end(), suffix)
            },
            ValidationResult::MissingBoth { prefix, suffix } => {
                format!("{} {} {}", prefix, response.trim(), suffix)
            },
        }
    }
}

/// Result of format validation
#[derive(Debug, Clone)]
pub enum ValidationResult {
    Valid,
    MissingPrefix(String),
    MissingSuffix(String),
    MissingBoth {
        prefix: String,
        suffix: String,
    },
}

impl Display for ValidationResult {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ValidationResult::Valid => write!(f, "Format is valid"),
            ValidationResult::MissingPrefix(prefix) => write!(f, "Missing prefix: {}", prefix),
            ValidationResult::MissingSuffix(suffix) => write!(f, "Missing suffix: {}", suffix),
            ValidationResult::MissingBoth { prefix, suffix } => {
                write!(f, "Missing both prefix: {} and suffix: {}", prefix, suffix)
            }
        }
    }
}
```

### 3. Integration with Agent Activator

Update the agent activator to inject the format requirements:

```rust
// In agent_activator.rs

// Enhance enforce_agent_protocol function
fn enforce_agent_protocol(&self, agent_name: &str) -> Result<(), Box<dyn Error>> {
    // Simply remind about protocol
    if self.config.verbose {
        println!("Agent protocol reminder for: {}", agent_name);
        println!("1. Begin your response with: [{}]:", agent_name);
        println!("2. End your response with: -- [{}]", agent_name);
        println!("3. Maintain the agent's personality and capabilities");
        println!("4. Respond as {} would to the user's query", agent_name);
    }
    
    Ok(())
}

// Update show_activation_info
pub fn show_activation_info(&self, result: &ActivationResult) {
    // ... existing code...
    
    // Protocol reminder
    if self.config.enforce_protocol {
        println!("\n{}", "Protocol Reminder:".yellow().bold());
        println!("  1. Begin your response with: [{}]:", result.agent_name.bold());
        println!("  2. End your response with: -- [{}]", result.agent_name.bold());
        println!("  3. Maintain the agent's personality and capabilities");
        println!("  4. Respond as {} would to the user's query", result.agent_name.bold());
    }
    
    // ... remaining code...
}
```

### 4. Format Monitoring and Compliance Reporting

Add monitoring capabilities to track format compliance:

```rust
/// Format compliance statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct FormatComplianceStats {
    /// Total responses processed
    pub total_responses: usize,
    
    /// Responses with valid format
    pub valid_format_count: usize,
    
    /// Responses missing prefix
    pub missing_prefix_count: usize,
    
    /// Responses missing suffix
    pub missing_suffix_count: usize,
    
    /// Responses missing both
    pub missing_both_count: usize,
    
    /// Compliance percentage (0-100)
    pub compliance_percentage: f64,
    
    /// Stats per agent
    pub agent_stats: HashMap<String, AgentFormatStats>,
}

/// Format stats for a specific agent
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AgentFormatStats {
    pub total_responses: usize,
    pub valid_format_count: usize,
    pub compliance_percentage: f64,
}

impl AgentCacheManager {
    // ...existing methods...
    
    /// Update format compliance statistics
    pub fn update_compliance_stats(&mut self, agent_name: &str, validation: &ValidationResult) {
        let stats = &mut self.compliance_stats;
        stats.total_responses += 1;
        
        // Update agent-specific stats
        let agent_stats = stats.agent_stats.entry(agent_name.to_string())
            .or_insert_with(AgentFormatStats::default);
        agent_stats.total_responses += 1;
        
        // Update overall and agent-specific counts
        match validation {
            ValidationResult::Valid => {
                stats.valid_format_count += 1;
                agent_stats.valid_format_count += 1;
            },
            ValidationResult::MissingPrefix(_) => {
                stats.missing_prefix_count += 1;
            },
            ValidationResult::MissingSuffix(_) => {
                stats.missing_suffix_count += 1;
            },
            ValidationResult::MissingBoth { .. } => {
                stats.missing_both_count += 1;
            },
        }
        
        // Recalculate percentages
        stats.compliance_percentage = (stats.valid_format_count as f64 / stats.total_responses as f64) * 100.0;
        agent_stats.compliance_percentage = 
            (agent_stats.valid_format_count as f64 / agent_stats.total_responses as f64) * 100.0;
    }
    
    /// Generate compliance report
    pub fn generate_compliance_report(&self) -> String {
        let stats = &self.compliance_stats;
        let mut report = String::new();
        
        report.push_str("# Format Compliance Report\n\n");
        report.push_str(&format!("## Overall Compliance: {:.2}%\n\n", stats.compliance_percentage));
        report.push_str(&format!("- Total responses: {}\n", stats.total_responses));
        report.push_str(&format!("- Valid format: {}\n", stats.valid_format_count));
        report.push_str(&format!("- Missing prefix: {}\n", stats.missing_prefix_count));
        report.push_str(&format!("- Missing suffix: {}\n", stats.missing_suffix_count));
        report.push_str(&format!("- Missing both: {}\n", stats.missing_both_count));
        
        report.push_str("\n## Agent-Specific Compliance\n\n");
        report.push_str("| Agent | Responses | Valid | Compliance % |\n");
        report.push_str("|-------|-----------|-------|-------------|\n");
        
        let mut agents: Vec<&String> = stats.agent_stats.keys().collect();
        agents.sort();
        
        for agent_name in agents {
            if let Some(agent_stats) = stats.agent_stats.get(agent_name) {
                report.push_str(&format!("| {} | {} | {} | {:.2}% |\n",
                    agent_name,
                    agent_stats.total_responses,
                    agent_stats.valid_format_count,
                    agent_stats.compliance_percentage
                ));
            }
        }
        
        report
    }
}
```

### 5. Default Configuration

Add default configuration in the AgentCacheConfig:

```rust
impl Default for AgentCacheConfig {
    fn default() -> Self {
        Self {
            // Existing fields...
            
            // New response format fields
            response_format: ResponseFormatConfig {
                prefix_template: "[{agent_name}]:".to_string(),
                suffix_template: "-- [{agent_name}]".to_string(),
                enforce: true,
                enforcement_level: EnforcementLevel::WarnUser,
            },
        }
    }
}
```

## Implementation Plan

1. **Phase 1: Core Format Validation**
   - Add response format configuration structures
   - Implement basic validation functionality
   - Update agent activator to display complete format requirements

2. **Phase 2: Enforcement Mechanisms**
   - Implement enforcement levels
   - Add auto-correction capability
   - Create logging system for violations

3. **Phase 3: Monitoring and Reporting**
   - Add compliance statistics tracking
   - Implement report generation
   - Create dashboard for format compliance

4. **Phase 4: Integration**
   - Connect format validation to agent activation
   - Ensure all components work together
   - Add compatibility with existing systems

## Testing Strategy

1. **Unit Tests**:
   - Validate format checking logic with various inputs
   - Test auto-correction functionality
   - Verify enforcement level behavior

2. **Integration Tests**:
   - Test full agent activation process with format enforcement
   - Verify terminal title and format enforcement work together
   - Test compliance monitoring with simulated agent interactions

3. **End-to-End Tests**:
   - Activate various agents and verify protocol enforcement
   - Test with compliant and non-compliant responses
   - Verify statistics tracking accuracy

## Expected Benefits

1. **Consistency**: Ensure all agents follow the same response format standard
2. **User Experience**: Improve readability through consistent formatting
3. **Traceability**: Enhance attribution of responses in conversation history
4. **Monitoring**: Gain insights into format compliance across the system
5. **Automation**: Reduce manual enforcement through automated validation

---

Prepared by: Athena  
Date: May 20, 2025