# Feature Specification: Code Style Standards Compliance

**Feature Branch**: `001-code-style-standards`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "Enhance the code base to meet coding standard described in https://github.com/VENIZIA-AI/ignis/blob/d58f0093/packages/docs/wiki/get-started/best-practices/code-style-standards.md"

## Clarifications

### Session 2025-12-25

- Q: What is the migration strategy for applying code style standards to existing code? → A: Gradual Convergence - Enforce standards on new/modified files only; use lint-disable comments for existing violations to be fixed incrementally

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Code Review Efficiency (Priority: P1)

As a developer reviewing code, I want consistent code formatting and structure so that I can quickly understand the codebase without being distracted by style inconsistencies.

**Why this priority**: This is the foundation for all other developer workflows. Consistent code style reduces cognitive load, speeds up code reviews, and prevents merge conflicts caused by formatting differences.

**Independent Test**: Can be tested by running Prettier and ESLint on the codebase - zero errors/warnings indicates the codebase meets the standard.

**Acceptance Scenarios**:

1. **Given** a developer checks out the codebase, **When** they run the lint command, **Then** zero linting errors should be reported
2. **Given** a developer modifies a file, **When** they run the format command, **Then** the file should be automatically formatted to match the project standards
3. **Given** a developer opens any source file, **When** they view the code, **Then** formatting should be consistent (double quotes, proper spacing, semicolons, etc.)

---

### User Story 2 - Maintainable Codebase Structure (Priority: P2)

As a developer onboarding to the project, I want code organized according to Ignis patterns so that I can quickly find files and understand the codebase architecture.

**Why this priority**: Proper directory structure and naming conventions significantly reduce onboarding time and make the codebase more maintainable. This follows P1 because it builds on the foundation of consistent formatting.

**Independent Test**: Can be tested by verifying directory structure matches the Ignis component organization pattern and all files use correct naming conventions.

**Acceptance Scenarios**:

1. **Given** a developer navigates to `src/components`, **When** they explore the structure, **Then** each feature should follow the standard pattern (index.ts, component.ts, controller.ts, common/)
2. **Given** a developer looks for a specific type of file, **When** they search, **Then** files should use kebab-case naming with appropriate suffixes (e.g., `user.controller.ts`, `auth.service.ts`)
3. **Given** a developer opens a folder, **When** they look for exports, **Then** an `index.ts` barrel export file should exist

---

### User Story 3 - Type Safety and Developer Experience (Priority: P3)

As a developer writing code, I want proper type definitions and IntelliSense support so that I can catch errors early and write code faster.

**Why this priority**: Type safety improves code quality and developer productivity. This is P3 because the codebase already has some TypeScript support, but we're enhancing it to match Ignis standards.

**Independent Test**: Can be tested by verifying all interfaces use `I` prefix, type aliases use `T` prefix, and constants use static class patterns instead of enums.

**Acceptance Scenarios**:

1. **Given** a developer creates an interface, **When** they name it, **Then** it should follow the `I` prefix convention (e.g., `IUserService`)
2. **Given** a developer creates a type alias, **When** they name it, **Then** it should follow the `T` prefix convention (e.g., `TUserRequest`)
3. **Given** a developer defines constants, **When** they create them, **Then** they should use static readonly classes instead of enums

---

### User Story 4 - Configured Development Tools (Priority: P1)

As a developer setting up the project, I want pre-configured linting and formatting tools so that I can start contributing without manually configuring development tools.

**Why this priority**: Without proper tooling configuration, developers cannot properly contribute to the project. This is P1 because it's required for the development workflow.

**Independent Test**: Can be tested by running `npm install` and `npm run lint:fix` - all tools should work without additional configuration.

**Acceptance Scenarios**:

1. **Given** a developer clones the repository, **When** they run `npm install`, **Then** ESLint and Prettier configurations should be installed
2. **Given** a developer runs `npm run lint`, **Then** ESLint should check the codebase using Ignis standards
3. **Given** a developer runs `npm run prettier:fix`, **Then** Prettier should format all files according to project standards

---

### Edge Cases

- What happens when a file has conflicting formatting rules between Prettier and ESLint?
  - Resolution: Prettier takes precedence for formatting; ESLint handles code quality issues
