use anyhow::Result;
use std::process::Command;
use std::path::Path;
use std::fs;
use colored::*;

fn main() -> Result<()> {
    println!("{}", "🔧 Building Rust agent management tools...".blue());
    
    // Ensure we're in the right directory
    let current_dir = std::env::current_dir()?;
    println!("Building in: {}", current_dir.display());
    
    // Build the project
    let output = Command::new("cargo")
        .arg("build")
        .arg("--release")
        .arg("--bins")
        .output()?;
        
    if !output.status.success() {
        println!("{}", "❌ Build failed!".red());
        println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
        println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
        return Err(anyhow::anyhow!("Cargo build failed"));
    }
    
    println!("{}", "✅ Build successful!".green());
    
    // Create bin directory if it doesn't exist
    let bin_dir = Path::new("bin");
    if !bin_dir.exists() {
        fs::create_dir_all(bin_dir)?;
        println!("Created bin/ directory");
    }
    
    // Copy binaries to bin directory for easy access
    let target_dir = Path::new("target/release");
    let binaries = ["sync-agent-indices", "update-agent-registry"];
    
    for binary in &binaries {
        let src = target_dir.join(binary);
        let dst = bin_dir.join(binary);
        
        if src.exists() {
            fs::copy(&src, &dst)?;
            println!("Copied {} to bin/", binary);
        } else {
            println!("{}", format!("Warning: {} not found in target/release/", binary).yellow());
        }
    }
    
    println!();
    println!("{}", "🎉 Build complete!".green());
    println!("Binaries available in: ./bin/");
    println!();
    println!("Usage:");
    println!("  ./bin/sync-agent-indices [--check]");
    println!("  ./bin/update-agent-registry <name> <role> <description>");
    println!();
    println!("Or install globally with:");
    println!("  cargo install --path .");
    
    Ok(())
}