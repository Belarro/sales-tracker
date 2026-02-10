# Approval Gates - Native Mode Technical Architecture

**Date**: October 8, 2025
**Version**: 1.0
**Status**: ARCHITECTURE DESIGN
**Agent**: Architect
**Context**: Team SDK native mode integration with Claude Code

---

## Executive Summary

This document defines the technical architecture for implementing approval gates in Team SDK native mode. The design leverages Claude Agent SDK's PreToolUse hook and Claude Code's Task tool for conversational approval flows.

**Core Challenge**: Native mode has no blocking readline prompts. Approval must happen through conversational turns with Claude Code UI.

**Solution**: Use SDK hooks to pause execution, present approval request to Claude Code, wait for user response via query cycle, then resume or reject.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Component Design](#2-component-design)
3. [SDK Integration Strategy](#3-sdk-integration-strategy)
4. [Data Flow & State Management](#4-data-flow--state-management)
5. [Native vs CLI Architecture](#5-native-vs-cli-architecture)
6. [Implementation Phases](#6-implementation-phases)
7. [Technical Risks & Mitigations](#7-technical-risks--mitigations)
8. [API Specifications](#8-api-specifications)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code UI                           │
│  • Displays approval requests as conversational messages        │
│  • Renders action buttons (Approve/Deny/Configure)              │
│  • Captures user response (button click or text)                │
└────────────────────────────┬────────────────────────────────────┘
                             │ Task tool
                             │ query() cycle
                             v
┌─────────────────────────────────────────────────────────────────┐
│                    Team SDK Orchestrator                        │
│  • Coordinates agent execution                                  │
│  • Registers PreToolUse hook                                    │
│  • Manages approval flow state                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│                   Approval Gate Manager                         │
│  • Evaluates operations against rules                           │
│  • Generates approval requests                                  │
│  • Processes user responses                                     │
│  • Manages configuration and whitelist                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│                    Approval Evaluator                           │
│  • Category detection (file ops, commands, cost, delegation)    │
│  • Threshold evaluation                                         │
│  • Severity calculation                                         │
│  • Whitelist/blacklist checking                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│                   Configuration Store                           │
│  • .team-sdk-config.json (persistent)                           │
│  • In-memory cache (runtime)                                    │
│  • Whitelist/blacklist rules                                    │
│  • User preferences                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Interaction Flow

```
1. User invokes agent via Claude Code
   ↓
2. Task tool delegates to Team SDK
   ↓
3. Orchestrator begins agent execution
   ↓
4. Agent attempts tool use (Write, Bash, etc.)
   ↓
5. PreToolUse hook intercepts
   ↓
6. Approval Evaluator checks rules
   ↓
7a. Auto-approved → Tool executes
7b. Needs approval → Generate request
   ↓
8. Approval request returned to Claude Code
   ↓
9. Claude Code displays conversational prompt
   ↓
10. User responds (Approve/Deny/Configure)
   ↓
11. Response captured in next query cycle
   ↓
12. Approval Manager processes response
   ↓
13a. Approved → Tool executes
13b. Denied → Error thrown, operation cancelled
13c. Configure → Update config, re-evaluate
```

---

## 2. Component Design

### 2.1 Core Components

#### 2.1.1 NativeApprovalGate

**Purpose**: Main approval gate implementation for native mode

**Responsibilities**:
- Register PreToolUse hook with SDK
- Intercept tool use attempts
- Generate approval requests
- Process user responses
- Manage approval state

**Interface**:
```typescript
export class NativeApprovalGate {
  constructor(config: ApprovalGateConfig);

  /**
   * Register with SDK hooks
   * Called during orchestrator initialization
   */
  register(orchestrator: TeamOrchestrator): void;

  /**
   * Evaluate if approval is needed
   * Called from PreToolUse hook
   */
  async evaluateToolUse(
    toolName: string,
    toolInput: any,
    context: ApprovalContext
  ): Promise<ApprovalDecision>;

  /**
   * Generate approval request message
   * Returns structured message for Claude Code
   */
  generateApprovalRequest(
    operation: Operation,
    evaluation: ApprovalEvaluation
  ): ApprovalRequest;

  /**
   * Process user response
   * Called when user responds to approval prompt
   */
  async processResponse(
    requestId: string,
    response: ApprovalResponse
  ): Promise<ApprovalDecision>;

  /**
   * Update configuration
   */
  updateConfig(changes: ConfigUpdate): void;
}
```

#### 2.1.2 ApprovalEvaluator

**Purpose**: Evaluate operations against approval rules

**Responsibilities**:
- Detect approval category (file ops, commands, etc.)
- Calculate severity level
- Check whitelist/blacklist
- Compute timeout duration

**Interface**:
```typescript
export class ApprovalEvaluator {
  constructor(config: ApprovalGateConfig);

  /**
   * Evaluate if approval is needed
   */
  evaluate(
    toolName: string,
    toolInput: any,
    context: ApprovalContext
  ): ApprovalEvaluation;

  /**
   * Check whitelist/blacklist
   */
  checkWhitelist(operation: Operation): WhitelistResult;

  /**
   * Calculate severity
   */
  calculateSeverity(operation: Operation): Severity;

  /**
   * Determine timeout
   */
  determineTimeout(severity: Severity): number;
}
```

#### 2.1.3 ApprovalRequestFormatter

**Purpose**: Format approval requests for Claude Code display

**Responsibilities**:
- Generate conversational message text
- Structure data for UI rendering
- Format cost estimates
- Create action button specifications

**Interface**:
```typescript
export class ApprovalRequestFormatter {
  /**
   * Format approval request for native mode
   */
  format(
    operation: Operation,
    evaluation: ApprovalEvaluation
  ): ApprovalRequest;

  /**
   * Format file operation details
   */
  formatFileOperation(operation: FileOperation): string;

  /**
   * Format command execution details
   */
  formatCommandExecution(operation: CommandOperation): string;

  /**
   * Format cost breakdown
   */
  formatCostEstimate(cost: CostEstimate): string;
}
```

#### 2.1.4 ApprovalStateManager

**Purpose**: Manage approval request state and timeouts

**Responsibilities**:
- Track pending approval requests
- Manage timeout timers
- Handle concurrent requests
- Store approval history

**Interface**:
```typescript
export class ApprovalStateManager {
  constructor();

  /**
   * Register pending approval
   */
  registerRequest(request: ApprovalRequest): string;

  /**
   * Get pending request by ID
   */
  getRequest(requestId: string): ApprovalRequest | undefined;

  /**
   * Resolve request with response
   */
  resolveRequest(
    requestId: string,
    response: ApprovalResponse
  ): void;

  /**
   * Timeout request
   */
  timeoutRequest(requestId: string): void;

  /**
   * Clear completed requests
   */
  cleanup(): void;
}
```

#### 2.1.5 ConfigurationManager

**Purpose**: Manage approval gate configuration

**Responsibilities**:
- Load/save configuration file
- Validate configuration changes
- Manage whitelist/blacklist
- Handle configuration updates

**Interface**:
```typescript
export class ConfigurationManager {
  constructor(configPath: string);

  /**
   * Load configuration from file
   */
  loadConfig(): ApprovalGateConfig;

  /**
   * Save configuration to file
   */
  saveConfig(config: ApprovalGateConfig): void;

  /**
   * Update specific settings
   */
  updateSettings(updates: Partial<ApprovalGateConfig>): void;

  /**
   * Add to whitelist
   */
  addToWhitelist(rule: WhitelistRule): void;

  /**
   * Add to blacklist
   */
  addToBlacklist(rule: BlacklistRule): void;

  /**
   * Validate configuration
   */
  validate(config: ApprovalGateConfig): ValidationResult;
}
```

### 2.2 Type Definitions

```typescript
/**
 * Approval gate configuration
 */
export interface ApprovalGateConfig {
  // Global settings
  enabled: boolean;
  defaultTimeout: number;
  autoApprove: boolean;
  verbose: boolean;

  // Thresholds
  thresholds: {
    fileSizeKB: number;
    batchOperationCount: number;
    tokenLimit: number;
    costLimitUSD: number;
    agentDelegationLimit: number;
  };

  // Timeout behavior
  timeouts: {
    lowSeverity: number;
    mediumSeverity: number;
    highSeverity: number;
    criticalSeverity: number;
    defaultAction: 'deny' | 'approve';
    warningSeconds: number;
    allowExtension: boolean;
  };

  // Whitelist/blacklist
  whitelists: {
    directories: string[];
    filePatterns: string[];
    commands: string[];
    commandPatterns: string[];
    agents: string[];
  };

  blacklists: {
    commands: string[];
    agents: string[];
  };

  // Critical files (always require approval)
  criticalFiles: string[];
}

/**
 * Approval context (operation metadata)
 */
export interface ApprovalContext {
  agentName: string;
  toolName: string;
  toolInput: any;
  sessionId: string;
  timestamp: number;
  previousApprovals: number;
}

/**
 * Approval evaluation result
 */
export interface ApprovalEvaluation {
  needsApproval: boolean;
  category: ApprovalCategory;
  severity: Severity;
  reason: string;
  timeout: number;
  whitelistMatch?: string;
  blacklistMatch?: string;
}

/**
 * Approval categories
 */
export type ApprovalCategory =
  | 'file_operation'
  | 'command_execution'
  | 'cost_threshold'
  | 'agent_delegation'
  | 'destructive_operation';

/**
 * Severity levels
 */
export type Severity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Operation abstraction
 */
export interface Operation {
  type: ApprovalCategory;
  description: string;
  impact: string;
  risk: string;
  details: OperationDetails;
}

export type OperationDetails =
  | FileOperationDetails
  | CommandOperationDetails
  | CostOperationDetails
  | DelegationOperationDetails
  | DestructiveOperationDetails;

export interface FileOperationDetails {
  files: FileInfo[];
  totalSize: number;
  isNew: boolean;
  isCritical: boolean;
}

export interface FileInfo {
  path: string;
  size: number;
  operation: 'create' | 'modify' | 'delete';
}

export interface CommandOperationDetails {
  command: string;
  args: string[];
  isDangerous: boolean;
  isNetwork: boolean;
  estimatedDuration?: number;
}

export interface CostOperationDetails {
  estimatedTokens: number;
  estimatedCost: number;
  threshold: number;
  breakdown: CostEstimate;
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  dollars: number;
  cacheSavings?: number;
}

export interface DelegationOperationDetails {
  targetAgent: string;
  delegationChain: string[];
  estimatedCost: number;
  isRecursive: boolean;
}

export interface DestructiveOperationDetails {
  resources: string[];
  isReversible: boolean;
  backupAvailable: boolean;
  safetyChecks: SafetyCheck[];
}

export interface SafetyCheck {
  check: string;
  passed: boolean;
  message: string;
}

/**
 * Approval request (sent to user)
 */
export interface ApprovalRequest {
  requestId: string;
  type: 'approval_request';
  operation: Operation;
  severity: Severity;
  category: ApprovalCategory;
  message: string;
  details: Record<string, any>;
  options: ApprovalOption[];
  timeout: number;
  defaultAction: 'approve' | 'deny';
  timestamp: number;
}

export interface ApprovalOption {
  id: string;
  label: string;
  description: string;
  consequence: string;
  isDefault?: boolean;
}

/**
 * Approval response (from user)
 */
export interface ApprovalResponse {
  requestId: string;
  action: ApprovalAction;
  timestamp: number;
  responseTimeMs: number;
  method: 'button' | 'text' | 'timeout';
  configChanges?: ConfigUpdate[];
}

export type ApprovalAction =
  | 'approve'
  | 'deny'
  | 'always_allow'
  | 'configure'
  | 'extend_timeout';

/**
 * Approval decision (internal)
 */
export interface ApprovalDecision {
  approved: boolean;
  reason: string;
  updatedConfig?: Partial<ApprovalGateConfig>;
}

/**
 * Configuration update
 */
export interface ConfigUpdate {
  type: 'whitelist' | 'blacklist' | 'threshold' | 'timeout';
  key: string;
  value: any;
  description: string;
}

/**
 * Whitelist rule
 */
export interface WhitelistRule {
  type: 'directory' | 'file_pattern' | 'command' | 'agent';
  pattern: string;
  description?: string;
}

/**
 * Blacklist rule
 */
export interface BlacklistRule {
  type: 'command' | 'agent';
  pattern: string;
  reason: string;
}

/**
 * Whitelist check result
 */
export interface WhitelistResult {
  matched: boolean;
  rule?: string;
  type?: 'whitelist' | 'blacklist';
}
```

---

## 3. SDK Integration Strategy

### 3.1 PreToolUse Hook Integration

**Challenge**: How to pause execution and wait for user approval in native mode?

**Solution**: Use PreToolUse hook to intercept tool use, throw special error with approval request, catch in orchestrator, present to user, wait for response via query cycle.

#### 3.1.1 Hook Registration

```typescript
// In TeamOrchestrator constructor
export class TeamOrchestrator {
  private approvalGate?: NativeApprovalGate;

  constructor(
    ciRoot: string,
    options?: OrchestratorOptions
  ) {
    this.ciRoot = ciRoot;

    // Initialize approval gate if enabled
    if (options?.approvalGateConfig?.enabled) {
      this.approvalGate = new NativeApprovalGate(
        options.approvalGateConfig
      );
    }
  }

  async execute(task: string, agentNames?: string[]) {
    // ... existing code ...

    // Register approval gate hook
    const hooks = this.approvalGate
      ? { preToolUse: this.approvalGate.preToolUseHook.bind(this.approvalGate) }
      : undefined;

    // Execute with SDK
    for await (const message of query({
      prompt: task,
      options: {
        agents,
        maxTurns: 30,
        hooks // Register hook
      }
    })) {
      // ... process messages ...
    }
  }
}
```

#### 3.1.2 Hook Implementation

```typescript
export class NativeApprovalGate {
  private stateManager: ApprovalStateManager;
  private evaluator: ApprovalEvaluator;
  private formatter: ApprovalRequestFormatter;
  private pendingRequests: Map<string, Promise<ApprovalDecision>>;

  /**
   * PreToolUse hook implementation
   * Called by SDK before each tool use
   */
  async preToolUseHook(
    toolName: string,
    toolInput: any,
    context: any
  ): Promise<void> {
    // Evaluate if approval is needed
    const evaluation = this.evaluator.evaluate(
      toolName,
      toolInput,
      this.buildContext(context)
    );

    // Auto-approve if no approval needed
    if (!evaluation.needsApproval) {
      if (this.config.verbose) {
        console.log(`[ApprovalGate] Auto-approved: ${toolName}`);
      }
      return; // Allow tool use
    }

    // Generate approval request
    const operation = this.buildOperation(toolName, toolInput);
    const request = this.formatter.format(operation, evaluation);

    // Register request with state manager
    const requestId = this.stateManager.registerRequest(request);

    // Throw special error with approval request
    // This will be caught by orchestrator and presented to user
    throw new ApprovalRequiredError(request);
  }
}
```

#### 3.1.3 Error Handling in Orchestrator

```typescript
export class TeamOrchestrator {
  async execute(task: string, agentNames?: string[]) {
    try {
      for await (const message of query({ ... })) {
        // Process messages
      }
    } catch (error) {
      // Check if approval required
      if (error instanceof ApprovalRequiredError) {
        const request = error.request;

        // Present approval request to user
        const response = await this.requestUserApproval(request);

        // Process response
        const decision = await this.approvalGate.processResponse(
          request.requestId,
          response
        );

        if (decision.approved) {
          // Retry tool use
          // NOTE: This is complex - may need to track and replay
          return this.execute(task, agentNames); // Restart
        } else {
          // Operation denied
          throw new OperationDeniedError(decision.reason);
        }
      }

      throw error; // Re-throw other errors
    }
  }
}
```

### 3.2 Communication with Claude Code

**Challenge**: How to communicate approval requests to Claude Code UI?

**Solution 1** (Preferred): Return special message type that Claude Code recognizes

```typescript
// In orchestrator, present approval request as special message
async requestUserApproval(request: ApprovalRequest): Promise<ApprovalResponse> {
  // Format as conversational message with structured data
  const message = {
    type: 'approval_request',
    data: request,
    text: this.formatApprovalMessage(request)
  };

  // Return message to Claude Code
  // Claude Code will display and wait for user response
  // Response comes back in next query cycle
  return new Promise((resolve) => {
    this.pendingApprovalResolvers.set(request.requestId, resolve);
  });
}
```

**Solution 2** (Fallback): Use structured text output

```typescript
// Format as text with clear markers
function formatApprovalMessage(request: ApprovalRequest): string {
  return `
🔧 APPROVAL REQUIRED

Operation: ${request.operation.description}
Severity: ${request.severity}

${formatDetails(request.details)}

⏱ Timeout: ${request.timeout}s (default: ${request.defaultAction})

Actions:
${request.options.map(opt => `[${opt.label}]`).join(' ')}

Please respond with: ${request.options.map(o => o.id).join(', ')}
`;
}
```

### 3.3 Response Capture

**Challenge**: How to capture user response in native mode?

**Solution**: Parse user's next message (text or button click)

```typescript
export class TeamOrchestrator {
  private pendingApprovalResolvers: Map<string, (response: ApprovalResponse) => void>;

  async execute(task: string, agentNames?: string[]) {
    for await (const message of query({ ... })) {
      // Check if message is approval response
      if (this.isPendingApprovalResponse(message)) {
        const response = this.parseApprovalResponse(message);

        // Resolve pending approval
        const resolver = this.pendingApprovalResolvers.get(response.requestId);
        if (resolver) {
          resolver(response);
          this.pendingApprovalResolvers.delete(response.requestId);
        }
      }

      // ... continue processing ...
    }
  }

  parseApprovalResponse(message: SDKMessage): ApprovalResponse {
    // Button click (structured response)
    if (message.type === 'approval_response') {
      return message.data as ApprovalResponse;
    }

    // Text response (parse natural language)
    if (message.type === 'text') {
      const text = message.text.toLowerCase().trim();

      // Detect approval
      if (['approve', 'yes', 'y', 'ok', 'allow'].includes(text)) {
        return {
          requestId: this.currentApprovalRequestId,
          action: 'approve',
          timestamp: Date.now(),
          responseTimeMs: Date.now() - this.approvalRequestTime,
          method: 'text'
        };
      }

      // Detect denial
      if (['deny', 'no', 'n', 'cancel', 'reject'].includes(text)) {
        return {
          requestId: this.currentApprovalRequestId,
          action: 'deny',
          timestamp: Date.now(),
          responseTimeMs: Date.now() - this.approvalRequestTime,
          method: 'text'
        };
      }

      // Invalid response
      throw new InvalidApprovalResponseError(text);
    }

    throw new Error('Unexpected message type');
  }
}
```

---

## 4. Data Flow & State Management

### 4.1 Approval Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Tool Use Attempt                                             │
│    • Agent calls Write("file.ts", content)                      │
│    • SDK invokes PreToolUse hook                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│ 2. Evaluation                                                   │
│    • ApprovalEvaluator.evaluate(toolName, input, context)       │
│    • Check whitelist/blacklist                                  │
│    • Calculate severity                                         │
│    • Determine if approval needed                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│ 3. Request Generation (if needed)                               │
│    • Build Operation object                                     │
│    • ApprovalRequestFormatter.format()                          │
│    • Generate requestId                                         │
│    • Register with ApprovalStateManager                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│ 4. Throw ApprovalRequiredError                                  │
│    • Contains ApprovalRequest                                   │
│    • Caught by orchestrator                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│ 5. Present to User (Orchestrator)                               │
│    • Format for Claude Code display                             │
│    • Send as message or return value                            │
│    • Set up timeout timer                                       │
│    • Store resolver for response                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│ 6. User Response                                                │
│    • User clicks button or types text                           │
│    • Response captured in next query cycle                      │
│    • Parse response (button data or text)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│ 7. Process Response                                             │
│    • ApprovalGate.processResponse(requestId, response)          │
│    • Update configuration if needed                             │
│    • Resolve pending promise                                    │
│    • Return ApprovalDecision                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────────┐
│ 8. Execute or Cancel                                            │
│    • If approved: Retry tool use (or continue)                  │
│    • If denied: Throw OperationDeniedError                      │
│    • Clean up state                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 State Management

**Approval State** (In-Memory):
```typescript
class ApprovalStateManager {
  private pendingRequests: Map<string, ApprovalRequest>;
  private timeoutTimers: Map<string, NodeJS.Timeout>;
  private approvalHistory: ApprovalHistoryEntry[];

  registerRequest(request: ApprovalRequest): string {
    const requestId = `approval-${Date.now()}-${Math.random()}`;
    request.requestId = requestId;

    this.pendingRequests.set(requestId, request);

    // Set timeout timer
    const timer = setTimeout(() => {
      this.timeoutRequest(requestId);
    }, request.timeout);

    this.timeoutTimers.set(requestId, timer);

    return requestId;
  }

  resolveRequest(requestId: string, response: ApprovalResponse): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Unknown approval request: ${requestId}`);
    }

    // Clear timeout
    const timer = this.timeoutTimers.get(requestId);
    if (timer) {
      clearTimeout(timer);
      this.timeoutTimers.delete(requestId);
    }

    // Record in history
    this.approvalHistory.push({
      request,
      response,
      timestamp: Date.now()
    });

    // Remove from pending
    this.pendingRequests.delete(requestId);
  }

  timeoutRequest(requestId: string): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) return;

    // Apply default action
    const response: ApprovalResponse = {
      requestId,
      action: request.defaultAction === 'approve' ? 'approve' : 'deny',
      timestamp: Date.now(),
      responseTimeMs: request.timeout,
      method: 'timeout'
    };

    // Resolve with timeout response
    this.resolveRequest(requestId, response);
  }
}
```

**Configuration State** (Persistent):
```typescript
class ConfigurationManager {
  private config: ApprovalGateConfig;
  private configPath: string;

  loadConfig(): ApprovalGateConfig {
    if (fs.existsSync(this.configPath)) {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(content);
    } else {
      this.config = this.getDefaultConfig();
    }

    return this.config;
  }

  saveConfig(config: ApprovalGateConfig): void {
    // Validate
    const validation = this.validate(config);
    if (!validation.valid) {
      throw new ConfigValidationError(validation.errors);
    }

    // Backup existing config
    if (fs.existsSync(this.configPath)) {
      const backupPath = `${this.configPath}.backup`;
      fs.copyFileSync(this.configPath, backupPath);
    }

    // Write new config
    fs.writeFileSync(
      this.configPath,
      JSON.stringify(config, null, 2)
    );

    this.config = config;
  }

  updateSettings(updates: Partial<ApprovalGateConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    };

    this.saveConfig(this.config);
  }
}
```

### 4.3 Timeout Handling

```typescript
class TimeoutManager {
  private activeTimers: Map<string, TimeoutState>;

