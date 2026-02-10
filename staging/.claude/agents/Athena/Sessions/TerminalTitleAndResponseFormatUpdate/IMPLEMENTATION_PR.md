# Response Format Enforcement Implementation PR

## Changes to Implement

This implementation plan outlines the necessary code changes to fully implement agent response format enforcement in the Collaborative Intelligence system.

### 1. Update `agent_activator.rs`

```diff
// In agent_activator.rs

// Enforce agent protocol
fn enforce_agent_protocol(&self, agent_name: &str) -> Result<(), Box<dyn Error>> {
    // Simply remind about protocol - no need to execute a script
    if self.config.verbose {
        println!("Agent protocol reminder for: {}", agent_name);
-       println!("1. Begin your response with: [{}]", agent_name);
+       println!("1. Begin your response with: [{}]:", agent_name);
+       println!("2. End your response with: -- [{}]", agent_name);
-       println!("2. Maintain the agent's personality and capabilities");
-       println!("3. Respond as {} would to the user's query", agent_name);
+       println!("3. Maintain the agent's personality and capabilities");
+       println!("4. Respond as {} would to the user's query", agent_name);
    }
    
    Ok(())
}

// Update show_activation_info
pub fn show_activation_info(&self, result: &ActivationResult) {
    // ... existing code...
    
    // Protocol reminder
    if self.config.enforce_protocol {
        println!("\n{}", "Protocol Reminder:".yellow().bold());
-       println!("  1. Begin your response with: [{}]", result.agent_name.bold());
+       println!("  1. Begin your response with: [{}]:", result.agent_name.bold());
+       println!("  2. End your response with: -- [{}]", result.agent_name.bold());
-       println!("  2. Maintain the agent's personality and capabilities");
-       println!("  3. Respond as {} would to the user's query", result.agent_name.bold());
+       println!("  3. Maintain the agent's personality and capabilities");
+       println!("  4. Respond as {} would to the user's query", result.agent_name.bold());
    }
    
    // ... remaining code...
}
```

### 2. Add Format Validation Module

Create a new file `src/format_validator.rs`:

