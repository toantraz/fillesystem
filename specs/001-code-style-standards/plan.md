# Implementation Plan: Code Style Standards Compliance

**Branch**: `001-code-style-standards` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-code-style-standards/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enhance the codebase to meet Ignis coding standards defined in [Code Style Standards](https://github.com/VENIZIA-AI/ignis/blob/d58f0093/packages/docs/wiki/get-started/best-practices/code-style-standards.md).

**Primary Requirements:**

- Configure ESLint, Prettier, and TypeScript to use `@venizia/dev-configs`
- Enforce naming conventions (I/T prefixes, class patterns)
- Implement static class constants pattern instead of enums
- Standardize error handling and logging formats
- Ensure proper directory structure with barrel exports

**Technical Approach:**

- Gradual convergence: Enforce standards on new/modified files only
- Use `// eslint-disable-next-line` and `// prettier-ignore` for existing violations
- File-by-file remediation over time (no big-bang reformatting)

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+
**Primary Dependencies**:

- `@venizia/dev-configs` - ESLint, Prettier, TypeScript configurations
- `@venizia/ignis` - Framework with coding standards
- `@venizia/ignis-helpers` - TConstValue and other utility types
- `eslint`, `prettier` - Linting and formatting tools

**Storage**: N/A (code style standards only)
**Testing**: Jest (existing), plus lint/format validation scripts
**Target Platform**: Node.js 18+
**Project Type**: Single TypeScript library/package
**Performance Goals**: N/A (developer tooling only)
**Constraints**:

- Must maintain backward compatibility (no breaking changes)
- Must not interfere with existing functionality
- Configuration should work for both npm and bun package managers

**Scale/Scope**:

- Existing codebase with potential violations
- All new code must comply 100%
- Gradual remediation of existing violations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Constitution Status**: Template only - no formal principles defined yet.

| Principle          | Status | Notes                                                   |
| ------------------ | ------ | ------------------------------------------------------- |
| [PRINCIPLE_1_NAME] | N/A    | Constitution is template - no actual principles defined |
| [PRINCIPLE_2_NAME] | N/A    | Constitution is template - no actual principles defined |
| [PRINCIPLE_3_NAME] | N/A    | Constitution is template - no actual principles defined |

**Gate Result**: PASSED (no principles to violate)

**Recommendation**: Consider running `/speckit.constitution` to establish project principles before implementing features.

## Project Structure

### Documentation (this feature)

```text
specs/001-code-style-standards/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/          # Feature components following Ignis pattern
│   └── [feature]/
│       ├── index.ts     # Barrel export
│       ├── [feature].component.ts
│       ├── [feature].controller.ts
│       └── common/      # Shared types, constants, utilities
├── ...
```

tests/
├── contract/
├── integration/
└── unit/

# Configuration files (to be created/updated)

.prettierrc.js # Prettier configuration
.eslintrc.json # ESLint configuration
tsconfig.json # TypeScript configuration (root)
tsconfig.component.json # TypeScript configuration (components)
.prettierignore # Prettier exclusions
.eslintignore # ESLint exclusions

```

**Structure Decision**: Single TypeScript library with Ignis component organization. The project follows the standard `src/` + `tests/` layout with feature-based component organization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations - no complexity tracking required.

---

## Phase 0: Research & Decisions

*Status: COMPLETE*

Research findings documented in [`research.md`](./research.md).

**Key Decisions**:
- ESLint: Use `@venizia/dev-configs/eslint`
- Prettier: Use `@venizia/dev-configs/prettier`
- TypeScript: Extend `@venizia/dev-configs/tsconfig.common.json`
- Migration: Gradual convergence with suppression comments

## Phase 1: Design Artifacts

*Status: COMPLETE*

All design artifacts generated:

| Artifact | Path | Description |
|----------|------|-------------|
| Research | `research.md` | Technical decisions and best practices |
| Data Model | `data-model.md` | Configuration entities and coding patterns |
| Contracts | `contracts/` | Configuration schemas and naming rules |
| Quickstart | `quickstart.md` | Developer onboarding guide |
```
