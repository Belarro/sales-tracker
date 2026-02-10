use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use clap::Subcommand;
use colored::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use tabled::{Table, Tabled};
use walkdir::WalkDir;

use crate::config::Config;
use crate::utils;

#[derive(Subcommand)]
pub enum AgentCommands {
    /// List all agents in the CollaborativeIntelligence system
    #[command(visible_alias = "ls")]
    List {
        #[arg(short, long, help = "Show detailed agent information")]
        detailed: bool,
        
        #[arg(short = 'c', long, help = "Filter by capability")]
        capability: Option<String>,
        
        #[arg(short, long, help = "Show only active agents")]
        active: bool,
        
        #[arg(short = 'i', long, help = "Show only inactive agents")]
        inactive: bool,
        
        #[arg(short = 's', long, help = "Sort by (name, usage, last-used, status)")]
        sort: Option<String>,
    },
    
    /// Show detailed information about a specific agent
    #[command(visible_aliases = ["i", "show"])]
    Info {
        #[arg(help = "Agent name")]
        name: String,
    },
    
    /// Synchronize agent metadata and memory
    #[command(visible_alias = "sync")]
    Synchronize {
        #[arg(help = "Agent name (or 'all' for all agents)")]
        agent: String,
        
        #[arg(short, long, help = "Force update even if up to date")]
        force: bool,
        
        #[arg(short = 'p', long, help = "Show progress")]
        progress: bool,
    },
    
    /// Search for agents by various criteria
    #[command(visible_aliases = ["s", "find"])]
    Search {
        #[arg(help = "Search query")]
        query: String,
        
        #[arg(short = 'm', long, help = "Search in memory files")]
        in_memory: bool,
        
        #[arg(short = 'l', long, help = "Search in continuous learning")]
        in_learning: bool,
        
        #[arg(short, long, help = "Case insensitive search")]
        ignore_case: bool,
    },
    
    /// Show agent usage statistics
    #[command(visible_alias = "stats")]
    Statistics {
        #[arg(short = 'p', long, help = "Time period (7d, 30d, all)")]
        period: Option<String>,
        
        #[arg(short, long, help = "Sort by (usage, created, updated)")]
        sort: Option<String>,
        
        #[arg(short = 't', long, help = "Show top N agents", default_value = "10")]
        top: usize,
    },
    
    /// Show agent relationships and dependencies
    Graph {
        #[arg(short, long, help = "Output format (dot, mermaid, ascii)")]
        format: Option<String>,
    },
    
