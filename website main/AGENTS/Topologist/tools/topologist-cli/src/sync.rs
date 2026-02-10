use anyhow::{Context, Result};
use clap::Subcommand;
use colored::*;
use std::fs;
use std::path::PathBuf;

use crate::config::Config;
use crate::utils;

#[derive(Subcommand)]
pub enum SyncCommands {
    /// Synchronize local cache with project data
    #[command(name = "sync")]
    Sync {
        #[arg(long, help = "Force synchronization")]
        force: bool,
    },
    
    /// Pull latest project data from repository
    Pull,
    
    /// Push local changes to repository
    Push,
}

pub async fn handle_command(cmd: SyncCommands, config: &Config) -> Result<()> {
    match cmd {
        SyncCommands::Sync { force } => {
            sync_data(force, config).await?;
        }
        
        SyncCommands::Pull => {
            pull_data(config).await?;
        }
        
        SyncCommands::Push => {
            push_data(config).await?;
        }
    }
    
    Ok(())
}

async fn sync_data(force: bool, config: &Config) -> Result<()> {
    utils::print_header("Synchronizing Data");
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    let project_path = config.get_project_path(project)
        .context("Project path not found")?;
    
    let spinner = utils::create_spinner("Checking synchronization status...");
    
    // Check local cache
    let cache_dir = dirs::home_dir()
        .context("Failed to get home directory")?
        .join(".topologist")
        .join("projects")
        .join(project);
    
    // Check project data
    let project_data_dir = PathBuf::from(project_path).join(".topologist");
    
    if !project_data_dir.exists() {
        spinner.finish_with_message("Project not initialized");
        return Err(anyhow::anyhow!("Project not initialized. Run 'topologist init' first."));
    }
    
    spinner.set_message("Synchronizing repository map...");
    sync_file(
        &project_data_dir.join("repository-map.json"),
        &cache_dir.join("repository-map.json"),
        force
    )?;
    
    spinner.set_message("Synchronizing integration matrix...");
    sync_file(
        &project_data_dir.join("integration-matrix.json"),
        &cache_dir.join("integration-matrix.json"),
        force
    )?;
    
    spinner.finish_with_message("Synchronization complete");
    
    utils::print_success("Data synchronized successfully");
    
    Ok(())
}

async fn pull_data(config: &Config) -> Result<()> {
    utils::print_header("Pulling Project Data");
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    utils::print_info(&format!("Pulling data for project: {}", project));
    
    // In a real implementation, this would:
    // 1. Run git pull in the project directory
    // 2. Update local cache from pulled data
    // 3. Merge any conflicts
    
    println!("Pull functionality would integrate with git repository");
    println!("Implementation pending git integration");
    
    Ok(())
}

async fn push_data(config: &Config) -> Result<()> {
    utils::print_header("Pushing Project Data");
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    let project_path = config.get_project_path(project)
        .context("Project path not found")?;
    
    utils::print_info(&format!("Pushing data for project: {}", project));
    
    // Check for changes
    let cache_dir = dirs::home_dir()
        .context("Failed to get home directory")?
        .join(".topologist")
        .join("projects")
        .join(project);
    
    let project_data_dir = PathBuf::from(project_path).join(".topologist");
    
    // In a real implementation, this would:
    // 1. Copy updated files from cache to project
    // 2. Run git add on changed files
    // 3. Prompt for commit message
    // 4. Run git commit and push
    
    println!("Push functionality would integrate with git repository");
    println!("Implementation pending git integration");
    
    Ok(())
}

fn sync_file(source: &PathBuf, dest: &PathBuf, force: bool) -> Result<()> {
    if !source.exists() {
        return Ok(());
    }
    
    // Create destination directory if needed
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)?;
    }
    
    if force || !dest.exists() || file_newer(source, dest)? {
        fs::copy(source, dest)?;
    }
    
    Ok(())
}

fn file_newer(source: &PathBuf, dest: &PathBuf) -> Result<bool> {
    let source_meta = fs::metadata(source)?;
    let dest_meta = fs::metadata(dest)?;
    
    let source_modified = source_meta.modified()?;
    let dest_modified = dest_meta.modified()?;
    
    Ok(source_modified > dest_modified)
}