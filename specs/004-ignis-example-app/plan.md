# Implementation Plan: Ignis Example Application

**Branch**: `004-ignis-example-app` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ignis-example-app/spec.md`

## Summary

Create a complete, runnable Ignis example application that demonstrates how to register and use the FilesystemComponent from the @ignis/filesystem library. The example will show core Ignis patterns including component registration, dependency injection, configuration management, and lifecycle hooks. The application will be located at `examples/ignis-application/` with its own package.json for independent execution.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+
**Primary Dependencies**:

- `@venizia/ignis` (^1.0.0) - Core Ignis framework for Application and dependency injection
- `@ignis/filesystem` (workspace package, ../src) - Filesystem component and interfaces

**Storage**: Local filesystem (default), S3 (via configuration switch)
**Testing**: Not required for example application (demo-only code)
**Target Platform**: Node.js 18+ (Linux/macOS/Windows)
**Project Type**: Example/Demo application (single project structure)
**Performance Goals**: Example code, not performance-optimized
**Constraints**: Source code under 300 lines (excluding comments/config), simple error handling only
**Scale/Scope**: Small example demonstrating 6 core filesystem operations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: No constitution file exists yet. Following common TypeScript/Ignis best practices:

- Type-safe code with proper TypeScript definitions
- Clear code comments explaining Ignis patterns
- Simple, maintainable structure
- No complex abstractions for example code

## Project Structure

### Documentation (this feature)

```text
specs/004-ignis-example-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if applicable)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
examples/
├── ignis-application/           # NEW: Ignis example application
│   ├── src/
│   │   ├── app.ts              # Main Application class with component registration
│   │   ├── services/
│   │   │   └── file-service.ts # Example service demonstrating DI of filesystem
│   │   └── index.ts            # Entry point
│   ├── config/
│   │   ├── local.yaml          # Local filesystem configuration (YAML)
│   │   ├── local.json          # Local filesystem configuration (JSON)
│   │   ├── s3.yaml             # S3 configuration (YAML)
│   │   └── s3.json             # S3 configuration (JSON)
│   ├── package.json            # Independent package configuration
│   ├── tsconfig.json           # TypeScript config
│   └── README.md               # Setup and usage documentation
```

**Structure Decision**: Single project structure under `examples/ignis-application/`. The example is self-contained with its own package.json for independent execution and development. Uses standard Ignis patterns: Application class, component registration, service classes with dependency injection decorators, and configuration-based adapter selection.

## Complexity Tracking

> No constitution violations to justify.

---

# Phase 0: Research & Technology Decisions

## Research Tasks

### 1. Ignis Framework Patterns

**Question**: What are the correct patterns for:

- Creating an Application instance
- Registering components
- Creating services with dependency injection
- Application lifecycle (start/stop)

**Findings**: Based on available information:

- `@venizia/ignis` is a TypeScript server infrastructure framework
- Uses dependency injection through `@venizia/ignis-inversion`
- Components extend `BaseComponent` with lifecycle hooks: `binding()`, `initialize()`, `start()`, `stop()`
- Uses decorators like `@Component()` and `@Inject()` for dependency injection
- Configuration is typically object-based (YAML/JSON compatible)

**Decision**: Follow the mock patterns defined in `src/mocks/ignis-core.ts` since the actual @venizia/ignis npm package is referenced but not fully documented in the codebase. The mock implementation provides sufficient patterns for a working example.

**Alternatives Considered**:

- Wait for actual @venizia/ignis documentation: Would delay implementation
- Use InversifyJS directly: Different API, not aligned with project goals

### 2. Configuration Format

**Question**: Should YAML or JSON be the primary format?

**Findings**:

- Spec requires both formats (FR-004, Clarification 2)
- YAML is more readable for examples
- JSON is more universally supported
- Both formats should be functionally identical

**Decision**: Provide both `local.yaml` and `local.json` (and `s3.yaml`, `s3.json`) as complete examples. The main application code will demonstrate inline configuration as well (FR-004).

**Alternatives Considered**:

- YAML only: Would violate spec requirement
- JSON only: Would violate spec requirement

### 3. Error Handling Approach

**Question**: How to handle errors in example code?

**Findings**: Spec clarifies (Session 2025-12-24): "Simple defaults with basic errors (use sensible defaults like auto-creating directories, with basic try-catch and clear error messages)"

**Decision**:

- Use try-catch blocks for each file operation
- Log errors with clear messages
- Continue execution after errors (don't exit)
- No retry logic or complex error recovery
- Use `createMissingDirs: true` for local adapter

**Alternatives Considered**:

- Comprehensive error handling: Violates spec simplicity requirement
- Fail-fast on any error: Not user-friendly for learning

## Phase 0 Output: research.md Summary

| Decision                                         | Rationale                                                      |
| ------------------------------------------------ | -------------------------------------------------------------- |
| Use mock patterns from `src/mocks/ignis-core.ts` | Sufficient for working example, aligned with existing codebase |
| Provide both YAML and JSON configs               | Required by spec, gives developers choice                      |
| Simple error handling with try-catch             | Required by spec, keeps example accessible                     |
| Single service (FileService) for DI demo         | Demonstrates pattern without over-complication                 |
| Local adapter as default                         | Works immediately without AWS credentials                      |
| Console logging for operations                   | Makes execution visible and educational                        |

---

# Phase 1: Design & Contracts

## Data Model

See [data-model.md](./data-model.md) for entity definitions.

### Entities

**ExampleApplication**: Main application class

- Properties: app (Application instance), filesystemComponent (FilesystemComponent)
- Methods: configure(), registerComponents(), start(), stop(), runDemo()

**FileService**: Service class demonstrating DI

- Properties: filesystem (Filesystem) - injected via constructor
- Methods: processFile(), listFiles(), createDirectory()

**Configuration**: Config objects (YAML/JSON)

- Local config: type='local', local.basePath, local.createMissingDirs
- S3 config: type='s3', s3.bucket, s3.region, s3.prefix

## API Contracts

Not applicable - this is an example application with no external API.

## File Structure Contracts

### Configuration Files

**local.yaml**:

```yaml
filesystem:
  type: "local"
  local:
    basePath: "./storage"
    createMissingDirs: true