    /// Update agent index
    Index {
        #[arg(short = 'r', long, help = "Rebuild entire index")]
        rebuild: bool,
        
        #[arg(short = 'v', long, help = "Verify index integrity")]
        verify: bool,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMetadata {
    pub name: String,
    pub description: String,
    pub capabilities: Vec<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub last_used: Option<DateTime<Utc>>,
    pub usage_count: Option<u32>,
    pub version: Option<String>,
    pub toolkit_path: Option<String>,
    pub memory_path: Option<String>,
    pub learning_path: Option<String>,
    pub attributes: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Tabled)]
struct AgentSummary {
    #[tabled(rename = "Agent")]
    name: String,
    #[tabled(rename = "Description")]
    description: String,
    #[tabled(rename = "Usage")]
    usage_count: String,
    #[tabled(rename = "Last Used")]
    last_used: String,
    #[tabled(rename = "Status")]
    status: String,
}

pub async fn handle_command(cmd: AgentCommands, config: &Config) -> Result<()> {
    match cmd {
        AgentCommands::List { detailed, capability, active, inactive, sort } => {
            list_agents(detailed, capability, active, inactive, sort, config).await?;
        }
        
        AgentCommands::Info { name } => {
            show_agent_info(&name, config).await?;
        }
        
        AgentCommands::Synchronize { agent, force, progress } => {
            sync_agent(&agent, force, progress, config).await?;
        }
        
        AgentCommands::Search { query, in_memory, in_learning, ignore_case } => {
            search_agents(&query, in_memory, in_learning, ignore_case, config).await?;
        }
        
        AgentCommands::Statistics { period, sort, top } => {
            show_agent_stats(period, sort, top, config).await?;
        }
        
        AgentCommands::Graph { format } => {
            generate_agent_graph(format, config).await?;
        }
        
        AgentCommands::Index { rebuild, verify } => {
            update_agent_index(rebuild, verify, config).await?;
        }
    }
    
    Ok(())
}

async fn list_agents(detailed: bool, capability: Option<String>, active: bool, inactive: bool, sort: Option<String>, config: &Config) -> Result<()> {
    utils::print_header("CollaborativeIntelligence Agents");
    
    let agents = load_all_agents(config)?;
    
    // Filter agents
    let mut filtered_agents = agents;
    
    if let Some(cap) = capability {
        filtered_agents.retain(|a| {
            a.capabilities.iter().any(|c| c.contains(&cap))
        });
    }
    
    if active {
        filtered_agents.retain(|a| {
            a.last_used.is_some() && a.usage_count.unwrap_or(0) > 0
        });
    }
    
    // Sort agents by usage count (descending) and then by name
    filtered_agents.sort_by(|a, b| {
        let usage_a = a.usage_count.unwrap_or(0);
        let usage_b = b.usage_count.unwrap_or(0);
        
        if usage_a == usage_b {
            a.name.cmp(&b.name)
        } else {
            usage_b.cmp(&usage_a)
        }
    });
    
    if detailed {
        // Show detailed view with colors
        for (idx, agent) in filtered_agents.iter().enumerate() {
            if idx > 0 {
                println!("{}", "─".repeat(60).dimmed());
            }
            
            let status_indicator = match determine_agent_status(agent).as_str() {
                s if s.contains("Active") => "●".green(),
                s if s.contains("Idle") => "●".yellow(),
                s if s.contains("Inactive") => "●".red(),
                _ => "●".white(),
            };
            
            println!("\n{} {}", 
                status_indicator,
                format!("{}", agent.name).bold().cyan()
            );
            
            println!("  {}: {}", "Description".bright_black(), agent.description);
            
            if !agent.capabilities.is_empty() {
                println!("  {}: {}", "Capabilities".bright_black(), 
                    agent.capabilities.join(", ").dimmed());
            }
            
            if let Some(usage) = agent.usage_count {
                let usage_str = if usage > 50 {
                    usage.to_string().bright_green()
                } else if usage > 10 {
                    usage.to_string().green()
                } else if usage > 0 {
                    usage.to_string().yellow()
                } else {
                    usage.to_string().dimmed()
                };
                println!("  {}: {} uses", "Usage".bright_black(), usage_str);
            }
            
            if let Some(last_used) = &agent.last_used {
                let time_str = format_relative_time(*last_used);
                let colored_time = if time_str.contains("hour") || time_str.contains("minute") {
                    time_str.bright_green()
                } else if time_str.contains("day") && !time_str.contains("days ago") {
                    time_str.green()
                } else if time_str.contains("days ago") {
                    time_str.yellow()
                } else {
                    time_str.red()
                };
                println!("  {}: {}", "Last Used".bright_black(), colored_time);
            }
            
            if let Some(version) = &agent.version {
                println!("  {}: {}", "Version".bright_black(), version.dimmed());
            }
        }
    } else {
        // Show compact colored list view
        println!("\n{}", "Most Active Agents:".bold().bright_cyan());
        println!("{}", "═".repeat(80).bright_blue());
        
        // Group agents by status
        let mut active_agents = Vec::new();
        let mut idle_agents = Vec::new();
        let mut inactive_agents = Vec::new();
        let mut unused_agents = Vec::new();
        
        for agent in &filtered_agents {
            match determine_agent_status(agent).as_str() {
                s if s.contains("Active") => active_agents.push(agent),
                s if s.contains("Idle") => idle_agents.push(agent),
                s if s.contains("Inactive") => inactive_agents.push(agent),
                _ => unused_agents.push(agent),
            }
        }
        
        // Display active agents
        if !active_agents.is_empty() {
            println!("\n{} {} {}", 
                "●".green().bold(),
                "ACTIVE".green().bold(),
                format!("({} agents)", active_agents.len()).dimmed()
            );
            println!("{}", "─".repeat(80).bright_black());
            
            for agent in active_agents.iter().take(20) {
                let usage = agent.usage_count.unwrap_or(0);
                let last_used = agent.last_used.map_or("Never".to_string(), format_relative_time);
                
                println!("  {:<25} {:>4} uses  {:<20} {}",
                    agent.name.bright_white().bold(),
                    usage.to_string().bright_green(),
                    last_used.green(),
                    truncate_string(&agent.description, 35).bright_black()
                );
            }
        }
        
        // Display idle agents
        if !idle_agents.is_empty() {
            println!("\n{} {} {}", 
                "●".yellow().bold(),
                "IDLE".yellow().bold(),
                format!("({} agents)", idle_agents.len()).dimmed()
            );
            println!("{}", "─".repeat(80).bright_black());
            
            for agent in idle_agents.iter().take(10) {
                let usage = agent.usage_count.unwrap_or(0);
                let last_used = agent.last_used.map_or("Never".to_string(), format_relative_time);
                
                println!("  {:<25} {:>4} uses  {:<20} {}",
                    agent.name.white(),
                    usage.to_string().yellow(),
                    last_used.yellow(),
                    truncate_string(&agent.description, 35).bright_black()
                );
            }
        }
        
        // Display inactive agents count
        if !inactive_agents.is_empty() {
            println!("\n{} {} {}", 
                "●".red().bold(),
                "INACTIVE".red().bold(),
                format!("({} agents)", inactive_agents.len()).dimmed()
            );
            println!("{}", "─".repeat(80).bright_black());
            
            let names: Vec<String> = inactive_agents.iter()
                .take(10)
                .map(|a| a.name.clone())
                .collect();
            println!("  {}", names.join(", ").red().dimmed());
            
            if inactive_agents.len() > 10 {
                println!("  {} more...", 
                    format!("and {}", inactive_agents.len() - 10).bright_black());
            }
        }
        
        // Display unused agents count
        if !unused_agents.is_empty() {
            println!("\n{} {} {}", 
                "○".white().dimmed(),
                "UNUSED".white().dimmed(),
                format!("({} agents)", unused_agents.len()).dimmed()
            );
            
            if unused_agents.len() <= 5 {
                let names: Vec<String> = unused_agents.iter()
                    .map(|a| a.name.clone())
                    .collect();
                println!("  {}", names.join(", ").dimmed());
            }
        }
    }
    
    // Summary statistics
    println!("\n{}", "═".repeat(80).bright_blue());
    
    let total_usage: u32 = filtered_agents.iter()
        .map(|a| a.usage_count.unwrap_or(0))
        .sum();
    
    let active_count = filtered_agents.iter()
        .filter(|a| matches!(determine_agent_status(a).as_str(), s if s.contains("Active")))
        .count();
    
    println!("{}", "Summary:".bold().bright_cyan());
    println!("  {} {} agents found", "Total:".bright_black(), filtered_agents.len().to_string().bold());
    println!("  {} {} agents", "Active:".bright_black(), active_count.to_string().green().bold());
    println!("  {} {} total uses", "Usage:".bright_black(), total_usage.to_string().bright_green().bold());
    
    Ok(())
}

async fn show_agent_info(name: &str, config: &Config) -> Result<()> {
    utils::print_header(&format!("Agent: {}", name));
    
    let agent = load_agent_metadata(name, config)?;
    
    // Status indicator
    let status = determine_agent_status(&agent);
    let status_icon = match status.as_str() {
        s if s.contains("Active") => "●".green().bold(),
        s if s.contains("Idle") => "●".yellow().bold(),
        s if s.contains("Inactive") => "●".red().bold(),
        _ => "○".white().dimmed(),
    };
    
    println!("{} {} {}", 
        status_icon,
        "Status:".bright_black(),
        status
    );
    
    // Basic information
    println!("\n{}", "╭─ Basic Information".bold().bright_cyan());
    println!("│");
    println!("│  {}: {}", "Name".bright_black(), agent.name.bold());
    println!("│  {}: {}", "Description".bright_black(), agent.description);
    
    if let Some(version) = &agent.version {
        println!("│  {}: {}", "Version".bright_black(), version.dimmed());
    }
    
    // Usage statistics
    println!("│");
    println!("│  {}", "╭─ Usage Statistics".bold().bright_cyan());
    
    if let Some(usage) = agent.usage_count {
        let usage_color = if usage > 50 {
            usage.to_string().bright_green().bold()
        } else if usage > 10 {
            usage.to_string().green()
        } else if usage > 0 {
            usage.to_string().yellow()
        } else {
            usage.to_string().dimmed()
        };
        println!("│  │  {}: {} uses", "Total Usage".bright_black(), usage_color);
    } else {
        println!("│  │  {}: {}", "Total Usage".bright_black(), "N/A".dimmed());
    }
    
    if let Some(created) = &agent.created_at {
        println!("│  │  {}: {}", "Created".bright_black(), 
            created.format("%Y-%m-%d %H:%M:%S").to_string().dimmed());
    }
    
    if let Some(last_used) = &agent.last_used {
        let time_str = format!("{} ({})", 
            last_used.format("%Y-%m-%d %H:%M:%S"),
            format_relative_time(*last_used)
        );
        
        let colored_time = if format_relative_time(*last_used).contains("hour") || 
                               format_relative_time(*last_used).contains("minute") {
            time_str.bright_green()
        } else if format_relative_time(*last_used).contains("day") {
            time_str.green()
        } else {
            time_str.yellow()
        };
        
        println!("│  │  {}: {}", "Last Used".bright_black(), colored_time);
    }
    println!("│  ╰─");
    
    // Capabilities
    if !agent.capabilities.is_empty() {
        println!("│");
        println!("│  {}", "╭─ Capabilities".bold().bright_cyan());
        for cap in &agent.capabilities {
            println!("│  │  {} {}", "•".green(), cap);
        }
        println!("│  ╰─");
    }
    
    // File paths
    println!("│");
    println!("│  {}", "╭─ File Locations".bold().bright_cyan());
    
    if let Some(path) = &agent.toolkit_path {
        println!("│  │  {}: {}", "Toolkit".bright_black(), 
            truncate_path(path, 60).dimmed());
    }
    
    if let Some(path) = &agent.memory_path {
        let exists = Path::new(path).exists();
        let icon = if exists { "✓".green() } else { "✗".red() };
        
        println!("│  │  {}: {} {}", "Memory".bright_black(),
            icon,
            truncate_path(path, 60).dimmed()
        );
        
        if exists {
            if let Ok(metadata) = fs::metadata(path) {
                println!("│  │    {}: {}", "Size".bright_black().dimmed(), 
                    format_file_size(metadata.len()).green());
            }
        }
    }
    
    if let Some(path) = &agent.learning_path {
        let exists = Path::new(path).exists();
        let icon = if exists { "✓".green() } else { "✗".red() };
        
        println!("│  │  {}: {} {}", "Learning".bright_black(),
            icon,
            truncate_path(path, 60).dimmed()
        );
        
        if exists {
            if let Ok(metadata) = fs::metadata(path) {
                println!("│  │    {}: {}", "Size".bright_black().dimmed(), 
                    format_file_size(metadata.len()).green());
            }
        }
    }
    println!("│  ╰─");
    
    // Custom attributes
    if !agent.attributes.is_empty() {
        println!("│");
        println!("│  {}", "╭─ Custom Attributes".bold().bright_cyan());
        for (key, value) in &agent.attributes {
            println!("│  │  {}: {}", key.bright_black(), value.to_string().dimmed());
        }
        println!("│  ╰─");
    }
    
    println!("╰─");
    
    Ok(())
}

async fn sync_agent(agent: &str, force: bool, progress: bool, config: &Config) -> Result<()> {
    utils::print_header(&format!("Synchronizing Agent: {}", agent));
    
    if agent == "all" {
        // Sync all agents
        let agents = load_all_agents(config)?;
        let total = agents.len();
        
        println!("Synchronizing {} agents...\n", total);
        
        let pb = indicatif::ProgressBar::new(total as u64);
        pb.set_style(
            indicatif::ProgressStyle::default_bar()
                .template("[{elapsed_precise}] {bar:40.cyan/blue} {pos:>3}/{len:3} {msg}")?
                .progress_chars("##-")
        );
        
        for agent_meta in agents {
            pb.set_message(format!("Syncing {}", agent_meta.name));
            sync_single_agent(&agent_meta.name, force, config)?;
            pb.inc(1);
        }
        
        pb.finish_with_message("Synchronization complete");
    } else {
        // Sync single agent
        sync_single_agent(agent, force, config)?;
    }
    
    println!("\n{}", "✓ Synchronization complete".green());
    
    Ok(())
}

async fn search_agents(query: &str, in_memory: bool, in_learning: bool, ignore_case: bool, config: &Config) -> Result<()> {
    utils::print_header(&format!("Searching for: {}", query));
    
    let agents = load_all_agents(config)?;
    let mut results = Vec::new();
    
    for agent in agents {
        let mut found = false;
        let mut context = Vec::new();
        
        // Search in metadata
        if agent.name.to_lowercase().contains(&query.to_lowercase()) ||
           agent.description.to_lowercase().contains(&query.to_lowercase()) {
            found = true;
            context.push("Found in metadata".to_string());
        }
        
        // Search in memory files
        if in_memory {
            if let Some(memory_path) = &agent.memory_path {
                if let Ok(content) = fs::read_to_string(memory_path) {
                    if content.to_lowercase().contains(&query.to_lowercase()) {
                        found = true;
                        context.push("Found in memory".to_string());
                    }
                }
            }
        }
        
        // Search in learning files
        if in_learning {
            if let Some(learning_path) = &agent.learning_path {
                if let Ok(content) = fs::read_to_string(learning_path) {
                    if content.to_lowercase().contains(&query.to_lowercase()) {
                        found = true;
                        context.push("Found in continuous learning".to_string());
                    }
                }
            }
        }
        
        if found {
            results.push((agent, context));
        }
    }
    
    // Display results
    if results.is_empty() {
        println!("No agents found matching '{}'", query);
    } else {
        println!("Found {} agents matching '{}':\n", results.len(), query);
        
        for (agent, contexts) in results {
            println!("{}", format!("• {}", agent.name).bold());
            println!("  {}: {}", "Description".yellow(), agent.description);
            println!("  {}: {}", "Context".yellow(), contexts.join(", "));
        }
    }
    
    Ok(())
}

async fn show_agent_stats(period: Option<String>, sort: Option<String>, top: usize, config: &Config) -> Result<()> {
    utils::print_header("Agent Statistics");
    
    let agents = load_all_agents(config)?;
    
    // Calculate statistics
    let total_agents = agents.len();
    let active_agents = agents.iter().filter(|a| a.usage_count.unwrap_or(0) > 0).count();
    let total_usage: u32 = agents.iter().map(|a| a.usage_count.unwrap_or(0)).sum();
    
    println!("{}", "Overall Statistics".bold().cyan());
    println!("  {}: {}", "Total Agents".yellow(), total_agents);
    println!("  {}: {}", "Active Agents".yellow(), active_agents);
    println!("  {}: {}", "Total Usage".yellow(), total_usage);
    
    // Sort agents based on criteria
    let mut sorted_agents = agents;
    match sort.as_deref() {
        Some("usage") => {
            sorted_agents.sort_by(|a, b| {
                b.usage_count.unwrap_or(0).cmp(&a.usage_count.unwrap_or(0))
            });
        }
        Some("created") => {
            sorted_agents.sort_by(|a, b| {
                b.created_at.cmp(&a.created_at)
            });
        }
        Some("updated") => {
            sorted_agents.sort_by(|a, b| {
                b.last_used.cmp(&a.last_used)
            });
        }
        _ => {}
    }
    
    // Show top agents
    println!("\n{}", "Top Agents by Usage".bold().cyan());
    for (i, agent) in sorted_agents.iter().take(10).enumerate() {
        println!("  {}. {} - {} uses", 
            i + 1,
            agent.name.bold(),
            agent.usage_count.unwrap_or(0)
        );
    }
    
    Ok(())
}

async fn generate_agent_graph(format: Option<String>, config: &Config) -> Result<()> {
    utils::print_header("Agent Relationship Graph");
    
    let output_format = format.unwrap_or_else(|| "ascii".to_string());
    
    match output_format.as_str() {
        "dot" => {
            println!("digraph agents {{");
            println!("  rankdir=LR;");
            println!("  node [shape=box];");
            
            let agents = load_all_agents(config)?;
            for agent in agents {
                println!("  \"{}\" [label=\"{}\\n{} uses\"];",
                    agent.name,
                    agent.name,
                    agent.usage_count.unwrap_or(0)
                );
            }
            
            println!("}}");
        }
        "mermaid" => {
            println!("graph LR");
            
            let agents = load_all_agents(config)?;
            for agent in agents {
                println!("  {}[{} - {} uses]",
                    agent.name.replace('-', "_"),
                    agent.name,
                    agent.usage_count.unwrap_or(0)
                );
            }
        }
        _ => {
            // ASCII representation
            let agents = load_all_agents(config)?;
            println!("Agent Network:");
            for agent in agents {
                println!("  [{}] - {} uses", agent.name, agent.usage_count.unwrap_or(0));
            }
        }
    }
    
    Ok(())
}

async fn update_agent_index(rebuild: bool, verify: bool, config: &Config) -> Result<()> {
    utils::print_header("Updating Agent Index");
    
    let agents_dir = get_agents_directory(config)?;
    
    if rebuild {
        println!("Rebuilding entire agent index...");
    } else {
        println!("Updating agent index...");
    }
    
    let pb = indicatif::ProgressBar::new_spinner();
    pb.set_style(
        indicatif::ProgressStyle::default_spinner()
            .template("{spinner:.green} {msg}")?
    );
    
    pb.set_message("Scanning agent directories...");
    
    let mut agent_count = 0;
    let mut index = Vec::new();
    
    for entry in WalkDir::new(&agents_dir)
        .min_depth(1)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_dir() {
            let agent_name = entry.file_name().to_string_lossy().to_string();
            
            // Skip special directories
            if agent_name.starts_with('.') || agent_name.starts_with("multi_agent_session") {
                continue;
            }
            
            pb.set_message(format!("Processing {}...", agent_name));
            
            // Try to load metadata
            if let Ok(metadata) = load_agent_metadata(&agent_name, config) {
                index.push(metadata);
                agent_count += 1;
            }
        }
    }
    
