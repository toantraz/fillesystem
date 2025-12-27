# Developer Guide - Ignis Code Style Standards

This guide documents the Ignis directory structure pattern and coding conventions for the filesystem project.

## Directory Structure

### Component Organization Pattern

```text
src/components/[feature-name]/
├── index.ts                    # Barrel export (REQUIRED)
├── [feature-name].component.ts # Component class (REQUIRED)
├── [feature-name].controller.ts# Controller (OPTIONAL)
└── common/                     # Shared types/constants (OPTIONAL)
    ├── index.ts
    ├── types.ts
    └── constants.ts
```

### Key Principles

1. **Every directory MUST have an `index.ts` barrel export file**
   - Exports all public items from the directory
   - Enables clean import paths
   - Example: `export * from "./common";`

2. **Files use kebab-case with type suffix**
   - `feature-name.component.ts`
   - `feature-name.controller.ts`
   - `feature-name.service.ts`
   - `feature-name.repository.ts`
   - `feature-name.adapter.ts`

3. **Classes follow `[Feature][Type]` pattern**
   - `FileSystemComponent`
   - `S3Adapter`
   - `UserService`
   - `FileRepository`

4. **Common subdirectory contains shared items**
   - `types.ts` - Interfaces and type aliases
   - `constants.ts` - Static class constants
   - `index.ts` - Barrel export for common items

## Example Component

See `src/components/example/` for a complete reference implementation:

```text
src/components/example/
├── index.ts                    # Barrel export
├── example.component.ts        # Component class
├── example.controller.ts       # Controller class
└── common/
    ├── index.ts
    ├── types.ts                # IExampleService, TExampleRequest
    └── constants.ts            # ExampleStatus class
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Interface | `IPascalCase` | `IUserService` |
| Type Alias | `TPascalCase` | `TUserRequest` |
| Class | `PascalCase[Type]` | `FileSystemComponent` |
| File | `kebab-case.type.ts` | `file-system.component.ts` |

## Type Safety Patterns

### Interface Naming (I Prefix)

```typescript
// Good - interface with I prefix
interface IUserService {
  getUser(id: string): Promise<IUser>;
}

// Bad - missing I prefix
interface UserService { }
```

### Type Alias Naming (T Prefix)

```typescript
// Good - type alias with T prefix
type TUserRequest = {
  name: string;
  email: string;
};

// Bad - missing T prefix
type UserRequest = { };
```

### Constants Pattern (Static Class, Not Enum)

```typescript
// Good - static class with validation
class HttpStatus {
  private static readonly _SCHEME_SET = new Set<string>(['OK', 'NOT_FOUND']);

  static readonly OK = 'OK';
  static readonly NOT_FOUND = 'NOT_FOUND';

  static isValid(value: string): value is THttpStatus {
    return this._SCHEME_SET.has(value);
  }
}

type THttpStatus = 'OK' | 'NOT_FOUND';

// Bad - enum (tree-shaking issues, no runtime validation)
enum HttpStatus {
  OK = 'OK',
  NOT_FOUND = 'NOT_FOUND'
}
```

### TConstValue Helper

When using `@venizia/ignis-helpers`, you can extract the union type:

```typescript
import { TConstValue } from '@venizia/ignis-helpers';

class ExampleStatus {
  static readonly ACTIVE = 'ACTIVE';
  static readonly INACTIVE = 'INACTIVE';
}

type TExampleStatus = TConstValue<typeof ExampleStatus>;
// Type is: 'ACTIVE' | 'INACTIVE'
```

## Import Paths

Use barrel exports for clean imports:

```typescript
// Good - using barrel export
import { ExampleComponent } from "./components/example";
import { IExampleService, ExampleStatus } from "./components/example";

// Avoid - deep imports
import { ExampleComponent } from "./components/example/example.component";
```

## Further Reading

- [Ignis Code Style Standards](https://github.com/VENIZIA-AI/ignis/blob/d58f0093/packages/docs/wiki/get-started/best-practices/code-style-standards.md)
- [quickstart.md](../specs/001-code-style-standards/quickstart.md) - Developer onboarding
- [contracts/naming-conventions.md](../specs/001-code-style-standards/contracts/naming-conventions.md) - Naming rules