- How does system handle configuration for multiple packages in a monorepo?
  - Resolution: Root-level configuration inherited by packages with local overrides where needed
- What if `@venizia/dev-configs` is not available?
  - Resolution: Project should have fallback configuration that matches Ignis standards

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Codebase MUST use Prettier for code formatting with Ignis standard settings (double quotes, 100 char line width, trailing commas)
- **FR-001a**: NEW and MODIFIED files MUST be formatted with Prettier; EXISTING files may use `// prettier-ignore` comments to defer fixing to incremental updates
- **FR-002**: Codebase MUST use ESLint for code quality with `@venizia/dev-configs` configuration
- **FR-002a**: ESLint MUST pass on all new and modified files; existing violations may be suppressed with `// eslint-disable-next-line` comments for gradual remediation
- **FR-003**: All interfaces MUST use `I` prefix (e.g., `IUserService`, `IFileSystemAdapter`)
- **FR-004**: All type aliases MUST use `T` prefix (e.g., `TUserRequest`, `TFileSystemConfig`)
- **FR-005**: All constants MUST be defined as static readonly classes, NOT enums
- **FR-006**: All classes extending Ignis base classes MUST set scope using `ClassName.name`
- **FR-007**: All log messages MUST follow `[ClassName][methodName] Message` format
- **FR-008**: All error messages MUST follow `[ClassName][methodName] Descriptive message` format
- **FR-009**: All binding keys MUST follow `@app/[component]/[feature]` format
- **FR-010**: Every folder MUST have an `index.ts` barrel export file
- **FR-011**: File names MUST use kebab-case with appropriate type suffixes (e.g., `user.controller.ts`, `filesystem.adapter.ts`)
- **FR-012**: Component classes MUST be named with `[Feature]Component` pattern (e.g., `FileSystemComponent`)
- **FR-013**: Controller classes MUST be named with `[Feature]Controller` pattern
- **FR-014**: Service classes MUST be named with `[Feature]Service` pattern
- **FR-015**: Repository classes MUST be named with `[Feature]Repository` pattern
- **FR-016**: All configurable classes MUST define `DEFAULT_OPTIONS` constant
- **FR-017**: All constructors MUST validate required options and throw `getError` for invalid inputs
- **FR-018**: Project MUST use `@venizia/dev-configs` for ESLint, Prettier, and TypeScript configurations
- **FR-019**: All errors MUST be thrown using `getError` helper with proper HTTP status codes
- **FR-020**: TypeScript configuration MUST extend `@venizia/dev-configs/tsconfig.common.json`

### Key Entities

- **Code Style Configuration**: Represents the set of formatting and linting rules (Prettier, ESLint, TypeScript configs)
- **Naming Convention**: Standardized patterns for classes, interfaces, types, files, and directories
- **Component Structure**: The organizational pattern for features (component.ts, controller.ts, common/, etc.)
- **Constants Pattern**: Static class approach for constants with validation helpers
- **Error Handling Pattern**: Standardized format for errors with context information
- **Logging Pattern**: Standardized format for log messages with context

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero ESLint errors on all new and modified files (existing violations may be suppressed for gradual remediation)
- **SC-002**: Zero Prettier formatting differences on all new and modified files
- **SC-003**: 100% of NEW interfaces use `I` prefix; existing interfaces tracked for gradual migration
- **SC-004**: 100% of NEW type aliases use `T` prefix; existing type aliases tracked for gradual migration
- **SC-005**: Zero enums in NEW code; existing enums tracked for gradual replacement with static class constants
- **SC-006**: 100% of NEW classes extending base classes have proper scope naming; existing tracked
- **SC-007**: Every NEW directory has an `index.ts` barrel export file; existing directories tracked
- **SC-008**: NEW file names follow kebab-case convention with appropriate suffixes; existing tracked
- **SC-009**: New developers can run `npm install && npm run lint:fix` without configuration errors
- **SC-010**: Code review time reduced by 30% due to consistent formatting (measured after adoption)

### Quality Metrics

- **SC-011**: 100% of log messages follow `[ClassName][methodName] Message` format
- **SC-012**: 100% of error messages include context (class/method information)
- **SC-013**: TypeScript strict mode enabled with zero type errors
- **SC-014**: All components follow Ignis directory structure pattern
- **SC-015**: All configurable classes have `DEFAULT_OPTIONS` defined

