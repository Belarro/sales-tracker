use anyhow::{anyhow, Result};
use clap::{Arg, Command};
use colored::*;
use std::path::{Path, PathBuf};
use tokio::fs as async_fs;
use walkdir::WalkDir;

#[derive(Debug)]
pub struct AgentValidator {
    base_dir: PathBuf,
    agents_dir: PathBuf,
}

#[derive(Debug)]
pub struct ValidationResult {
    pub agent_name: String,
    pub is_valid: bool,
    pub issues: Vec<String>,
    pub warnings: Vec<String>,
    pub recommendations: Vec<String>,
}

impl AgentValidator {
    pub fn new(base_dir: impl AsRef<Path>) -> Self {
        let base_dir = base_dir.as_ref().to_path_buf();
        let agents_dir = base_dir.join("AGENTS");
        
        Self {
            base_dir,
            agents_dir,
        }
    }
    
    pub async fn validate_agent(&self, agent_name: &str) -> Result<ValidationResult> {
        let agent_dir = self.agents_dir.join(agent_name);
        
        if !agent_dir.exists() {
            return Err(anyhow!("Agent directory not found: {}", agent_dir.display()));
        }
        
        let mut result = ValidationResult {
            agent_name: agent_name.to_string(),
            is_valid: true,
            issues: Vec::new(),
            warnings: Vec::new(),
            recommendations: Vec::new(),
        };
        
        // Validate directory structure
        self.validate_directory_structure(&agent_dir, &mut result).await;
        
        // Validate required files
        self.validate_required_files(&agent_dir, &mut result).await;
        
        // Validate file contents
        self.validate_file_contents(&agent_dir, &mut result).await;
        
        // Validate agent registration
        self.validate_agent_registration(agent_name, &mut result).await;
        
        // Performance and best practice checks
        self.validate_best_practices(&agent_dir, &mut result).await;
        
        result.is_valid = result.issues.is_empty();
        
        Ok(result)
    }
    
    pub async fn validate_all_agents(&self) -> Result<Vec<ValidationResult>> {
        let mut results = Vec::new();
        
        if !self.agents_dir.exists() {
            return Err(anyhow!("AGENTS directory not found: {}", self.agents_dir.display()));
        }
        
        let mut entries = async_fs::read_dir(&self.agents_dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            let file_type = entry.file_type().await?;
            if file_type.is_dir() {
                let agent_name = entry.file_name().to_string_lossy().to_string();
                
                // Skip system files and directories
                if !agent_name.starts_with('.') && 
                   !agent_name.ends_with(".md") && 
                   !agent_name.ends_with(".sh") && 
                   !agent_name.ends_with(".json") {
                    match self.validate_agent(&agent_name).await {
                        Ok(result) => results.push(result),
                        Err(e) => {
                            results.push(ValidationResult {
                                agent_name,
                                is_valid: false,
                                issues: vec![format!("Validation error: {}", e)],
                                warnings: Vec::new(),
                                recommendations: Vec::new(),
                            });
                        }
                    }
                }
            }
        }
        
        Ok(results)
    }
    
