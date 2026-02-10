#!/usr/bin/env python3
"""
Agent Switch Optimizer
Optimizes agent switching workflows with state preservation and handoff protocols
"""

import json
import time
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any
from pathlib import Path

@dataclass
class AgentState:
    """Represents the current state of an agent session"""
    agent_name: str
    timestamp: float
    working_directory: str
    active_todos: List[Dict[str, str]]
    context_summary: str
    key_decisions: List[str]
    current_focus: str
    handoff_notes: str = ""

class AgentSwitchOptimizer:
    """Optimizes agent switching with minimal context loss"""
    
    def __init__(self, agents_dir: str = "/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS"):
        self.agents_dir = Path(agents_dir)
        self.state_file = self.agents_dir / "session_state.json"
        self.current_state: Optional[AgentState] = None
        
    def capture_state(self, agent_name: str, context: Dict[str, Any]) -> AgentState:
        """Capture current agent state before switching"""
        state = AgentState(
            agent_name=agent_name,
            timestamp=time.time(),
            working_directory=context.get("working_dir", ""),
            active_todos=context.get("todos", []),
            context_summary=context.get("summary", ""),
            key_decisions=context.get("decisions", []),
            current_focus=context.get("focus", ""),
            handoff_notes=context.get("handoff_notes", "")
        )
        
        self._save_state(state)
        return state
    
    def prepare_handoff(self, target_agent: str, context: str = "") -> Dict[str, Any]:
        """Prepare optimized handoff package for target agent"""
        if not self.current_state:
            return {"error": "No current state to handoff"}
            
        handoff_package = {
            "previous_agent": self.current_state.agent_name,
            "timestamp": self.current_state.timestamp,
            "context_summary": self.current_state.context_summary,
            "active_todos": self.current_state.active_todos,
            "key_decisions": self.current_state.key_decisions,
            "current_focus": self.current_state.current_focus,
            "handoff_context": context,
            "target_agent": target_agent,
            "switch_reason": context
        }
        
        return handoff_package
    
    def optimize_switch_sequence(self, agents: List[str], task_context: str) -> List[Dict[str, str]]:
        """Generate optimized agent switching sequence for complex tasks"""
        sequence = []
        
        # Analysis phase
        if "Analyst" in agents:
            sequence.append({
                "agent": "Analyst",
                "purpose": "Initial analysis and requirements gathering",
                "handoff_focus": "problem decomposition and scope definition"
            })
        
        # Architecture phase
        if "Architect" in agents:
            sequence.append({
                "agent": "Architect", 
                "purpose": "System design and technical planning",
                "handoff_focus": "implementation strategy and component design"
            })
        
        # Implementation phase
        implementation_agents = [a for a in agents if a in ["Coder", "Backender", "Frontender"]]
        for agent in implementation_agents:
            sequence.append({
                "agent": agent,
                "purpose": f"Implementation using {agent} expertise",
                "handoff_focus": "code implementation and feature development"
            })
        
        # Optimization phase
        if "Optimizer" in agents:
            sequence.append({
                "agent": "Optimizer",
                "purpose": "Performance optimization and code cleanup",
                "handoff_focus": "efficiency improvements and dead code removal"
            })
        
        # Testing phase
        if "Tester" in agents:
            sequence.append({
                "agent": "Tester",
                "purpose": "Quality assurance and testing",
                "handoff_focus": "test coverage and validation"
            })
        
        return sequence
    
    def generate_switch_command(self, target_agent: str, context: str = "") -> str:
        """Generate optimized switch command with context preservation"""
        handoff = self.prepare_handoff(target_agent, context)
        
        return f"""
# Optimized Agent Switch Protocol

## Previous Context
- Agent: {handoff.get('previous_agent', 'Unknown')}
- Focus: {handoff.get('current_focus', 'None specified')}
- Key Decisions: {', '.join(handoff.get('key_decisions', []))}

## Active State Transfer
- Todos: {len(handoff.get('active_todos', []))} items pending
- Context: {handoff.get('context_summary', 'No summary available')}

## Switch Command
/agent {target_agent}

## Handoff Message
Continuing from {handoff.get('previous_agent', 'previous agent')} with focus on: {context}

Previous context: {handoff.get('context_summary', 'See above for context')}
Active todos: {len(handoff.get('active_todos', []))} items to continue
"""
    
    def _save_state(self, state: AgentState):
        """Save current state to persistent storage"""
        self.current_state = state
        
        try:
            with open(self.state_file, 'w') as f:
                json.dump(asdict(state), f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save state: {e}")
    
    def load_previous_state(self) -> Optional[AgentState]:
        """Load previous session state if available"""
        if not self.state_file.exists():
            return None
            
        try:
            with open(self.state_file, 'r') as f:
                data = json.load(f)
                return AgentState(**data)
        except Exception as e:
            print(f"Warning: Could not load previous state: {e}")
            return None

# CLI Interface
if __name__ == "__main__":
    import sys
    
    optimizer = AgentSwitchOptimizer()
    
    if len(sys.argv) < 2:
        print("Usage: agent_switch_optimizer.py <command> [args...]")
        print("Commands:")
        print("  switch <agent> [context]  - Generate optimized switch command")
        print("  sequence <agents...>      - Generate optimal switching sequence")
        print("  state                     - Show current state")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "switch":
        if len(sys.argv) < 3:
            print("Usage: switch <agent> [context]")
            sys.exit(1)
        
        target_agent = sys.argv[2]
        context = " ".join(sys.argv[3:]) if len(sys.argv) > 3 else ""
        
        print(optimizer.generate_switch_command(target_agent, context))
    
    elif command == "sequence":
        agents = sys.argv[2:]
        if not agents:
            print("Usage: sequence <agent1> <agent2> ...")
            sys.exit(1)
        
        sequence = optimizer.optimize_switch_sequence(agents, "")
        print("Optimal Agent Switching Sequence:")
        for i, step in enumerate(sequence, 1):
            print(f"{i}. {step['agent']} - {step['purpose']}")
            print(f"   Handoff: {step['handoff_focus']}")
    
    elif command == "state":
        state = optimizer.load_previous_state()
        if state:
            print(f"Current Agent: {state.agent_name}")
            print(f"Focus: {state.current_focus}")
            print(f"Active Todos: {len(state.active_todos)}")
            print(f"Last Update: {time.ctime(state.timestamp)}")
        else:
            print("No previous state found")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)