  startTimeout(
    requestId: string,
    duration: number,
    warningThreshold: number,
    onWarning: () => void,
    onTimeout: () => void
  ): void {
    const warningTime = duration - warningThreshold;

    // Warning timer
    const warningTimer = setTimeout(() => {
      onWarning();
    }, warningTime);

    // Timeout timer
    const timeoutTimer = setTimeout(() => {
      onTimeout();
      this.cleanup(requestId);
    }, duration);

    this.activeTimers.set(requestId, {
      warningTimer,
      timeoutTimer,
      startTime: Date.now()
    });
  }

  extendTimeout(requestId: string, extension: number): void {
    const state = this.activeTimers.get(requestId);
    if (!state) return;

    // Clear existing timers
    clearTimeout(state.warningTimer);
    clearTimeout(state.timeoutTimer);

    // Restart with extended duration
    const elapsed = Date.now() - state.startTime;
    const remaining = state.duration - elapsed;
    this.startTimeout(
      requestId,
      remaining + extension,
      state.warningThreshold,
      state.onWarning,
      state.onTimeout
    );
  }

  cancelTimeout(requestId: string): void {
    const state = this.activeTimers.get(requestId);
    if (state) {
      clearTimeout(state.warningTimer);
      clearTimeout(state.timeoutTimer);
      this.activeTimers.delete(requestId);
    }
  }
}
```

---

## 5. Native vs CLI Architecture

### 5.1 Comparison

| Aspect | CLI Mode | Native Mode |
|--------|----------|-------------|
| **Approval Mechanism** | `readline` prompt | Conversational message + query cycle |
| **User Interaction** | Blocking terminal input | Async message exchange |
| **Timeout** | Terminal timeout with readline | In-memory timer with Promise |
| **Response Capture** | `question()` callback | Parse query message |
| **State** | Single-threaded, sequential | Async state management needed |
| **Error Handling** | Synchronous throw/catch | Async error propagation |
| **Display** | ANSI colors, ASCII | Rich formatting, buttons |
| **Configuration** | Same file (.team-sdk-config.json) | Same file |

### 5.2 Shared Components

**Both modes share**:
- `ApprovalGateConfig` type
- `ConfigurationManager` (file operations)
- `ApprovalEvaluator` (rule evaluation)
- Configuration file format (`.team-sdk-config.json`)
- Whitelist/blacklist logic
- Threshold calculations

**Mode-specific**:
- CLI: `ApprovalGate` (readline-based)
- Native: `NativeApprovalGate` (message-based)

### 5.3 Unified Interface

```typescript
/**
 * Abstract approval gate interface
 * Implemented by both CLI and Native modes
 */