```rust
//! Format validation for agent responses
//! 
//! This module provides functionality for validating and enforcing
//! the standardized agent response format (prefix and suffix)

use serde::{Serialize, Deserialize};
use std::fmt;

/// Format validation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormatValidationResult {
    /// Valid format
    Valid,
    
    /// Missing prefix
    MissingPrefix {
        expected: String,
    },
    
    /// Missing suffix
    MissingSuffix {
        expected: String,
    },
    
    /// Missing both prefix and suffix
    MissingBoth {
        prefix: String,
        suffix: String,
    },
}

impl fmt::Display for FormatValidationResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Valid => write!(f, "Format is valid"),
            Self::MissingPrefix { expected } => {
                write!(f, "Missing prefix: expected '{}'", expected)
            },
            Self::MissingSuffix { expected } => {
                write!(f, "Missing suffix: expected '{}'", expected)
            },
            Self::MissingBoth { prefix, suffix } => {
                write!(f, "Missing both prefix '{}' and suffix '{}'", prefix, suffix)
            },
        }
    }
}

/// Response format configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormatConfig {
    /// Prefix format template
    pub prefix_template: String,
    
    /// Suffix format template
    pub suffix_template: String,
    
    /// Whether to enforce the format
    pub enforce: bool,
    
    /// How to handle non-compliant responses
    pub enforcement_level: EnforcementLevel,
}

/// Format enforcement level
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EnforcementLevel {
    /// Only log violations
    LogOnly,
    
    /// Warn the user but don't modify
    WarnUser,
    
    /// Automatically correct
    AutoCorrect,
    
    /// Reject non-compliant responses
    Reject,
}

impl Default for FormatConfig {
    fn default() -> Self {
        Self {
            prefix_template: "[{agent_name}]:".to_string(),
            suffix_template: "-- [{agent_name}]".to_string(),
            enforce: true,
            enforcement_level: EnforcementLevel::WarnUser,
        }
    }
}

/// Response format validator
pub struct FormatValidator {
    config: FormatConfig,
}

impl FormatValidator {
    /// Create a new validator with default config
    pub fn new() -> Self {
        Self {
            config: FormatConfig::default(),
        }
    }
    
    /// Create with custom config
    pub fn with_config(config: FormatConfig) -> Self {
        Self { config }
    }
    
    /// Validate a response format
    pub fn validate(&self, agent_name: &str, response: &str) -> FormatValidationResult {
        let expected_prefix = self.config.prefix_template
            .replace("{agent_name}", agent_name);
        let expected_suffix = self.config.suffix_template
            .replace("{agent_name}", agent_name);
        
        let has_prefix = response.trim_start()
            .starts_with(&expected_prefix);
        let has_suffix = response.trim_end()
            .ends_with(&expected_suffix);
        
        match (has_prefix, has_suffix) {
            (true, true) => FormatValidationResult::Valid,
            (false, true) => FormatValidationResult::MissingPrefix { 
                expected: expected_prefix 
            },
            (true, false) => FormatValidationResult::MissingSuffix { 
                expected: expected_suffix 
            },
            (false, false) => FormatValidationResult::MissingBoth { 
                prefix: expected_prefix, 
                suffix: expected_suffix,
            },
        }
    }
    
    /// Auto-correct a response
    pub fn auto_correct(&self, agent_name: &str, response: &str) -> String {
        let expected_prefix = self.config.prefix_template
            .replace("{agent_name}", agent_name);
        let expected_suffix = self.config.suffix_template
            .replace("{agent_name}", agent_name);
        
        let has_prefix = response.trim_start()
            .starts_with(&expected_prefix);
        let has_suffix = response.trim_end()
            .ends_with(&expected_suffix);
        
        let trimmed = response.trim();
        
        match (has_prefix, has_suffix) {
            (true, true) => response.to_string(),
            (false, true) => format!("{} {}", expected_prefix, trimmed),
            (true, false) => format!("{} {}", trimmed, expected_suffix),
            (false, false) => format!("{} {} {}", expected_prefix, trimmed, expected_suffix),
        }
    }
    
    /// Process a response based on enforcement level
    pub fn process(&self, agent_name: &str, response: &str) -> String {
        if !self.config.enforce {
            return response.to_string();
        }
        
        let validation = self.validate(agent_name, response);
        
        match validation {
            FormatValidationResult::Valid => response.to_string(),
            _ => match self.config.enforcement_level {
                EnforcementLevel::LogOnly => {
                    // Just log without modifying
                    // Logging logic would be added here in real implementation
                    response.to_string()
                },
                EnforcementLevel::WarnUser => {
                    // Add warning message
                    format!("{}\n\n[WARNING: Response format non-compliant: {}]", 
                        response, validation)
                },
                EnforcementLevel::AutoCorrect => {
                    // Auto-correct the format
                    self.auto_correct(agent_name, response)
                },
                EnforcementLevel::Reject => {
                    // Return error message
                    format!("[ERROR: Response format rejected: {}]", validation)
                },
            }
        }
    }
}

// Add unit tests
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_validate_valid_format() {
        let validator = FormatValidator::new();
        let response = "[TEST]: This is a test -- [TEST]";
        let result = validator.validate("TEST", response);
        assert!(matches!(result, FormatValidationResult::Valid));
    }
    
    #[test]
    fn test_validate_missing_prefix() {
        let validator = FormatValidator::new();
        let response = "This is a test -- [TEST]";
        let result = validator.validate("TEST", response);
        assert!(matches!(result, FormatValidationResult::MissingPrefix { .. }));
    }
    
    #[test]
    fn test_validate_missing_suffix() {
        let validator = FormatValidator::new();
        let response = "[TEST]: This is a test";
        let result = validator.validate("TEST", response);
        assert!(matches!(result, FormatValidationResult::MissingSuffix { .. }));
    }
    
    #[test]
    fn test_validate_missing_both() {
        let validator = FormatValidator::new();
        let response = "This is a test";
        let result = validator.validate("TEST", response);
        assert!(matches!(result, FormatValidationResult::MissingBoth { .. }));
    }
    
    #[test]
    fn test_auto_correct() {
        let validator = FormatValidator::new();
        let response = "This is a test";
        let corrected = validator.auto_correct("TEST", response);
        assert_eq!(corrected, "[TEST]: This is a test -- [TEST]");
    }
}
```

