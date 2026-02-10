# 🌋 Volcano Agent's Chasm Framework Templates

> **Production-Ready Boilerplate Templates for Chasm Framework Development**
> Maintained by Volcano - The Chasm Framework Application Implementation Specialist

## 📋 Overview

This repository contains the official Chasm framework boilerplate templates, providing production-ready starting points for building cross-platform applications. These templates embody the framework's philosophy of clean, declarative UI development in pure C.

## 🎯 Quick Navigation

- [**Core Framework**](#core-framework) - Base headers and implementation
- [**Cocoa GUI**](#cocoa-gui-template) - Native macOS applications
- [**Terminal CLI**](#terminal-cli-template) - Rich terminal interfaces
- [**Cross-Platform**](#cross-platform-template) - Automatic platform detection
- [**Chasm Framework**](#chasm-framework-directory) - Complete framework implementation

## 🚀 Quick Start

```bash
# Build all templates
make build-all

# Run platform-appropriate demo
make run

# Install CLI tools globally
make install-all
```

## 📁 Repository Structure

```
chasm-templates/
├── README.md                    # This file
├── Makefile                     # Master build orchestrator
├── core-framework/              # Core Chasm headers and implementation
│   ├── chasm.h                 # Complete framework API
│   └── chasm.c                 # Base implementation
├── cocoa-gui/                  # macOS native GUI template
│   ├── Makefile
│   ├── chasm_cocoa.h
│   ├── chasm_cocoa.m
│   └── main.c
├── terminal-cli/               # Terminal UI template
│   ├── Makefile
│   ├── chasm_terminal.h
│   ├── chasm_terminal.c
│   └── main.c
├── cross-platform/             # Auto-detecting cross-platform
│   ├── Makefile
│   └── main.c
└── chasm-framework/            # Complete framework implementation
    ├── docs/                   # Framework documentation
    ├── examples/               # Example applications
    ├── include/                # Public headers
    ├── src/                    # Source implementation
    └── tools/                  # Build and development tools
```

## 🏗️ Template Details

### Core Framework

The foundation of all Chasm applications, providing:

- **Type System**: `chasm_app_t`, `chasm_window_t`, `chasm_view_t`
- **UI Components**: Text, buttons, stacks, and containers
- **Layout Engine**: VStack/HStack with automatic sizing
- **Color Management**: RGBA color system with presets
- **Event Handling**: Callback-based event system
- **Memory Safety**: Reference counting and proper cleanup

### Cocoa GUI Template

Native macOS application template with:

- ✅ NSWindow and NSView integration
- ✅ Automatic .app bundle creation
- ✅ Retina display support
- ✅ Native controls and styling
- ✅ Menu bar integration
- ✅ Event loop management

**Usage:**
```bash
cd cocoa-gui
make bundle        # Create .app bundle
make run-bundle    # Launch application
make install       # Install to /Applications
```

### Terminal CLI Template

Rich terminal interface with:

- ✅ ANSI color support
- ✅ Unicode box drawing
- ✅ Progress bars and spinners
- ✅ Keyboard navigation
- ✅ Non-blocking input
- ✅ Terminal size detection

**Usage:**
```bash
cd terminal-cli
make all          # Build executable
make install      # Install to ~/.local/bin
make run          # Run with instructions
```

### Cross-Platform Template

Intelligent platform detection:

- **macOS** → Cocoa GUI backend
- **Linux** → Terminal CLI backend
- **Windows** → Terminal CLI (future: Win32 API)

**Usage:**
```bash
cd cross-platform
make all          # Auto-detect and build
make run          # Run with appropriate UI
```

### Chasm Framework Directory

Complete framework implementation including:

- **Documentation**: API references, guides, examples
- **Examples**: Sample applications and demos
- **Tools**: Build systems, generators, utilities
- **Tests**: Comprehensive test suite

## 🎨 Framework Philosophy

The Chasm framework follows these core principles:

### 1. SwiftUI-Inspired Declarative API
```c
// Declarative UI construction
chasm_vstack_t* stack = chasm_vstack_create(20.0f);
chasm_text_t* title = chasm_text_create("Welcome to Chasm");
chasm_button_t* button = chasm_button_create("Get Started");

// Configure properties
chasm_text_set_color(title, chasm_color_blue());
chasm_button_set_callback(button, on_start_clicked, user_data);

// Build hierarchy
chasm_vstack_add_child(stack, chasm_text_as_view(title));
chasm_vstack_add_child(stack, chasm_button_as_view(button));
```

### 2. Zero External Dependencies
- Pure C implementation
- System frameworks only
- No third-party libraries
- Minimal binary size

### 3. True Cross-Platform
- Single codebase
- Platform-specific backends
- Native look and feel
- Automatic optimization

### 4. Production Ready
- Memory safety
- Error handling
- Performance optimized
- Well-documented

## 🛠️ Development Workflow

### Creating a New Application

1. **Choose Your Template**
   ```bash
   # For macOS apps
   cp -r cocoa-gui/ my-app/
   
   # For terminal apps
   cp -r terminal-cli/ my-cli/
   
   # For cross-platform
   cp -r cross-platform/ my-universal-app/
   ```

2. **Implement Your Logic**
   - Edit `main.c` with application code
   - Add custom components
   - Configure build settings

3. **Build and Test**
   ```bash
   cd my-app/
   make debug      # Debug build
   make test       # Run tests
   make release    # Optimized build
   ```

4. **Deploy**
   ```bash
   make install    # Install to system
   make bundle     # Create distribution
   ```

## 📚 API Quick Reference

### Application Lifecycle
```c
chasm_app_t* app = chasm_app_create("MyApp");
chasm_app_set_launch_handler(app, app_launched);
chasm_app_run(app);
chasm_app_destroy(app);
```

### Window Management
```c
chasm_window_t* window = chasm_window_create("Title", size);
chasm_window_set_content_view(window, view);
chasm_window_show(window);
```

### UI Components
```c
// Text
chasm_text_t* label = chasm_text_create("Hello");
chasm_text_set_font_size(label, 18.0f);

// Button
chasm_button_t* btn = chasm_button_create("Click");
chasm_button_set_callback(btn, clicked, data);

// Layout
chasm_vstack_t* vstack = chasm_vstack_create(10.0f);
chasm_hstack_t* hstack = chasm_hstack_create(10.0f);
```

## 🔧 Build Commands

### Master Makefile

| Command | Description |
|---------|-------------|
| `make all` | Build default for platform |
| `make build-all` | Build all variants |
| `make install-all` | Install all to system |
| `make clean` | Remove build artifacts |
| `make test-all` | Run all tests |
| `make info` | Show build information |

### Variant Specific

| Command | Description |
|---------|-------------|
| `make cocoa-gui` | Build Cocoa variant |
| `make terminal-cli` | Build terminal variant |
| `make cross-platform` | Build cross-platform |
| `make demo-[variant]` | Run specific demo |

## 🐛 Troubleshooting

### Common Issues

**macOS: Command Line Tools**
```bash
xcode-select --install
```

**Terminal: Color Support**
```bash
export TERM=xterm-256color
```

**Memory Debugging**
```bash
# macOS
leaks --atExit -- ./app

# Linux
valgrind --leak-check=full ./app
```

## 📄 License

Public domain. Use freely for any purpose.

## 🤝 Contributing

Contributions welcome:
- New platform backends
- Additional UI components
- Performance improvements
- Documentation enhancements

## 🌋 Volcano Agent Notes

These templates are maintained as part of the Volcano agent's toolkit for rapid Chasm framework application development. The agent specializes in:

- Converting user requirements into working Chasm applications
- Optimizing framework usage patterns
- Ensuring production-ready code quality
- Cross-platform compatibility testing

For agent-specific features and workflows, see the Volcano agent documentation.

---

**Built with the Chasm Framework** | **Maintained by Volcano Agent**