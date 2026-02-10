use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use clap::Subcommand;
use colored::*;
use git2::{Repository as GitRepo, StatusOptions, BranchType, Oid};
use serde_json::json;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use tabled::{Table, Tabled, settings::{Style, Format, Alignment, Modify, object::{Columns, Rows}}};
use walkdir::WalkDir;

use crate::config::Config;
use crate::types::*;
use crate::utils;

#[derive(Debug, Clone, Serialize, Deserialize, Tabled)]
pub struct RepositoryInfo {
    #[tabled(rename = "Repository")]
    pub name: String,
    
    #[tabled(rename = "Branch")]
    pub branch: String,
    
    #[tabled(rename = "Status")]
    pub status: String,
    
    #[tabled(rename = "Files")]
    pub file_count: usize,
    
    #[tabled(rename = "Size")]
    pub size: String,
    
    #[tabled(rename = "Commits")]
    pub commit_count: usize,
    
    #[tabled(rename = "Contributors")]
    pub contributors: usize,
    
    #[tabled(rename = "Last Commit")]
    pub last_commit: String,
    
    #[tabled(rename = "Changes")]
    pub changes: String,
    
    #[tabled(skip)]
    pub path: PathBuf,
    
    #[tabled(skip)]
    pub remote_url: Option<String>,
    
    #[tabled(skip)]
    pub languages: Vec<String>,
    
    #[tabled(skip)]
    pub ahead_behind: (usize, usize),
}

#[derive(Subcommand)]
pub enum RepoCommands {
    /// Investigate a specific repository
    Investigate {
        #[arg(help = "Repository path")]
        path: String,
        
        #[arg(long, help = "Focus on dependencies")]
        dependencies: bool,
        
        #[arg(long, help = "Analyze commit history")]
        history: bool,
        
        #[arg(long, help = "Analyze performance metrics")]
        performance: bool,
    },
    
    /// Compare two repositories
    Compare {
        #[arg(help = "First repository path")]
        repo1: String,
        
        #[arg(help = "Second repository path")]
        repo2: String,
        
        #[arg(long, help = "Compare health metrics")]
        health: bool,
        
        #[arg(long, help = "Compare activity")]
        activity: bool,
    },
}

pub async fn handle_command(cmd: RepoCommands, config: &Config) -> Result<()> {
    match cmd {
        RepoCommands::Investigate { path, dependencies, history, performance } => {
            investigate_repository(&path, dependencies, history, performance, config).await?;
        }
        
        RepoCommands::Compare { repo1, repo2, health, activity } => {
            compare_repositories(&repo1, &repo2, health, activity, config).await?;
        }
    }
    
    Ok(())
}

pub fn init_project(name: Option<String>, template: Option<String>, config: &Config) -> Result<()> {
    let current_dir = std::env::current_dir()
        .context("Failed to get current directory")?;
    
    let project_name = name.unwrap_or_else(|| {
        current_dir.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("project")
            .to_string()
    });
    
    // Create .topologist directory
    let topo_dir = current_dir.join(".topologist");
    fs::create_dir_all(&topo_dir)
        .context("Failed to create .topologist directory")?;
    
    // Create initial repository map
    let repo_map = json!({
        "metadata": {
            "project": project_name.clone(),
            "version": "1.0.0",
            "updated": Utc::now().to_rfc3339(),
            "schema_version": "1.0.0",
            "generated_by": "topologist-cli v1.0.0"
        },
        "project_info": {
            "name": project_name.clone(),
            "description": format!("{} - Multi-Repository Project", project_name),
            "repository_count": 0,
            "primary_languages": [],
            "architecture_pattern": "unknown"
        },
        "repositories": []
    });
    
    let repo_map_path = topo_dir.join("repository-map.json");
    fs::write(&repo_map_path, serde_json::to_string_pretty(&repo_map)?)
        .context("Failed to write repository map")?;
    
    // Create other initial files
    let integration_matrix = json!({
        "metadata": {
            "project": project_name.clone(),
            "version": "1.0.0",
            "updated": Utc::now().to_rfc3339(),
            "analysis_type": "initial"
        },
        "integration_matrix": {},
        "build_coordination": {
            "build_order": [],
            "parallel_build_groups": [],
            "build_dependencies": {}
        },
        "failure_analysis": {
            "critical_path_repositories": [],
            "single_points_of_failure": [],
            "cascade_failure_risks": []
        }
    });
    
    let integration_path = topo_dir.join("integration-matrix.json");
    fs::write(&integration_path, serde_json::to_string_pretty(&integration_matrix)?)
        .context("Failed to write integration matrix")?;
    
    // Update config
    let mut config_mut = config.clone();
    config_mut.add_project(project_name.clone(), current_dir.to_string_lossy().to_string());
    config_mut.save()?;
    
    utils::print_success(&format!("Initialized project '{}'", project_name));
    println!("  Created: {}", topo_dir.display());
    
    Ok(())
}

