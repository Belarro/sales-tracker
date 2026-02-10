use anyhow::{anyhow, Result};
use chrono::Utc;
use clap::{Arg, Command};
use colored::*;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tokio::fs as async_fs;

mod create_agent;
use create_agent::{AgentConfig, AgentCreator};

#[derive(Debug, Deserialize, Serialize)]
struct BatchConfig {
    agents: Vec<AgentBatchEntry>,
    #[serde(default = "default_max_concurrent")]
    max_concurrent: usize,
    #[serde(default)]
    registry_update: bool,
}

#[derive(Debug, Deserialize, Serialize)]
struct AgentBatchEntry {
    name: String,
    role: String,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    expertise: Option<Vec<String>>,
    #[serde(default)]
    focus: Option<String>,
    #[serde(default)]
    perspective: Option<String>,
}

#[derive(Debug)]
struct BatchResults {
    successful: Vec<String>,
    failed: Vec<(String, String)>,
    total_time: std::time::Duration,
}

fn default_max_concurrent() -> usize {
    num_cpus::get().min(8) // Limit to 8 concurrent operations
}

impl From<AgentBatchEntry> for AgentConfig {
    fn from(entry: AgentBatchEntry) -> Self {
        let description = entry.description.unwrap_or_else(|| entry.role.clone());
        let expertise = entry.expertise.unwrap_or_else(|| vec![entry.role.clone()]);
        let focus = entry.focus.unwrap_or_else(|| {
            format!("Specialized {} operations", entry.role.to_lowercase())
        });
        let perspective = entry.perspective.unwrap_or_else(|| {
            format!("How can we excel in {}?", entry.role.to_lowercase())
        });

        AgentConfig {
            name: entry.name,
            role: entry.role,
            description,
            expertise,
            focus,
            perspective,
        }
    }
}

#[derive(Debug)]
pub struct BatchAgentCreator {
    creator: AgentCreator,
    base_dir: PathBuf,
    max_concurrent: usize,
}

impl BatchAgentCreator {
    pub fn new(base_dir: impl AsRef<Path>, max_concurrent: usize) -> Result<Self> {
        let base_dir = base_dir.as_ref().to_path_buf();
        let creator = AgentCreator::new(&base_dir)?;
        
        Ok(Self {
            creator,
            base_dir,
            max_concurrent,
        })
    }

    pub async fn create_batch_from_config(&self, config_path: impl AsRef<Path>) -> Result<BatchResults> {
        let config_content = async_fs::read_to_string(config_path).await?;
        let mut batch_config: BatchConfig = serde_json::from_str(&config_content)?;
        
        // Use configured max_concurrent or default
        if batch_config.max_concurrent == 0 {
            batch_config.max_concurrent = self.max_concurrent;
        }
        
        self.create_batch_agents(batch_config).await
    }

    pub async fn create_batch_agents(&self, config: BatchConfig) -> Result<BatchResults> {
        let start_time = std::time::Instant::now();
        
        println!("{}", "🚀 Batch Agent Creation (Rust Optimized)".blue().bold());
        println!("{}", format!("📊 Creating {} agents with {} max concurrent operations", 
                 config.agents.len(), config.max_concurrent).blue());
        
        // Pre-validate entire batch
        self.validate_batch_config(&config).await?;
        
        // Convert to AgentConfig objects
        let agent_configs: Vec<AgentConfig> = config.agents
            .into_iter()
            .map(AgentConfig::from)
            .collect();
        
        // Create agents in controlled parallel batches
        let results = self.create_agents_parallel(&agent_configs, config.max_concurrent).await;
        
        // Update registry if requested
        if config.registry_update {
            self.update_registry_batch(&results.successful).await?;
        }
        
        let total_time = start_time.elapsed();
        
        self.print_batch_summary(&results, total_time);
        
        Ok(BatchResults {
            successful: results.successful,
            failed: results.failed,
            total_time,
        })
    }
    
