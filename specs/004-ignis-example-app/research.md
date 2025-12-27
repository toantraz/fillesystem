# Research: Ignis Example Application

**Feature**: `004-ignis-example-app`
**Date**: 2025-12-24

## Overview

This document captures research findings and technology decisions for implementing the Ignis example application that demonstrates the FilesystemComponent integration.

## Technology Decisions

### 1. Ignis Framework Implementation

**Decision**: Use mock patterns from `src/mocks/ignis-core.ts`

**Rationale**:

- The actual `@venizia/ignis` npm package exists but lacks comprehensive documentation in the codebase
- The mock implementation in `src/mocks/ignis-core.ts` provides sufficient patterns for a working example
- Using the existing mock ensures compatibility with the FilesystemComponent
- The mock demonstrates the core patterns: `BaseComponent`, `@Inject()` decorator, lifecycle hooks

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|------------|------|------|------------------|
| Wait for @venizia/ignis docs | Would use "real" API | Would delay implementation indefinitely | Blocks progress |
| Use InversifyJS directly | Well-documented | Different API, not aligned with project | Incompatible with FilesystemComponent |

**Implementation Notes**:

- Use `BaseComponent` as the base class for components
- Implement `binding()`, `initialize()`, `start()`, `stop()` lifecycle hooks
- Use `@Inject()` decorator for constructor dependency injection
- Follow the existing `FilesystemComponent` pattern in `src/component.ts`

### 2. Configuration Approach

**Decision**: Provide both YAML and JSON configuration files with inline fallback

**Rationale**:

- Spec explicitly requires both formats (FR-004, Clarification 2)
- YAML is more readable and commonly used in modern Node.js projects
- JSON is more universally supported and doesn't require additional parsers
- Inline configuration ensures the example works even without config files

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|------------|------|------|------------------|
| YAML only | Cleaner examples | Violates spec requirement | FR-004 explicitly requires both |
| JSON only | No parser needed | Less readable, violates spec | FR-004 explicitly requires both |
| Environment only | Simple for containers | Harder to read/debug | Not user-friendly for learning |

**Implementation Notes**:

- Create `config/local.yaml` and `config/local.json` for local filesystem
- Create `config/s3.yaml` and `config/s3.json` for S3 configuration
- Use inline configuration as fallback with detailed comments
- Load config files with try-catch, fall back to inline if not found

### 3. Error Handling Strategy

**Decision**: Simple try-catch with clear error messages

**Rationale**:

- Spec clarifies: "Simple defaults with basic errors" (Session 2025-12-24)
- Comprehensive error handling would over-complicate the example
- Basic try-catch demonstrates the pattern without overwhelming beginners
- Console.error with meaningful messages helps developers understand issues

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|------------|------|------|------------------|
| Comprehensive error handling | Production-ready | Too complex for example | Violates simplicity goal |
| Fail-fast on error | Easy to implement | Stops demo prematurely | Not user-friendly for learning |
| No error handling | Simplest code | Unhelpful for debugging | Not educational |

**Implementation Notes**:

- Wrap each file operation in try-catch
- Log errors to console.error with operation context
- Continue execution after errors (don't process.exit)
- Use `createMissingDirs: true` for local adapter to prevent permission errors
- For S3, fail at startup if environment variables are missing

### 4. Dependency Injection Pattern

**Decision**: Constructor injection with `@Inject()` decorator

**Rationale**:

- Constructor injection is the most common DI pattern in TypeScript
- `@Inject()` decorator is supported by the mock implementation
- Makes dependencies explicit and testable
- Aligns with existing `FilesystemComponent` patterns

**Injection Tokens**:

- `'filesystem.instance.default'` - Default filesystem instance
- `'filesystem.component.instance'` - Component instance (for health checks)

**Implementation Notes**:

- Create `FileService` class with `@Inject('filesystem.instance.default')` in constructor
- The service will use the injected filesystem for all operations
- Demonstrate that the filesystem can be used without knowing the adapter type

### 5. Default Adapter Selection

**Decision**: Use local filesystem as default

**Rationale**:

- Works immediately without any external setup or credentials
- Developers can run the example as soon as they clone the repo
- S3 requires AWS credentials which creates friction
- Easy to switch to S3 via configuration (demonstrates the pattern)

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|------------|------|------|------------------|
| S3 default | Production-like | Requires AWS credentials | Blocks immediate execution |
| Prompt user | Flexible | Adds complexity | Not user-friendly |

**Implementation Notes**:

- Default configuration uses `type: 'local'` with `basePath: './storage'`
- Configuration files show both local and S3 options with comments
- README explains how to switch between adapters

### 6. Demo Operations

**Decision**: Demonstrate 6 core filesystem operations

**Rationale**:

- Spec requires: writeFile, readFile, unlink, stat, exists, readdir (FR-005)
- These operations cover the most common use cases
- Sequential operations are easier to follow than concurrent

**Operations**:

1. `writeFile` - Create a test file
2. `readFile` - Read the file back
3. `exists` - Check if file exists
4. `stat` - Get file metadata
5. `readdir` - List directory contents
6. `unlink` - Clean up test file

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|------------|------|------|------------------|
| More operations | Comprehensive | Exceeds 300-line limit | Violates SC-007 |
| Streaming operations | Shows advanced features | Too complex for example | Deferred to advanced section |

## Best Practices Research

### TypeScript Project Structure

**Decision**: Standard TypeScript project with separate src/

**Structure**:

```
examples/ignis-application/
├── src/
│   ├── app.ts              # Application class
│   ├── services/
│   │   └── file-service.ts # Service with DI
│   └── index.ts            # Entry point
├── config/                 # Configuration files
├── package.json
├── tsconfig.json
└── README.md
```

**Rationale**:

- Follows common TypeScript conventions
- Separates source code from configuration
- Clear entry point at `src/index.ts`

### Package.json Scripts

**Decision**: Simple scripts for development and running

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "clean": "rm -rf dist"
  }
}
```

**Rationale**:

- `build`: Compile TypeScript to JavaScript
- `start`: Run compiled example
- `dev`: Run directly with ts-node for development
- `clean`: Remove build artifacts

### Dependencies

```json
{
  "dependencies": {
    "@venizia/ignis": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}
```

**Note**: The FilesystemComponent will be imported from the workspace (../../src)

## Uncertities Resolved

| Question                           | Answer                             | Source                     |
| ---------------------------------- | ---------------------------------- | -------------------------- |
| How to create Application instance | Use patterns from mock             | src/mocks/ignis-core.ts    |
| How to register components         | app.component(FilesystemComponent) | Mock patterns              |
| How to inject dependencies         | @Inject() decorator in constructor | Mock patterns              |
| Configuration format               | Both YAML and JSON                 | Spec FR-004                |
| Default adapter                    | Local filesystem                   | Best practice for examples |
| Error handling                     | Simple try-catch                   | Spec clarification         |

## References

- **@venizia/ignis npm**: https://www.npmjs.com/package/@venizia/ignis
- **@venizia/ignis-docs npm**: https://www.npmjs.com/package/@venizia/ignis-docs
- **Existing FilesystemComponent**: ../../src/component.ts
- **Ignis Mock Patterns**: ../../src/mocks/ignis-core.ts
- **Feature Specification**: ./spec.md