pub async fn scan_repositories(path: Option<String>, deep: bool, update_cache: bool, config: &Config) -> Result<()> {
    // Use provided path or try to get from config or use current directory
    let scan_path = if let Some(p) = path {
        PathBuf::from(p)
    } else if let Some(project) = config.get_active_project() {
        if let Some(project_path) = config.get_project_path(project) {
            PathBuf::from(project_path)
        } else {
            std::env::current_dir()?
        }
    } else {
        std::env::current_dir()?
    };
    
    // Resolve to absolute path for proper detection
    let project_dir = scan_path.canonicalize()
        .unwrap_or(scan_path.clone());
    
    if !project_dir.exists() {
        return Err(anyhow::anyhow!("Directory does not exist: {}", project_dir.display()));
    }
    
    let spinner = utils::create_spinner("Discovering repositories...");
    
    let mut repositories = Vec::new();
    let mut repo_paths = Vec::new();
    
    // First pass: discover all git repositories OR agent directories
    // Check if we're scanning the CollaborativeIntelligence project
    let is_ci_project = project_dir.to_string_lossy().contains("CollaborativeIntelligence");
    let agents_dir = project_dir.join("AGENTS");
    
    if is_ci_project && agents_dir.exists() {
        // Special handling for CollaborativeIntelligence: treat each agent as a repository
        for entry in std::fs::read_dir(&agents_dir)? {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    let dir_name = path.file_name().unwrap_or_default().to_string_lossy();
                    // Skip special directories
                    if !dir_name.starts_with('.') && !dir_name.starts_with("multi_agent_session") {
                        repo_paths.push(path);
                    }
                }
            }
        }
    } else {
        // Normal repository scanning
        for entry in WalkDir::new(project_dir)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_dir() {
                let git_dir = entry.path().join(".git");
                if git_dir.exists() {
                    // Skip nested git repositories if not in deep mode
                    if !deep {
                        let is_nested = repo_paths.iter().any(|p: &PathBuf| entry.path().starts_with(p));
                        if is_nested {
                            continue;
                        }
                    }
                    repo_paths.push(entry.path().to_path_buf());
                }
            }
        }
    }
    
    spinner.set_message(format!("Analyzing {} repositories...", repo_paths.len()));
    
    // Second pass: analyze each repository in detail
    let pb = indicatif::ProgressBar::new(repo_paths.len() as u64);
    pb.set_style(
        indicatif::ProgressStyle::default_bar()
            .template("[{elapsed_precise}] {bar:40.cyan/blue} {pos:>3}/{len:3} {msg}")?
            .progress_chars("##-")
    );
    
    for path in &repo_paths {
        pb.set_message(format!("Analyzing {}", path.file_name().unwrap_or_default().to_string_lossy()));
        
        if let Ok(repo_info) = analyze_repository_detailed(path, deep).await {
            repositories.push(repo_info);
        }
        
        pb.inc(1);
    }
    
    pb.finish_and_clear();
    spinner.finish_with_message(format!("Analyzed {} repositories", repositories.len()));
    
    // Update cache if we have an active project
    if let Some(project) = config.get_active_project() {
        if update_cache || !cache_exists(project, config)? {
            update_repository_cache_detailed(project, &repositories, config)?;
        }
    }
    
    // Display detailed table
    display_repository_table(&repositories)?;
    
    // Display summary statistics
    display_repository_summary(&repositories)?;
    
    Ok(())
}

