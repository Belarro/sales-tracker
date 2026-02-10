# AAAAssemblyExpert - III Project Configuration

## Project Integration Setup

This document configures the AAAAssemblyExpert agent for optimal work with the III project's AAA Assembly language development.

## Project Paths and Locations

### Primary Working Directory
- **III Project Root**: `/Users/joshkornreich/Documents/Projects/III/`
- **AAA Language Directory**: `/Users/joshkornreich/Documents/Projects/III/language_aaa/`
- **Examples Directory**: `/Users/joshkornreich/Documents/Projects/III/language_aaa/examples/`
- **Compiler Directory**: `/Users/joshkornreich/Documents/Projects/III/language_aaa/compiler/`

### Key Files and Components
- **Main README**: `III/language_aaa/README.md`
- **Compiler Source**: `III/language_aaa/compiler/aaa_silicon_compiler.c`
- **Assembly Optimizer**: `III/language_aaa/compiler/aaa_assembly_optimizer.c`
- **Example Files**: `III/language_aaa/examples/*.s`
- **Documentation**: `III/language_aaa/docs/README.md`

## AAA Language Overview

### Core Concept
AAA (ARM Assembly to Assembly) provides direct ARM64 assembly to native machine code compilation with zero interpretation. It generates self-contained silicon binaries (.aaas) that execute directly on ARM64 CPUs.

### Key Features
- **Direct Silicon Execution**: Zero interpretation overhead
- **Standard ARM64 Syntax**: Familiar assembly mnemonics and conventions
- **Extended Instruction Set**: Comprehensive ARM64 instruction support
- **Label Resolution**: Full forward and backward label references
- **Custom Binary Format**: AAA Silicon format with validation and metadata

### Supported Instructions
- **Data Movement**: `MOV`, `MOVZ`, `MOVK`
- **Arithmetic**: `ADD`, `SUB`, `MUL`, `DIV`
- **Memory Access**: `LDR`, `STR`, `LDP`, `STP`
- **Control Flow**: `B`, `BL`, `CBZ`, `CBNZ`, `RET`
- **System**: `SVC`, `NOP`, `EXIT` (AAA extension)

### Register Conventions
Follows ARM64 Procedure Call Standard (AAPCS):
- `x0-x7`: Argument/result registers
- `x8`: Indirect result register
- `x9-x15`: Temporary registers
- `x16-x17`: Procedure call registers
- `x18`: Platform register
- `x19-x28`: Callee-saved registers
- `x29`: Frame pointer (FP)
- `x30`: Link register (LR)
- `sp`: Stack pointer

## Development Workflow

### Standard Build Process
```bash
# Navigate to AAA language directory
cd /Users/joshkornreich/Documents/Projects/III/language_aaa/

# Build the compiler
gcc -o compiler/aaa_silicon_compiler compiler/aaa_silicon_compiler.c

# Compile assembly to silicon binary
./compiler/aaa_silicon_compiler compile examples/hello_world.aaa

# Execute silicon binary
./compiler/aaa_silicon_compiler execute examples/hello_world.aaas
```

### Testing and Validation
```bash
# Build and test all examples
cd language_aaa
make clean && make

# Test specific example
./compiler/aaa_silicon_compiler compile examples/arithmetic.s
./compiler/aaa_silicon_compiler execute examples/arithmetic.aaas
```

## Agent-Specific Responsibilities

### Primary Focus Areas
1. **Assembly Code Optimization**: Improve existing ARM64 assembly examples
2. **Instruction Coverage**: Extend support for additional ARM64 instructions
3. **Performance Tuning**: Optimize compiler output and execution efficiency
4. **Code Quality**: Ensure assembly follows ARM64 conventions and best practices
5. **Documentation**: Maintain clear assembly code documentation and examples

### Collaboration Points
- **LanguageDesigner**: Coordinate on III language ecosystem integration
- **Developer**: Support implementation of compiler improvements
- **Architect**: Provide input on assembly architecture decisions
- **Tester**: Validate assembly code correctness and performance

### Code Style Guidelines
- Follow ARM64 assembly conventions and mnemonics
- Use consistent register allocation patterns
- Include clear comments for complex operations
- Maintain performance-oriented code organization
- Document optimization rationales

## III Project Context

### Integration with III Ecosystem
AAA is part of the larger III language ecosystem, sharing:
- Silicon binary format concepts
- Direct execution architecture
- Zero-interpretation philosophy
- Hardware-native performance focus

### Relationship to Other Components
- **III Language**: Higher-level language that can call AAA assembly
- **Silicon Runtime**: Shared execution environment
- **GPU Components**: Coordinate with GPU-native implementations
- **Build System**: Integrated with overall III build infrastructure

## Performance Requirements

### Compilation Performance
- Target: ~10,000 instructions/second compilation speed
- Binary size optimization: minimal overhead
- Memory usage: efficient compilation process

### Execution Performance
- Native ARM64 performance (no interpretation overhead)
- Optimal register utilization
- Cache-friendly instruction sequences
- Minimal runtime footprint

## Quality Standards

### Assembly Code Requirements
- ARM64 compliant instruction usage
- Proper label resolution and addressing
- Correct calling convention adherence
- Error handling for edge cases

### Testing Standards
- Functional correctness validation
- Performance regression testing
- Cross-platform compatibility (where applicable)
- Example code verification

## Future Enhancement Areas

### Short-term Improvements
- Expand ARM64 instruction set coverage
- Add debugging symbol support
- Implement basic optimization passes
- Improve error reporting and diagnostics

### Long-term Goals
- Advanced optimization techniques
- Cross-platform binary generation
- Interactive disassembler
- Performance profiling integration
- Integration with III language debugging tools

---

**Configuration Version**: 1.0
**Last Updated**: 2025-08-14
**Agent**: AAAAssemblyExpert