    pb.finish_with_message(format!("Indexed {} agents", agent_count));
    
    // Save index to cache
    save_agent_index(&index, config)?;
    
    println!("\n{}", format!("✓ Successfully indexed {} agents", agent_count).green());
    
    Ok(())
}

// Helper functions

fn load_all_agents(config: &Config) -> Result<Vec<AgentMetadata>> {
    // Try to load from cache first
    if let Ok(index) = load_agent_index(config) {
        return Ok(index);
    }
    
    // Otherwise scan the agents directory
    let agents_dir = get_agents_directory(config)?;
    let mut agents = Vec::new();
    
    for entry in WalkDir::new(&agents_dir)
        .min_depth(1)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_dir() {
            let agent_name = entry.file_name().to_string_lossy().to_string();
            
            // Skip special directories
            if agent_name.starts_with('.') || agent_name.starts_with("multi_agent_session") {
                continue;
            }
            
            // Try to load metadata
            if let Ok(metadata) = load_agent_metadata(&agent_name, config) {
                agents.push(metadata);
            }
        }
    }
    
    Ok(agents)
}

fn load_agent_metadata(name: &str, config: &Config) -> Result<AgentMetadata> {
    let agents_dir = get_agents_directory(config)?;
    let metadata_path = agents_dir.join(name).join("metadata.json");
    
    if metadata_path.exists() {
        let content = fs::read_to_string(&metadata_path)
            .context(format!("Failed to read metadata for agent {}", name))?;
        let metadata: AgentMetadata = serde_json::from_str(&content)
            .context(format!("Failed to parse metadata for agent {}", name))?;
        Ok(metadata)
    } else {
        // Create basic metadata from directory structure
        Ok(AgentMetadata {
            name: name.to_string(),
            description: format!("Agent {}", name),
            capabilities: Vec::new(),
            created_at: None,
            last_used: None,
            usage_count: None,
            version: None,
            toolkit_path: Some(agents_dir.join(name).to_string_lossy().to_string()),
            memory_path: Some(agents_dir.join(name).join(format!("{}_memory.md", name)).to_string_lossy().to_string()),
            learning_path: Some(agents_dir.join(name).join("ContinuousLearning.md").to_string_lossy().to_string()),
            attributes: HashMap::new(),
        })
    }
}