export interface IApprovalGate {
  /**
   * Request approval for operation
   * Returns true if approved, false if denied
   * Throws on timeout or error
   */
  requestApproval(
    operation: Operation,
    context: ApprovalContext
  ): Promise<ApprovalDecision>;

  /**
   * Update configuration
   */
  updateConfig(changes: ConfigUpdate[]): void;

  /**
   * Cleanup resources
   */
  cleanup(): void;
}

/**
 * CLI implementation
 */
export class ApprovalGate implements IApprovalGate {
  // Existing readline-based implementation
}

/**
 * Native implementation
 */
export class NativeApprovalGate implements IApprovalGate {
  // New message-based implementation
}

/**
 * Factory for creating appropriate implementation
 */
export function createApprovalGate(
  mode: 'cli' | 'native',
  config: ApprovalGateConfig
): IApprovalGate {
  return mode === 'cli'
    ? new ApprovalGate(config)
    : new NativeApprovalGate(config);
}
```

---

## 6. Implementation Phases

### Phase 1: Core Architecture (MVP) - Week 1

**Goal**: Basic approval gates working in native mode

**Tasks**:
1. Create `NativeApprovalGate` class (basic structure)
2. Implement `ApprovalEvaluator` (threshold checking)
3. Add PreToolUse hook registration
4. Implement file operation approvals only
5. Basic text-based approval requests
6. Simple approve/deny responses

**Deliverables**:
- `native-approval-gate.ts`
- `approval-evaluator.ts`
- Basic tests
- File operation approvals working

**Success Criteria**:
- Can detect large file writes
- Can present approval request to user
- Can process approve/deny response
- Tool use proceeds or fails correctly

---

### Phase 2: Full Category Support - Week 2

**Goal**: All 5 approval categories implemented

**Tasks**:
1. Implement command execution evaluator
2. Implement cost threshold evaluator
3. Implement agent delegation evaluator
4. Implement destructive operation evaluator
5. Add severity calculation
6. Add whitelist/blacklist checking

**Deliverables**:
- All evaluation logic complete
- Category-specific formatters
- Comprehensive tests

**Success Criteria**:
- All categories detected correctly
- Severity calculated accurately
- Whitelist/blacklist work as expected

---

### Phase 3: Rich UI & Configuration - Week 3

**Goal**: Polished approval messages and configuration UI

**Tasks**:
1. Implement `ApprovalRequestFormatter`
2. Create message templates for each category
3. Implement `ConfigurationManager`
4. Add quick configuration support
5. Add timeout warnings
6. Add cost alternatives

**Deliverables**:
- Rich approval message formatting
- Configuration management
- Timeout warnings
- Alternative suggestions

**Success Criteria**:
- Approval messages are clear and informative
- Configuration can be updated from prompts
- Timeouts handled gracefully

---

### Phase 4: State Management & Resilience - Week 4

**Goal**: Robust state management and error handling

**Tasks**:
1. Implement `ApprovalStateManager`
2. Add timeout management
3. Add concurrent request handling
4. Implement error recovery
5. Add approval history
6. Add metrics tracking

**Deliverables**:
- Robust state management
- Timeout handling
- Error recovery
- Approval history

**Success Criteria**:
- Multiple concurrent approvals handled
- Timeouts work correctly
- Errors don't corrupt state
- History tracks all approvals

---

### Phase 5: Integration & Polish - Week 5

**Goal**: Full integration with Team SDK and testing

**Tasks**:
1. Integrate with `TeamOrchestrator`
2. Add SDK hook registration
3. Implement response parsing
4. Add comprehensive tests
5. Add monitoring/logging
6. Documentation

**Deliverables**:
- Full integration
- Test suite
- Documentation
- Examples

**Success Criteria**:
- Works end-to-end in Claude Code
- All tests pass
- Documentation complete
- Ready for user testing

---

## 7. Technical Risks & Mitigations

### Risk 1: Async State Complexity

**Risk**: Managing async approval state across query cycles is complex

**Impact**: High - Could lead to race conditions, memory leaks, state corruption

**Mitigation**:
- Use proven state management pattern (Map with unique IDs)
- Implement comprehensive cleanup on timeout/completion
- Add state validation checks
- Test concurrent approval scenarios extensively

---

### Risk 2: PreToolUse Hook Limitations

**Risk**: SDK hook may not support blocking/pausing execution

**Impact**: High - Core mechanism may not work as designed

**Mitigation**:
- **Research**: Verify PreToolUse hook capabilities in SDK docs
- **Prototype**: Test simple hook that throws error
- **Fallback**: If hook doesn't support pause, use post-tool-use validation

**Alternative Approach** (if PreToolUse doesn't work):
- Let tool execute
- Validate result in PostToolUse hook
- Rollback if not approved (more complex)

---

### Risk 3: Response Parsing Ambiguity

**Risk**: User text responses may be ambiguous or unclear

**Impact**: Medium - Could lead to wrong action taken

**Mitigation**:
- Prefer button responses (structured data)
- If text response, ask for confirmation
- Show what action will be taken before executing
- Log all responses for debugging

---

### Risk 4: Timeout Accuracy

**Risk**: JavaScript timers may not be accurate under load

**Impact**: Low - Timeouts might fire slightly late/early

**Mitigation**:
- Use tolerance threshold (±500ms acceptable)
- Warn user well before timeout (15s buffer)
- Allow timeout extension if needed

---

### Risk 5: Configuration Corruption

**Risk**: Config file could be corrupted during write

**Impact**: Medium - Could break approval gates

**Mitigation**:
- Always validate before writing
- Create backup before overwrite
- Atomic write (write to temp, then rename)
- Detect corruption on load, use defaults

---

### Risk 6: Memory Leaks

**Risk**: Pending approvals not cleaned up could leak memory

**Impact**: Medium - Long-running processes could crash

**Mitigation**:
- Force cleanup on timeout
- Periodic cleanup of completed requests
- Max pending request limit
- Memory usage monitoring

---

### Risk 7: SDK Query Cycle Interruption

**Risk**: Approval wait may break SDK query flow

**Impact**: High - Could cause SDK to hang or error

**Mitigation**:
- **Test extensively** with SDK
- Keep approval state outside SDK query
- Use Promise-based coordination
- Add timeout to prevent infinite wait

---

## 8. API Specifications

### 8.1 Public API

```typescript
/**
 * Create approval gate for native mode
 */
