# Feature Specification: Ignis Example Application

**Feature Branch**: `004-ignis-example-app`
**Created**: 2025-12-24
**Status**: Draft
**Input**: User description: "Implement example application. It is a https://www.npmjs.com/package/@venizia/ignis application. It registers file system component."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer references example application to integrate filesystem component (Priority: P1)

As a developer exploring the @ignis/filesystem library, I want a complete working example application that demonstrates how to register and use the filesystem component within an Ignis application, so that I can understand the integration pattern and apply it to my own projects.

**Why this priority**: This is the primary use case - providing developers with a reference implementation they can study, run, and adapt. Without a working example, developers must piece together integration details from documentation, which increases friction and adoption barriers.

**Independent Test**: Can be fully tested by cloning the repository, installing dependencies, running the example application, and verifying it successfully starts, registers the filesystem component, and performs file operations.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** a developer runs `npm install` and `npm start` on the example application, **Then** the application starts successfully with the filesystem component registered
2. **Given** the example application is running, **When** it executes its demonstration operations, **Then** all file operations (read, write, delete) complete successfully
3. **Given** the example application source code, **When** a developer reads through the code, **Then** they can identify the key integration patterns (component registration, configuration, dependency injection)

---

### User Story 2 - Developer adapts example application for their own use (Priority: P2)

As a developer, I want to easily modify the example application to use my own storage configuration and file operations, so that I can quickly prototype my own Ignis application with filesystem capabilities.

**Why this priority**: Adaptability is essential for the example to be practically useful. Developers should be able to customize the example for their needs without major refactoring.

**Acceptance Scenarios**:

1. **Given** the example application source code, **When** a developer modifies the configuration to use their own S3 bucket or local directory, **Then** the application runs with their configuration
2. **Given** the example application, **When** a developer adds their own service that uses the filesystem component, **Then** the service can successfully inject and use the filesystem
3. **Given** the example application structure, **When** a developer wants to switch from local to S3 adapter, **Then** they only need to modify configuration (change `defaultAdapter` and add S3 settings), no code changes required

---

### User Story 3 - Developer uses example application for testing and development (Priority: P3)

As a developer working on the filesystem library or Ignis integration, I want to use the example application as a test harness to verify filesystem operations work correctly in an Ignis context.

**Why this priority**: The example serves as both documentation and a testing tool for the filesystem component integration.

**Acceptance Scenarios**:

1. **Given** the example application, **When** a developer makes changes to the filesystem library, **Then** they can run the example to verify the integration still works
2. **Given** the example application, **When** health checks are configured, **Then** the application reports filesystem component health status
3. **Given** the example application, **When** errors occur (file not found, permission issues), **Then** the application demonstrates proper error handling patterns

---

### Edge Cases

- **Missing configuration files**: Example uses inline configuration defaults with console warnings if files not found
- **Missing S3 environment variables**: Example fails at startup with clear error message indicating which variables are required
- **Local directory doesn't exist**: Example auto-creates directories using `createMissingDirs: true` configuration option
- **Local directory not writable**: Example catches permission errors and displays clear error message with suggested fix
- **Application shutdown**: Example demonstrates graceful shutdown pattern with cleanup comments (no complex resource management needed)
- **Concurrent file operations**: Example demonstrates sequential operations; comments note that filesystem is thread-safe for concurrent use
- **Failed operation recovery**: Example demonstrates try-catch pattern with error logging, then continues with next operation

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Example application MUST be a complete, runnable Ignis application using @venizia/ignis framework
- **FR-002**: Example application MUST register the FilesystemComponent from feature 003
- **FR-003**: Example application MUST demonstrate dependency injection by creating at least one service that injects the filesystem
- **FR-004**: Example application MUST use a single default adapter (local filesystem by default) with configuration comments showing how to switch to S3; configuration provided in both YAML and JSON formats
- **FR-005**: Example application MUST demonstrate at least these core file operations: writeFile, readFile, unlink, stat, exists, readdir
- **FR-006**: Example application MUST include a README with setup instructions, prerequisites, and usage examples
- **FR-007**: Example application MUST demonstrate proper error handling with try-catch blocks and meaningful error messages (simple, clear errors without over-engineering)
- **FR-008**: Example application MUST demonstrate health check integration for the filesystem component
- **FR-009**: Example application MUST include console logging that clearly shows what operations are being performed
- **FR-010**: Example application MUST clean up any test files it creates during execution
- **FR-011**: Example application source code MUST be well-commented to explain Ignis concepts (component registration, dependency injection, lifecycle)
- **FR-012**: Example application MUST follow TypeScript best practices with proper type definitions
- **FR-013**: Example application MUST include a package.json with all required dependencies and scripts