    async fn validate_batch_config(&self, config: &BatchConfig) -> Result<()> {
        println!("{}", "🔍 Validating batch configuration...".yellow());
        
        // Check for duplicate names
        let mut names = std::collections::HashSet::new();
        for agent in &config.agents {
            if !names.insert(&agent.name) {
                return Err(anyhow!("Duplicate agent name: {}", agent.name));
            }
        }
        
        // Check for existing agents in parallel
        let existing_check: Result<Vec<_>> = config.agents
            .par_iter()
            .map(|agent| {
                let agent_dir = self.base_dir.join("AGENTS").join(&agent.name);
                if agent_dir.exists() {
                    Err(anyhow!("Agent already exists: {}", agent.name))
                } else {
                    Ok(())
                }
            })
            .collect();
        
        existing_check?;
        
        println!("{}", "✓ Batch configuration validated".green());
        Ok(())
    }
    
    async fn create_agents_parallel(
        &self,
        agent_configs: &[AgentConfig],
        max_concurrent: usize,
    ) -> BatchCreationResults {
        let successful = Arc::new(std::sync::Mutex::new(Vec::new()));
        let failed = Arc::new(std::sync::Mutex::new(Vec::new()));
        let completed_count = Arc::new(AtomicUsize::new(0));
        let total_count = agent_configs.len();
        
        // Process in chunks to control concurrency
        for chunk in agent_configs.chunks(max_concurrent) {
            let chunk_tasks: Vec<_> = chunk
                .iter()
                .map(|config| {
                    let creator = &self.creator;
                    let successful = Arc::clone(&successful);
                    let failed = Arc::clone(&failed);
                    let completed_count = Arc::clone(&completed_count);
                    
                    async move {
                        match creator.create_agent(config).await {
                            Ok(_) => {
                                successful.lock().unwrap().push(config.name.clone());
                                let count = completed_count.fetch_add(1, Ordering::SeqCst) + 1;
                                println!("{}", 
                                    format!("✅ [{}/{}] Successfully created: {}", 
                                            count, total_count, config.name).green());
                            }
                            Err(e) => {
                                failed.lock().unwrap().push((config.name.clone(), e.to_string()));
                                let count = completed_count.fetch_add(1, Ordering::SeqCst) + 1;
                                println!("{}", 
                                    format!("❌ [{}/{}] Failed to create {}: {}", 
                                            count, total_count, config.name, e).red());
                            }
                        }
                    }
                })
                .collect();
            
            // Wait for current chunk to complete before starting next
            futures::future::join_all(chunk_tasks).await;
        }
        
        let successful = Arc::try_unwrap(successful).unwrap().into_inner().unwrap();
        let failed = Arc::try_unwrap(failed).unwrap().into_inner().unwrap();
        
        BatchCreationResults { successful, failed }
    }
    
    async fn update_registry_batch(&self, successful_agents: &[String]) -> Result<()> {
        if successful_agents.is_empty() {
            return Ok(());
        }
        
        println!("{}", "📝 Updating agent registry...".blue());
        
        // Read current AGENTS.md
        let agents_md_path = self.base_dir.join("AGENTS").join("AGENTS.md");
        let current_content = if agents_md_path.exists() {
            async_fs::read_to_string(&agents_md_path).await?
        } else {
            String::new()
        };
        
        // Update agent count
        let current_count = self.count_existing_agents().await?;
        let new_count = current_count + successful_agents.len();
        
        // Update content with new count and agents
        let updated_content = self.update_agents_md_content(
            &current_content,
            successful_agents,
            new_count,
        )?;
        
        // Write updated content atomically
        let temp_path = agents_md_path.with_extension("tmp");
        async_fs::write(&temp_path, updated_content).await?;
        async_fs::rename(&temp_path, &agents_md_path).await?;
        
        println!("{}", format!("✓ Registry updated with {} new agents", successful_agents.len()).green());
        Ok(())
    }
    
    async fn count_existing_agents(&self) -> Result<usize> {
        let agents_dir = self.base_dir.join("AGENTS");
        let mut count = 0;
        
        if agents_dir.exists() {
            let mut entries = async_fs::read_dir(&agents_dir).await?;
            while let Some(entry) = entries.next_entry().await? {
                let file_type = entry.file_type().await?;
                if file_type.is_dir() {
                    let name = entry.file_name();
                    let name_str = name.to_string_lossy();
                    // Skip files and special directories
                    if !name_str.ends_with(".md") && 
                       !name_str.ends_with(".sh") && 
                       !name_str.ends_with(".json") {
                        count += 1;
                    }
                }
            }
        }
        
        Ok(count)
    }
    