pub async fn show_status(verbose: bool, watch: bool, config: &Config) -> Result<()> {
    let project = config.get_active_project()
        .context("No active project")?;
    
    let cache = load_repository_cache(project, config)?;
    
    if let Some(status) = cache.get("summary") {
        println!("{}", "Overall Health".bold());
        if let Some(health) = status.get("overall_health") {
            let health_str = health.as_str().unwrap_or("unknown");
            let health_colored = match health_str {
                "good" => health_str.green(),
                "warning" => health_str.yellow(),
                "critical" => health_str.red(),
                _ => health_str.white(),
            };
            println!("  Status: {}", health_colored);
        }
    }
    
    if verbose {
        // Show detailed status
        if let Some(repos) = cache.get("repositories").and_then(|r| r.as_array()) {
            println!("\n{}", "Repository Details".bold());
            for repo in repos {
                if let Some(path) = repo.get("path").and_then(|p| p.as_str()) {
                    println!("\n  {}", path.cyan());
                    
                    if let Some(status) = repo.get("git_status") {
                        if let Some(branch) = status.get("branch").and_then(|b| b.as_str()) {
                            println!("    Branch: {}", branch);
                        }
                        if let Some(changes) = status.get("uncommitted_changes").and_then(|c| c.as_u64()) {
                            if changes > 0 {
                                println!("    Uncommitted changes: {}", changes.to_string().yellow());
                            }
                        }
                    }
                }
            }
        }
    }
    
    if watch {
        // TODO: Implement watch mode
        println!("\n{}", "Watch mode not yet implemented".yellow());
    }
    
    Ok(())
}

pub async fn show_health(summary: bool, issues: bool, config: &Config) -> Result<()> {
    let project = config.get_active_project()
        .context("No active project")?;
    
    utils::print_info(&format!("Analyzing health for project: {}", project));
    
    // TODO: Implement full health analysis
    println!("Health analysis implementation pending");
    
    Ok(())
}

pub async fn show_changes(since: Option<String>, by_author: Option<String>, staged: bool, config: &Config) -> Result<()> {
    let project = config.get_active_project()
        .context("No active project")?;
    
    utils::print_info(&format!("Checking changes in project: {}", project));
    
    // TODO: Implement changes detection
    println!("Changes detection implementation pending");
    
    Ok(())
}

pub async fn show_map(visual: bool, domains: bool, build_order: bool, config: &Config) -> Result<()> {
    let project = config.get_active_project()
        .context("No active project")?;
    
    utils::print_info(&format!("Generating map for project: {}", project));
    
    // TODO: Implement repository mapping
    println!("Repository mapping implementation pending");
    
    Ok(())
}

pub async fn generate_docs(doc_type: &str, config: &Config) -> Result<()> {
    let project = config.get_active_project()
        .context("No active project")?;
    
    utils::print_info(&format!("Generating {} documentation for project: {}", doc_type, project));
    
    // TODO: Implement documentation generation
    println!("Documentation generation implementation pending");
    
    Ok(())
}

pub async fn export_data(format: &str, output: Option<PathBuf>, template: Option<String>, config: &Config) -> Result<()> {
    let project = config.get_active_project()
        .context("No active project")?;
    
    utils::print_info(&format!("Exporting data in {} format for project: {}", format, project));
    
    // TODO: Implement data export
    println!("Data export implementation pending");
    
    Ok(())
}

async fn investigate_repository(path: &str, dependencies: bool, history: bool, performance: bool, config: &Config) -> Result<()> {
    utils::print_header(&format!("Investigating Repository: {}", path));
    
    // TODO: Implement repository investigation
    println!("Repository investigation implementation pending");
    
    Ok(())
}

async fn compare_repositories(repo1: &str, repo2: &str, health: bool, activity: bool, config: &Config) -> Result<()> {
    utils::print_header(&format!("Comparing: {} vs {}", repo1, repo2));
    
    // TODO: Implement repository comparison
    println!("Repository comparison implementation pending");
    
    Ok(())
}