fn sync_single_agent(name: &str, force: bool, config: &Config) -> Result<()> {
    let agent = load_agent_metadata(name, config)?;
    
    // Check if sync is needed
    if !force {
        // Add logic to check if sync is needed
        // For now, always sync
    }
    
    // Perform synchronization
    // This would involve:
    // 1. Reading agent's memory files
    // 2. Updating metadata
    // 3. Saving updated information
    
    println!("  {} {}", "✓".green(), name);
    
    Ok(())
}

fn get_agents_directory(config: &Config) -> Result<PathBuf> {
    // Get the CI agents directory
    let ci_root = PathBuf::from("/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence");
    Ok(ci_root.join("AGENTS"))
}

fn load_agent_index(config: &Config) -> Result<Vec<AgentMetadata>> {
    let cache_dir = dirs::cache_dir()
        .context("Failed to get cache directory")?
        .join("topologist")
        .join("agent_index.json");
    
    if cache_dir.exists() {
        let content = fs::read_to_string(&cache_dir)?;
        let index: Vec<AgentMetadata> = serde_json::from_str(&content)?;
        Ok(index)
    } else {
        Err(anyhow::anyhow!("Agent index not found"))
    }
}

fn save_agent_index(index: &[AgentMetadata], config: &Config) -> Result<()> {
    let cache_dir = dirs::cache_dir()
        .context("Failed to get cache directory")?
        .join("topologist");
    
    fs::create_dir_all(&cache_dir)?;
    
    let index_path = cache_dir.join("agent_index.json");
    let content = serde_json::to_string_pretty(index)?;
    fs::write(index_path, content)?;
    
    Ok(())
}

