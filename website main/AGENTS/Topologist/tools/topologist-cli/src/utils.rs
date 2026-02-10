use colored::*;
use console::{style, Term};
use std::io::{self, Write};

pub fn print_header(title: &str) {
    let term = Term::stdout();
    let width = term.size().1 as usize;
    let padding = if width > title.len() + 4 {
        (width - title.len() - 4) / 2
    } else {
        0
    };
    
    println!();
    println!("{}", "═".repeat(width).bright_blue());
    println!("{}{}{}", 
        " ".repeat(padding),
        format!("  {}  ", title).bold().bright_cyan(),
        " ".repeat(padding)
    );
    println!("{}", "═".repeat(width).bright_blue());
    println!();
}

pub fn print_separator() {
    let term = Term::stdout();
    let width = term.size().1 as usize;
    println!("{}", "─".repeat(width).dimmed());
}

pub fn print_success(message: &str) {
    println!("{} {}", "✓".green().bold(), message);
}

pub fn print_error(message: &str) {
    eprintln!("{} {}", "✗".red().bold(), message);
}

pub fn print_warning(message: &str) {
    println!("{} {}", "⚠".yellow().bold(), message);
}

pub fn print_info(message: &str) {
    println!("{} {}", "ℹ".blue().bold(), message);
}

pub fn prompt(message: &str) -> io::Result<String> {
    print!("{} ", format!("{}:", message).yellow());
    io::stdout().flush()?;
    
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    Ok(input.trim().to_string())
}

pub fn confirm(message: &str) -> io::Result<bool> {
    print!("{} {} ", format!("{}?", message).yellow(), "[y/N]".dimmed());
    io::stdout().flush()?;
    
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    
    Ok(input.trim().to_lowercase() == "y" || input.trim().to_lowercase() == "yes")
}

pub fn format_size(bytes: u64) -> String {
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

pub fn format_duration(seconds: u64) -> String {
    if seconds < 60 {
        format!("{}s", seconds)
    } else if seconds < 3600 {
        format!("{}m {}s", seconds / 60, seconds % 60)
    } else if seconds < 86400 {
        format!("{}h {}m", seconds / 3600, (seconds % 3600) / 60)
    } else {
        format!("{}d {}h", seconds / 86400, (seconds % 86400) / 3600)
    }
}

pub fn truncate_path(path: &str, max_len: usize) -> String {
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

pub fn create_progress_bar(total: u64, message: &str) -> indicatif::ProgressBar {
    let pb = indicatif::ProgressBar::new(total);
    pb.set_style(
        indicatif::ProgressStyle::default_bar()
            .template("[{elapsed_precise}] {bar:40.cyan/blue} {pos:>3}/{len:3} {msg}")
            .unwrap()
            .progress_chars("##-")
    );
    pb.set_message(message.to_string());
    pb
}

pub fn create_spinner(message: &str) -> indicatif::ProgressBar {
    let spinner = indicatif::ProgressBar::new_spinner();
    spinner.set_style(
        indicatif::ProgressStyle::default_spinner()
            .template("{spinner:.green} {msg}")
            .unwrap()
    );
    spinner.set_message(message.to_string());
    spinner.enable_steady_tick(std::time::Duration::from_millis(100));
    spinner
}