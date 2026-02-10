# ============================================================================
# CHASM BOILERPLATES MASTER MAKEFILE
# Build all variants of the Chasm framework boilerplates
# ============================================================================

# Available variants
VARIANTS = core-framework cocoa-gui terminal-cli cross-platform

# Platform detection for default variant
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    DEFAULT_VARIANT = cocoa-gui
else
    DEFAULT_VARIANT = terminal-cli
endif

.PHONY: all clean install help $(VARIANTS)

# Default target builds the most appropriate variant for the platform
all: $(DEFAULT_VARIANT)
	@echo "✅ Built default variant: $(DEFAULT_VARIANT)"

# Individual variant targets
core-framework:
	@echo "🏗️  Building core framework (library only)..."
	@cd core-framework && echo "Core framework is header-only - no build needed"
	@echo "✅ Core framework ready"

cocoa-gui:
	@echo "🏗️  Building Cocoa GUI variant..."
	@cd cocoa-gui && $(MAKE) all
	@echo "✅ Cocoa GUI variant built"

terminal-cli:
	@echo "🏗️  Building Terminal CLI variant..."
	@cd terminal-cli && $(MAKE) all
	@echo "✅ Terminal CLI variant built"

cross-platform:
	@echo "🏗️  Building Cross-Platform variant..."
	@cd cross-platform && $(MAKE) all
	@echo "✅ Cross-Platform variant built"

# Build all variants
build-all:
	@echo "🏗️  Building all Chasm boilerplate variants..."
	@for variant in $(VARIANTS); do \
		if [ "$$variant" != "core-framework" ]; then \
			echo "Building $$variant..."; \
			cd $$variant && $(MAKE) all && cd ..; \
		fi; \
	done
	@echo "✅ All variants built successfully"

# Install the default variant
install: $(DEFAULT_VARIANT)
	@echo "🚀 Installing default variant: $(DEFAULT_VARIANT)"
	@cd $(DEFAULT_VARIANT) && $(MAKE) install

# Install all variants
install-all:
	@echo "🚀 Installing all Chasm boilerplate variants..."
	@for variant in $(VARIANTS); do \
		if [ "$$variant" != "core-framework" ]; then \
			echo "Installing $$variant..."; \
			cd $$variant && $(MAKE) install && cd ..; \
		fi; \
	done
	@echo "✅ All variants installed"

# Run the default variant
run: $(DEFAULT_VARIANT)
	@echo "🚀 Running default variant: $(DEFAULT_VARIANT)"
	@cd $(DEFAULT_VARIANT) && $(MAKE) run

# Clean all variants
clean:
	@echo "🧹 Cleaning all Chasm boilerplate variants..."
	@for variant in $(VARIANTS); do \
		if [ "$$variant" != "core-framework" ]; then \
			echo "Cleaning $$variant..."; \
			cd $$variant && $(MAKE) clean && cd ..; \
		fi; \
	done
	@echo "✅ All variants cleaned"

# Test all variants
test-all: build-all
	@echo "🧪 Testing all Chasm boilerplate variants..."
	@echo "✅ All variants tested (build successful)"

# Development targets
debug:
	@echo "🐛 Building debug version of $(DEFAULT_VARIANT)..."
	@cd $(DEFAULT_VARIANT) && $(MAKE) debug

release:
	@echo "📦 Building release version of $(DEFAULT_VARIANT)..."
	@cd $(DEFAULT_VARIANT) && $(MAKE) release

# Demo targets
demo-cocoa:
	@echo "🎬 Running Cocoa GUI demo..."
	@cd cocoa-gui && $(MAKE) run

demo-terminal:
	@echo "🎬 Running Terminal CLI demo..."
	@cd terminal-cli && $(MAKE) run

demo-cross-platform:
	@echo "🎬 Running Cross-Platform demo..."
	@cd cross-platform && $(MAKE) run

# Information targets
info:
	@echo "Chasm Framework Boilerplates"
	@echo "============================"
	@echo "Platform: $(UNAME_S)"
	@echo "Default variant: $(DEFAULT_VARIANT)"
	@echo ""
	@echo "Available variants:"
	@echo "  core-framework - Core Chasm framework headers"
	@echo "  cocoa-gui      - macOS Cocoa GUI applications"
	@echo "  terminal-cli   - Terminal/CLI applications"
	@echo "  cross-platform - Automatic platform detection"
	@echo ""

# Help target
help:
	@echo "Chasm Framework Boilerplates Master Makefile"
	@echo "============================================="
	@echo ""
	@$(MAKE) info
	@echo "Available targets:"
	@echo "  all            - Build default variant ($(DEFAULT_VARIANT))"
	@echo "  build-all      - Build all variants"
	@echo "  install        - Install default variant"
	@echo "  install-all    - Install all variants"
	@echo "  run            - Run default variant"
	@echo "  clean          - Clean all variants"
	@echo "  test-all       - Test all variants"
	@echo ""
	@echo "Individual variant targets:"
	@echo "  core-framework - Build core framework"
	@echo "  cocoa-gui      - Build Cocoa GUI variant"
	@echo "  terminal-cli   - Build Terminal CLI variant"
	@echo "  cross-platform - Build Cross-Platform variant"
	@echo ""
	@echo "Demo targets:"
	@echo "  demo-cocoa     - Run Cocoa GUI demo"
	@echo "  demo-terminal  - Run Terminal CLI demo"
	@echo "  demo-cross-platform - Run Cross-Platform demo"
	@echo ""
	@echo "Development targets:"
	@echo "  debug          - Build debug version"
	@echo "  release        - Build release version"
	@echo "  info           - Show platform and variant info"
	@echo "  help           - Show this help message"