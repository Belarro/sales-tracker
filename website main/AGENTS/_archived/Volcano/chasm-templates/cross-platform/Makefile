# ============================================================================
# CHASM CROSS-PLATFORM MAKEFILE
# Automatically builds GUI on macOS, Terminal on other platforms
# ============================================================================

# Project configuration
PROJECT_NAME = chasm-cross-platform-demo
EXECUTABLE = $(PROJECT_NAME)

# Platform detection
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    PLATFORM = macos
    BUNDLE_NAME = $(PROJECT_NAME).app
else
    PLATFORM = terminal
endif

# Compiler settings
CC = clang
CFLAGS = -std=c11 -Wall -Wextra -O2
INCLUDES = -I../core-framework

# Source files
CORE_SOURCES = ../core-framework/chasm.c
APP_SOURCES = main.c

# Platform-specific configuration
ifeq ($(PLATFORM),macos)
    PLATFORM_SOURCES = ../cocoa-gui/chasm_cocoa.m
    FRAMEWORKS = -framework Cocoa -framework Foundation
    INCLUDES += -I../cocoa-gui
    BUILD_TYPE = "macOS Cocoa GUI"
else
    PLATFORM_SOURCES = ../terminal-cli/chasm_terminal.c
    FRAMEWORKS = 
    INCLUDES += -I../terminal-cli
    BUILD_TYPE = "Terminal CLI"
endif

ALL_SOURCES = $(CORE_SOURCES) $(PLATFORM_SOURCES) $(APP_SOURCES)

# Build targets
.PHONY: all clean install run platform-info

all: platform-info $(EXECUTABLE)

platform-info:
	@echo "🔍 Detected platform: $(PLATFORM)"
	@echo "🏗️  Build type: $(BUILD_TYPE)"
	@echo ""

$(EXECUTABLE): $(ALL_SOURCES)
	@echo "🔨 Building Chasm Cross-Platform application for $(PLATFORM)..."
	$(CC) $(CFLAGS) $(INCLUDES) $(FRAMEWORKS) -o $(EXECUTABLE) $(ALL_SOURCES)
	@echo "✅ Build complete: $(EXECUTABLE)"

# macOS-specific targets
ifeq ($(PLATFORM),macos)
app: bundle

bundle: $(EXECUTABLE)
	@echo "📦 Creating macOS app bundle..."
	@mkdir -p $(BUNDLE_NAME)/Contents/{MacOS,Resources}
	@cp $(EXECUTABLE) $(BUNDLE_NAME)/Contents/MacOS/
	@echo '<?xml version="1.0" encoding="UTF-8"?>' > $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<plist version="1.0"><dict>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleExecutable</key><string>$(EXECUTABLE)</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleIdentifier</key><string>com.chasm.cross-platform</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleName</key><string>Chasm Cross-Platform</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleDisplayName</key><string>Chasm Cross-Platform Demo</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleVersion</key><string>1.0</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleShortVersionString</key><string>1.0</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundlePackageType</key><string>APPL</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>LSMinimumSystemVersion</key><string>10.14</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>NSHighResolutionCapable</key><true/>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '</dict></plist>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo "✅ App bundle created: $(BUNDLE_NAME)"

install: bundle
	@echo "🚀 Installing to /Applications/..."
	@cp -R $(BUNDLE_NAME) /Applications/
	@echo "✅ Installed: /Applications/$(BUNDLE_NAME)"

run-bundle: bundle
	@echo "🚀 Running app bundle..."
	open $(BUNDLE_NAME)

else
# Terminal-specific targets
install: $(EXECUTABLE)
	@echo "🚀 Installing to ~/.local/bin/..."
	@mkdir -p ~/.local/bin
	@cp $(EXECUTABLE) ~/.local/bin/
	@chmod +x ~/.local/bin/$(EXECUTABLE)
	@echo "✅ Installed: ~/.local/bin/$(EXECUTABLE)"
	@echo "💡 Make sure ~/.local/bin is in your PATH"

endif

run: $(EXECUTABLE)
	@echo "🚀 Running Chasm Cross-Platform application..."
ifeq ($(PLATFORM),macos)
	@echo "💡 Native macOS window will appear"
else
	@echo "🎮 Terminal controls: arrow keys to navigate, Enter to select, 'q' to quit"
endif
	@echo ""
	./$(EXECUTABLE)

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -f $(EXECUTABLE)
ifeq ($(PLATFORM),macos)
	@rm -rf $(BUNDLE_NAME)
endif
	@echo "✅ Clean complete"

# Development targets
debug: CFLAGS += -g -DDEBUG
debug: $(EXECUTABLE)

release: CFLAGS += -DNDEBUG
release: $(EXECUTABLE)

# Cross-platform testing
test-build-all:
	@echo "🧪 Testing cross-platform builds..."
	@echo "Building for current platform ($(PLATFORM))..."
	@$(MAKE) clean all
	@echo "✅ Cross-platform build test complete"

# Help target
help:
	@echo "Chasm Cross-Platform Makefile"
	@echo "=============================="
	@echo "Platform: $(PLATFORM) ($(BUILD_TYPE))"
	@echo ""
	@echo "Available targets:"
	@echo "  all       - Build the executable (default)"
	@echo "  install   - Install to system location"
	@echo "  run       - Run the application"
	@echo "  clean     - Remove build artifacts"
	@echo "  debug     - Build with debug symbols"
	@echo "  release   - Build optimized release version"
	@echo "  help      - Show this help message"
ifeq ($(PLATFORM),macos)
	@echo ""
	@echo "macOS-specific targets:"
	@echo "  app       - Create macOS app bundle"
	@echo "  bundle    - Same as app"
	@echo "  run-bundle- Run the app bundle"
endif
	@echo ""
	@echo "Development targets:"
	@echo "  test-build-all - Test cross-platform builds"
	@echo "  platform-info  - Show platform detection info"