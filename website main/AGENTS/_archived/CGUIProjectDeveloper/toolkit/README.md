# C GUI Project Tracker Development Toolkit

This toolkit provides comprehensive resources for developing professional project tracking applications in C using GTK. It includes templates, examples, build configurations, and specialized widgets for creating full-featured project management software.

## Toolkit Contents

### Core Templates
- **`gtk_templates.h`** - Header file with data structures, function declarations, and API templates
- **`project_tracker_template.c`** - Complete application template with main window, database integration, and basic functionality
- **`CMakeLists.txt`** - Professional CMake build configuration with cross-platform support

### Custom Widgets
- **`gantt_chart_widget.c`** - Complete implementation of a custom Gantt chart widget with Cairo graphics
- Additional widget templates for task lists, calendars, and dashboards

### Development Resources
- **Database schemas** - SQLite table definitions for projects, tasks, users, and dependencies
- **Build configurations** - CMake setup for GTK4, SQLite3, and optional libgit2 integration
- **Testing framework** - Unit test structure using Check framework
- **Packaging support** - Cross-platform packaging (DEB, RPM, NSIS, DMG)

## Quick Start

### Prerequisites
```bash
# Ubuntu/Debian
sudo apt install build-essential cmake pkg-config libgtk-4-dev libsqlite3-dev

# Fedora/RHEL
sudo dnf install gcc cmake pkgconfig gtk4-devel sqlite-devel

# macOS (with Homebrew)
brew install cmake gtk4 sqlite3
```

### Basic Project Setup
1. Copy the template files to your project directory
2. Customize the CMakeLists.txt for your specific needs
3. Modify the application structure in `project_tracker_template.c`
4. Build with CMake:
```bash
mkdir build && cd build
cmake ..
make
```

## Key Features

### Application Architecture
- **Modular Design**: Separation of GUI, business logic, and data layers
- **GTK 4.x Integration**: Modern GTK widgets and patterns
- **Database Integration**: SQLite with prepared statements and transactions
- **Cross-Platform**: Windows, macOS, and Linux support
- **Memory Management**: Proper GObject reference counting and cleanup

### Custom Widgets
- **Gantt Chart**: Interactive timeline with drag-and-drop task scheduling
- **Task Tree**: Hierarchical task display with progress indicators
- **Calendar View**: Date-based project visualization
- **Dashboard**: Project metrics and progress overview

### Professional Features
- **Multi-project Support**: Handle multiple projects simultaneously
- **Task Dependencies**: Visual dependency tracking and management
- **Resource Management**: User assignment and workload tracking
- **Import/Export**: CSV, PDF, and native format support
- **Reporting**: Automated progress and time reports

## Development Guidelines

### Code Organization
```
project/
├── src/
│   ├── main.c                  # Application entry point
│   ├── app/                    # Application lifecycle management
│   ├── windows/                # Main windows and dialogs
│   ├── views/                  # Different view implementations
│   ├── widgets/                # Custom GTK widgets
│   ├── models/                 # Data models and business logic
│   ├── services/               # Database and file operations
│   └── utils/                  # Utility functions
├── include/                    # Header files
├── data/                       # UI files, icons, schemas
├── tests/                      # Unit and integration tests
└── packaging/                  # Platform-specific packaging
```

### Best Practices
1. **Memory Management**: Always pair `g_malloc()` with `g_free()`, use `g_object_ref()`/`g_object_unref()` for GObjects
2. **Error Handling**: Use GError for consistent error reporting throughout the application
3. **Database Operations**: Use prepared statements and transactions for data integrity
4. **UI Responsiveness**: Perform heavy operations in background threads
5. **Cross-Platform**: Test on all target platforms, handle platform-specific paths and behaviors

### Custom Widget Development
- Extend `GtkDrawingArea` for custom graphics (like Gantt charts)
- Use Cairo for high-quality 2D graphics and charts
- Implement proper event handling for mouse interactions
- Support keyboard navigation for accessibility
- Follow GTK naming conventions and design patterns

## Build System Features

### CMake Configuration
- **Automatic Dependency Detection**: Finds GTK4, SQLite3, and optional libraries
- **Resource Compilation**: Handles UI files and icons with glib-compile-resources
- **Testing Support**: Integrates Check framework for unit testing
- **Static Analysis**: Optional cppcheck integration
- **Code Coverage**: GCC coverage reporting support
- **Cross-Platform Packaging**: Automatic package generation for all platforms