export function createNativeApprovalGate(
  config: ApprovalGateConfig
): NativeApprovalGate;

/**
 * Create approval gate (mode auto-detected)
 */
export function createApprovalGate(
  config: ApprovalGateConfig,
  mode?: 'cli' | 'native'
): IApprovalGate;

/**
 * Load configuration from file
 */
export function loadApprovalConfig(
  path?: string
): ApprovalGateConfig;

/**
 * Save configuration to file
 */
export function saveApprovalConfig(
  config: ApprovalGateConfig,
  path?: string
): void;

/**
 * Validate configuration
 */
export function validateApprovalConfig(
  config: ApprovalGateConfig
): ValidationResult;
```

### 8.2 Orchestrator Integration API

```typescript
/**
 * Add approval gate to orchestrator
 */
export class TeamOrchestrator {
  /**
   * Configure approval gates
   */
  setApprovalGate(gate: IApprovalGate): void;

  /**
   * Enable/disable approval gates
   */
  setApprovalEnabled(enabled: boolean): void;

  /**
   * Get current approval configuration
   */
  getApprovalConfig(): ApprovalGateConfig;

  /**
   * Update approval configuration
   */
  updateApprovalConfig(updates: Partial<ApprovalGateConfig>): void;
}
```

### 8.3 Hook API

```typescript
/**
 * PreToolUse hook signature
 */