    async fn validate_directory_structure(&self, agent_dir: &Path, result: &mut ValidationResult) {
        let required_dirs = ["Sessions"];
        
        for dir_name in &required_dirs {
            let dir_path = agent_dir.join(dir_name);
            if !dir_path.exists() {
                result.issues.push(format!("Missing required directory: {}", dir_name));
            } else if !dir_path.is_dir() {
                result.issues.push(format!("{} exists but is not a directory", dir_name));
            }
        }
        
        // Check for unexpected files in root
        if let Ok(entries) = std::fs::read_dir(agent_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let name = entry.file_name().to_string_lossy().to_string();
                
                if path.is_file() && !self.is_expected_file(&name) {
                    result.warnings.push(format!("Unexpected file in agent root: {}", name));
                }
            }
        }
    }
    
    async fn validate_required_files(&self, agent_dir: &Path, result: &mut ValidationResult) {
        let required_files = [
            "README.md",
            "MEMORY.md", 
            "ContinuousLearning.md",
            "Sessions/README.md",
        ];
        
        for file_path in &required_files {
            let full_path = agent_dir.join(file_path);
            if !full_path.exists() {
                result.issues.push(format!("Missing required file: {}", file_path));
            } else if full_path.is_dir() {
                result.issues.push(format!("{} should be a file, not a directory", file_path));
            }
        }
    }
    
    async fn validate_file_contents(&self, agent_dir: &Path, result: &mut ValidationResult) {
        // Validate README.md
        if let Ok(readme_content) = async_fs::read_to_string(agent_dir.join("README.md")).await {
            self.validate_readme_content(&readme_content, result);
        }
        
        // Validate MEMORY.md
        if let Ok(memory_content) = async_fs::read_to_string(agent_dir.join("MEMORY.md")).await {
            self.validate_memory_content(&memory_content, result);
        }
        
        // Validate ContinuousLearning.md
        if let Ok(learning_content) = async_fs::read_to_string(agent_dir.join("ContinuousLearning.md")).await {
            self.validate_learning_content(&learning_content, result);
        }
    }
    
    fn validate_readme_content(&self, content: &str, result: &mut ValidationResult) {
        let required_sections = [
            "# ",           // Title
            "## Purpose",
            "## Core Identity",
            "## Primary Responsibilities", 
            "## Activation Context",
            "## Success Metrics",
        ];
        
        for section in &required_sections {
            if !content.contains(section) {
                result.issues.push(format!("README.md missing required section: {}", section.trim()));
            }
        }
        
        // Check for placeholder text
        if content.contains("[TO BE FILLED]") {
            result.warnings.push("README.md contains placeholder text that should be completed".to_string());
        }
        
        // Check for reasonable content length
        if content.len() < 500 {
            result.warnings.push("README.md appears to be very short - consider adding more detail".to_string());
        }
    }
    
    fn validate_memory_content(&self, content: &str, result: &mut ValidationResult) {
        let required_sections = [
            "# ",           // Title
            "## Long-Term Memory",
            "## Short-Term Memory",
        ];
        
        for section in &required_sections {
            if !content.contains(section) {
                result.issues.push(format!("MEMORY.md missing required section: {}", section.trim()));
            }
        }
        
        if content.contains("[TO BE FILLED]") {
            result.warnings.push("MEMORY.md contains placeholder text that should be completed".to_string());
        }
    }
    
    fn validate_learning_content(&self, content: &str, result: &mut ValidationResult) {
        let recommended_sections = [
            "# ",           // Title
            "## Domain-Specific Patterns",
            "## Best Practices",
            "## Lessons Learned",
        ];
        
        for section in &recommended_sections {
            if !content.contains(section) {
                result.recommendations.push(format!("Consider adding section to ContinuousLearning.md: {}", section.trim()));
            }
        }
    }
    
    async fn validate_agent_registration(&self, agent_name: &str, result: &mut ValidationResult) {
        let agents_md_path = self.agents_dir.join("AGENTS.md");
        
        if agents_md_path.exists() {
            if let Ok(content) = async_fs::read_to_string(&agents_md_path).await {
                if !content.contains(agent_name) {
                    result.warnings.push("Agent not found in AGENTS.md registry".to_string());
                }
            }
        } else {
            result.warnings.push("AGENTS.md registry file not found".to_string());
        }
    }
    
    async fn validate_best_practices(&self, agent_dir: &Path, result: &mut ValidationResult) {
        // Check for reasonable file sizes
        for file_name in &["README.md", "MEMORY.md", "ContinuousLearning.md"] {
            let file_path = agent_dir.join(file_name);
            if let Ok(metadata) = async_fs::metadata(&file_path).await {
                let size = metadata.len();
                if size > 100_000 { // 100KB
                    result.warnings.push(format!("{} is quite large ({}KB) - consider breaking into smaller sections", 
                                                file_name, size / 1024));
                }
                if size < 100 { // 100 bytes
                    result.warnings.push(format!("{} is very small - consider adding more content", file_name));
                }
            }
        }
        
        // Check Sessions directory usage
        let sessions_dir = agent_dir.join("Sessions");
        if sessions_dir.exists() {
            let session_count = WalkDir::new(&sessions_dir)
                .min_depth(1)
                .max_depth(1)
                .into_iter()
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().is_dir())
                .count();
                
            if session_count == 0 {
                result.recommendations.push("Consider adding session directories to track agent work".to_string());
            } else if session_count > 50 {
                result.recommendations.push("Large number of sessions - consider archiving older sessions".to_string());
            }
        }
        
        // Check for common issues
        self.check_common_issues(agent_dir, result).await;
    }
    
    async fn check_common_issues(&self, agent_dir: &Path, result: &mut ValidationResult) {
        // Check for empty directories
        let sessions_dir = agent_dir.join("Sessions");
        if sessions_dir.exists() {
            if let Ok(mut entries) = async_fs::read_dir(&sessions_dir).await {
                let mut has_entries = false;
                while let Some(_) = entries.next_entry().await.unwrap_or(None) {
                    has_entries = true;
                    break;
                }
                if !has_entries {
                    result.recommendations.push("Sessions directory is empty - add README.md or session data".to_string());
                }
            }
        }
        
        // Check for consistent naming
        let agent_name = agent_dir.file_name().unwrap().to_string_lossy();
        if let Ok(readme_content) = async_fs::read_to_string(agent_dir.join("README.md")).await {
            if !readme_content.contains(&agent_name.to_string()) {
                result.warnings.push("Agent name in directory doesn't match content in README.md".to_string());
            }
        }
    }
    
    fn is_expected_file(&self, filename: &str) -> bool {
        matches!(filename, 
            "README.md" | 
            "MEMORY.md" | 
            "ContinuousLearning.md" | 
            "creation-report.md" |
            "metadata.json" |
            ".DS_Store" // macOS system file
        )
    }
    
    pub fn print_validation_result(&self, result: &ValidationResult) {
        let status = if result.is_valid {
            "✅ VALID".green().bold()
        } else {
            "❌ INVALID".red().bold()
        };
        
        println!("{} Agent: {}", status, result.agent_name.blue().bold());
        
        if !result.issues.is_empty() {
            println!("  {} Issues:", "❌".red());
            for issue in &result.issues {
                println!("    • {}", issue.red());
            }
        }
        
        if !result.warnings.is_empty() {
            println!("  {} Warnings:", "⚠️".yellow());
            for warning in &result.warnings {
                println!("    • {}", warning.yellow());
            }
        }
        
        if !result.recommendations.is_empty() {
            println!("  {} Recommendations:", "💡".blue());
            for recommendation in &result.recommendations {
                println!("    • {}", recommendation.blue());
            }
        }
        
        println!();
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let matches = Command::new("validate-agent")
        .version("0.2.0")
        .about("Validates agent directory structure and content")
        .arg(
            Arg::new("agent")
                .help("Agent name to validate (if not provided, validates all agents)")
                .index(1),
        )
        .arg(
            Arg::new("base-dir")
                .long("base-dir")
                .help("Base directory for the CollaborativeIntelligence system")
                .default_value("/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"),
        )
        .arg(
            Arg::new("summary")
                .long("summary")
                .short('s')
                .help("Show only summary statistics")
                .action(clap::ArgAction::SetTrue),
        )
        .get_matches();

    let base_dir = matches.get_one::<String>("base-dir").unwrap();
    let show_summary = matches.get_flag("summary");
    let validator = AgentValidator::new(base_dir);
    
    if let Some(agent_name) = matches.get_one::<String>("agent") {
        // Validate single agent
        println!("{}", format!("🔍 Validating agent: {}", agent_name).blue().bold());
        let result = validator.validate_agent(agent_name).await?;
        validator.print_validation_result(&result);
        
        if !result.is_valid {
            std::process::exit(1);
        }
    } else {
        // Validate all agents
        println!("{}", "🔍 Validating all agents...".blue().bold());
        let results = validator.validate_all_agents().await?;
        
        if results.is_empty() {
            println!("{}", "No agents found to validate".yellow());
            return Ok(());
        }
        
        let mut valid_count = 0;
        let mut invalid_count = 0;
        let mut total_issues = 0;
        let mut total_warnings = 0;
        
        for result in &results {
            if !show_summary {
                validator.print_validation_result(result);
            }
            
            if result.is_valid {
                valid_count += 1;
            } else {
                invalid_count += 1;
            }
            
            total_issues += result.issues.len();
            total_warnings += result.warnings.len();
        }
        
        // Print summary
        println!("{}", "📊 Validation Summary".blue().bold());
        println!("  Total agents: {}", results.len());
        println!("  {} Valid: {}", "✅".green(), valid_count);
        println!("  {} Invalid: {}", "❌".red(), invalid_count);
        println!("  {} Total issues: {}", "🐛".red(), total_issues);
        println!("  {} Total warnings: {}", "⚠️".yellow(), total_warnings);
        
        if invalid_count > 0 {
            println!("\n{}", "❌ Some agents failed validation".red().bold());
            std::process::exit(1);
        } else {
            println!("\n{}", "✅ All agents passed validation".green().bold());
        }
    }
    
    Ok(())
}