use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Repository {
    pub path: String,
    pub name: String,
    pub description: Option<String>,
    pub domain: String,
    pub repo_type: RepositoryType,
    pub languages: Vec<String>,
    pub build_system: BuildSystem,
    pub dependencies: Vec<Dependency>,
    pub dependents: Vec<String>,
    pub integration_points: Vec<IntegrationPoint>,
    pub tags: Vec<String>,
    pub criticality: CriticalityLevel,
    pub maintenance_status: MaintenanceStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RepositoryType {
    Library,
    Application,
    Service,
    Tool,
    Documentation,
    Configuration,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BuildSystem {
    Cargo,
    Make,
    Npm,
    Gradle,
    Maven,
    CMake,
    Multiple,
    None,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    pub repo: String,
    pub dep_type: DependencyType,
    pub interface: InterfaceType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencyType {
    Compile,
    Runtime,
    Test,
    Optional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterfaceType {
    Library,
    RestApi,
    Grpc,
    Database,
    FileSystem,
    Network,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationPoint {
    pub point_type: String,
    pub description: String,
    pub port: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CriticalityLevel {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaintenanceStatus {
    Active,
    Maintenance,
    Deprecated,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitStatus {
    pub initialized: bool,
    pub branch: Option<String>,
    pub remote_tracking: Option<String>,
    pub ahead_behind: Option<AheadBehind>,
    pub uncommitted_changes: usize,
    pub untracked_files: usize,
    pub staged_changes: usize,
    pub has_conflicts: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AheadBehind {
    pub ahead: usize,
    pub behind: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryHealth {
    pub score: u8,
    pub status: HealthStatus,
    pub issues: Vec<HealthIssue>,
    pub warnings: Vec<HealthWarning>,
    pub last_assessment: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealthStatus {
    Healthy,
    ChangesPending,
    IssuesDetected,
    Critical,
    Uninitialized,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthIssue {
    pub severity: IssueSeverity,
    pub description: String,
    pub resolution: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthWarning {
    pub warning_type: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMetadata {
    pub name: String,
    pub description: String,
    pub repository_count: usize,
    pub primary_languages: Vec<String>,
    pub architecture_pattern: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub name: String,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub notes: Vec<SessionNote>,
    pub findings: Vec<String>,
    pub repositories_analyzed: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionNote {
    pub timestamp: DateTime<Utc>,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationMatrix {
    pub metadata: MatrixMetadata,
    pub repositories: Vec<Repository>,
    pub dependencies: Vec<RepositoryDependency>,
    pub build_coordination: BuildCoordination,
    pub failure_analysis: FailureAnalysis,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatrixMetadata {
    pub project: String,
    pub version: String,
    pub updated: DateTime<Utc>,
    pub analysis_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryDependency {
    pub source: String,
    pub target: String,
    pub dependency_type: DependencyType,
    pub interface_type: InterfaceType,
    pub coupling_strength: CouplingStrength,
    pub data_flow: DataFlow,
    pub failure_impact: FailureImpact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CouplingStrength {
    Strong,
    Medium,
    Weak,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataFlow {
    Bidirectional,
    UnidirectionalInbound,
    UnidirectionalOutbound,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FailureImpact {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildCoordination {
    pub build_order: Vec<String>,
    pub parallel_groups: Vec<Vec<String>>,
    pub build_dependencies: HashMap<String, Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailureAnalysis {
    pub critical_path_repositories: Vec<String>,
    pub single_points_of_failure: Vec<String>,
    pub cascade_failure_risks: Vec<CascadeRisk>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CascadeRisk {
    pub trigger: String,
    pub affected_repositories: Vec<String>,
    pub impact_severity: String,
}