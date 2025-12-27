# Quickstart: Code Style Standards Compliance

**Feature**: 001-code-style-standards
**Branch**: `001-code-style-standards`
**Last Updated**: 2025-12-25

## Overview

This guide helps developers quickly adopt the Ignis coding standards in the filesystem project.

## Prerequisites

- Node.js 18+
- npm or bun package manager
- TypeScript 5.0+

---

## Installation

### 1. Install Dependencies

```bash
# Install @venizia/dev-configs
npm install --save-dev @venizia/dev-configs

# Install peer dependencies (if not already installed)
npm install --save-dev eslint prettier typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 2. Create Configuration Files

Copy the configurations from `specs/001-code-style-standards/contracts/`:

```bash
# Prettier config
cat << 'EOF' > .prettierrc.js
module.exports = require('@venizia/dev-configs/prettier');
EOF

# ESLint config
cat << 'EOF' > .eslintrc.json
{
  "extends": ["@venizia/dev-configs/eslint"],
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
EOF

# TypeScript config
cat << 'EOF' > tsconfig.json
{
  "extends": "@venizia/dev-configs/tsconfig.common.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Prettier ignore
cat << 'EOF' > .prettierignore
node_modules/
dist/
build/
*.generated.ts
package-lock.json
*.log
EOF

# ESLint ignore
cat << 'EOF' > .eslintignore
node_modules/
dist/
build/
*.generated.ts
EOF
```

### 3. Add npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix",
    "prettier": "prettier --check \"**/*.{ts,js,json,md}\"",
    "prettier:fix": "prettier --write \"**/*.{ts,js,json,md}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run prettier",
    "validate:fix": "npm run prettier:fix && npm run lint:fix"
  }
}
```

---

## Quick Validation

Run all checks:

```bash
npm run validate
```

Auto-fix issues:

```bash
npm run validate:fix
```

---

## Naming Conventions at a Glance

| Type       | Pattern              | Example                    |
| ---------- | -------------------- | -------------------------- |
| Interface  | `IPascalCase`        | `IUserService`             |
| Type Alias | `TPascalCase`        | `TUserRequest`             |
| Class      | `PascalCase[Type]`   | `FileSystemComponent`      |
| File       | `kebab-case.type.ts` | `file-system.component.ts` |
| Function   | `camelCase`          | `getUserById`              |
| Variable   | `camelCase`          | `userName`                 |

---

## Common Patterns

### 1. Interface Definition

```typescript
// Good - I prefix, PascalCase
interface IUserService {
  getUser(id: string): Promise<IUser>;
}
```

### 2. Type Alias Definition

```typescript
// Good - T prefix, PascalCase
type TUserRequest = {
  name: string;
  email: string;
};
```

### 3. Constants Class (Not Enum)

```typescript
// Good - Static class with validation
class HttpStatus {
  private static readonly _SCHEME_SET = new Set<string>(["OK", "NOT_FOUND"]);

  static readonly OK = "OK";
  static readonly NOT_FOUND = "NOT_FOUND";

  static isValid(value: string): value is THttpStatus {
    return this._SCHEME_SET.has(value);
  }
}

type THttpStatus = TConstValue<typeof HttpStatus>;
```

### 4. Component Class

```typescript
// Good - PascalCase with Component suffix
export class FileSystemComponent {
  constructor(private readonly options: IFileSystemOptions) {
    if (!options.rootPath) {
      throw getError(
        "[FileSystemComponent][constructor] rootPath is required",
        HTTP.ResultCodes.BAD_REQUEST,
      );
    }
  }
}
```

### 5. Logging

```typescript
// Good - [ClassName][methodName] format
logger.info("[UserService][getUser] Fetching user | ID: %s", userId);
logger.error("[S3Adapter][upload] Upload failed | Error: %s", error.message);
```

### 6. Error Handling

```typescript
// Good - getError with context
throw getError("[UserService][deleteUser] User not found", HTTP.ResultCodes.NOT_FOUND);
```

### 7. Directory Structure

```text
src/components/file-system/
├── index.ts                    # Barrel export
├── file-system.component.ts    # Main component
├── file-system.controller.ts   # Controller (optional)
└── common/                     # Shared items
    ├── index.ts
    ├── types.ts
    └── constants.ts
```

---

## Migration Guide: Gradual Convergence

### New Files

All new files must be 100% compliant:

```bash
# Before committing new code
npm run validate
```

### Modified Files

Fix violations in sections you modify:

```typescript
// Old code you're not touching - suppress
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = getOldFormat();

// prettier-ignore
const oldStyle = {
    foo:'bar'
};

// New code you add - must be compliant
const newData: INewFormat = { foo: "bar" };
```

### Existing Files

Track violations for gradual remediation:

```bash
# Find all violations (for tracking)
npm run lint 2> violations.txt
npm run prettier 2> formatting-issues.txt
```

---

## Troubleshooting

### "Cannot find module '@venizia/dev-configs'"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "TS5058: The specified path does not exist"

Check `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Prettier and ESLint conflicts

Prettier takes precedence for formatting. Disable conflicting ESLint rules:

```json
{
  "rules": {
    "prettier/prettier": "error"
  }
}
```

### Decorator errors

Ensure these are set in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## VS Code Integration

### Recommended Settings (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Recommended Extensions

- ESLint
- Prettier - Code formatter
- TypeScript Importer

---

## Checklist for Code Review

Before submitting code:

- [ ] `npm run validate` passes
- [ ] All new interfaces use `I` prefix
- [ ] All new type aliases use `T` prefix
- [ ] No new enums (use static classes)
- [ ] All classes follow `[Feature][Type]` pattern
- [ ] Files use kebab-case with type suffix
- [ ] Log messages use `[Class][Method]` format
- [ ] Errors use `getError` with context
- [ ] New directories have `index.ts` barrel export
- [ ] No new violations introduced

---

## Further Reading

- [research.md](./research.md) - Technical decisions and rationale
- [data-model.md](./data-model.md) - Detailed entity definitions
- [contracts/](./contracts/) - Configuration contracts
- [Ignis Code Style Standards](https://github.com/VENIZIA-AI/ignis/blob/d58f0093/packages/docs/wiki/get-started/best-practices/code-style-standards.md)
