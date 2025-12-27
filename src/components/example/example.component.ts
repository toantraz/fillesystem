// Example component following Ignis naming conventions
// Class name pattern: [Feature]Component
// File name pattern: kebab-case.component.ts

import { ExampleStatus } from "./common/constants";

/**
 * Example service interface following I prefix convention
 */
export interface IExampleService {
  process(input: string): Promise<string>;
}

/**
 * Example request type alias following T prefix convention
 */
export type TExampleRequest = {
  input: string;
  options?: TExampleOptions;
};

/**
 * Example options type alias
 */
export type TExampleOptions = {
  timeout?: number;
  retry?: number;
};

/**
 * Logger utility following [ClassName][methodName] format
 */
class Logger {
  private readonly className: string;

  constructor(className: string) {
    this.className = className;
  }

  info(methodName: string, message: string): void {
    console.log(`[${this.className}][${methodName}] ${message}`);
  }

  error(methodName: string, message: string): void {
    console.error(`[${this.className}][${methodName}] ${message}`);
  }

  debug(methodName: string, message: string): void {
    console.debug(`[${this.className}][${methodName}] ${message}`);
  }
}

/**
 * Example error with context following getError pattern
 */
export class ExampleError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ExampleError";
  }
}

/**
 * Utility function to create errors with context
 */
export function getError(
  message: string,
  code: string,
  context?: Record<string, unknown>
): ExampleError {
  return new ExampleError(message, code, context);
}

/**
 * Example component demonstrating Ignis coding standards
 *
 * Standards demonstrated:
 * - Class naming: [Feature]Component pattern
 * - Logging: [ClassName][methodName] format
 * - Error handling: getError with context
 * - Type safety: I/T prefixes, static classes instead of enums
 */
export class ExampleComponent {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("ExampleComponent");
    this.logger.info("constructor", "Component initialized");
  }

  /**
   * Process input with proper logging and error handling
   */
  async process(request: TExampleRequest): Promise<string> {
    this.logger.info("process", `Processing request: ${request.input}`);

    try {
      // Validate input
      if (!request.input || request.input.trim().length === 0) {
        throw getError(
          "Input cannot be empty",
          "VALIDATION_ERROR",
          { input: request.input }
        );
      }

      // Simulate processing
      const result = await this.doProcess(request);

      this.logger.info("process", `Processing complete: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(
        "process",
        `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw error;
    }
  }

  /**
   * Internal processing method
   */
  private async doProcess(request: TExampleRequest): Promise<string> {
    this.logger.debug("doProcess", "Starting internal processing");

    // Check status using static class (not enum)
    if (ExampleStatus.isActive()) {
      this.logger.debug("doProcess", `Status: ${ExampleStatus.Values.ACTIVE}`);
    }

    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 10));

    return `Processed: ${request.input}`;
  }

  /**
   * Example method showing error handling with context
   */
  async validateInput(input: string): Promise<boolean> {
    this.logger.info("validateInput", `Validating input: ${input}`);

    try {
      if (input.length > 100) {
        throw getError(
          "Input exceeds maximum length",
          "VALIDATION_ERROR",
          { maxLength: 100, actualLength: input.length, input }
        );
      }

      this.logger.debug("validateInput", "Input validation passed");
      return true;
    } catch (error) {
      this.logger.error("validateInput", `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Example method showing logging for conditional flows
   */
  getStatus(): string {
    this.logger.info("getStatus", "Retrieving component status");

    if (ExampleStatus.isActive()) {
      this.logger.debug("getStatus", "Component is active");
      return ExampleStatus.Values.ACTIVE;
    }

    this.logger.debug("getStatus", "Component is inactive");
    return ExampleStatus.Values.INACTIVE;
  }
}