### Key Entities

- **ExampleApplication**: The main Ignis application class that initializes and starts the example
- **FileService**: A sample Ignis service that demonstrates dependency injection of the filesystem component
- **Configuration**: YAML and JSON configuration files showing local and S3 adapter setups (both formats provided)
- **README**: Documentation explaining setup, configuration options, and how to run the example

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer new to the project can run the example application within 5 minutes of cloning the repository
- **SC-002**: Example application successfully demonstrates at least 6 different filesystem operations
- **SC-003**: Example application code contains explanatory comments for all Ignis-specific patterns (component registration, injection tokens, lifecycle hooks)
- **SC-004**: README documentation covers 100% of setup steps (prerequisites, installation, configuration, running)
- **SC-005**: Example application can switch between local and S3 adapters by changing only configuration files
- **SC-006**: Example application handles and reports errors in a user-friendly way
- **SC-007**: Total source code size is under 300 lines (excluding comments and configuration) to maintain clarity
- **SC-008**: Example application runs successfully on Node.js 18+ and TypeScript 5+

## Clarifications

### Session 2025-12-24

- Q: Edge Case Handling Strategy - Should the example demonstrate comprehensive error handling, simple defaults, or minimal handling? → A: Simple defaults with basic errors (use sensible defaults like auto-creating directories, with basic try-catch and clear error messages)
- Q: Multi-Adapter Support - Should the example demonstrate using both adapters simultaneously or a single default adapter? → A: Single adapter only (local by default, config comments show S3 switch)
- Q: Configuration File Format - Should the example provide YAML only, JSON only, or both formats? → A: Both YAML and JSON (provide both formats for completeness)
- Q: Demo Script Scope - Is the optional demo script in scope for this feature? → A: Not in scope (main application demonstration is sufficient)

### Clarification 1: Example Application Scope and Complexity

**Question**: How complex should the example application be? Should it demonstrate basic operations only, or include advanced patterns like custom adapters, streaming, and concurrent operations?

**Answer**: Focus on core integration patterns with basic operations. The example should demonstrate:

1. Component registration and configuration
2. Dependency injection in a custom service
3. Basic file operations (read, write, delete, stat, exists)
4. Error handling
5. Health checks

Advanced patterns (streaming, custom adapters, concurrent operations) should be mentioned in comments or optional sections but not required for the core example. This keeps the example accessible to newcomers while still showing essential patterns.

**Impact on Requirements**:

- FR-005 focuses on core operations only (writeFile, readFile, unlink, stat, exists, readdir)
- Add optional section for advanced patterns in comments or separate file
- Keep main example under 300 lines

### Clarification 2: Configuration Approach

**Question**: Should the example use configuration files (YAML/JSON), environment variables, or inline configuration?

**Answer**: Provide both configuration files and inline configuration with clear comments. The example should include:

1. A `config/` directory with example YAML AND JSON files for local and S3 configurations
2. Inline configuration in the main application file with detailed comments explaining each option
3. Environment variable support documentation in the README

This approach demonstrates multiple valid configuration patterns and allows developers to choose the approach that fits their needs.

**Impact on Requirements**:

- Update FR-004 to specify both file-based (YAML and JSON) and inline configuration examples
- Add configuration directory structure to example with both formats
- README must document all configuration approaches (files, inline, environment variables)

### Clarification 3: Example Application Location and Naming

**Question**: Where should the example application be located in the repository? What should it be named?

**Answer**: Create a new `examples/ignis-application/` directory (separate from existing examples) with a clear, descriptive structure. The example should be named to clearly indicate it's an Ignis application integration example.

**Impact on Requirements**:

- Example located at `examples/ignis-application/`
- Includes its own package.json for dependency management
- Can be run independently from the main library code
