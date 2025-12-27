# Building Reusable Ignis Components

A comprehensive guide to creating and using reusable components in the Ignis framework, using the `@ignis/filesystem` component as a reference example.

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Implementing a Component](#implementing-a-component)
4. [Using a Component in Your Application](#using-a-component-in-your-application)
5. [Complete Example: Filesystem Component](#complete-example-filesystem-component)
6. [Best Practices](#best-practices)

---

## Overview

An Ignis component is a reusable, self-contained module that encapsulates specific functionality and integrates with the Ignis framework's dependency injection system. Components can be shared across multiple applications and provide a consistent API.

### Key Characteristics

- **Self-Contained**: All logic, types, and configuration within the component
- **DI Integration**: Uses Ignis's dependency injection for configuration and services
- **Lifecycle Hooks**: Integrates with application lifecycle (binding, configure, init)
- **Type-Safe**: Full TypeScript support with proper interfaces
- **Reusable**: Can be published as npm packages and shared across projects

---

## Component Architecture

### Directory Structure

```
@ignis/my-component/
├── src/
│   ├── component.ts              # Main component class
│   ├── common/                   # Shared types, keys, constants
│   │   ├── index.ts
│   │   ├── types.ts             # Component interfaces
│   │   ├── keys.ts              # DI binding keys
│   │   └── constants.ts         # Static constants
│   ├── core/                    # Core business logic
│   │   └── my-service.ts
│   ├── interfaces/              # Public interfaces
│   │   └── my-service.interface.ts
│   └── index.ts                 # Public API exports
├── package.json
├── tsconfig.json
└── README.md
```

### Core Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Component Class** | Extends `BaseComponent<TOptions>` | `FilesystemComponent` |
| **Options Interface** | Configuration interface with `I` prefix | `IFilesystemComponentOptions` |
| **Binding Keys** | Static class with DI key constants | `FilesystemBindingKeys` |
| **Service Instance** | The actual service provided by component | `Filesystem` |
| **Factory Function** | Creates service instances (optional) | `createFilesystem()` |

---

## Implementing a Component

### Step 1: Define the Public Interface

First, define what your component provides. This is the interface users will interact with.

```typescript
// src/interfaces/my-service.interface.ts

/**
 * Public interface for the service
 */
export interface IMyService {
  // Public methods that users will call
  doSomething(input: string): Promise<Result>;
  getStatus(): Status;
}
```

### Step 2: Define Component Types

Create the configuration options and component-specific types.

```typescript
// src/common/types.ts

import type { IMyService } from '../../interfaces/my-service.interface';

/**
 * Component configuration options
 * Pass this when registering the component
 */
export interface IMyComponentOptions {
  /** Service configuration */
  config: TMyServiceConfig;

  /** Optional: Enable/disable feature */
  enableFeatureX?: boolean;
}

/**
 * Component state (internal tracking)
 */
export interface IMyComponentState {
  initialized: boolean;
  status: 'idle' | 'running' | 'stopped';
}

/**
 * Service configuration
 */
export type TMyServiceConfig = {
  mode: 'basic' | 'advanced';
  apiKey?: string;
  timeout?: number;
};
```

### Step 3: Define Binding Keys

Create static constants for dependency injection keys.

```typescript
// src/common/keys.ts

/**
 * Binding keys for dependency injection
 * Using static class instead of enum
 */
export class MyComponentBindingKeys {
  private constructor() {
    // Static class - no instantiation
  }

  /** Configuration binding key */
  static readonly CONFIG = '@my-component/config';

  /** Service instance binding key */
  static readonly SERVICE_INSTANCE = '@my-component/service/instance';

  /** Options binding key */
  static readonly OPTIONS = '@my-component/options';
}
```

### Step 4: Define Constants

```typescript
// src/common/constants.ts

/**
 * Component constants
 * Using static class instead of enum
 */
export class MyComponentConstants {
  private constructor() {
    // Static class - no instantiation
  }

  /** Default timeout in milliseconds */
  static readonly DEFAULT_TIMEOUT = 30000;

  /** Max retry attempts */
  static readonly MAX_RETRIES = 3;

  /** Supported modes */
  static readonly SUPPORTED_MODES = ['basic', 'advanced'] as const;
}
```

### Step 5: Implement the Service

Create the actual service implementation.

```typescript
// src/core/my-service.impl.ts

import type { IMyService } from '../interfaces/my-service.interface';
import type { TMyServiceConfig } from '../common/types';
import { MyComponentConstants } from '../common/constants';

/**
 * Internal service implementation
 */
class MyServiceImpl implements IMyService {
  private config: TMyServiceConfig;
  private state: 'idle' | 'running' | 'stopped' = 'idle';

  constructor(config: TMyServiceConfig) {
    this.config = config;
    this.log('[MyServiceImpl][constructor] Service initialized');
  }

  async doSomething(input: string): Promise<Result> {
    this.log('[MyServiceImpl][doSomething] Processing input');

    // Implementation here
    return {
      success: true,
      data: input.toUpperCase(),
    };
  }

  getStatus(): Status {
    return {
      mode: this.config.mode,
      state: this.state,
    };
  }

  private log(message: string): void {
    console.log(message);
  }
}

/**
 * Factory function to create service instance
 */
export function createMyService(config: TMyServiceConfig): IMyService {
  return new MyServiceImpl(config);
}
```

### Step 6: Implement the Component

Create the main component class that integrates with Ignis.

```typescript
// src/component.ts

import { BaseApplication } from '@venizia/ignis';
import { BaseComponent } from '@venizia/ignis';
import { inject } from '@venizia/ignis';
import { CoreBindings } from '@venizia/ignis';
import type { ValueOrPromise } from '@venizia/ignis';

import { createMyService } from './core/my-service.impl';
import type { IMyComponentOptions } from './common/types';
import { MyComponentBindingKeys } from './common/keys';
import { MyComponentConstants } from './common/constants';
import type { IMyService } from './interfaces/my-service.interface';
import type { TMyServiceConfig } from './common/types';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: TMyServiceConfig = {
  mode: 'basic',
  timeout: MyComponentConstants.DEFAULT_TIMEOUT,
};

/**
 * My Component for Ignis
 *
 * Provides reusable service functionality with dependency injection.
 *
 * @example
 * ```typescript
 * import { BaseApplication } from '@venizia/ignis';
 * import { MyComponent } from '@ignis/my-component';
 *
 * class MyApp extends BaseApplication {
 *   preConfigure() {
 *     this.component(MyComponent, {
 *       config: { mode: 'advanced', apiKey: 'xxx' }
 *     });
 *   }
 * }
 * ```
 */
export class MyComponent extends BaseComponent<IMyComponentOptions> {
  private application: BaseApplication;
  private service?: IMyService;

  constructor(
    @inject({ key: CoreBindings.APPLICATION_INSTANCE })
    application: BaseApplication,
  ) {
    super({
      scope: MyComponent.name,
    });
    this.application = application;
  }

  /**
   * Component binding phase
   *
   * Called by Ignis during component initialization.
   * Create and bind the service instance here.
   */
  override binding(): ValueOrPromise<void> {
    this.defineService();
  }

  /**
   * Get the service instance directly
   *
   * @returns The service instance
   */
  getService(): IMyService | undefined {
    return this.service;
  }

  /**
   * Define and bind the service
   */
  private defineService(): void {
    // Get configuration from bindings
    const config = this.getConfig();

    // Validate configuration
    this.validateConfig(config);

    // Create service instance
    const service = createMyService(config);
    this.service = service;

    // Bind to DI container for injection
    this.application
      .bind({ key: MyComponentBindingKeys.SERVICE_INSTANCE })
      .toValue(service);

    this.logger?.info('[MyComponent] Service initialized', {
      mode: config.mode,
    });
  }

  /**
   * Get and merge configuration
   */
  private getConfig(): TMyServiceConfig {
    // Try to get config from bindings
    const boundConfig = this.application.get<TMyServiceConfig>({
      key: MyComponentBindingKeys.CONFIG,
    });

    // Merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...(boundConfig || {}),
    };
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: TMyServiceConfig): void {
    if (!MyComponentConstants.SUPPORTED_MODES.includes(config.mode)) {
      throw new Error(
        `[MyComponent] Invalid mode: ${config.mode}. Supported: ${MyComponentConstants.SUPPORTED_MODES.join(', ')}`,
      );
    }
  }
}

/**
 * Default export
 */
export default MyComponent;
```

### Step 7: Export Public API

```typescript
// src/index.ts

/**
 * @ignis/my-component
 *
 * A reusable Ignis component for...
 */

// Component
export { MyComponent, default as MyComponentDefault } from './component';

// Types and interfaces
export type { IMyService } from './interfaces/my-service.interface';
export type { IMyComponentOptions, TMyServiceConfig } from './common/types';

// Keys and constants
export { MyComponentBindingKeys } from './common/keys';
export { MyComponentConstants } from './common/constants';

// Factory function (optional, for direct usage)
export { createMyService } from './core/my-service.impl';
```

---

## Using a Component in Your Application

### Method 1: Simple Registration (Recommended)

The easiest way to use a component is to manually bind configuration and create the service.

```typescript
// src/app.ts

import {
  BaseApplication,
  CoreBindings,
  type IApplicationConfigs,
  ValueOrPromise,
} from '@venizia/ignis';
import { MyComponentBindingKeys } from '@ignis/my-component';
import type { TMyServiceConfig } from '@ignis/my-component';
import { createMyService } from '@ignis/my-component';

export class Application extends BaseApplication {
  private myConfig: TMyServiceConfig = {
    mode: 'advanced',
    apiKey: process.env.API_KEY!,
    timeout: 5000,
  };

  constructor() {
    super({
      scope: 'MyApp',
      config: {
        host: 'localhost',
        port: 3000,
      },
    });
  }

  override preConfigure(): ValueOrPromise<void> {
    // 1. Bind the configuration
    this.bind<TMyServiceConfig>({
      key: MyComponentBindingKeys.CONFIG,
    }).toValue(this.myConfig);

    // 2. Create and bind the service instance
    const service = createMyService(this.myConfig);
    this.bind({ key: MyComponentBindingKeys.SERVICE_INSTANCE })
      .toValue(service);

    this.logger.info('[preConfigure] MyComponent configured');
  }

  override async postConfigure(): Promise<void> {
    // 3. Use the service
    const service = this.get({
      key: MyComponentBindingKeys.SERVICE_INSTANCE,
    });

    const result = await service.doSomething('hello');
    this.logger.info('[postConfigure] Result:', result);
  }
}
```

### Method 2: Component Registration

For full component lifecycle management, register the component class.

```typescript
// src/app.ts

import {
  BaseApplication,
  CoreBindings,
  type IApplicationConfigs,
  ValueOrPromise,
} from '@venizia/ignis';
import { MyComponent } from '@ignis/my-component';
import { MyComponentBindingKeys } from '@ignis/my-component';
import type { TMyServiceConfig } from '@ignis/my-component';

export class Application extends BaseApplication {
  private myConfig: TMyServiceConfig = {
    mode: 'advanced',
    apiKey: process.env.API_KEY!,
  };

  constructor() {
    super({
      scope: 'MyApp',
      config: {
        host: 'localhost',
        port: 3000,
      },
    });
  }

  override preConfigure(): ValueOrPromise<void> {
    // Bind configuration first
    this.bind<TMyServiceConfig>({
      key: MyComponentBindingKeys.CONFIG,
    }).toValue(this.myConfig);

    // Register the component
    // Note: Using 'as any' due to type system limitations
    this.component(MyComponent as any);

    this.logger.info('[preConfigure] MyComponent registered');
  }

  override async postConfigure(): Promise<void> {
    // Get service from DI container
    const service = this.get({
      key: MyComponentBindingKeys.SERVICE_INSTANCE,
    });

    const result = await service.doSomething('hello');
    this.logger.info('[postConfigure] Result:', result);
  }
}
```

### Method 3: Using Component Directly

You can also access the component instance directly.

```typescript
// src/app.ts

import { MyComponent } from '@ignis/my-component';
import { BindingKeys, BindingNamespaces } from '@venizia/ignis';

export class Application extends BaseApplication {
  override async postConfigure(): Promise<void> {
    // Get the component instance
    const component = this.get<MyComponent>({
      key: BindingKeys.build({
        namespace: BindingNamespaces.COMPONENT,
        key: MyComponent.name,
      }),
    });

    // Access service through component
    const service = component.getService();
    if (service) {
      const result = await service.doSomething('hello');
      this.logger.info('[postConfigure] Result:', result);
    }
  }
}
```

### Injecting Services in Other Services

You can inject component services into your own services using the binding key.

```typescript
// src/services/my-service.ts

import { inject } from '@venizia/ignis';
import { MyComponentBindingKeys } from '@ignis/my-component';
import type { IMyService } from '@ignis/my-component';

export class MyCustomService {
  private myService: IMyService;

  constructor(
    @inject({ key: MyComponentBindingKeys.SERVICE_INSTANCE })
    myService: IMyService,
  ) {
    this.myService = myService;
  }

  async processData(input: string): Promise<string> {
    const result = await this.myService.doSomething(input);
    return result.data;
  }
}
```

---

## Complete Example: Filesystem Component

The `@ignis/filesystem` component demonstrates all these patterns:

### Component Implementation

```typescript
// src/component.ts (filesystem component)

export class FilesystemComponent extends BaseComponent<IFilesystemComponentOptions> {
  private application: BaseApplication;
  private filesystem?: Filesystem;

  constructor(
    @inject({ key: CoreBindings.APPLICATION_INSTANCE })
    application: BaseApplication,
  ) {
    super({ scope: FilesystemComponent.name });
    this.application = application;
  }

  override binding(): ValueOrPromise<void> {
    const config = this.application.get<FilesystemConfig>({
      key: FilesystemBindingKeys.FILESYSTEM_CONFIG,
    });

    const filesystem = createFilesystem(config);
    this.filesystem = filesystem;

    this.application
      .bind({ key: FilesystemBindingKeys.FILESYSTEM_INSTANCE })
      .toValue(filesystem);
  }

  getFilesystem(): Filesystem | undefined {
    return this.filesystem;
  }
}
```

### Application Usage

```typescript
// examples/local-storage-application/src/app.ts

export class Application extends BaseApplication {
  private filesystemConfig: FilesystemConfig = {
    type: 'local',
    local: { basePath: './storage', createMissingDirs: true },
  };

  override preConfigure(): ValueOrPromise<void> {
    // Bind config
    this.bind<FilesystemConfig>({
      key: FilesystemBindingKeys.FILESYSTEM_CONFIG,
    }).toValue(this.filesystemConfig);

    // Create and bind filesystem
    const filesystem = createFilesystem(this.filesystemConfig);
    this.bind({ key: FilesystemBindingKeys.FILESYSTEM_INSTANCE })
      .toValue(filesystem);
  }

  override async postConfigure(): Promise<void> {
    // Get and use filesystem
    const filesystem = this.get<Filesystem>({
      key: FilesystemBindingKeys.FILESYSTEM_INSTANCE,
    });

    await filesystem.writeFile('/test.txt', 'Hello!');
    const content = await filesystem.readFile('/test.txt', 'utf8');
  }
}
```

---

## Best Practices

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Class | `[Feature]Component` | `FilesystemComponent` |
| Interface (public) | `I[Name]` | `IFilesystem` |
| Interface (component opts) | `I[Component]Options` | `IFilesystemComponentOptions` |
| Type Alias | `T[Name]` | `TFilesystemConfig` |
| File | `kebab-case.type.ts` | `filesystem.component.ts` |
| Binding Keys | `[Feature]BindingKeys` | `FilesystemBindingKeys` |
| Constants | `[Feature]Constants` | `FilesystemConstants` |

### Logging Format

Use consistent logging: `[ClassName][methodName] message`

```typescript
this.logger?.info('[MyComponent][binding] Initializing service');
this.logger?.error('[MyComponent][validateConfig] Invalid config');
```

### Error Handling

Provide contextual error information:

```typescript
if (!config.apiKey) {
  throw new Error(
    '[MyComponent] Missing required configuration: apiKey',
  );
}
```

### Configuration Validation

Always validate configuration with clear error messages:

```typescript
private validateConfig(config: TConfig): void {
  if (!config.mode) {
    throw new Error('[MyComponent] config.mode is required');
  }
  if (!SUPPORTED_MODES.includes(config.mode)) {
    throw new Error(
      `[MyComponent] Invalid mode: ${config.mode}. ` +
      `Supported: ${SUPPORTED_MODES.join(', ')}`,
    );
  }
}
```

### Dependency Injection

- Use `@inject()` decorator for constructor injection
- Bind services in `binding()` phase
- Use binding keys constants (never strings)

### State Management

- Keep component state minimal
- Use private properties with getters for controlled access
- Log state changes for debugging

### Documentation

- Document public interfaces thoroughly
- Provide usage examples in JSDoc
- Keep README up to date with configuration options

---

## Quick Reference

### Package Structure

```
@ignis/my-component/
├── src/
│   ├── component.ts              # Main component class
│   ├── common/
│   │   ├── index.ts              # Barrel export
│   │   ├── types.ts              # IMyComponentOptions, etc.
│   │   ├── keys.ts               # MyComponentBindingKeys
│   │   └── constants.ts          # MyComponentConstants
│   ├── core/
│   │   └── my-service.impl.ts    # Service implementation
│   ├── interfaces/
│   │   └── my-service.interface.ts
│   └── index.ts                  # Public exports
├── package.json
├── tsconfig.json
└── README.md
```

### Minimal Component Template

```typescript
// component.ts
export class MyComponent extends BaseComponent<IMyComponentOptions> {
  constructor(@inject({ key: CoreBindings.APPLICATION_INSTANCE }) app: BaseApplication) {
    super({ scope: MyComponent.name });
  }

  override binding(): ValueOrPromise<void> {
    // Create and bind service
  }
}
```

### Application Usage Template

```typescript
// app.ts
export class Application extends BaseApplication {
  override preConfigure(): ValueOrPromise<void> {
    // 1. Bind config
    this.bind<TConfig>({ key: BindingKeys.CONFIG }).toValue(config);

    // 2. Create and bind service
    const service = createService(config);
    this.bind({ key: BindingKeys.SERVICE_INSTANCE }).toValue(service);
  }

  override async postConfigure(): Promise<void> {
    // 3. Use service
    const service = this.get({ key: BindingKeys.SERVICE_INSTANCE });
    await service.doWork();
  }
}
```

---

## Summary

Building reusable Ignis components involves:

1. **Clear interface design** - Define what your component provides
2. **Type-safe configuration** - Use interfaces with `I` prefix
3. **Dependency injection** - Use binding keys for loose coupling
4. **Lifecycle integration** - Implement `binding()` for initialization
5. **Proper naming** - Follow conventions for consistency
6. **Documentation** - Provide examples and clear docs

The Filesystem component (`@ignis/filesystem`) serves as a complete reference implementation demonstrating all these patterns in action.
