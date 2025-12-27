# Troubleshooting Code Style Standards

This guide helps resolve common issues when working with the code style standards.

## ESLint Issues

### "Cannot find module '@venizia/dev-configs'"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "ESLint was configured to run on ... however that TSConfig does not include this file"

The file is not included in `tsconfig.json`. Options:

1. **Add the file to tsconfig.json** (recommended)
2. **Create a separate tsconfig** for that directory
3. **Add to ignorePatterns** in `.eslintrc.json`

### ESLint conflicts with Prettier

Prettier takes precedence for formatting. Disable conflicting ESLint rules:

```json
{
  "rules": {
    "prettier/prettier": "error"
  }
}
```

## Prettier Issues

### "Invalid configuration for file..."

Prettier configuration error. Check `.prettierrc.js` syntax:

```javascript
// Good
module.exports = {
  semi: true,
  singleQuote: false,
};

// Bad - invalid syntax
module.exports = { semi: true, singleQuote: false, };
```

### Prettier ignores files

Files ignored by `.prettierignore` won't be formatted. Check `.prettierignore`:

```
# Common ignores
node_modules/
dist/
build/
*.log
```

## TypeScript Issues

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

### "Cannot find module" errors

Check `baseUrl` and `paths` in `tsconfig.json`:

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

## Validation Failures

### Type check failures

```bash
# See detailed type errors
npx tsc --noEmit

# Fix specific issues
npm run lint:fix
npm run prettier:fix
```

### Structure validation failures

```bash
# Check which directories are missing index.ts
npm run validate:structure

# Fix missing barrel exports
# Create index.ts in each directory:
export * from "./file";
```

### Naming convention failures

```bash
# Find files not following kebab-case
npm run validate:naming

# Rename files to kebab-case with type suffix
# Example: MyComponent.ts -> my-component.component.ts
```

## Gradual Migration Issues

### Too many violations to fix at once

Use the gradual convergence approach:

```bash
# Track existing violations
npm run migrate:track

# Fix one file at a time
npm run fix-file path/to/file.ts

# Validate specific directories only
npx eslint src/components/
```

### Suppressing violations doesn't work

Make sure to use the correct suppression syntax:

```typescript
// ESLint - next line only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getValue();

// Prettier - next line only
// prettier-ignore-next-line
const obj = {a:1};
```

## Performance Issues

### Validation takes too long

1. **Exclude more directories** from `.eslintignore` and `.prettierignore`
2. **Run specific validations** instead of `validate:all`
3. **Use incremental validation** - only check changed files

### Build time increased

This is expected with stricter type checking. Options:

1. **Use `skipLibCheck: true`** in tsconfig.json (already set)
2. **Disable some ESLint rules** for development
3. **Use `tsc --incremental`** for faster builds

## Editor Integration

### VS Code not formatting on save

Check `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Prettier and ESLint extensions not working

Install recommended extensions:

```bash
# Check .vscode/extensions.json
cat .vscode/extensions.json
```

## Getting Help

If issues persist:

1. **Check the logs**: Run commands with verbose output
2. **Review configuration**: Compare with example files in `src/components/example/`
3. **Consult documentation**:
   - [developer-guide.md](./developer-guide.md)
   - [scripts-reference.md](./scripts-reference.md)
   - [migration-guide.md](./migration-guide.md)
4. **Check examples**: See `src/components/example/` for reference implementation

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `TS6133: 'X' is declared but never used` | Unused variable/parameter | Prefix with `_` or remove |
| `@typescript-eslint/no-explicit-any` | Using `any` type | Use proper type or suppress |
| `prettier/prettier` | Formatting conflict | Run `prettier:fix` |
| `Missing I prefix` | Interface naming | Rename to use `I` prefix |
| `Missing T prefix` | Type alias naming | Rename to use `T` prefix |