```

**local.json**:

```json
{
  "filesystem": {
    "type": "local",
    "local": {
      "basePath": "./storage",
      "createMissingDirs": true
    }
  }
}
```

**s3.yaml**:

```yaml
filesystem:
  type: "s3"
  s3:
    bucket: "my-bucket"
    region: "us-east-1"
    prefix: "example/"
```

**s3.json**: Same structure as YAML

### Application Entry Point

**src/index.ts**:

- Creates Application instance
- Loads configuration (with fallback to inline defaults)
- Registers FilesystemComponent
- Starts application
- Runs demo operations
- Handles graceful shutdown

### Service Contract

**src/services/file-service.ts**:

- Constructor with `@Inject('filesystem.instance.default')` decorator
- Methods: writeFile, readFile, deleteFile, listFiles, getFileStats, checkExists
- Each method logs operation and handles errors

## Quick Start Guide

See [quickstart.md](./quickstart.md) for user-facing documentation.

---

# Phase 2: Implementation Tasks

_This section will be populated by `/speckit.tasks` command._

---

# Constitution Check (Post-Design)

_Re-check after Phase 1 design._

**Status**: Design remains aligned with best practices:

- TypeScript types throughout
- Simple, readable code structure
- Clear comments for Ignis patterns
- No over-engineering for example code
- Under 300 lines of source code

**No violations or justified deviations.**

---

# References

- **Feature Spec**: [spec.md](./spec.md)
- **@venizia/ignis npm**: https://www.npmjs.com/package/@venizia/ignis
- **@venizia/ignis-docs npm**: https://www.npmjs.com/package/@venizia/ignis-docs
- **Existing FilesystemComponent**: [src/component.ts](../../src/component.ts)
- **Ignis Mock Patterns**: [src/mocks/ignis-core.ts](../../src/mocks/ignis-core.ts)
