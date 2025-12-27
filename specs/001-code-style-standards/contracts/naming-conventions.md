# Naming Convention Contracts

**Feature**: 001-code-style-standards
**Contract Type**: Naming Convention Rules

This document defines the naming convention contracts enforced by ESLint rules and manual code review.

## Interface Naming Contract

**Pattern**: `I` prefix + PascalCase name

```typescript
// VALID
interface IUserService {}
interface IFileSystemAdapter {}
interface IValidationHelper {}

// INVALID
interface UserService {} // Missing I prefix
interface userservice {} // Wrong case
interface IUser_Service {} // Wrong separator
type IUserService = {}; // Should be interface, not type
```

**ESLint Rule**:

```json
{
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "interface",
      "format": ["PascalCase"],
      "prefix": ["I"]
    }
  ]
}
```

---

## Type Alias Naming Contract

**Pattern**: `T` prefix + PascalCase name

```typescript
// VALID
type TUserRequest = {};
type TFileSystemConfig = {};
type TEvent = TClickEvent | TSubmitEvent;

// INVALID
type UserRequest = {}; // Missing T prefix
type tUserRequest = {}; // Wrong prefix case
type user_request = {}; // Wrong case
```

**ESLint Rule**:

```json
{
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "typeAlias",
      "format": ["PascalCase"],
      "prefix": ["T"]
    }
  ]
}
```

---

## Class Naming Contract

**Pattern**: `[Feature][Type]` - PascalCase with type suffix

```typescript
// VALID
class FileSystemComponent {}
class FileSystemController {}
class UserService {}
class S3Adapter {}
class ValidationHelper {}

// INVALID
class filesystemComponent {} // Wrong case
class File_System_Component {} // Wrong separator
class Component {} // Too generic
```

**ESLint Rule**:

```json
{
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "class",
      "format": ["PascalCase"],
      "suffix": ["Component", "Controller", "Service", "Repository", "Adapter", "Helper"]
    }
  ]
}
```

---

## File Naming Contract

**Pattern**: kebab-case with type suffix

```
# VALID
file-system.component.ts
file-system.controller.ts
user.service.ts
s3.adapter.ts

# INVALID
FileSystem.component.ts              # Wrong case
file_system.component.ts             # Wrong separator
filesystem.ts                        # Missing suffix
```

**Validation**: Manual review + custom lint script

---

## Constants Class Contract

**Pattern**: PascalCase, static readonly, no suffix

```typescript
// VALID
class HttpMethod {
  static readonly GET = 'GET';
  static readonly POST = 'POST';
  static isValid(value: string): value is THttpMethod { ... }
}

// INVALID
class HTTP_METHOD { }                // Wrong case
class HttpMethods { }                // Plural when represents collection
class HttpMethodEnum { }             // Has "Enum" suffix
```

---

## Function/Method Naming Contract

**Pattern**: camelCase

```typescript
// VALID
function getUserById(id: string) {}
class UserService {
  async validateEmail(email: string) {}
}

// INVALID
function GetUserById(id: string) {} // Wrong case
function get_user_by_id(id: string) {} // Wrong separator
```

**ESLint Rule**:

```json
{
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "function",
      "format": ["camelCase"]
    }
  ]
}
```

---

## Variable Naming Contract

**Pattern**: camelCase

```typescript
// VALID
const userName = "john";
const fileSystemConfig = {};
let isValid = true;

// INVALID
const UserName = "john"; // Wrong case
const file_system_config = {}; // Wrong separator
```

---

## Private Member Contract

**Pattern**: No prefix (use TypeScript's private keyword)

```typescript
// VALID
class UserService {
  private options: IS3AdapterOptions;
  private _cache?: Map<string, any>; // Underscore only if needed to avoid collision
}

// DISCOURAGED (legacy JS pattern, not needed in TS)
class UserService {
  private _options: IS3AdapterOptions; // Don't use underscore prefix
}
```

---

## Binding Key Contract

**Pattern**: `@app/[component]/[feature]` - lowercase, kebab-case

```typescript
// VALID
const BINDINGS = {
  FILE_SYSTEM_COMPONENT: "@app/filesystem/component",
  FILE_SYSTEM_ADAPTER: "@app/filesystem/adapter",
  USER_SERVICE: "@app/user/service",
};

// INVALID
const BINDINGS = {
  FILE_SYSTEM_COMPONENT: "@app/FileSystem/Component", // Wrong case
  FILE_SYSTEM_COMPONENT: "@app.file-system.component", // Wrong separator
  FILE_SYSTEM_COMPONENT: "FileSystemComponent", // Missing hierarchy
};
```

---

## Enforcement Summary

| Naming Type  | Pattern                | Enforced By   |
| ------------ | ---------------------- | ------------- |
| Interfaces   | `IPascalCase`          | ESLint        |
| Type Aliases | `TPascalCase`          | ESLint        |
| Classes      | `PascalCase[Type]`     | ESLint        |
| Functions    | `camelCase`            | ESLint        |
| Variables    | `camelCase`            | ESLint        |
| Files        | `kebab-case.suffix.ts` | Script        |
| Binding Keys | `@app/comp/feature`    | Manual review |
| Constants    | `PascalCase`           | ESLint        |
