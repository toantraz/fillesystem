/**
 * Mock implementation of @ignis/core for development
 * This provides the minimal types needed for the filesystem component
 */

/**
 * Binding interface for dependency injection
 */
export interface Binding {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bind<T>(_serviceIdentifier: string | symbol | Function): BindingToSyntax<T>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bind(_serviceIdentifier: string | symbol | Function, _implementation: Function): void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unbind(_serviceIdentifier: string | symbol | Function): void;
  unbindAll(): void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get<T>(_serviceIdentifier: string | symbol | Function): T;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAll<T>(_serviceIdentifier: string | symbol | Function): T[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rebind<T>(_serviceIdentifier: string | symbol | Function): BindingToSyntax<T>;
}

/**
 * Binding to syntax for fluent API
 */
export interface BindingToSyntax<T> {
  to(constructor: new (...args: any[]) => T): BindingInWhenOnSyntax<T>;
  toSelf(): BindingInWhenOnSyntax<T>;
  toConstantValue(value: T): void;
  toDynamicValue(func: (context: any) => T): BindingInWhenOnSyntax<T>;
  toFactory<T2>(factory: (context: any) => (...args: any[]) => T2): BindingInWhenOnSyntax<T>;
}

/**
 * Binding syntax for scope, when, and on
 */
export interface BindingInWhenOnSyntax<T> {
  inSingletonScope(): BindingWhenOnSyntax<T>;
  inTransientScope(): BindingWhenOnSyntax<T>;
  inRequestScope(): BindingWhenOnSyntax<T>;
}

/**
 * Binding syntax for when and on
 */
export interface BindingWhenOnSyntax<T> {
  when(constraint: (request: any) => boolean): BindingOnSyntax<T>;
  whenTargetNamed(name: string): BindingOnSyntax<T>;
  whenTargetTagged(tag: string, value: any): BindingOnSyntax<T>;
}

/**
 * Binding syntax for on
 */
export interface BindingOnSyntax<T> {
  onActivation(handler: (context: any, instance: T) => T): void;
}

/**
 * Component options
 */
export interface ComponentOptions {
  name?: string;
  version?: string;
  dependencies?: string[];
  config?: Record<string, any>;
}

/**
 * Base component class
 */
export abstract class BaseComponent {
  protected options: ComponentOptions;

  constructor(options: ComponentOptions = {}) {
    this.options = options;
  }

  /**
   * Component binding phase (dependency injection setup)
   */
  abstract binding(): Binding;

  /**
   * Component initialization phase
   */
  abstract initialize(): Promise<void>;

  /**
   * Component start phase
   */
  abstract start(): Promise<void>;

  /**
   * Component stop phase
   */
  abstract stop(): Promise<void>;

  /**
   * Get component name
   */
  getName(): string {
    return this.options.name || this.constructor.name;
  }

  /**
   * Get component version
   */
  getVersion(): string {
    return this.options.version || "1.0.0";
  }
}

/**
 * Inject decorator for dependency injection
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Inject(
  _serviceIdentifier?: string | symbol | Function,
): PropertyDecorator & ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_target: any, _propertyKey?: string | symbol, _parameterIndex?: number) => {
    // Mock implementation - does nothing
  };
}

/**
 * Component decorator
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Component(_options?: ComponentOptions): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_target: any) => {
    // Mock implementation - does nothing
  };
}