### Compilation Options
```bash
# Debug build with full debugging symbols
cmake -DCMAKE_BUILD_TYPE=Debug ..

# Release build with optimizations
cmake -DCMAKE_BUILD_TYPE=Release ..

# Enable code coverage
cmake -DENABLE_COVERAGE=ON ..

# Custom install prefix
cmake -DCMAKE_INSTALL_PREFIX=/usr/local ..
```

## Database Schema

### Core Tables
- **projects**: Project metadata, dates, status, progress
- **tasks**: Task details, hierarchies, assignments, progress
- **users**: User information and roles
- **task_dependencies**: Task relationship definitions

### Advanced Features
- **Audit Trail**: Change tracking with timestamps and user attribution
- **File Attachments**: Binary data storage for project documents
- **Comments**: Task-level discussion and collaboration
- **Time Tracking**: Detailed time entry and reporting

## Testing Strategy

### Unit Tests
- **Model Testing**: Validate data structures and business logic
- **Database Testing**: Test CRUD operations and schema integrity
- **Utility Testing**: Verify helper functions and calculations
- **Widget Testing**: Test custom widget behavior and rendering

### Integration Tests
- **Database Integration**: Test complete data workflows
- **File Operations**: Validate import/export functionality
- **UI Integration**: Test widget interactions and data binding
- **Cross-Platform**: Verify functionality across operating systems

## Performance Optimization

### Memory Efficiency
- **Object Pooling**: Reuse frequently created objects
- **Lazy Loading**: Load data on demand for large projects
- **Cache Management**: Smart caching of rendered graphics
- **Memory Profiling**: Regular Valgrind analysis

### Rendering Performance
- **Cairo Optimization**: Cache complex drawings and surfaces
- **Dirty Rectangle Updates**: Only redraw changed areas
- **Virtual Scrolling**: Handle large task lists efficiently
- **Background Processing**: Move heavy calculations off UI thread

## Deployment and Distribution

### Linux Packaging
- **AppImage**: Universal binary for all distributions
- **Flatpak**: Sandboxed application with runtime dependencies
- **Native Packages**: DEB for Debian/Ubuntu, RPM for Fedora/RHEL
- **Snap**: Ubuntu Software Center distribution

### Windows Distribution
- **NSIS Installer**: Professional Windows installer with GTK runtime
- **Portable**: Self-contained executable with dependencies
- **Microsoft Store**: UWP packaging for Windows Store distribution

### macOS Distribution
- **DMG Bundle**: Standard macOS application bundle
- **Homebrew**: Package manager integration
- **Mac App Store**: Commercial distribution channel

## Extension and Customization

### Plugin Architecture
- **Dynamic Loading**: Load plugins at runtime using GModule
- **API Definition**: Stable plugin API for third-party extensions
- **Configuration**: Plugin management and configuration interface
- **Examples**: Sample plugins for common functionality

### Theming and Customization
- **GTK Themes**: Full support for system and custom themes
- **CSS Styling**: Custom CSS for application-specific styling
- **Icon Sets**: Support for multiple icon themes and custom icons
- **Localization**: Internationalization support with gettext

## Troubleshooting

### Common Build Issues
- **GTK Not Found**: Install GTK4 development packages
- **SQLite Missing**: Install SQLite development libraries
- **CMake Version**: Requires CMake 3.16 or later
- **Compiler Issues**: Ensure C11 support and proper flags

### Runtime Issues
- **Database Errors**: Check file permissions and SQLite version
- **GTK Themes**: Verify GTK theme installation and configuration
- **Memory Leaks**: Use Valgrind for memory debugging
- **Performance**: Profile with gprof or perf tools

## Contributing

### Code Style
- Follow GTK/GNOME coding standards
- Use consistent indentation (4 spaces)
- Document all public APIs
- Write comprehensive tests for new features

### Development Workflow
1. Fork the repository and create feature branches
2. Write tests for new functionality
3. Ensure code passes static analysis
4. Test on multiple platforms
5. Submit pull requests with detailed descriptions

## Resources

### Documentation
- [GTK 4 Documentation](https://docs.gtk.org/gtk4/)
- [Cairo Graphics Tutorial](https://www.cairographics.org/tutorial/)
- [SQLite C Interface](https://www.sqlite.org/c3ref/intro.html)
- [CMake Documentation](https://cmake.org/documentation/)

### Examples and References
- [GNOME Development](https://developer.gnome.org/)
- [GTK Example Applications](https://gitlab.gnome.org/GNOME/gtk/-/tree/main/examples)
- [Project Management Concepts](https://www.projectmanagement.com/)

This toolkit provides everything needed to create professional, cross-platform project management applications in C with GTK. The templates and examples serve as a solid foundation while allowing for extensive customization and feature development.