    fn update_agents_md_content(
        &self,
        current_content: &str,
        new_agents: &[String],
        new_count: usize,
    ) -> Result<String> {
        let mut lines: Vec<String> = current_content.lines().map(String::from).collect();
        
        // Update or add count header
        let count_line = format!("# Collaborative Intelligence Agents ({})", new_count);
        if lines.is_empty() {
            lines.push(count_line);
            lines.push(String::new());
        } else {
            // Update first line if it's a count header
            if lines[0].starts_with("# Collaborative Intelligence Agents") {
                lines[0] = count_line;
            } else {
                lines.insert(0, String::new());
                lines.insert(0, count_line);
            }
        }
        
        // Add new agents to the list
        for agent_name in new_agents {
            let agent_entry = format!("- **{}**: [Description to be added]", agent_name);
            lines.push(agent_entry);
        }
        
        lines.push(String::new());
        lines.push(format!("---"));
        lines.push(format!("Last updated: {}", Utc::now().format("%Y-%m-%d %H:%M:%S UTC")));
        
        Ok(lines.join("\n"))
    }
    
    fn print_batch_summary(&self, results: &BatchCreationResults, total_time: std::time::Duration) {
        println!("\n{}", "📊 Batch Creation Summary".blue().bold());
        println!("{}", format!("⏱️  Total Time: {:.2}s", total_time.as_secs_f64()).blue());
        println!("{}", format!("✅ Successful: {}", results.successful.len()).green());
        println!("{}", format!("❌ Failed: {}", results.failed.len()).red());
        
        if !results.failed.is_empty() {
            println!("\n{}", "Failed Agents:".red().bold());
            for (name, error) in &results.failed {
                println!("  - {}: {}", name.red(), error);
            }
        }
        
        let agents_per_second = results.successful.len() as f64 / total_time.as_secs_f64();
        println!("\n{}", format!("🚀 Performance: {:.1} agents/second", agents_per_second).yellow());
        
        let estimated_bash_time = results.successful.len() as f64 * 18.0 * 60.0; // 18 minutes per agent
        let time_saved = estimated_bash_time - total_time.as_secs_f64();
        let efficiency_gain = (time_saved / estimated_bash_time) * 100.0;
        
        println!("{}", format!("⚡ Efficiency Gain: {:.1}% faster than bash", efficiency_gain).green());
    }
}

#[derive(Debug)]
struct BatchCreationResults {
    successful: Vec<String>,
    failed: Vec<(String, String)>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let matches = Command::new("batch-create-agents")
        .version("0.2.0")
        .about("Creates multiple agents in parallel from configuration file")
        .arg(
            Arg::new("config")
                .help("JSON configuration file path")
                .required(true)
                .index(1),
        )
        .arg(
            Arg::new("max-concurrent")
                .long("max-concurrent")
                .short('c')
                .help("Maximum concurrent operations")
                .value_parser(clap::value_parser!(usize))
                .default_value("4"),
        )
        .arg(
            Arg::new("base-dir")
                .long("base-dir")
                .help("Base directory for the CollaborativeIntelligence system")
                .default_value("/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"),
        )
        .arg(
            Arg::new("no-registry-update")
                .long("no-registry-update")
                .help("Skip updating the agent registry")
                .action(clap::ArgAction::SetTrue),
        )
        .get_matches();

    let config_path = matches.get_one::<String>("config").unwrap();
    let max_concurrent = *matches.get_one::<usize>("max-concurrent").unwrap();
    let base_dir = matches.get_one::<String>("base-dir").unwrap();
    let update_registry = !matches.get_flag("no-registry-update");
    
    // Verify config file exists
    if !Path::new(config_path).exists() {
        return Err(anyhow!("Configuration file not found: {}", config_path));
    }
    
    let batch_creator = BatchAgentCreator::new(base_dir, max_concurrent)?;
    
    // Load and modify config for registry update preference
    let config_content = fs::read_to_string(config_path)?;
    let mut batch_config: BatchConfig = serde_json::from_str(&config_content)?;
    batch_config.registry_update = update_registry;
    
    let results = batch_creator.create_batch_agents(batch_config).await?;
    
    // Exit with error code if any agents failed
    if !results.failed.is_empty() {
        std::process::exit(1);
    }
    
    Ok(())
}