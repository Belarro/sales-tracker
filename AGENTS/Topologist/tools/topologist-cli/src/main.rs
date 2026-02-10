use anyhow::Result;
use clap::{Parser, Subcommand, builder::Styles};
use colored::*;
use std::path::PathBuf;

mod agents;
mod config;
mod error;
mod repository;
mod session;
mod sync;
mod types;
mod utils;

use crate::agents::AgentCommands;
use crate::config::Config;
use crate::repository::RepoCommands;
use crate::session::SessionCommands;
use crate::sync::SyncCommands;

fn get_styles() -> Styles {
    Styles::styled()
        .header(clap::builder::styling::AnsiColor::BrightCyan.on_default().bold())
        .usage(clap::builder::styling::AnsiColor::BrightCyan.on_default().bold())
        .literal(clap::builder::styling::AnsiColor::BrightGreen.on_default())
        .placeholder(clap::builder::styling::AnsiColor::BrightYellow.on_default())
}

fn print_welcome() {
    use colored::*;
    
    println!();
    println!("{}", "═══════════════════════════════════════════════════════════════════".bright_blue());
    println!("        {} {}", "TOPOLOGIST".bold().bright_cyan(), "v1.0.0".dimmed());
    println!("   {}", "Multi-Repository Intelligence & Coordination System".bright_white());
    println!("{}", "═══════════════════════════════════════════════════════════════════".bright_blue());
    println!();
    
    println!("{}", "🚀 QUICK START".bold().bright_cyan());
    println!("{}", "─────────────".bright_black());
    println!("  {} {} {}", "topologist".bright_green(), "init".yellow(), "          Initialize a new project".dimmed());
    println!("  {} {} {}", "topologist".bright_green(), "agent list".yellow(), "    List all CI agents".dimmed());
    println!("  {} {} {}", "topologist".bright_green(), "scan".yellow(), "          Scan for repositories".dimmed());
    println!("  {} {} {}", "topologist".bright_green(), "status".yellow(), "        Show project status".dimmed());
    println!();
    
    println!("{}", "🤖 AGENT COMMANDS".bold().bright_cyan());
    println!("{}", "─────────────────".bright_black());
    println!("  {} {}    List agents with beautiful colors", "topologist".bright_green(), "a list".yellow());
    println!("  {} {} Show detailed agent information", "topologist".bright_green(), "a info <name>".yellow());
    println!("  {} {}  Sync all agent metadata", "topologist".bright_green(), "a sync all".yellow());
    println!("  {} {} Search agents by query", "topologist".bright_green(), "a search <q>".yellow());
    println!();
    
    println!("{}", "📦 REPOSITORY COMMANDS".bold().bright_cyan());
    println!("{}", "──────────────────────".bright_black());
    println!("  {} {}      Scan all git repositories", "topologist".bright_green(), "s".yellow());
    println!("  {} {}     Show project status", "topologist".bright_green(), "st".yellow());
    println!("  {} {}      Check repository health", "topologist".bright_green(), "h".yellow());
    println!("  {} {}      Show uncommitted changes", "topologist".bright_green(), "c".yellow());
    println!("  {} {}      Show dependency map", "topologist".bright_green(), "m".yellow());
    println!();
    
    println!("{}", "💡 TIPS".bold().bright_cyan());
    println!("{}", "───────".bright_black());
    println!("  • Use {} for detailed help on any command", "--help".bright_green());
    println!("  • Most commands have {} (shown above)", "short aliases".bright_yellow());
    println!("  • Add {} for extra output", "--verbose".bright_green());
    println!("  • Use {} to force colors", "CLICOLOR_FORCE=1".bright_green());
    println!();
    
    println!("{}", "For more help, run:".dimmed());
    println!("  {} {}", "topologist".bright_green().bold(), "--help".yellow());
    println!();
}

#[derive(Parser)]
#[command(
    name = "topologist",
    about = "Multi-Repository Intelligence & Coordination System",
    long_about = None,
    version,
    styles = get_styles(),
    help_template = "\
{before-help}{name} {version}
{author-with-newline}{about-with-newline}
{usage-heading} {usage}

{all-args}{after-help}
"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    #[arg(long, global = true, help = "Project name to work with")]
    project: Option<String>,

    #[arg(long, global = true, help = "Enable verbose output")]
    verbose: bool,

    #[arg(long, global = true, help = "Output format (json, table, markdown)")]
    format: Option<String>,
}

#[derive(Subcommand)]
enum Commands {
    // === CORE COMMANDS ===
    
    /// 🚀 Initialize a new project for tracking
    #[command(visible_alias = "i")]
    Init {
        #[arg(long, help = "Project name")]
        name: Option<String>,
        
        #[arg(long, help = "Project template to use")]
        template: Option<String>,
    },

    /// 🔍 Discover and scan all git repositories
    #[command(visible_alias = "s")]
    Scan {
        #[arg(help = "Path to scan for repositories (defaults to current directory)")]
        path: Option<String>,
        
        #[arg(long, help = "Perform deep analysis including submodules")]
        deep: bool,
        
        #[arg(long, help = "Force refresh of all cached data")]
        update_cache: bool,
    },

    /// 📊 Show current project status and health
    #[command(visible_alias = "st")]
    Status {
        #[arg(long, help = "Show detailed status with repository breakdown")]
        verbose: bool,
        
        #[arg(long, help = "Enable continuous monitoring mode")]
        watch: bool,
    },

