use anyhow::{Context, Result};
use chrono::Utc;
use clap::Subcommand;
use colored::*;
use serde_json::json;
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

use crate::config::Config;
use crate::types::*;
use crate::utils;

#[derive(Subcommand)]
pub enum SessionCommands {
    /// Start a new investigation session
    Start {
        #[arg(help = "Session name")]
        name: String,
        
        #[arg(long, help = "Template to use")]
        template: Option<String>,
    },
    
    /// Show current session status
    Status,
    
    /// Add notes to current session
    Notes {
        #[arg(help = "Note content")]
        text: String,
    },
    
    /// End current session
    End {
        #[arg(long, help = "Generate report")]
        report: bool,
    },
    
    /// List all sessions
    List,
    
    /// Show session details
    Show {
        #[arg(help = "Session ID or name")]
        session: String,
    },
    
    /// Export session data
    Export {
        #[arg(help = "Session ID or name")]
        session: String,
        
        #[arg(long, help = "Output file")]
        output: Option<PathBuf>,
    },
}

pub async fn handle_command(cmd: SessionCommands, config: &Config) -> Result<()> {
    match cmd {
        SessionCommands::Start { name, template } => {
            start_session(&name, template, config)?;
        }
        
        SessionCommands::Status => {
            show_session_status(config)?;
        }
        
        SessionCommands::Notes { text } => {
            add_session_notes(&text, config)?;
        }
        
        SessionCommands::End { report } => {
            end_session(report, config)?;
        }
        
        SessionCommands::List => {
            list_sessions(config)?;
        }
        
        SessionCommands::Show { session } => {
            show_session(&session, config)?;
        }
        
        SessionCommands::Export { session, output } => {
            export_session(&session, output, config)?;
        }
    }
    
    Ok(())
}

fn start_session(name: &str, template: Option<String>, config: &Config) -> Result<()> {
    utils::print_header(&format!("Starting Session: {}", name));
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    let session_id = Uuid::new_v4().to_string();
    let session = Session {
        id: session_id.clone(),
        name: name.to_string(),
        started_at: Utc::now(),
        ended_at: None,
        notes: Vec::new(),
        findings: Vec::new(),
        repositories_analyzed: Vec::new(),
    };
    
    // Save session
    save_current_session(&session, project, config)?;
    
    utils::print_success(&format!("Session '{}' started", name));
    println!("  ID: {}", session_id);
    println!("  Started: {}", session.started_at.format("%Y-%m-%d %H:%M:%S"));
    
    if let Some(tmpl) = template {
        println!("  Template: {}", tmpl);
    }
    
    Ok(())
}

fn show_session_status(config: &Config) -> Result<()> {
    utils::print_header("Current Session Status");
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    if let Ok(session) = load_current_session(project, config) {
        println!("{}: {}", "Session".bold(), session.name);
        println!("{}: {}", "ID".bold(), session.id);
        println!("{}: {}", "Started".bold(), session.started_at.format("%Y-%m-%d %H:%M:%S"));
        
        let duration = Utc::now().signed_duration_since(session.started_at);
        println!("{}: {}", "Duration".bold(), format_duration(duration));
        
        println!("{}: {}", "Notes".bold(), session.notes.len());
        println!("{}: {}", "Findings".bold(), session.findings.len());
        println!("{}: {}", "Repositories Analyzed".bold(), session.repositories_analyzed.len());
    } else {
        println!("No active session.");
        println!("\nUse {} to start a new session.", "topologist session start <name>".cyan());
    }
    
    Ok(())
}

fn add_session_notes(text: &str, config: &Config) -> Result<()> {
    let project = config.get_active_project()
        .context("No active project")?;
    
    let mut session = load_current_session(project, config)
        .context("No active session")?;
    
    session.notes.push(SessionNote {
        timestamp: Utc::now(),
        content: text.to_string(),
    });
    
    save_current_session(&session, project, config)?;
    
    utils::print_success("Note added to session");
    
    Ok(())
}

fn end_session(report: bool, config: &Config) -> Result<()> {
    utils::print_header("Ending Session");
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    let mut session = load_current_session(project, config)
        .context("No active session")?;
    
    session.ended_at = Some(Utc::now());
    
    // Archive session
    archive_session(&session, project, config)?;
    
    // Clear current session
    clear_current_session(project, config)?;
    
    utils::print_success(&format!("Session '{}' ended", session.name));
    
    if let Some(ended) = session.ended_at {
        let duration = ended.signed_duration_since(session.started_at);
        println!("  Duration: {}", format_duration(duration));
    }
    
    println!("  Notes: {}", session.notes.len());
    println!("  Findings: {}", session.findings.len());
    
    if report {
        generate_session_report(&session, project, config)?;
        utils::print_success("Report generated");
    }
    
    Ok(())
}

