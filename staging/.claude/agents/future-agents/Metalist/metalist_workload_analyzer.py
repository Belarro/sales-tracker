#!/usr/bin/env python3
"""
Metalist Workload Analyzer
Intelligent workload classification and resource optimization
"""

import json
import subprocess
import time
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class WorkloadType(Enum):
    REMOTE_HEAVY = "remote_heavy"          # CPU-intensive, use all 48 threads
    REMOTE_PARALLEL = "remote_parallel"    # Parallel processing advantage
    REMOTE_CONTAINER = "remote_container"  # Container orchestration
    REMOTE_MEMORY = "remote_memory"        # Memory-intensive (>16GB)
    LOCAL_INTERACTIVE = "local_interactive" # Interactive development
    LOCAL_COORDINATION = "local_coordination" # Git, planning, communication
    HYBRID = "hybrid"                      # Benefits from both environments

@dataclass
class ResourceProfile:
    cpu_cores: int
    ram_gb: int
    disk_io: str  # "low", "medium", "high"
    network_io: str
    priority: str  # "low", "medium", "high", "critical"
    estimated_duration: str  # "seconds", "minutes", "hours"

@dataclass
class WorkloadAnalysis:
    command: str
    project: str
    workload_type: WorkloadType
    resource_profile: ResourceProfile
    confidence: float
    recommendation: str
    optimization_notes: List[str]