// Helper functions

async fn analyze_repository_detailed(path: &Path, deep: bool) -> Result<RepositoryInfo> {
    // Get repository name from the last component of the path that's not .git
    let repo_name = if path.ends_with(".git") {
        path.parent()
            .and_then(|p| p.file_name())
            .and_then(|n| n.to_str())
            .unwrap_or("repository")
    } else {
        path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("repository")
    }.to_string();
    
    // Try to open git repository - if it fails, try parent directories
    let repo = match GitRepo::open(path) {
        Ok(r) => r,
        Err(_) => {
            // Try parent directories up to 3 levels
            let mut parent = path.parent();
            let mut found = None;
            for _ in 0..3 {
                if let Some(p) = parent {
                    if let Ok(r) = GitRepo::open(p) {
                        found = Some(r);
                        break;
                    }
                    parent = p.parent();
                }
            }
            found.ok_or_else(|| anyhow::anyhow!("Could not find git repository for {}", path.display()))?
        }
    };
    
    // Get current branch
    let head = repo.head()?;
    let branch = if head.is_branch() {
        head.shorthand().unwrap_or("HEAD").to_string()
    } else {
        "HEAD (detached)".to_string()
    };
    
    // Count files and calculate size
    let mut file_count = 0;
    let mut total_size = 0u64;
    let mut language_map: HashMap<String, usize> = HashMap::new();
    
    for entry in WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
    {
        // Skip .git directory
        if entry.path().components().any(|c| c.as_os_str() == ".git") {
            continue;
        }
        
        file_count += 1;
        
        if let Ok(metadata) = entry.metadata() {
            total_size += metadata.len();
        }
        
        // Track languages by extension
        if let Some(ext) = entry.path().extension() {
            if let Some(ext_str) = ext.to_str() {
                let lang = match ext_str {
                    "rs" => "Rust",
                    "js" | "jsx" => "JavaScript",
                    "ts" | "tsx" => "TypeScript",
                    "py" => "Python",
                    "go" => "Go",
                    "java" => "Java",
                    "c" => "C",
                    "cpp" | "cc" | "cxx" => "C++",
                    "cs" => "C#",
                    "rb" => "Ruby",
                    "php" => "PHP",
                    "swift" => "Swift",
                    "kt" | "kts" => "Kotlin",
                    "scala" => "Scala",
                    "r" => "R",
                    "m" => "Objective-C",
                    "dart" => "Dart",
                    "lua" => "Lua",
                    "sh" | "bash" => "Shell",
                    "md" => "Markdown",
                    "json" => "JSON",
                    "yaml" | "yml" => "YAML",
                    "toml" => "TOML",
                    "xml" => "XML",
                    "html" => "HTML",
                    "css" | "scss" | "sass" => "CSS",
                    _ => "Other",
                }.to_string();
                
                *language_map.entry(lang).or_insert(0) += 1;
            }
        }
    }
    
    // Get top languages
    let mut languages: Vec<String> = language_map.into_iter()
        .filter(|(lang, _)| lang != "Other")
        .map(|(lang, count)| format!("{} ({})", lang, count))
        .take(3)
        .collect();
    languages.sort();
    
    // Check git status
    let mut opts = StatusOptions::new();
    opts.include_untracked(true);
    let statuses = repo.statuses(Some(&mut opts))?;
    
    let changes_count = statuses.len();
    let mut staged = 0;
    let mut modified = 0;
    let mut untracked = 0;
    
    for entry in statuses.iter() {
        let status = entry.status();
        if status.contains(git2::Status::INDEX_NEW) || 
           status.contains(git2::Status::INDEX_MODIFIED) || 
           status.contains(git2::Status::INDEX_DELETED) {
            staged += 1;
        }
        if status.contains(git2::Status::WT_MODIFIED) {
            modified += 1;
        }
        if status.contains(git2::Status::WT_NEW) {
            untracked += 1;
        }
    }
    
    let status_str = if changes_count == 0 {
        "Clean".green().to_string()
    } else if staged > 0 {
        "Staged".yellow().to_string()
    } else if modified > 0 {
        "Modified".yellow().to_string()
    } else {
        "Untracked".white().to_string()
    };
    
    let changes_str = if changes_count == 0 {
        "None".dimmed().to_string()
    } else {
        format!("{} ({}S/{}M/{}U)", 
            changes_count.to_string().yellow(),
            staged,
            modified,
            untracked
        )
    };
    
    // Count commits
    let mut revwalk = repo.revwalk()?;
    revwalk.push_head()?;
    let commit_count = revwalk.count();
    
    // Count contributors
    let mut contributors = std::collections::HashSet::new();
    let mut revwalk = repo.revwalk()?;
    revwalk.push_head()?;
    
    for oid in revwalk.take(1000) { // Limit to last 1000 commits for performance
        if let Ok(oid) = oid {
            if let Ok(commit) = repo.find_commit(oid) {
                contributors.insert(commit.author().name().unwrap_or("Unknown").to_string());
            }
        }
    }
    
    // Get last commit info
    let last_commit = if let Ok(head) = repo.head() {
        if let Ok(commit) = head.peel_to_commit() {
            let time = commit.time();
            let datetime = DateTime::from_timestamp(time.seconds(), 0)
                .unwrap_or_else(|| Utc::now());
            format_relative_time(datetime)
        } else {
            "Unknown".to_string()
        }
    } else {
        "No commits".to_string()
    };
    
    // Get remote URL
    let remote_url = repo.find_remote("origin")
        .ok()
        .and_then(|r| r.url().map(|s| s.to_string()));
    
    // Check ahead/behind status with remote
    let ahead_behind = if let Ok(head) = repo.head() {
        if let Some(local_oid) = head.target() {
            // Try to get upstream branch
            if let Ok(upstream_ref) = repo.branch_upstream_name(head.name().unwrap_or("HEAD")) {
                if let Ok(upstream) = repo.find_reference(upstream_ref.as_str().unwrap_or("")) {
                    if let Some(upstream_oid) = upstream.target() {
                        repo.graph_ahead_behind(local_oid, upstream_oid)
                            .unwrap_or((0, 0))
                    } else {
                        (0, 0)
                    }
                } else {
                    (0, 0)
                }
            } else {
                (0, 0)
            }
        } else {
            (0, 0)
        }
    } else {
        (0, 0)
    };
    
    Ok(RepositoryInfo {
        name: repo_name,
        branch,
        status: status_str,
        file_count,
        size: format_file_size(total_size),
        commit_count,
        contributors: contributors.len(),
        last_commit,
        changes: changes_str,
        path: path.to_path_buf(),
        remote_url,
        languages,
        ahead_behind,
    })
}