fn list_sessions(config: &Config) -> Result<()> {
    utils::print_header("Investigation Sessions");
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    let sessions_dir = get_sessions_directory(project, config)?;
    
    if !sessions_dir.exists() {
        println!("No sessions found.");
        return Ok(());
    }
    
    let mut sessions = Vec::new();
    
    for entry in fs::read_dir(&sessions_dir)? {
        let entry = entry?;
        let path = entry.path();
        
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(session) = serde_json::from_str::<Session>(&content) {
                    sessions.push(session);
                }
            }
        }
    }
    
    if sessions.is_empty() {
        println!("No sessions found.");
    } else {
        sessions.sort_by(|a, b| b.started_at.cmp(&a.started_at));
        
        for session in sessions {
            let duration = session.ended_at
                .map(|e| e.signed_duration_since(session.started_at))
                .map(format_duration)
                .unwrap_or_else(|| "In progress".to_string());
            
            println!("\n{}", session.name.bold());
            println!("  ID: {}", session.id);
            println!("  Started: {}", session.started_at.format("%Y-%m-%d %H:%M:%S"));
            println!("  Duration: {}", duration);
            println!("  Notes: {}", session.notes.len());
        }
    }
    
    Ok(())
}

fn show_session(session_id: &str, config: &Config) -> Result<()> {
    utils::print_header(&format!("Session: {}", session_id));
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    let session = load_session(session_id, project, config)?;
    
    println!("{}: {}", "Name".bold(), session.name);
    println!("{}: {}", "ID".bold(), session.id);
    println!("{}: {}", "Started".bold(), session.started_at.format("%Y-%m-%d %H:%M:%S"));
    
    if let Some(ended) = session.ended_at {
        println!("{}: {}", "Ended".bold(), ended.format("%Y-%m-%d %H:%M:%S"));
        let duration = ended.signed_duration_since(session.started_at);
        println!("{}: {}", "Duration".bold(), format_duration(duration));
    } else {
        println!("{}: {}", "Status".bold(), "In progress".yellow());
    }
    
    if !session.notes.is_empty() {
        println!("\n{}", "Notes:".bold());
        for note in &session.notes {
            println!("  [{}] {}", 
                note.timestamp.format("%H:%M:%S"),
                note.content
            );
        }
    }
    
    if !session.findings.is_empty() {
        println!("\n{}", "Findings:".bold());
        for finding in &session.findings {
            println!("  • {}", finding);
        }
    }
    
    if !session.repositories_analyzed.is_empty() {
        println!("\n{}", "Repositories Analyzed:".bold());
        for repo in &session.repositories_analyzed {
            println!("  • {}", repo);
        }
    }
    
    Ok(())
}

fn export_session(session_id: &str, output: Option<PathBuf>, config: &Config) -> Result<()> {
    utils::print_header(&format!("Exporting Session: {}", session_id));
    
    let project = config.get_active_project()
        .context("No active project")?;
    
    let session = load_session(session_id, project, config)?;
    
    let output_path = output.unwrap_or_else(|| {
        PathBuf::from(format!("session-{}-{}.json", 
            session.name.replace(' ', "-").to_lowercase(),
            session.started_at.format("%Y%m%d-%H%M%S")
        ))
    });
    
    let content = serde_json::to_string_pretty(&session)?;
    fs::write(&output_path, content)?;
    
    utils::print_success(&format!("Session exported to: {}", output_path.display()));
    
    Ok(())
}

// Helper functions

fn get_sessions_directory(project: &str, config: &Config) -> Result<PathBuf> {
    let sessions_dir = dirs::home_dir()
        .context("Failed to get home directory")?
        .join(".topologist")
        .join("projects")
        .join(project)
        .join("sessions");
    
    Ok(sessions_dir)
}

fn save_current_session(session: &Session, project: &str, config: &Config) -> Result<()> {
    let sessions_dir = get_sessions_directory(project, config)?;
    fs::create_dir_all(&sessions_dir)?;
    
    let current_file = sessions_dir.join("current.json");
    let content = serde_json::to_string_pretty(session)?;
    fs::write(current_file, content)?;
    
    Ok(())
}

fn load_current_session(project: &str, config: &Config) -> Result<Session> {
    let current_file = get_sessions_directory(project, config)?.join("current.json");
    
    if current_file.exists() {
        let content = fs::read_to_string(&current_file)?;
        Ok(serde_json::from_str(&content)?)
    } else {
        Err(anyhow::anyhow!("No active session"))
    }
}

