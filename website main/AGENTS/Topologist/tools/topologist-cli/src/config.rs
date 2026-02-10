use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use colored::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use crate::utils;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub version: String,
    pub user: UserConfig,
    pub projects: ProjectsConfig,
    pub features: FeaturesConfig,
    pub templates: TemplatesConfig,
    
    #[serde(skip)]
    verbose: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserConfig {
    pub name: Option<String>,
    pub email: Option<String>,
    pub preferences: UserPreferences,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPreferences {
    pub default_output_format: String,
    pub color_output: bool,
    pub auto_sync_enabled: bool,
    pub session_auto_save: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectsConfig {
    pub active_project: Option<String>,
    pub recent_projects: Vec<String>,
    pub project_paths: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeaturesConfig {
    pub experimental_features: bool,
    pub performance_tracking: bool,
    pub telemetry_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplatesConfig {
    pub default_session_template: String,
    pub custom_templates: Vec<String>,
}

impl Config {
    pub fn load() -> Result<Self> {
        let config_path = Self::config_path()?;
        
        if config_path.exists() {
            let content = fs::read_to_string(&config_path)
                .context("Failed to read configuration file")?;
            let mut config: Config = serde_json::from_str(&content)
                .context("Failed to parse configuration file")?;
            config.verbose = false;
            Ok(config)
        } else {
            // Create default configuration
            let config = Self::default();
            config.save()?;
            Ok(config)
        }
    }
    
    pub fn save(&self) -> Result<()> {
        let config_path = Self::config_path()?;
        let config_dir = config_path.parent()
            .context("Failed to get config directory")?;
        
        fs::create_dir_all(config_dir)
            .context("Failed to create config directory")?;
        
        let content = serde_json::to_string_pretty(self)
            .context("Failed to serialize configuration")?;
        
        fs::write(&config_path, content)
            .context("Failed to write configuration file")?;
        
        Ok(())
    }
    
    pub fn config_path() -> Result<PathBuf> {
        let home_dir = dirs::home_dir()
            .context("Failed to get home directory")?;
        Ok(home_dir.join(".topologist").join("config.json"))
    }
    
    pub fn set_active_project(&mut self, project: String) {
        self.projects.active_project = Some(project.clone());
        
        // Update recent projects
        if !self.projects.recent_projects.contains(&project) {
            self.projects.recent_projects.insert(0, project);
            if self.projects.recent_projects.len() > 10 {
                self.projects.recent_projects.pop();
            }
        }
    }
    
    pub fn get_active_project(&self) -> Option<&String> {
        self.projects.active_project.as_ref()
    }
    
    pub fn set_verbose(&mut self, verbose: bool) {
        self.verbose = verbose;
    }
    
    pub fn is_verbose(&self) -> bool {
        self.verbose
    }
    
    pub fn get_project_path(&self, project: &str) -> Option<&String> {
        self.projects.project_paths.get(project)
    }
    
    pub fn add_project(&mut self, name: String, path: String) {
        self.projects.project_paths.insert(name.clone(), path);
        self.set_active_project(name);
    }
}

impl Default for Config {
    fn default() -> Self {
        Config {
            version: "1.0.0".to_string(),
            user: UserConfig {
                name: None,
                email: None,
                preferences: UserPreferences {
                    default_output_format: "table".to_string(),
                    color_output: true,
                    auto_sync_enabled: true,
                    session_auto_save: true,
                },
            },
            projects: ProjectsConfig {
                active_project: None,
                recent_projects: Vec::new(),
                project_paths: HashMap::new(),
            },
            features: FeaturesConfig {
                experimental_features: false,
                performance_tracking: true,
                telemetry_enabled: false,
            },
            templates: TemplatesConfig {
                default_session_template: "standard-investigation".to_string(),
                custom_templates: vec![
                    "architecture-review".to_string(),
                    "security-audit".to_string(),
                ],
            },
            verbose: false,
        }
    }
}

pub fn list_projects(detailed: bool, config: &Config) -> Result<()> {
    if config.projects.project_paths.is_empty() {
        println!("No projects tracked yet.");
        println!("\nUse {} to start tracking a project.", "topologist init".cyan());
        return Ok(());
    }
    
    let active = config.projects.active_project.as_ref();
    
    if detailed {
        for (name, path) in &config.projects.project_paths {
            let is_active = active.map_or(false, |a| a == name);
            let marker = if is_active { " (active)".green().to_string() } else { String::new() };
            
            println!("\n{}{}", format!("Project: {}", name).bold().cyan(), marker);
            println!("  {}: {}", "Path".yellow(), path);
            
            // Check if path exists and show status
            if Path::new(path).exists() {
                println!("  {}: {}", "Status".yellow(), "Available".green());
                
                // Check for .topologist directory
                let topo_dir = Path::new(path).join(".topologist");
                if topo_dir.exists() {
                    println!("  {}: {}", "Topologist".yellow(), "Initialized".green());
                } else {
                    println!("  {}: {}", "Topologist".yellow(), "Not initialized".yellow());
                }
            } else {
                println!("  {}: {}", "Status".yellow(), "Path not found".red());
            }
        }
    } else {
        println!("Tracked projects:");
        for (name, _) in &config.projects.project_paths {
            let is_active = active.map_or(false, |a| a == name);
            if is_active {
                println!("  • {} {}", name.bold(), "(active)".green());
            } else {
                println!("  • {}", name);
            }
        }
    }
    
    println!("\n{}: {} projects", "Total".bold(), config.projects.project_paths.len());
    
    Ok(())
}

pub fn switch_project(project: &str, interactive: bool, config: &mut Config) -> Result<()> {
    if interactive {
        // TODO: Implement interactive selection
        println!("Interactive mode not yet implemented");
        return Ok(());
    }
    
    if config.projects.project_paths.contains_key(project) {
        config.set_active_project(project.to_string());
        config.save()?;
        
        println!("{}", format!("✓ Switched to project: {}", project).green());
        
        if let Some(path) = config.get_project_path(project) {
            println!("  {}: {}", "Path".yellow(), path);
        }
    } else {
        println!("{}", format!("Project '{}' not found", project).red());
        println!("\nAvailable projects:");
        for name in config.projects.project_paths.keys() {
            println!("  • {}", name);
        }
    }
    
    Ok(())
}

pub fn show_current(config: &Config) -> Result<()> {
    if let Some(project) = &config.projects.active_project {
        println!("{}: {}", "Active project".bold(), project.cyan());
        
        if let Some(path) = config.get_project_path(project) {
            println!("{}: {}", "Project path".bold(), path);
            
            // Check project status
            let project_path = Path::new(path);
            if project_path.exists() {
                let topo_dir = project_path.join(".topologist");
                if topo_dir.exists() {
                    println!("{}: {}", "Status".bold(), "Initialized".green());
                    
                    // Check for cached data
                    let cache_dir = dirs::home_dir()
                        .context("Failed to get home directory")?
                        .join(".topologist")
                        .join("projects")
                        .join(project);
                    
                    if cache_dir.exists() {
                        println!("{}: {}", "Cache".bold(), "Available".green());
                        
                        // Show last scan time if available
                        let status_file = cache_dir.join("status.json");
                        if status_file.exists() {
                            if let Ok(content) = fs::read_to_string(&status_file) {
                                if let Ok(status) = serde_json::from_str::<serde_json::Value>(&content) {
                                    if let Some(last_scan) = status.get("metadata")
                                        .and_then(|m| m.get("last_scan"))
                                        .and_then(|s| s.as_str()) {
                                        println!("{}: {}", "Last scan".bold(), last_scan);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    println!("{}: {}", "Status".bold(), "Not initialized".yellow());
                    println!("\nRun {} to initialize the project.", "topologist init".cyan());
                }
            } else {
                println!("{}: {}", "Status".bold(), "Path not found".red());
            }
        }
    } else {
        println!("No active project set.");
        println!("\nUse {} to set an active project.", "topologist switch <project>".cyan());
    }
    
    // Show configuration summary
    println!("\n{}", "Configuration".bold());
    println!("  {}: {}", "Output format".yellow(), config.user.preferences.default_output_format);
    println!("  {}: {}", "Color output".yellow(), 
        if config.user.preferences.color_output { "enabled".green() } else { "disabled".red() });
    println!("  {}: {}", "Auto sync".yellow(),
        if config.user.preferences.auto_sync_enabled { "enabled".green() } else { "disabled".red() });
    
    Ok(())
}