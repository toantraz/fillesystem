# Research: Code Style Standards Compliance

**Feature**: 001-code-style-standards
**Date**: 2025-12-25
**Status**: COMPLETE

## Overview

This research documents the technical decisions and best practices for implementing Ignis coding standards in the filesystem project. The primary source is the [Ignis Code Style Standards](https://github.com/VENIZIA-AI/ignis/blob/d58f0093/packages/docs/wiki/get-started/best-practices/code-style-standards.md).

---

## Decision 1: ESLint Configuration

**Decision**: Use `@venizia/dev-configs` for ESLint configuration

**Rationale**:

- Centralized configuration maintained by Venizia team
- Pre-configured for Node.js/TypeScript projects
- Consistent with other Ignis-based projects
- Extends `@minimaltech/eslint-node` with project-specific rules

**Configuration**:

```javascript
// .eslintrc.json
{
  "extends": ["@venizia/dev-configs/eslint"],
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

**Alternatives Considered**:

1. **Manual ESLint configuration**: Rejected because it creates maintenance burden and potential drift from Ignis standards
2. **Alternative shared configs (e.g., Airbnb, Standard)**: Rejected because they don't align with Ignis framework conventions

---

## Decision 2: Prettier Configuration

**Decision**: Use `@venizia/dev-configs` for Prettier configuration

**Rationale**:

- Consistency with ESLint configuration approach
- Pre-integrated with ESLint to avoid conflicts
- Matches Ignis framework code style exactly

**Configuration**:

```javascript
// .prettierrc.js
module.exports = require("@venizia/dev-configs/prettier");
```

**Settings** (from Ignis standards):
| Setting | Value | Notes |
|---------|-------|-------|
| `bracketSpacing` | `true` | `{ foo: bar }` |
| `singleQuote` | `false` | Double quotes required |
| `printWidth` | `100` | Maximum line length |
| `trailingComma` | `'all'` | Trailing commas where allowed |
| `arrowParens` | `'avoid'` | `x => x` not `(x) => x` |
| `semi` | `true` | Semicolons required |

**Alternatives Considered**:

1. **Project-specific Prettier config**: Rejected to maintain consistency with Ignis ecosystem
2. **Prettier disabled**: Rejected - formatting consistency is a core requirement

---

## Decision 3: TypeScript Configuration

**Decision**: Extend `@venizia/dev-configs/tsconfig.common.json`

**Rationale**:

- Base configuration provides essential compiler options for Ignis projects
- Ensures compatibility with Ignis decorators and metadata
- Maintains strict type checking

**Configuration**:

```json
// tsconfig.json
{
  "extends": "@venizia/dev-configs/tsconfig.common.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Required Compiler Options** (for Ignis):
| Option | Value | Purpose |
|--------|-------|---------|
| `target` | `ES2022` | Modern JavaScript features |
| `experimentalDecorators` | `true` | Ignis decorators |
| `emitDecoratorMetadata` | `true` | Decorator type metadata |
| `strict` | `true` | Strict type checking |
| `skipLibCheck` | `true` | Faster builds |

**Alternatives Considered**:

1. **Custom TypeScript config**: Rejected because it risks missing required Ignis options

---

## Decision 4: Interface Naming Convention

**Decision**: All interfaces MUST use `I` prefix

**Rationale**:

- Visual distinction between interfaces and classes
- Standard Ignis convention
- Improves code readability

**Examples**:

```typescript
// Good
interface IUserService {
  getUser(id: string): Promise<IUser>;
}

interface IFileSystemAdapter {
  read(path: string): Promise<Buffer>;
}

// Bad
interface UserService {} // Missing I prefix
interface user {} // Wrong casing
```

**Alternatives Considered**:

1. **No prefix (TypeScript default)**: Rejected - doesn't match Ignis standards
2. **T prefix for interfaces**: Rejected - T is reserved for type aliases

---

## Decision 5: Type Alias Naming Convention

**Decision**: All type aliases MUST use `T` prefix

**Rationale**:

- Clear distinction from interfaces
- Indicates utility/discriminated types
- Standard Ignis convention

**Examples**:

```typescript
// Good
type TUserRequest = {
  name: string;
  email: string;
};

type TFileSystemConfig = {
  rootPath: string;
  readonly: boolean;
};

type TEvent = TClickEvent | TSubmitEvent;

// Bad
type UserRequest { }  // Missing T prefix
type user { }         // Wrong casing
```

**Alternatives Considered**:

1. **No prefix**: Rejected - loses type category information
2. **U prefix**: Rejected - not standard in Ignis

---

## Decision 6: Constants Pattern

**Decision**: Use static readonly classes instead of enums

**Rationale**:

- Enums have runtime overhead and tree-shaking issues
- Static classes provide better TypeScript intellisense
- Supports runtime validation through helper methods
- Compatible with `TConstValue` helper type

**Pattern**:

```typescript
// Good - Static class with validation
class HttpStatus {
  private static readonly _SCHEME_SET = new Set<string>(["OK", "NOT_FOUND", "ERROR"]);

  static readonly OK = "OK";
  static readonly NOT_FOUND = "NOT_FOUND";
  static readonly ERROR = "ERROR";

  static isValid(value: string): value is THttpStatus {
    return this._SCHEME_SET.has(value);
  }
}

type THttpStatus = TConstValue<typeof HttpStatus>;

// Usage
const status: THttpStatus = HttpStatus.OK;
if (HttpStatus.isValid(status)) {
  // TypeScript knows status is valid
}

// Bad - Enum (avoid)
enum HttpStatus {
  OK = "OK",
  NOT_FOUND = "NOT_FOUND",
}
```

**Alternatives Considered**:

1. **Native TypeScript enums**: Rejected - tree-shaking issues, no runtime validation
2. **Plain const objects**: Rejected - less type safety, no validation helpers

---

## Decision 7: Class Naming Conventions

**Decision**: Follow `[Feature][Type]` pattern consistently

**Rationale**:

- Predictable file location from class name
- Clear separation of concerns
- Matches Ignis component organization

**Patterns**:
| Type | Pattern | Example |
|------|---------|---------|
| Component | `[Feature]Component` | `FileSystemComponent` |
| Controller | `[Feature]Controller` | `FileSystemController` |
| Service | `[Feature]Service` | `FileSystemService` |
| Repository | `[Feature]Repository` | `UserRepository` |
| Adapter | `[Feature]Adapter` | `S3Adapter` |
| Helper | `[Feature]Helper` | `ValidationHelper` |

**File Naming**:

- Files use kebab-case with type suffix
- Example: `file-system.component.ts`, `file-system.controller.ts`

**Alternatives Considered**:

1. **Flat naming without suffixes**: Rejected - harder to locate files
2. **Different suffix style**: Rejected - inconsistent with Ignis

---

## Decision 8: Logging Format

**Decision**: Use `[ClassName][methodName] Message` format

**Rationale**:

- Consistent log parsing
- Easy to trace execution flow
- Standard Ignis convention

**Pattern**:

```typescript
// Good
logger.info("[UserService][getUser] Fetching user | ID: %s", userId);
logger.error("[UserService][deleteUser] User not found | ID: %s", userId);
logger.debug("[S3Adapter][upload] Upload complete | Size: %d bytes", size);

// Bad
logger.info("getting user"); // Missing context
logger.info(`User ${userId}`); // Inconsistent format
```

**Format Specifiers**:

- `%s` - String
- `%d` - Number
- `%j` - JSON (auto-serialized)

**Alternatives Considered**:

1. **Structured logging (JSON)**: Rejected for application logs (useful for metrics, less readable for developers)
2. **No context prefix**: Rejected - harder to debug

---

## Decision 9: Error Handling Format

**Decision**: Use `getError` helper with `[ClassName][methodName]` context

**Rationale**:

- Consistent error messages
- HTTP status code association
- Stack trace preservation
- Standard Ignis pattern

**Pattern**:

```typescript
import { getError } from "@venizia/ignis";
import { HTTP } from "@venizia/ignis";

class UserService {
  getUser(id: string): IUser {
    if (!id) {
      throw getError("[UserService][getUser] Invalid user ID", HTTP.ResultCodes.BAD_REQUEST);
    }
    const user = this.repository.find(id);
    if (!user) {
      throw getError("[UserService][getUser] User not found", HTTP.ResultCodes.NOT_FOUND);
    }
    return user;
  }
}
```

**Alternatives Considered**:

1. **Native Error class**: Rejected - lacks HTTP status code integration
2. **Custom error classes**: Rejected - over-engineering for this use case

---

## Decision 10: Directory Structure

**Decision**: Feature-based organization with barrel exports

**Rationale**:

- Clear feature boundaries
- Easy to locate related files
- Supports lazy loading
- Standard Ignis pattern

**Structure**:

```text
src/components/[feature]/
├── index.ts                 # Barrel export (exports everything)
├── [feature].component.ts   # Main component class
├── [feature].controller.ts  # Controller (if needed)
└── common/                  # Shared types, constants, utilities
    ├── index.ts
    ├── types.ts
    └── constants.ts
```

**Every folder MUST have `index.ts`**:

```typescript
// src/components/file-system/index.ts
export { FileSystemComponent } from "./file-system.component";
export * from "./common";
```

**Alternatives Considered**:

1. **Type-based organization (models/, controllers/, services/)**: Rejected - harder to find feature-related code
2. **No barrel exports**: Rejected - deeper import paths

---

## Decision 11: Binding Key Format

**Decision**: Use `@app/[component]/[feature]` format

**Rationale**:

- Hierarchical organization
- Clear dependency injection structure
- Prevents naming conflicts
- Standard Ignis convention

**Examples**:

```typescript
// Binding keys
const BINDINGS = {
  FILE_SYSTEM_COMPONENT: "@app/filesystem/component",
  FILE_SYSTEM_ADAPTER: "@app/filesystem/adapter",
  USER_SERVICE: "@app/user/service",
  S3_ADAPTER: "@app/s3/adapter",
};
```

**Alternatives Considered**:

1. **Flat naming**: Rejected - potential for naming conflicts
2. **Class-based naming**: Rejected - less flexible

---

## Decision 12: Constructor Validation Pattern

**Decision**: All constructors must validate options and throw `getError`

**Rationale**:

- Fail fast on invalid configuration
- Consistent error handling
- Better developer experience

**Pattern**:

```typescript
class S3Adapter {
  static readonly DEFAULT_OPTIONS = {
    region: "us-east-1",
    maxRetries: 3,
  } as const;

  constructor(private readonly options: IS3AdapterOptions) {
    // Validate required options
    if (!options.bucketName) {
      throw getError(
        "[S3Adapter][constructor] bucketName is required",
        HTTP.ResultCodes.BAD_REQUEST,
      );
    }
    // Merge with defaults
    this.options = { ...S3Adapter.DEFAULT_OPTIONS, ...options };
  }
}
```

**Alternatives Considered**:

1. **No validation**: Rejected - errors surface later, harder to debug
2. **Assertion libraries**: Rejected - additional dependency

---

## Migration Strategy

**Decision**: Gradual convergence with suppression comments

**Rationale**:

- Avoid massive unreviewable commits
- Allow developers to fix violations incrementally
- Prevent merge conflicts from formatting changes
- Maintain velocity while improving quality

**Implementation**:

```typescript
// For existing violations, suppress with comments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = getLegacyData();

// prettier-ignore
const poorlyFormatted = {
  foo:'bar'
};

// New code MUST comply - no exceptions
```

**Workflows**:

1. **New files**: Must be 100% compliant
2. **Modified files**: Fix violations in modified sections
3. **Existing files**: Can be suppressed, tracked for later remediation

**Alternatives Considered**:

1. **Big bang reformat**: Rejected - creates merge conflicts, unreviewable
2. **No enforcement**: Rejected - never converges on standards

---

## Best Practices Summary

1. **Always use `I` prefix for interfaces** - Visual distinction
2. **Always use `T` prefix for type aliases** - Clear type category
3. **Use static classes for constants** - Better than enums
4. **Follow `[Feature][Type] naming** - Predictable structure
5. **Every folder needs `index.ts`** - Barrel exports
6. **Use kebab-case for files** - Consistency with Ignis
7. **Log with `[Class][Method]` prefix** - Debuggability
8. **Throw with `getError` helper** - HTTP status integration
9. **Validate in constructors** - Fail fast
10. **Suppress old violations gradually** - Manageable migration

---

## Open Questions

None - all technical decisions resolved.

---

## References

- [Ignis Code Style Standards](https://github.com/VENIZIA-AI/ignis/blob/d58f0093/packages/docs/wiki/get-started/best-practices/code-style-standards.md)
- `@venizia/dev-configs` package
- `@venizia/ignis` framework documentation