fn clear_current_session(project: &str, config: &Config) -> Result<()> {
    let current_file = get_sessions_directory(project, config)?.join("current.json");
    
    if current_file.exists() {
        fs::remove_file(current_file)?;
    }
    
    Ok(())
}

fn archive_session(session: &Session, project: &str, config: &Config) -> Result<()> {
    let sessions_dir = get_sessions_directory(project, config)?;
    let archive_file = sessions_dir.join(format!("{}.json", session.id));
    
    let content = serde_json::to_string_pretty(session)?;
    fs::write(archive_file, content)?;
    
    // Also update session index
    update_session_index(session, project, config)?;
    
    Ok(())
}

fn update_session_index(session: &Session, project: &str, config: &Config) -> Result<()> {
    let sessions_dir = get_sessions_directory(project, config)?;
    let index_file = sessions_dir.join("session-index.json");
    
    let mut index = if index_file.exists() {
        let content = fs::read_to_string(&index_file)?;
        serde_json::from_str::<Vec<serde_json::Value>>(&content).unwrap_or_default()
    } else {
        Vec::new()
    };
    
    index.push(json!({
        "id": session.id,
        "name": session.name,
        "started_at": session.started_at.to_rfc3339(),
        "ended_at": session.ended_at.map(|e| e.to_rfc3339()),
        "notes_count": session.notes.len(),
        "findings_count": session.findings.len(),
    }));
    
    let content = serde_json::to_string_pretty(&index)?;
    fs::write(index_file, content)?;
    
    Ok(())
}

fn load_session(session_id: &str, project: &str, config: &Config) -> Result<Session> {
    // First check if it's the current session
    if let Ok(current) = load_current_session(project, config) {
        if current.id == session_id || current.name == session_id {
            return Ok(current);
        }
    }
    
    // Check archived sessions
    let sessions_dir = get_sessions_directory(project, config)?;
    
    // Try by ID
    let session_file = sessions_dir.join(format!("{}.json", session_id));
    if session_file.exists() {
        let content = fs::read_to_string(&session_file)?;
        return Ok(serde_json::from_str(&content)?);
    }
    
    // Try by name
    for entry in fs::read_dir(&sessions_dir)? {
        let entry = entry?;
        let path = entry.path();
        
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(session) = serde_json::from_str::<Session>(&content) {
                    if session.name == session_id {
                        return Ok(session);
                    }
                }
            }
        }
    }
    
    Err(anyhow::anyhow!("Session not found: {}", session_id))
}

fn generate_session_report(session: &Session, project: &str, config: &Config) -> Result<()> {
    let project_path = config.get_project_path(project)
        .context("Project path not found")?;
    
    let reports_dir = PathBuf::from(project_path)
        .join(".topologist")
        .join("reports");
    
    fs::create_dir_all(&reports_dir)?;
    
    let report_file = reports_dir.join(format!("session-{}-{}.md",
        session.name.replace(' ', "-").to_lowercase(),
        session.started_at.format("%Y%m%d-%H%M%S")
    ));
    
    let mut report = String::new();
    report.push_str(&format!("# Investigation Session: {}\n\n", session.name));
    report.push_str(&format!("**Session ID**: {}\n", session.id));
    report.push_str(&format!("**Started**: {}\n", session.started_at.format("%Y-%m-%d %H:%M:%S")));
    
    if let Some(ended) = session.ended_at {
        report.push_str(&format!("**Ended**: {}\n", ended.format("%Y-%m-%d %H:%M:%S")));
        let duration = ended.signed_duration_since(session.started_at);
        report.push_str(&format!("**Duration**: {}\n", format_duration(duration)));
    }
    
    report.push_str("\n## Notes\n\n");
    for note in &session.notes {
        report.push_str(&format!("- **[{}]** {}\n", 
            note.timestamp.format("%H:%M:%S"),
            note.content
        ));
    }
    
    if !session.findings.is_empty() {
        report.push_str("\n## Findings\n\n");
        for finding in &session.findings {
            report.push_str(&format!("- {}\n", finding));
        }
    }
    
    if !session.repositories_analyzed.is_empty() {
        report.push_str("\n## Repositories Analyzed\n\n");
        for repo in &session.repositories_analyzed {
            report.push_str(&format!("- {}\n", repo));
        }
    }
    
    fs::write(&report_file, report)?;
    
    println!("  Report: {}", report_file.display());
    
    Ok(())
}

fn format_duration(duration: chrono::Duration) -> String {
    let seconds = duration.num_seconds();
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let secs = seconds % 60;
    
    if hours > 0 {
        format!("{}h {}m {}s", hours, minutes, secs)
    } else if minutes > 0 {
        format!("{}m {}s", minutes, secs)
    } else {
        format!("{}s", secs)
    }
}