### 3. Update `AgentCacheConfig` Structure

In `src/agent_cache.rs` or appropriate file:

```diff
/// Configuration for Agent Cache
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCacheConfig {
    // Existing fields
    pub cache_dir: PathBuf,
    pub persistence_interval: Duration,
    // ...
+   
+   /// Response format configuration
+   pub response_format: FormatConfig,
}

impl Default for AgentCacheConfig {
    fn default() -> Self {
        Self {
            // Existing defaults
            // ...
+           
+           // Add format configuration
+           response_format: FormatConfig::default(),
        }
    }
}
```

### 4. Extend `AgentCacheManager` Implementation

```diff
impl AgentCacheManager {
    // Existing methods
    // ...
    
+   /// Validate response format
+   pub fn validate_response_format(&self, agent_name: &str, response: &str) -> FormatValidationResult {
+       let validator = FormatValidator::with_config(self.config.response_format.clone());
+       validator.validate(agent_name, response)
+   }
+   
+   /// Process response with format rules
+   pub fn process_response(&self, agent_name: &str, response: &str) -> String {
+       let validator = FormatValidator::with_config(self.config.response_format.clone());
+       validator.process(agent_name, response)
+   }
}
```

### 5. Add Format Compliance Tracking

```rust
/// Response format compliance statistics
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct FormatComplianceStats {
    /// Total responses processed
    pub total_responses: usize,
    
    /// Valid format count
    pub valid_count: usize,
    
    /// Missing prefix count
    pub missing_prefix_count: usize,
    
    /// Missing suffix count
    pub missing_suffix_count: usize,
    
    /// Missing both count
    pub missing_both_count: usize,
    
    /// Stats per agent
    pub agent_stats: HashMap<String, AgentFormatStats>,
}

/// Format stats for a specific agent
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct AgentFormatStats {
    pub total_responses: usize,
    pub valid_count: usize,
    pub compliance_percentage: f64,
}

impl AgentCacheManager {
    // ... other methods
    
    /// Update format compliance statistics
    pub fn update_compliance_stats(&mut self, agent_name: &str, validation: &FormatValidationResult) {
        let stats = &mut self.format_compliance_stats;
        stats.total_responses += 1;
        
        // Update based on validation result
        match validation {
            FormatValidationResult::Valid => {
                stats.valid_count += 1;
            }
            FormatValidationResult::MissingPrefix { .. } => {
                stats.missing_prefix_count += 1;
            }
            FormatValidationResult::MissingSuffix { .. } => {
                stats.missing_suffix_count += 1;
            }
            FormatValidationResult::MissingBoth { .. } => {
                stats.missing_both_count += 1;
            }
        }
        
        // Update agent-specific stats
        let agent_stats = stats.agent_stats
            .entry(agent_name.to_string())
            .or_insert_with(AgentFormatStats::default);
        
        agent_stats.total_responses += 1;
        if matches!(validation, FormatValidationResult::Valid) {
            agent_stats.valid_count += 1;
        }
        
        if agent_stats.total_responses > 0 {
            agent_stats.compliance_percentage = 
                (agent_stats.valid_count as f64 / agent_stats.total_responses as f64) * 100.0;
        }
    }
    
    /// Generate compliance report
    pub fn generate_compliance_report(&self) -> String {
        let stats = &self.format_compliance_stats;
        let total = stats.total_responses;
        
        if total == 0 {
            return "No responses have been processed yet.".to_string();
        }
        
        let compliance_percentage = 
            (stats.valid_count as f64 / total as f64) * 100.0;
        
        let mut report = String::new();
        
        report.push_str("# Response Format Compliance Report\n\n");
        report.push_str(&format!("## Overall Compliance: {:.1}%\n\n", compliance_percentage));
        report.push_str(&format!("- Total responses: {}\n", total));
        report.push_str(&format!("- Valid format: {}\n", stats.valid_count));
        report.push_str(&format!("- Missing prefix: {}\n", stats.missing_prefix_count));
        report.push_str(&format!("- Missing suffix: {}\n", stats.missing_suffix_count));
        report.push_str(&format!("- Missing both: {}\n", stats.missing_both_count));
        
        if !stats.agent_stats.is_empty() {
            report.push_str("\n## Agent-Specific Compliance\n\n");
            report.push_str("| Agent | Responses | Valid | Compliance % |\n");
            report.push_str("|-------|-----------|-------|-------------|\n");
            
            // Sort agents by name
            let mut agents: Vec<&String> = stats.agent_stats.keys().collect();
            agents.sort();
            
            for agent_name in agents {
                if let Some(agent_stats) = stats.agent_stats.get(agent_name) {
                    report.push_str(&format!("| {} | {} | {} | {:.1}% |\n",
                        agent_name,
                        agent_stats.total_responses,
                        agent_stats.valid_count,
                        agent_stats.compliance_percentage
                    ));
                }
            }
        }
        
        report
    }
}
```

