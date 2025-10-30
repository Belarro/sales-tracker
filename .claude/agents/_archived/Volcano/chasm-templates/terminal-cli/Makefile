# ============================================================================
# CHASM TERMINAL CLI MAKEFILE
# Build configuration for terminal/CLI applications
# ============================================================================

# Project configuration
PROJECT_NAME = chasm-terminal-demo
EXECUTABLE = $(PROJECT_NAME)

# Compiler settings
CC = clang
CFLAGS = -std=c11 -Wall -Wextra -O2
INCLUDES = -I../core-framework

# Source files
CORE_SOURCES = ../core-framework/chasm.c
TERMINAL_SOURCES = chasm_terminal.c
APP_SOURCES = main.c
ALL_SOURCES = $(CORE_SOURCES) $(TERMINAL_SOURCES) $(APP_SOURCES)

# Build targets
.PHONY: all clean install run

all: $(EXECUTABLE)

$(EXECUTABLE): $(ALL_SOURCES)
	@echo "🔨 Building Chasm Terminal CLI application..."
	$(CC) $(CFLAGS) $(INCLUDES) -o $(EXECUTABLE) $(ALL_SOURCES)
	@echo "✅ Build complete: $(EXECUTABLE)"

install: $(EXECUTABLE)
	@echo "🚀 Installing to ~/.local/bin/..."
	@mkdir -p ~/.local/bin
	@cp $(EXECUTABLE) ~/.local/bin/
	@chmod +x ~/.local/bin/$(EXECUTABLE)
	@echo "✅ Installed: ~/.local/bin/$(EXECUTABLE)"
	@echo "💡 Make sure ~/.local/bin is in your PATH"

run: $(EXECUTABLE)
	@echo "🚀 Running Chasm Terminal CLI application..."
	@echo "📖 Controls: [S]tart, S[T]op, [R]eset, [Q]uit"
	@echo "🎮 Use arrow keys to navigate, Enter to activate"
	@echo ""
	./$(EXECUTABLE)

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -f $(EXECUTABLE)
	@echo "✅ Clean complete"

# Development targets
debug: CFLAGS += -g -DDEBUG
debug: $(EXECUTABLE)

release: CFLAGS += -DNDEBUG
release: $(EXECUTABLE)

# Terminal testing targets
test-colors:
	@echo "🎨 Testing terminal colors..."
	@echo "\033[31mRed\033[0m \033[32mGreen\033[0m \033[33mYellow\033[0m \033[34mBlue\033[0m \033[35mMagenta\033[0m \033[36mCyan\033[0m \033[37mWhite\033[0m"
	@echo "\033[91mBright Red\033[0m \033[92mBright Green\033[0m \033[93mBright Yellow\033[0m \033[94mBright Blue\033[0m"

test-unicode:
	@echo "🔤 Testing Unicode box drawing characters..."
	@echo "┌─────────────────────┐"
	@echo "│ Box Drawing Test    │"
	@echo "├─────────────────────┤"
	@echo "│ ░▒▓█ Progress: [██░] │"
	@echo "│ Spinner: | / - \\    │"
	@echo "└─────────────────────┘"

test-terminal: test-colors test-unicode
	@echo "✅ Terminal capability tests complete"

# Help target
help:
	@echo "Chasm Terminal CLI Makefile"
	@echo "==========================="
	@echo "Available targets:"
	@echo "  all          - Build the executable (default)"
	@echo "  install      - Install to ~/.local/bin"
	@echo "  run          - Run the application"
	@echo "  clean        - Remove build artifacts"
	@echo "  debug        - Build with debug symbols"
	@echo "  release      - Build optimized release version"
	@echo "  test-colors  - Test terminal color support"
	@echo "  test-unicode - Test Unicode character support"
	@echo "  test-terminal- Run all terminal tests"
	@echo "  help         - Show this help message"