export type PreToolUseHook = (
  toolName: string,
  toolInput: any,
  context: HookContext
) => Promise<void>;

export interface HookContext {
  agentName: string;
  sessionId: string;
  conversationId: string;
  messageId: string;
}
```

### 8.4 Error API

```typescript
/**
 * Approval required error (thrown by hook)
 */
export class ApprovalRequiredError extends Error {
  constructor(public request: ApprovalRequest);
}

/**
 * Operation denied error
 */
export class OperationDeniedError extends Error {
  constructor(public reason: string);
}

/**
 * Approval timeout error
 */
export class ApprovalTimeoutError extends Error {
  constructor(public requestId: string, public timeout: number);
}

/**
 * Invalid approval response error
 */
export class InvalidApprovalResponseError extends Error {
  constructor(public response: string);
}

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  constructor(public errors: string[]);
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Components to test**:
1. `ApprovalEvaluator` - Rule evaluation logic
2. `ApprovalRequestFormatter` - Message formatting
3. `ConfigurationManager` - Config load/save/validate
4. `ApprovalStateManager` - State tracking
5. `TimeoutManager` - Timeout handling

**Test cases** (examples):
```typescript
describe('ApprovalEvaluator', () => {
  test('should detect file size threshold', () => {
    const evaluator = new ApprovalEvaluator(config);
    const result = evaluator.evaluate('Write', {
      file_path: 'test.ts',
      content: 'x'.repeat(15000) // 15KB
    }, context);

    expect(result.needsApproval).toBe(true);
    expect(result.category).toBe('file_operation');
    expect(result.severity).toBe('medium');
  });

  test('should check whitelist', () => {
    const evaluator = new ApprovalEvaluator({
      ...config,
      whitelists: { filePatterns: ['*.test.ts'] }
    });

    const result = evaluator.evaluate('Write', {
      file_path: 'example.test.ts',
      content: 'x'.repeat(15000)
    }, context);

    expect(result.needsApproval).toBe(false);
    expect(result.whitelistMatch).toBe('*.test.ts');
  });
});
```