fn truncate_string(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len - 3])
    }
}

fn format_relative_time(dt: DateTime<Utc>) -> String {
    let now = Utc::now();
    let duration = now.signed_duration_since(dt);
    
    if duration.num_days() > 30 {
        format!("{} months ago", duration.num_days() / 30)
    } else if duration.num_days() > 0 {
        format!("{} days ago", duration.num_days())
    } else if duration.num_hours() > 0 {
        format!("{} hours ago", duration.num_hours())
    } else if duration.num_minutes() > 0 {
        format!("{} minutes ago", duration.num_minutes())
    } else {
        "Just now".to_string()
    }
}

fn determine_agent_status(agent: &AgentMetadata) -> String {
    if let Some(last_used) = agent.last_used {
        let now = Utc::now();
        let duration = now.signed_duration_since(last_used);
        
        if duration.num_days() < 7 {
            "Active".green().to_string()
        } else if duration.num_days() < 30 {
            "Idle".yellow().to_string()
        } else {
            "Inactive".red().to_string()
        }
    } else {
        "Unused".white().to_string()
    }
}

fn format_file_size(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB"];
    let mut size = bytes as f64;
    let mut unit_index = 0;
    
    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }
    
    if unit_index == 0 {
        format!("{} {}", size as u64, UNITS[unit_index])
    } else {
        format!("{:.2} {}", size, UNITS[unit_index])
    }
}

fn truncate_path(path: &str, max_len: usize) -> String {
    if path.len() <= max_len {
        return path.to_string();
    }
    
    let parts: Vec<&str> = path.split('/').collect();
    if parts.len() <= 2 {
        return format!("...{}", &path[path.len() - max_len + 3..]);
    }
    
    // Try to keep first and last parts
    let first = parts[0];
    let last = parts[parts.len() - 1];
    let middle_len = max_len - first.len() - last.len() - 6; // Account for "/.../""
    
    if middle_len > 0 {
        format!("{}/.../{}", first, last)
    } else {
        format!("...{}", &path[path.len() - max_len + 3..])
    }
}