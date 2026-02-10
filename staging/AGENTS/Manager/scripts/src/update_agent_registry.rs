use anyhow::{Context, Result};
use clap::Parser;
use colored::*;
use std::fs;

// Reuse the agent sync logic 
mod agent_sync {
    use anyhow::{Context, Result};
    use std::fs;

    pub struct AgentRegistryTool {
        pub base_dir: String,
        pub agents_file: String,
        pub agent_index_file: String,
    }

    impl AgentRegistryTool {
        pub fn new() -> Self {
            let base_dir = "/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence".to_string();
            Self {
                agents_file: format!("{}/docs/agent-system/agents-overview.md", base_dir),
                agent_index_file: format!("{}/docs/agent-system/agent-index.md", base_dir),
                base_dir,
            }
        }

        pub fn add_agent(&self, name: &str, role: &str, description: &str) -> Result<()> {
            // Add to agents-overview.md
            let mut agents_content = fs::read_to_string(&self.agents_file)
                .with_context(|| format!("Failed to read agents file: {}", self.agents_file))?;

            let new_agent_section = format!(
                "\n## {}\n\n**Role**: {}\n**Description**: {}\n\n",
                name, role, description
            );

            agents_content.push_str(&new_agent_section);
            fs::write(&self.agents_file, agents_content)
                .with_context(|| format!("Failed to write agents file: {}", self.agents_file))?;

            // Update agent index by reading and regenerating it
            self.update_agent_index(name, role, description)?;

            Ok(())
        }

        fn update_agent_index(&self, name: &str, role: &str, description: &str) -> Result<()> {
            let mut content = if std::path::Path::new(&self.agent_index_file).exists() {
                fs::read_to_string(&self.agent_index_file)
                    .with_context(|| format!("Failed to read agent index: {}", self.agent_index_file))?
            } else {
                String::from("# Agent Index\n\nQuick reference for all available agents.\n\n| Agent | Role | Description |\n|-------|------|-------------|\n")
            };

            // Check if agent already exists in index
            if content.contains(&format!("| **{}**", name)) {
                return Ok(()); // Agent already exists
            }

            // Find the insertion point (after the header row)
            let header_end = content.find("|-------|------|-------------|")
                .ok_or_else(|| anyhow::anyhow!("Invalid agent index format"))?;
            
            let insert_pos = content[header_end..].find('\n')
                .map(|pos| header_end + pos + 1)
                .ok_or_else(|| anyhow::anyhow!("Invalid agent index format"))?;

            let new_entry = format!("| **{}** | {} | {} |\n", name, role, description);
            content.insert_str(insert_pos, &new_entry);

            // Update timestamp
            let timestamp = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC");
            if let Some(timestamp_pos) = content.find("*Last updated:") {
                if let Some(end_pos) = content[timestamp_pos..].find('\n') {
                    let full_end = timestamp_pos + end_pos;
                    content.replace_range(timestamp_pos..full_end, &format!("*Last updated: {}*", timestamp));
                }
            } else {
                content.push_str(&format!("\n---\n\n*Last updated: {}*\n*Generated automatically by update-agent-registry*\n", timestamp));
            }

            fs::write(&self.agent_index_file, content)
                .with_context(|| format!("Failed to write agent index: {}", self.agent_index_file))?;

            Ok(())
        }
    }
}

#[derive(Parser)]
#[command(name = "update-agent-registry")]
#[command(about = "Add a new agent to the agent registry")]
struct Args {
    /// Agent name
    agent_name: String,
    
    /// Agent role
    agent_role: String,
    
    /// Agent description
    description: String,
}

fn main() -> Result<()> {
    let args = Args::parse();

    let tool = agent_sync::AgentRegistryTool::new();
    
    println!("{}", format!("Adding agent '{}' to registry...", args.agent_name).blue());
    
    match tool.add_agent(&args.agent_name, &args.agent_role, &args.description) {
        Ok(_) => {
            println!("{}", format!("✓ Successfully added agent '{}'", args.agent_name).green());
            println!("  - Updated agents-overview.md");
            println!("  - Updated agent-index.md");
        }
        Err(e) => {
            println!("{}", format!("✗ Failed to add agent: {}", e).red());
            return Err(e);
        }
    }
    
    Ok(())
}