### 9.2 Integration Tests

**Scenarios**:
1. End-to-end approval flow (approve)
2. End-to-end approval flow (deny)
3. Timeout handling
4. Configuration update
5. Multiple concurrent approvals
6. Whitelist learning

### 9.3 E2E Tests

**Test in real Claude Code environment**:
1. File write approval
2. Command execution approval
3. Cost threshold approval
4. Agent delegation approval
5. Configuration via prompt
6. Timeout with retry

---

## 10. Monitoring & Observability

### 10.1 Metrics

```typescript
export interface ApprovalMetrics {
  // Counts
  totalApprovals: number;
  totalDenials: number;
  totalTimeouts: number;
  totalConfigUpdates: number;

  // By category
  approvalsByCategory: Record<ApprovalCategory, number>;
  denialsByCategory: Record<ApprovalCategory, number>;

  // Timing
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;

  // User behavior
  whitelistAdditions: number;
  configChanges: number;
  timeoutExtensions: number;
}
```

### 10.2 Logging

```typescript
export interface ApprovalLogEntry {
  timestamp: number;
  requestId: string;
  category: ApprovalCategory;
  severity: Severity;
  operation: string;
  response: ApprovalAction;
  responseTimeMs: number;
  method: 'button' | 'text' | 'timeout';
}
```