fn display_repository_table(repositories: &[RepositoryInfo]) -> Result<()> {
    if repositories.is_empty() {
        println!("\n{}", "No repositories found".yellow());
        return Ok(());
    }
    
    println!("\n{}", "═══ REPOSITORY SCAN RESULTS ═══".bold().bright_cyan());
    println!();
    
    // Create and configure the table
    let mut table = Table::new(repositories);
    
    table
        .with(Style::rounded())
        .with(Modify::new(Rows::new(0..1)).with(Format::content(|s| s.bold().to_string())))
        .with(Modify::new(Columns::single(0)).with(Format::content(|s| s.bright_white().bold().to_string())))
        .with(Modify::new(Columns::single(2)).with(Format::content(|s| {
            if s.contains("Clean") {
                s.green().to_string()
            } else if s.contains("Staged") || s.contains("Modified") {
                s.yellow().to_string()
            } else {
                s.to_string()
            }
        })))
        .with(Modify::new(Columns::single(8)).with(Format::content(|s| {
            if s.contains("None") {
                s.dimmed().to_string()
            } else {
                s.to_string()
            }
        })));
    
    println!("{}", table);
    
    Ok(())
}

fn display_repository_summary(repositories: &[RepositoryInfo]) -> Result<()> {
    println!("\n{}", "═══ SUMMARY STATISTICS ═══".bold().bright_cyan());
    println!();
    
    let total_repos = repositories.len();
    let clean_repos = repositories.iter().filter(|r| r.status.contains("Clean")).count();
    let repos_with_changes = total_repos - clean_repos;
    
    let total_files: usize = repositories.iter().map(|r| r.file_count).sum();
    let total_commits: usize = repositories.iter().map(|r| r.commit_count).sum();
    let total_contributors: usize = repositories.iter().map(|r| r.contributors).max().unwrap_or(0);
    
    // Calculate total size
    let total_size = repositories.iter()
        .map(|r| parse_size(&r.size).unwrap_or(0))
        .sum::<u64>();
    
    // Find most active repository
    let most_active = repositories.iter()
        .max_by_key(|r| r.commit_count)
        .map(|r| &r.name);
    
    // Find largest repository
    let largest = repositories.iter()
        .max_by_key(|r| parse_size(&r.size).unwrap_or(0))
        .map(|r| &r.name);
    
    // Collect all languages
    let mut all_languages: HashMap<String, usize> = HashMap::new();
    for repo in repositories {
        for lang in &repo.languages {
            if let Some(lang_name) = lang.split(" (").next() {
                *all_languages.entry(lang_name.to_string()).or_insert(0) += 1;
            }
        }
    }
    
    let mut languages: Vec<(String, usize)> = all_languages.into_iter().collect();
    languages.sort_by(|a, b| b.1.cmp(&a.1));
    
    // Display statistics
    println!("  {} {}", "Total Repositories:".bright_black(), total_repos.to_string().bold());
    println!("  {} {} clean, {} with changes", 
        "Repository Status:".bright_black(),
        clean_repos.to_string().green(),
        repos_with_changes.to_string().yellow()
    );
    println!("  {} {}", "Total Files:".bright_black(), total_files.to_string().bold());
    println!("  {} {}", "Total Size:".bright_black(), format_file_size(total_size).bold());
    println!("  {} {}", "Total Commits:".bright_black(), total_commits.to_string().bold());
    println!("  {} {}", "Max Contributors:".bright_black(), total_contributors.to_string().bold());
    
    if let Some(name) = most_active {
        println!("  {} {}", "Most Active:".bright_black(), name.bright_cyan());
    }
    
    if let Some(name) = largest {
        println!("  {} {}", "Largest:".bright_black(), name.bright_cyan());
    }
    
    if !languages.is_empty() {
        let top_langs: Vec<String> = languages.iter()
            .take(5)
            .map(|(lang, count)| format!("{} ({})", lang, count))
            .collect();
        println!("  {} {}", "Top Languages:".bright_black(), top_langs.join(", ").dimmed());
    }
    
    // Show repositories needing attention
    let repos_needing_attention: Vec<&RepositoryInfo> = repositories.iter()
        .filter(|r| !r.status.contains("Clean"))
        .take(5)
        .collect();
    
    if !repos_needing_attention.is_empty() {
        println!("\n  {} {}", "⚠".yellow(), "Repositories Needing Attention:".yellow().bold());
        for repo in repos_needing_attention {
            println!("    • {} - {}", repo.name.white(), repo.changes.dimmed());
        }
    }
    
    println!();
    Ok(())
}

