use thiserror::Error;

#[derive(Error, Debug)]
pub enum TopologistError {
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("Repository error: {0}")]
    Repository(String),
    
    #[error("Agent error: {0}")]
    Agent(String),
    
    #[error("Session error: {0}")]
    Session(String),
    
    #[error("Sync error: {0}")]
    Sync(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("Git error: {0}")]
    Git(#[from] git2::Error),
    
    #[error("Unknown error: {0}")]
    Unknown(String),
}

pub type Result<T> = std::result::Result<T, TopologistError>;