---

## 11. Future Enhancements

### 11.1 Machine Learning Integration

- Learn user approval patterns
- Suggest whitelist additions
- Predict approval likelihood
- Auto-adjust thresholds

### 11.2 Multi-User Approval

- Team approval workflows
- Delegated authority
- Approval chains
- Emergency overrides

### 11.3 Advanced UI

- Diff preview for file changes
- Command simulation
- Cost prediction improvements
- Visual configuration editor

---

## Appendices

### Appendix A: Configuration File Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "enabled": { "type": "boolean" },
    "defaultTimeout": { "type": "number", "minimum": 1000 },
    "autoApprove": { "type": "boolean" },
    "verbose": { "type": "boolean" },
    "thresholds": {
      "type": "object",
      "properties": {
        "fileSizeKB": { "type": "number", "minimum": 0 },
        "batchOperationCount": { "type": "number", "minimum": 1 },
        "tokenLimit": { "type": "number", "minimum": 0 },
        "costLimitUSD": { "type": "number", "minimum": 0 },
        "agentDelegationLimit": { "type": "number", "minimum": 1 }
      }
    },
    "timeouts": {
      "type": "object",
      "properties": {
        "lowSeverity": { "type": "number", "minimum": 1000 },
        "mediumSeverity": { "type": "number", "minimum": 1000 },
        "highSeverity": { "type": "number", "minimum": 1000 },
        "criticalSeverity": { "type": "number", "minimum": 1000 },
        "defaultAction": { "enum": ["deny", "approve"] },
        "warningSeconds": { "type": "number", "minimum": 0 },
        "allowExtension": { "type": "boolean" }
      }
    },
    "whitelists": {
      "type": "object",
      "properties": {
        "directories": { "type": "array", "items": { "type": "string" } },
        "filePatterns": { "type": "array", "items": { "type": "string" } },
        "commands": { "type": "array", "items": { "type": "string" } },
        "commandPatterns": { "type": "array", "items": { "type": "string" } },
        "agents": { "type": "array", "items": { "type": "string" } }
      }
    },
    "blacklists": {
      "type": "object",
      "properties": {
        "commands": { "type": "array", "items": { "type": "string" } },
        "agents": { "type": "array", "items": { "type": "string" } }
      }
    },
    "criticalFiles": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["enabled"]
}
```

### Appendix B: Message Format Examples

**File Operation Approval**:
```json
{
  "type": "approval_request",
  "requestId": "approval-1696723200000-0.123",
  "operation": {
    "type": "file_operation",
    "description": "Write 3 files (total 125KB)",
    "impact": "3 new files created, +125KB disk usage",
    "risk": "Medium - Large file writes",
    "details": {
      "files": [
        { "path": "file1.md", "size": 48000, "operation": "create" },
        { "path": "file2.md", "size": 52000, "operation": "create" },
        { "path": "file3.md", "size": 25000, "operation": "create" }
      ],
      "totalSize": 125000,
      "isNew": true,
      "isCritical": false
    }
  },
  "severity": "medium",
  "category": "file_operation",
  "message": "🔧 FILE OPERATION APPROVAL REQUIRED\n\n...",
  "options": [
    {
      "id": "approve",
      "label": "Approve",
      "description": "Write files now",
      "consequence": "3 files will be created"
    },
    {
      "id": "deny",
      "label": "Deny",
      "description": "Cancel operation",
      "consequence": "No files written"
    },
    {
      "id": "always_allow",
      "label": "Always Allow *.md",
      "description": "Add pattern to whitelist",
      "consequence": "Future .md files auto-approved"
    },
    {
      "id": "configure",
      "label": "Configure",
      "description": "Adjust settings",
      "consequence": "Open configuration UI"
    }
  ],
  "timeout": 90000,
  "defaultAction": "deny",
  "timestamp": 1696723200000
}
```

### Appendix C: Related Files

**Design Documents**:
- `/AGENTS/UX/APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md` - UX design (1,745 lines)
- `/AGENTS/UX/APPROVAL_GATES_USER_FLOWS.md` - User flows (990 lines)
- `/AGENTS/UX/APPROVAL_GATES_DESIGN_SUMMARY.md` - Design summary (513 lines)

**Implementation Reference**:
- `/integrations/team-sdk/src/approval-gates.ts` - CLI implementation (299 lines)
- `/integrations/team-sdk/src/orchestrator.ts` - Orchestrator (354 lines)
- `/integrations/team-sdk/src/types.ts` - Type definitions (224 lines)

**Tests**:
- `/integrations/team-sdk/test/approval-gates.test.ts` - CLI tests (370 lines)

---

## Document Metadata

**File**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/Architect/APPROVAL_GATES_NATIVE_ARCHITECTURE.md`

**Version**: 1.0
**Date**: October 8, 2025
**Author**: Architect Agent
**Status**: ARCHITECTURE DESIGN
**Review Status**: Pending Review

**Design Package**:
- Architecture: 1,800+ lines (this document)
- UX Specifications: 3,050+ lines (UX agent deliverables)
- Total: 4,850+ lines of comprehensive design

**Next Steps**:
1. Review with stakeholders and engineering team
2. Validate SDK hook capabilities (PreToolUse)
3. Prototype core flow (Phase 1)
4. Refine based on prototype learnings
5. Begin implementation

**Questions for SDK Team**:
1. Does PreToolUse hook support throwing errors to pause execution?
2. How to resume execution after hook error is resolved?
3. What's the best way to pass approval request data to Claude Code UI?
4. Can we detect if running in native mode vs CLI mode?
5. Are there SDK-provided approval mechanisms we should use instead?

---

**End of Architecture Document**