fn format_file_size(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
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

fn parse_size(size_str: &str) -> Option<u64> {
    let parts: Vec<&str> = size_str.split_whitespace().collect();
    if parts.len() != 2 {
        return None;
    }
    
    let value: f64 = parts[0].parse().ok()?;
    let multiplier = match parts[1] {
        "B" => 1,
        "KB" => 1024,
        "MB" => 1024 * 1024,
        "GB" => 1024 * 1024 * 1024,
        "TB" => 1024_u64.pow(4),
        _ => return None,
    };
    
    Some((value * multiplier as f64) as u64)
}

fn format_relative_time(dt: DateTime<Utc>) -> String {
    let now = Utc::now();
    let duration = now.signed_duration_since(dt);
    
    if duration.num_days() > 365 {
        format!("{} years ago", duration.num_days() / 365)
    } else if duration.num_days() > 30 {
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

async fn analyze_repository(path: &Path, deep: bool) -> Result<(String, usize, bool)> {
    let repo_name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();
    
    let file_count = WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .count();
    
    let is_clean = if let Ok(repo) = GitRepo::open(path) {
        let mut opts = StatusOptions::new();
        opts.include_untracked(true);
        let statuses = repo.statuses(Some(&mut opts))?;
        statuses.is_empty()
    } else {
        false
    };
    
    Ok((repo_name, file_count, is_clean))
}

fn cache_exists(project: &str, config: &Config) -> Result<bool> {
    let cache_dir = dirs::home_dir()
        .context("Failed to get home directory")?
        .join(".topologist")
        .join("projects")
        .join(project);
    
    Ok(cache_dir.join("status.json").exists())
}

fn update_repository_cache_detailed(project: &str, repositories: &[RepositoryInfo], config: &Config) -> Result<()> {
    let cache_dir = dirs::home_dir()
        .context("Failed to get home directory")?
        .join(".topologist")
        .join("projects")
        .join(project);
    
    fs::create_dir_all(&cache_dir)?;
    
    let cache_data = json!({
        "metadata": {
            "project": project,
            "last_scan": Utc::now().to_rfc3339(),
            "repositories_scanned": repositories.len(),
        },
        "summary": {
            "total_repositories": repositories.len(),
            "clean_repositories": repositories.iter().filter(|r| r.status.contains("Clean")).count(),
            "repositories_with_changes": repositories.iter().filter(|r| !r.status.contains("Clean")).count(),
            "total_files": repositories.iter().map(|r| r.file_count).sum::<usize>(),
            "total_commits": repositories.iter().map(|r| r.commit_count).sum::<usize>(),
            "overall_health": if repositories.iter().all(|r| r.status.contains("Clean")) { "excellent" } 
                else if repositories.iter().filter(|r| !r.status.contains("Clean")).count() < repositories.len() / 3 { "good" }
                else { "needs attention" }
        },
        "repositories": repositories.iter().map(|r| {
            json!({
                "name": r.name.clone(),
                "path": r.path.to_string_lossy(),
                "branch": r.branch.clone(),
                "status": r.status.clone(),
                "file_count": r.file_count,
                "size": r.size.clone(),
                "commit_count": r.commit_count,
                "contributors": r.contributors,
                "last_commit": r.last_commit.clone(),
                "changes": r.changes.clone(),
                "remote_url": r.remote_url.clone(),
                "languages": r.languages.clone(),
                "ahead_behind": {
                    "ahead": r.ahead_behind.0,
                    "behind": r.ahead_behind.1
                }
            })
        }).collect::<Vec<_>>()
    });
    
    fs::write(
        cache_dir.join("status.json"),
        serde_json::to_string_pretty(&cache_data)?
    )?;
    
    Ok(())
}

fn update_repository_cache(project: &str, repositories: &[(String, usize, bool)], config: &Config) -> Result<()> {
    let cache_dir = dirs::home_dir()
        .context("Failed to get home directory")?
        .join(".topologist")
        .join("projects")
        .join(project);
    
    fs::create_dir_all(&cache_dir)?;
    
    let cache_data = json!({
        "metadata": {
            "project": project,
            "last_scan": Utc::now().to_rfc3339(),
            "repositories_scanned": repositories.len(),
        },
        "summary": {
            "total_repositories": repositories.len(),
            "clean_repositories": repositories.iter().filter(|r| r.2).count(),
            "overall_health": "good"
        },
        "repositories": repositories.iter().map(|r| {
            json!({
                "path": r.0.clone(),
                "file_count": r.1,
                "is_clean": r.2
            })
        }).collect::<Vec<_>>()
    });
    
    fs::write(
        cache_dir.join("status.json"),
        serde_json::to_string_pretty(&cache_data)?
    )?;
    
    Ok(())
}

fn load_repository_cache(project: &str, config: &Config) -> Result<serde_json::Value> {
    let cache_file = dirs::home_dir()
        .context("Failed to get home directory")?
        .join(".topologist")
        .join("projects")
        .join(project)
        .join("status.json");
    
    if cache_file.exists() {
        let content = fs::read_to_string(&cache_file)?;
        Ok(serde_json::from_str(&content)?)
    } else {
        Ok(json!({}))
    }
}