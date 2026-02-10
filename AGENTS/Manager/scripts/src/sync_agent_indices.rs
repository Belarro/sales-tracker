use anyhow::{Context, Result};
use clap::Parser;
use colored::*;

// Reuse the agent sync logic from CIA CLI but as a standalone binary
mod agent_sync {
    use anyhow::{Context, Result};
    use regex::Regex;
    use std::collections::HashMap;
    use std::fs;
    use std::path::Path;

    #[derive(Debug, Clone)]
    pub struct Agent {
        pub name: String,
        pub role: String,
        pub description: String,
        pub focus: Option<String>,
    }

    pub struct AgentSyncTool {
        pub base_dir: String,
        pub agents_file: String,
        pub agent_index_file: String,
    }

    impl AgentSyncTool {
        pub fn new() -> Self {
            let base_dir = "/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence".to_string();
            Self {
                agents_file: format!("{}/docs/agent-system/agents-overview.md", base_dir),
                agent_index_file: format!("{}/docs/agent-system/agent-index.md", base_dir),
                base_dir,
            }
        }

        pub fn parse_agents_file(&self) -> Result<Vec<Agent>> {
            let content = fs::read_to_string(&self.agents_file)
                .with_context(|| format!("Failed to read agents file: {}", self.agents_file))?;

            let mut agents = Vec::new();
            let agent_regex = Regex::new(r"(?m)^###\s+(.+?)\s*-\s*(.+?)$").unwrap();
            let role_regex = Regex::new(r"(?m)^\s*-\s*\*\*Role\*\*:\s*(.+?)$").unwrap();

            for cap in agent_regex.captures_iter(&content) {
                let name_and_title = cap[1].trim();
                let description = cap[2].trim();
                
                // Find the role in the section following this agent
                let start_pos = cap.get(0).unwrap().end();
                let next_agent_pos = agent_regex.find_at(&content, start_pos).map(|m| m.start()).unwrap_or(content.len());
                let section = &content[start_pos..next_agent_pos];
                
                let role = role_regex
                    .find(section)
                    .map(|m| {
                        m.as_str()
                            .trim_start_matches("- **Role**:")
                            .trim()
                            .to_string()
                    })
                    .unwrap_or_else(|| "Not specified".to_string());

                agents.push(Agent {
                    name: name_and_title.to_string(),
                    role,
                    description: description.to_string(),
                    focus: None,
                });
            }


            Ok(agents)
        }

        pub fn parse_agent_index(&self) -> Result<HashMap<String, Agent>> {
            if !Path::new(&self.agent_index_file).exists() {
                return Ok(HashMap::new());
            }

            let content = fs::read_to_string(&self.agent_index_file)
                .with_context(|| format!("Failed to read agent index: {}", self.agent_index_file))?;

            let mut index_agents = HashMap::new();
            let line_regex = Regex::new(r"(?m)^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|").unwrap();

            for cap in line_regex.captures_iter(&content) {
                let name = cap[1].trim().to_string();
                let role = cap[2].trim().to_string();
                let description = cap[3].trim().to_string();

                index_agents.insert(
                    name.clone(),
                    Agent {
                        name,
                        role,
                        description,
                        focus: None,
                    },
                );
            }

            Ok(index_agents)
        }

        pub fn generate_agent_index(&self, agents: &[Agent]) -> Result<String> {
            let mut content = String::new();
            content.push_str("# Agent Index\n\n");
            content.push_str("Quick reference for all available agents in the Collaborative Intelligence system.\n\n");
            content.push_str("| Agent | Role | Description |\n");
            content.push_str("|-------|------|-------------|\n");

            for agent in agents {
                content.push_str(&format!(
                    "| **{}** | {} | {} |\n",
                    agent.name, agent.role, agent.description
                ));
            }

            content.push_str("\n---\n\n");
            content.push_str(&format!(
                "*Last updated: {}*\n",
                chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC")
            ));
            content.push_str("*Generated automatically by sync-agent-indices*\n");

            Ok(content)
        }

        pub fn sync_indices(&self) -> Result<()> {
            println!("🔍 Analyzing agents-overview.md...");
            let agents = self.parse_agents_file()?;
            println!("  - Found {} agents", agents.len());
            println!("  - Located in {}", self.agents_file);

            println!("\n🔄 Checking current agent-index.md...");
            let index_agents = self.parse_agent_index()?;
            println!("  - Found {} agents in index", index_agents.len());
            println!("  - Located in {}", self.agent_index_file);

            let discrepancies = self.check_discrepancies(&agents, &index_agents);
            
            if discrepancies.is_empty() {
                println!("\n✓ agents-overview.md and agent-index.md are synchronized");
                return Ok(());
            }

            println!("\n⚠️  Found discrepancies:");
            for discrepancy in &discrepancies {
                println!("  - {}", discrepancy);
            }

            println!("\n📝 Updating agent-index.md...");
            let new_content = self.generate_agent_index(&agents)?;
            fs::write(&self.agent_index_file, new_content)
                .with_context(|| format!("Failed to write agent index: {}", self.agent_index_file))?;

            println!("✓ agent-index.md successfully synchronized with agents-overview.md");
            println!("  - agents-overview.md: {} agents", agents.len());
            println!("  - agent-index.md: {} agents", agents.len());

            Ok(())
        }

        pub fn check_discrepancies(&self, agents: &[Agent], index_agents: &HashMap<String, Agent>) -> Vec<String> {
            let mut discrepancies = Vec::new();
            
            let agent_names: std::collections::HashSet<String> = 
                agents.iter().map(|a| a.name.clone()).collect();
            let index_names: std::collections::HashSet<String> = 
                index_agents.keys().cloned().collect();

            let missing_in_index: Vec<_> = agent_names.difference(&index_names).collect();
            let extra_in_index: Vec<_> = index_names.difference(&agent_names).collect();

            if !missing_in_index.is_empty() {
                discrepancies.push(format!(
                    "Missing in agent-index.md: {}", 
                    missing_in_index.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(", ")
                ));
            }

            if !extra_in_index.is_empty() {
                discrepancies.push(format!(
                    "Extra in agent-index.md: {}", 
                    extra_in_index.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(", ")
                ));
            }

            discrepancies
        }
    }
}

#[derive(Parser)]
#[command(name = "sync-agent-indices")]
#[command(about = "Synchronize agents-overview.md and agent-index.md")]
struct Args {
    /// Check for discrepancies without fixing them
    #[arg(long)]
    check: bool,
}

fn main() -> Result<()> {
    let args = Args::parse();

    let tool = agent_sync::AgentSyncTool::new();
    
    if args.check {
        println!("{}", "🔍 Checking agent synchronization...".blue());
        let agents = tool.parse_agents_file()?;
        let index_agents = tool.parse_agent_index()?;
        
        println!("  - Found {} agents in agents-overview.md", agents.len());
        println!("  - Found {} agents in agent-index.md", index_agents.len());

        let discrepancies = tool.check_discrepancies(&agents, &index_agents);
        
        if discrepancies.is_empty() {
            println!("{}", "✓ No discrepancies found".green());
        } else {
            println!("{}", format!("⚠️  Found {} discrepancies:", discrepancies.len()).yellow());
            for discrepancy in discrepancies {
                println!("  - {}", discrepancy);
            }
        }
    } else {
        tool.sync_indices()?;
    }
    
    Ok(())
}