class MetalistWorkloadAnalyzer:
    def __init__(self):
        self.local_resources = self._detect_local_resources()
        self.remote_resources = {
            'cpu_cores': 48,  # AMD EPYC 9254
            'ram_gb': 377,    # Massive memory capacity
            'disk_gb': 879,   # NVMe storage
            'network_gbps': 10
        }
        
        # Load learning data if available
        self.performance_history = self._load_performance_history()
        
    def _detect_local_resources(self) -> Dict:
        """Detect local machine capabilities"""
        try:
            # Get CPU count
            cpu_count = os.cpu_count()
            
            # Get memory info (macOS)
            mem_output = subprocess.check_output(['sysctl', 'hw.memsize']).decode()
            mem_bytes = int(mem_output.split(':')[1].strip())
            mem_gb = mem_bytes // (1024**3)
            
            return {
                'cpu_cores': cpu_count,
                'ram_gb': mem_gb,
                'platform': 'macOS'
            }
        except:
            # Fallback defaults for macOS development machine
            return {
                'cpu_cores': 8,
                'ram_gb': 16,
                'platform': 'macOS'
            }
    
    def _load_performance_history(self) -> Dict:
        """Load historical performance data for learning"""
        history_file = Path.home() / '.metalist_performance.json'
        try:
            if history_file.exists():
                with open(history_file, 'r') as f:
                    return json.load(f)
        except:
            pass
        return {}
    
    def analyze_command(self, command: str, project_path: str = None) -> WorkloadAnalysis:
        """Analyze a command and determine optimal execution strategy"""
        
        # Extract project context
        if project_path:
            project = Path(project_path).name
        else:
            project = "unknown"
            
        # Command pattern matching
        workload_type, confidence = self._classify_workload_type(command, project_path)
        resource_profile = self._estimate_resource_requirements(command, workload_type)
        recommendation = self._generate_recommendation(workload_type, resource_profile)
        optimization_notes = self._generate_optimization_notes(command, workload_type)
        
        return WorkloadAnalysis(
            command=command,
            project=project,
            workload_type=workload_type,
            resource_profile=resource_profile,
            confidence=confidence,
            recommendation=recommendation,
            optimization_notes=optimization_notes
        )
    
    def _classify_workload_type(self, command: str, project_path: str = None) -> Tuple[WorkloadType, float]:
        """Classify workload based on command patterns"""
        
        cmd = command.lower()
        confidence = 0.7  # Base confidence
        
        # High-confidence CPU-intensive patterns
        cpu_intensive_patterns = [
            'cargo build --release',
            'make -j',
            'npm run build',
            'webpack',
            'gcc -O3',
            'rustc -O',
            'cargo bench'
        ]
        
        if any(pattern in cmd for pattern in cpu_intensive_patterns):
            return WorkloadType.REMOTE_HEAVY, 0.95
            
        # Parallel processing patterns
        parallel_patterns = [
            'cargo test',
            'pytest -n',
            'npm test',
            'make test',
            'go test -parallel'
        ]
        
        if any(pattern in cmd for pattern in parallel_patterns):
            return WorkloadType.REMOTE_PARALLEL, 0.9
            
        # Container orchestration
        container_patterns = [
            'docker build',
            'docker-compose',
            'kubectl',
            'helm',
            'docker run'
        ]
        
        if any(pattern in cmd for pattern in container_patterns):
            return WorkloadType.REMOTE_CONTAINER, 0.85
            
        # Memory-intensive patterns
        memory_patterns = [
            'machine learning',
            'tensorflow',
            'pytorch',
            'large dataset',
            'data processing',
            'video encoding',
            'image processing'
        ]
        
        if any(pattern in cmd for pattern in memory_patterns):
            return WorkloadType.REMOTE_MEMORY, 0.8
            
        # Interactive development
        interactive_patterns = [
            'code .',
            'vim ',
            'nano ',
            'edit',
            'claude',
            'repl'
        ]
        
        if any(pattern in cmd for pattern in interactive_patterns):
            return WorkloadType.LOCAL_INTERACTIVE, 0.9
            
        # Coordination tasks
        coordination_patterns = [
            'git ',
            'github',
            'slack',
            'email',
            'planning',
            'document'
        ]
        
        if any(pattern in cmd for pattern in coordination_patterns):
            return WorkloadType.LOCAL_COORDINATION, 0.85
            
        # Check project context for additional hints
        if project_path:
            project_files = self._analyze_project_files(project_path)
            if 'rust_heavy' in project_files:
                confidence += 0.1
                return WorkloadType.REMOTE_HEAVY, min(confidence, 0.95)
            elif 'web_frontend' in project_files:
                return WorkloadType.HYBRID, 0.7
                
        # Default classification with lower confidence
        return WorkloadType.HYBRID, 0.5
    
    def _analyze_project_files(self, project_path: str) -> List[str]:
        """Analyze project structure for workload hints"""
        hints = []
        
        try:
            project = Path(project_path)
            
            # Check for Rust projects
            if (project / 'Cargo.toml').exists():
                hints.append('rust_project')
                
                # Check for heavy compilation indicators
                cargo_toml = (project / 'Cargo.toml').read_text()
                if any(dep in cargo_toml for dep in ['tokio', 'async', 'rayon', 'crossbeam']):
                    hints.append('rust_heavy')
                    
            # Check for Node.js projects
            if (project / 'package.json').exists():
                hints.append('nodejs_project')
                
                package_json = json.loads((project / 'package.json').read_text())
                if 'webpack' in package_json.get('dependencies', {}):
                    hints.append('webpack_build')
                    
            # Check for Python ML projects
            if (project / 'requirements.txt').exists():
                reqs = (project / 'requirements.txt').read_text()
                if any(lib in reqs for lib in ['tensorflow', 'pytorch', 'scikit-learn']):
                    hints.append('ml_project')
                    
        except Exception:
            pass
            
        return hints
    
    def _estimate_resource_requirements(self, command: str, workload_type: WorkloadType) -> ResourceProfile:
        """Estimate resource requirements based on workload type"""
        
        profiles = {
            WorkloadType.REMOTE_HEAVY: ResourceProfile(
                cpu_cores=24,  # Use most of EPYC cores
                ram_gb=32,     # Generous but not excessive
                disk_io="high",
                network_io="medium",
                priority="high",
                estimated_duration="minutes"
            ),
            WorkloadType.REMOTE_PARALLEL: ResourceProfile(
                cpu_cores=16,
                ram_gb=16,
                disk_io="medium",
                network_io="low",
                priority="medium",
                estimated_duration="minutes"
            ),
            WorkloadType.REMOTE_CONTAINER: ResourceProfile(
                cpu_cores=8,
                ram_gb=64,  # Containers can be memory-hungry
                disk_io="high",
                network_io="high",
                priority="medium",
                estimated_duration="minutes"
            ),
            WorkloadType.REMOTE_MEMORY: ResourceProfile(
                cpu_cores=8,
                ram_gb=128,  # Leverage server's massive RAM
                disk_io="medium",
                network_io="low",
                priority="high",
                estimated_duration="hours"
            ),
            WorkloadType.LOCAL_INTERACTIVE: ResourceProfile(
                cpu_cores=1,
                ram_gb=2,
                disk_io="low",
                network_io="low",
                priority="critical",  # Responsiveness is key
                estimated_duration="seconds"
            ),
            WorkloadType.LOCAL_COORDINATION: ResourceProfile(
                cpu_cores=1,
                ram_gb=1,
                disk_io="low",
                network_io="medium",
                priority="medium",
                estimated_duration="seconds"
            ),
            WorkloadType.HYBRID: ResourceProfile(
                cpu_cores=4,
                ram_gb=8,
                disk_io="medium",
                network_io="medium",
                priority="medium",
                estimated_duration="minutes"
            )
        }
        
        return profiles.get(workload_type, profiles[WorkloadType.HYBRID])
    
    def _generate_recommendation(self, workload_type: WorkloadType, profile: ResourceProfile) -> str:
        """Generate execution recommendation"""
        
        if workload_type in [WorkloadType.REMOTE_HEAVY, WorkloadType.REMOTE_PARALLEL, 
                           WorkloadType.REMOTE_CONTAINER, WorkloadType.REMOTE_MEMORY]:
            return f"Execute on nuru.tools server ({profile.cpu_cores} cores, {profile.ram_gb}GB RAM)"
        elif workload_type in [WorkloadType.LOCAL_INTERACTIVE, WorkloadType.LOCAL_COORDINATION]:
            return "Execute locally for optimal responsiveness"
        else:
            return "Analyze specific command context for optimal placement"
    
    def _generate_optimization_notes(self, command: str, workload_type: WorkloadType) -> List[str]:
        """Generate specific optimization suggestions"""
        notes = []
        
        if workload_type == WorkloadType.REMOTE_HEAVY:
            notes.extend([
                "Use all available CPU cores for compilation",
                "Consider ccache for faster rebuilds",
                "Monitor temperature and throttling"
            ])
        elif workload_type == WorkloadType.REMOTE_PARALLEL:
            notes.extend([
                "Enable parallel test execution",
                "Use job slots efficiently",
                "Consider test result caching"
            ])
        elif workload_type == WorkloadType.REMOTE_MEMORY:
            notes.extend([
                "Leverage server's 377GB RAM advantage",
                "Consider memory mapping for large datasets",
                "Monitor memory usage patterns"
            ])
        elif workload_type == WorkloadType.LOCAL_INTERACTIVE:
            notes.extend([
                "Keep on local machine for responsiveness",
                "Minimize network latency",
                "Use local caching when possible"
            ])
            
        return notes

def main():
    """CLI interface for workload analysis"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: metalist_workload_analyzer.py <command> [project_path]")
        sys.exit(1)
        
    command = sys.argv[1]
    project_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    analyzer = MetalistWorkloadAnalyzer()
    analysis = analyzer.analyze_command(command, project_path)
    
    print(f"🔍 Workload Analysis for: {command}")
    print(f"📁 Project: {analysis.project}")
    print(f"🏷️  Type: {analysis.workload_type.value}")
    print(f"🎯 Confidence: {analysis.confidence:.2f}")
    print(f"💡 Recommendation: {analysis.recommendation}")
    print(f"⚙️  Resources: {analysis.resource_profile.cpu_cores} cores, {analysis.resource_profile.ram_gb}GB RAM")
    
    if analysis.optimization_notes:
        print("🚀 Optimization Notes:")
        for note in analysis.optimization_notes:
            print(f"   • {note}")

if __name__ == "__main__":
    main()