### 6. Add CLI Command for Compliance Reporting

```diff
// In main CLI file or appropriate command handler

// Add subcommand for format validation
let matches = App::new("collaborative-intelligence")
    // ... existing commands
+   .subcommand(SubCommand::with_name("format-compliance")
+       .about("Display response format compliance report")
+       .arg(Arg::with_name("agent")
+           .long("agent")
+           .value_name("NAME")
+           .help("Show compliance for specific agent")
+           .takes_value(true))
+   )
    // ... rest of commands

// Process subcommands
match matches.subcommand() {
    // ... existing commands
+   ("format-compliance", Some(sub_m)) => {
+       let agent_filter = sub_m.value_of("agent");
+       let cache_manager = AgentCacheManager::new()?;
+       
+       let report = if let Some(agent_name) = agent_filter {
+           cache_manager.generate_agent_compliance_report(agent_name)?
+       } else {
+           cache_manager.generate_compliance_report()?
+       };
+       
+       println!("{}", report);
+   },
    // ... rest of command handlers
}
```

## Testing Plan

1. Update unit tests to verify format validation functionality
2. Add tests for auto-correction logic
3. Add tests for compliance reporting
4. Verify that format enforcement respects configuration settings
5. Test with various response formats to ensure correct detection

## Documentation

Update documentation to explain:

1. The new format validation system
2. Configuration options for format enforcement
3. How to view format compliance reports
4. How to auto-correct formatting issues
5. Integration with the agent response processing pipeline

## Implementation Timeline

- **Day 1**: Implement core format validation functionality
- **Day 2**: Integrate with agent cache system and add enforcement levels
- **Day 3**: Add compliance tracking and reporting
- **Day 4**: Test all functionality and update documentation
- **Day 5**: Release and monitor for issues

## Impact Assessment

This implementation will:

1. Ensure consistent response formatting across all agents
2. Improve user experience with clear visual boundaries
3. Enable monitoring of format compliance
4. Allow for automated correction of formatting issues
5. Provide insights into agent behavior through compliance reporting

---

Prepared by: Athena
Date: May 20, 2025