# ============================================================================
# CHASM COCOA GUI MAKEFILE
# Build configuration for macOS Cocoa GUI applications
# ============================================================================

# Project configuration
PROJECT_NAME = chasm-cocoa-demo
EXECUTABLE = $(PROJECT_NAME)
BUNDLE_NAME = $(PROJECT_NAME).app

# Compiler settings
CC = clang
CFLAGS = -std=c11 -Wall -Wextra -O2
FRAMEWORKS = -framework Cocoa -framework Foundation
INCLUDES = -I../core-framework

# Source files
CORE_SOURCES = ../core-framework/chasm.c
COCOA_SOURCES = chasm_cocoa.m
APP_SOURCES = main.c
ALL_SOURCES = $(CORE_SOURCES) $(COCOA_SOURCES) $(APP_SOURCES)

# Build targets
.PHONY: all clean app bundle install

all: $(EXECUTABLE)

$(EXECUTABLE): $(ALL_SOURCES)
	@echo "🔨 Building Chasm Cocoa GUI application..."
	$(CC) $(CFLAGS) $(INCLUDES) $(FRAMEWORKS) -o $(EXECUTABLE) $(ALL_SOURCES)
	@echo "✅ Build complete: $(EXECUTABLE)"

app: bundle

bundle: $(EXECUTABLE)
	@echo "📦 Creating macOS app bundle..."
	@mkdir -p $(BUNDLE_NAME)/Contents/{MacOS,Resources}
	@cp $(EXECUTABLE) $(BUNDLE_NAME)/Contents/MacOS/
	@echo '<?xml version="1.0" encoding="UTF-8"?>' > $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<plist version="1.0"><dict>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleExecutable</key><string>$(EXECUTABLE)</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleIdentifier</key><string>com.chasm.$(PROJECT_NAME)</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleName</key><string>$(PROJECT_NAME)</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
	@echo '<key>CFBundleDisplayName</key><string>Chasm Cocoa Demo</string>' >> $(BUNDLE_NAME)/Contents/Info.plist
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

run: $(EXECUTABLE)
	@echo "🚀 Running Chasm Cocoa GUI application..."
	./$(EXECUTABLE)

run-bundle: bundle
	@echo "🚀 Running app bundle..."
	open $(BUNDLE_NAME)

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -f $(EXECUTABLE)
	@rm -rf $(BUNDLE_NAME)
	@echo "✅ Clean complete"

# Development targets
debug: CFLAGS += -g -DDEBUG
debug: $(EXECUTABLE)

release: CFLAGS += -DNDEBUG
release: $(EXECUTABLE)

# Help target
help:
	@echo "Chasm Cocoa GUI Makefile"
	@echo "========================"
	@echo "Available targets:"
	@echo "  all      - Build the executable (default)"
	@echo "  app      - Create macOS app bundle"
	@echo "  bundle   - Same as app"
	@echo "  install  - Install app bundle to /Applications"
	@echo "  run      - Run the executable directly"
	@echo "  run-bundle - Run the app bundle"
	@echo "  clean    - Remove build artifacts"
	@echo "  debug    - Build with debug symbols"
	@echo "  release  - Build optimized release version"
	@echo "  help     - Show this help message"