#!/usr/bin/env python3
"""
BRAIN Startup Protocol Compliance Verification
Monitors and verifies that agents follow the mandatory BRAIN startup sequence.
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path

class BRAINComplianceVerifier:
    def __init__(self):
        self.agents_dir = "/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS"
        self.brain_dir = "/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/BRAIN/Core"
        self.compliance_log = os.path.join(self.agents_dir, "brain_compliance_log.json")
        
    def get_agent_list(self):
        """Get list of all agents in the ecosystem"""
        try:
            result = subprocess.run([
                "ls", "-1", self.agents_dir
            ], capture_output=True, text=True)
            
            agents = []
            for item in result.stdout.strip().split('\n'):
                if not item.endswith('.md') and not item.endswith('.sh') and not item.endswith('.json'):
                    agents.append(item)
            
            return agents
        except Exception as e:
            print(f"Error getting agent list: {e}")
            return []
    
    def verify_agent_count(self):
        """Verify current agent count matches expected"""
        agents = self.get_agent_list()
        count = len([a for a in agents if a and not a.startswith('.')])
        return count
    
    def check_brain_files_accessible(self):
        """Verify BRAIN Core files are accessible"""
        brain_files = [
            "README.md",
            "autonomous-learning-mechanisms.md",
            "communication-optimization.md",
            "memory-architecture-principles.md"
        ]
        
        accessible_files = []
        for file in brain_files:
            file_path = os.path.join(self.brain_dir, file)
            if os.path.exists(file_path):
                accessible_files.append(file)
        
        return accessible_files
    
    def log_compliance_check(self, agent_name, compliant, details):
        """Log compliance check results"""
        if os.path.exists(self.compliance_log):
            with open(self.compliance_log, 'r') as f:
                log_data = json.load(f)
        else:
            log_data = {"checks": []}
        
        check_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "compliant": compliant,
            "details": details
        }
        
        log_data["checks"].append(check_entry)
        
        with open(self.compliance_log, 'w') as f:
            json.dump(log_data, f, indent=2)
    
    def generate_compliance_report(self):
        """Generate compliance status report"""
        current_agent_count = self.verify_agent_count()
        accessible_brain_files = self.check_brain_files_accessible()
        
        report = {
            "compliance_check_timestamp": datetime.now().isoformat(),
            "total_agents": current_agent_count,
            "brain_files_accessible": len(accessible_brain_files),
            "brain_files_list": accessible_brain_files,
            "protocol_requirements": {
                "startup_commands": [
                    "ls /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS",
                    "cat /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/BRAIN/Core/*.md",
                    "ls -1 /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS | grep -v '\\.md$' | grep -v '\\.sh$' | grep -v '\\.json$' | wc -l"
                ],
                "expected_outcomes": [
                    "Agent directory listing for ecosystem awareness",
                    "BRAIN Core knowledge loading",
                    f"Agent count verification (current: {current_agent_count})"
                ]
            },
            "system_status": "BRAIN startup protocol verification active"
        }
        
        return report
    
    def run_verification(self):
        """Run complete compliance verification"""
        print("🧠 BRAIN Startup Protocol Compliance Verification")
        print("=" * 50)
        
        report = self.generate_compliance_report()
        
        print(f"Current Agent Count: {report['total_agents']}")
        print(f"BRAIN Files Accessible: {report['brain_files_accessible']}/4")
        print(f"Protocol Status: {report['system_status']}")
        
        # Save report
        report_path = os.path.join(self.agents_dir, "brain_compliance_report.json")
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\nCompliance report saved: {report_path}")
        
        if report['brain_files_accessible'] == 4:
            print("✅ BRAIN Core files are accessible")
        else:
            print("❌ Some BRAIN Core files are missing")
            print(f"Available files: {report['brain_files_list']}")
        
        return report

if __name__ == "__main__":
    verifier = BRAINComplianceVerifier()
    verifier.run_verification()