### Technology-Agnostic Outcomes

- **SC-016**: Developers can locate any file in under 10 seconds due to consistent structure
- **SC-017**: Code reviews focus on logic instead of formatting (verified by issue tracker analysis)
- **SC-018**: Onboarding time for new developers reduced by 40%
- **SC-019**: Zero merge conflicts caused by formatting differences
- **SC-020**: All constants have runtime validation support through static class methods

## Assumptions

1. The project is a Node.js/TypeScript project using the Ignis framework
2. The codebase currently has some TypeScript configuration but may not meet all Ignis standards
3. The project uses or will use npm/bun for package management
4. Developers have access to `@venizia/dev-configs` package or can use fallback configurations
5. The codebase may have existing ESLint/Prettier configurations that need to be updated
6. The codebase may contain enums that need to be converted to static class constants
7. Some files may not follow the Ignis directory structure pattern
8. Git is used for version control

## Out of Scope

The following items are explicitly out of scope for this feature:

- **Performance optimization**: This feature focuses on code style standards, not runtime performance
- **New functionality**: No new features or business logic will be added
- **Documentation updates**: While code comments should be clear, this doesn't include external documentation
- **Testing infrastructure**: Test files should follow the same standards, but test framework setup is separate
- **CI/CD pipeline integration**: While scripts are provided, actual CI/CD configuration is not included
- **Breaking changes**: Refactoring should be non-breaking where possible; API changes are out of scope
- **Mass refactoring of existing files**: Only gradual, file-by-file remediation is in scope; big-bang reformatting of all existing files is out of scope

## Dependencies

### External Dependencies

- **@venizia/dev-configs**: Provides centralized ESLint, Prettier, and TypeScript configurations
- **@venizia/ignis**: Framework that defines the coding standards
- **@venizia/ignis-helpers**: Provides utility types like `TConstValue` for static class patterns

### Internal Dependencies

- Existing codebase structure and patterns
- Current TypeScript configuration (if any)
- Existing ESLint/Prettier configurations (if any)
- Package manager configuration (package.json)

### Prerequisite Features

None - this feature can be implemented independently

## Implementation Notes

### Migration Strategy

**Gradual Convergence Approach**:

- NEW and MODIFIED files must fully comply with all standards (no exceptions)
- EXISTING violations may be temporarily suppressed using:
  - `// eslint-disable-next-line` for ESLint violations
  - `// prettier-ignore` for Prettier violations
- Track suppressed violations for incremental remediation
- Prefer fixing violations in files being modified for other reasons
- File-by-file remediation is acceptable; big-bang reformatting is out of scope

### Code Style Settings Summary

Based on the Ignis coding standards document:

**Prettier Configuration**:

- `bracketSpacing: true` - `{ foo: bar }`
- `singleQuote: false` - `"string"` (double quotes)
- `printWidth: 100` - Maximum line length
- `trailingComma: 'all'` - Trailing commas where allowed
- `arrowParens: 'avoid'` - `x => x` not `(x) => x`
- `semi: true` - Semicolons required

**ESLint Configuration**:

- Extends `@minimaltech/eslint-node`
- Pre-configured for Node.js/TypeScript
- `@typescript-eslint/no-explicit-any` disabled by default

**TypeScript Configuration**:

- `target: ES2022`
- `experimentalDecorators: true` (required for Ignis)
- `emitDecoratorMetadata: true`
- `strict: true`
- `skipLibCheck: true`

**Naming Conventions**:

- Components: `[Feature]Component`
- Controllers: `[Feature]Controller`
- Services: `[Feature]Service`
- Repositories: `[Feature]Repository`
- Interfaces: `I` prefix
- Type aliases: `T` prefix
- Files: kebab-case with type suffix

**Constants Pattern**:

- Use static readonly classes instead of enums
- Include `SCHEME_SET` for O(1) validation
- Provide `isValid()` method for runtime validation
- Use `TConstValue` helper to extract union type

**Error Handling**:

- Use `getError` helper from `@venizia/ignis`
- Include `[ClassName][methodName]` context in error messages
- Use `HTTP.ResultCodes` for status codes

**Logging**:

- Format: `[ClassName][methodName] Message | Key: %s`
- Use format specifiers: `%s` (string), `%d` (number), `%j` (JSON)