    /// 🏥 Show repository health across all repositories
    #[command(visible_alias = "h")]
    Health {
        #[arg(long, help = "Show aggregated summary")]
        summary: bool,
        
        #[arg(long, help = "Show only repositories with issues")]
        issues: bool,
    },

    /// 📝 Show only repositories with uncommitted changes
    #[command(visible_alias = "c")]
    Changes {
        #[arg(long, help = "Filter changes within time window")]
        since: Option<String>,
        
        #[arg(long, help = "Filter changes by author")]
        by_author: Option<String>,
        
        #[arg(long, help = "Show only staged changes")]
        staged: bool,
    },

    /// 🗺️  Show repository relationships and dependencies
    #[command(visible_alias = "m")]
    Map {
        #[arg(long, help = "Generate visual dependency graph")]
        visual: bool,
        
        #[arg(long, help = "Group by domain architecture")]
        domains: bool,
        
        #[arg(long, help = "Show optimal build order")]
        build_order: bool,
    },

    // === MANAGEMENT COMMANDS ===

    /// 🤖 Agent management commands
    #[command(subcommand, visible_alias = "a")]
    Agent(AgentCommands),

    /// 📦 Repository analysis commands
    #[command(subcommand, visible_alias = "r")]
    Repo(RepoCommands),

    /// 🔬 Session management commands
    #[command(subcommand)]
    Session(SessionCommands),

    /// 📚 Documentation generation commands
    #[command(visible_alias = "d")]
    Docs {
        #[arg(help = "Type of documentation to generate (status, readme, architecture)")]
        doc_type: String,
    },

    /// 🔄 Multi-machine synchronization
    #[command(subcommand)]
    Sync(SyncCommands),

    /// 💾 Export project data in various formats
    #[command(visible_alias = "e")]
    Export {
        #[arg(long, help = "Export format (json, markdown, html, dot)")]
        format: String,
        
        #[arg(long, help = "Output file path")]
        output: Option<PathBuf>,
        
        #[arg(long, help = "Template to use for export")]
        template: Option<String>,
    },

    // === PROJECT COMMANDS ===

    /// 📋 List all tracked projects
    #[command(visible_alias = "l")]
    List {
        #[arg(long, help = "Show detailed information")]
        detailed: bool,
    },

    /// 🔀 Switch to a different project
    #[command(visible_alias = "sw")]
    Switch {
        #[arg(help = "Project name to switch to")]
        project: String,
        
        #[arg(long, help = "Interactive selection")]
        interactive: bool,
    },

    /// 📍 Show current project context
    Current,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Force enable colors - iTerm2 supports them
    colored::control::set_override(true);
    
    // Check if no arguments provided
    if std::env::args().len() == 1 {
        print_welcome();
        std::process::exit(0);
    }
    
    let cli = Cli::parse();
    
    // Load configuration
    let mut config = Config::load()?;
    
    // Override project if specified
    if let Some(ref project) = cli.project {
        config.set_active_project(project.clone());
    }
    
    // Set verbose mode
    if cli.verbose {
        config.set_verbose(true);
    }
    
    // Execute command
    match cli.command {
        Commands::Init { name, template } => {
            utils::print_header("Initializing Topologist Project");
            repository::init_project(name, template, &config)?;
        }
        
        Commands::Scan { path, deep, update_cache } => {
            utils::print_header("Scanning Repositories");
            repository::scan_repositories(path, deep, update_cache, &config).await?;
        }
        
        Commands::Status { verbose, watch } => {
            utils::print_header("Project Status");
            repository::show_status(verbose, watch, &config).await?;
        }
        
        Commands::Health { summary, issues } => {
            utils::print_header("Repository Health");
            repository::show_health(summary, issues, &config).await?;
        }
        
        Commands::Changes { since, by_author, staged } => {
            utils::print_header("Repository Changes");
            repository::show_changes(since, by_author, staged, &config).await?;
        }
        
        Commands::Map { visual, domains, build_order } => {
            utils::print_header("Repository Map");
            repository::show_map(visual, domains, build_order, &config).await?;
        }
        
        Commands::Agent(cmd) => {
            agents::handle_command(cmd, &config).await?;
        }
        
        Commands::Repo(cmd) => {
            repository::handle_command(cmd, &config).await?;
        }
        
        Commands::Session(cmd) => {
            session::handle_command(cmd, &config).await?;
        }
        
        Commands::Docs { doc_type } => {
            utils::print_header("Documentation Generation");
            repository::generate_docs(&doc_type, &config).await?;
        }
        
        Commands::Sync(cmd) => {
            sync::handle_command(cmd, &config).await?;
        }
        
        Commands::Export { format, output, template } => {
            utils::print_header("Exporting Data");
            repository::export_data(&format, output, template, &config).await?;
        }
        
        Commands::List { detailed } => {
            utils::print_header("Tracked Projects");
            config::list_projects(detailed, &config)?;
        }
        
        Commands::Switch { project, interactive } => {
            utils::print_header("Switching Project");
            config::switch_project(&project, interactive, &mut config)?;
        }
        
        Commands::Current => {
            utils::print_header("Current Context");
            config::show_current(&config)?;
        }
    }
    
    Ok(())
}