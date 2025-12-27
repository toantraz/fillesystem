// Example controller following Ignis naming conventions
// Class name pattern: [Feature]Controller
// File name pattern: kebab-case.controller.ts

import { ExampleComponent, getError } from "./example.component";

/**
 * Controller request type alias following T prefix convention
 */
export type TControllerRequest = {
  action: string;
  data?: string;
};

/**
 * Controller response type alias
 */
export type TControllerResponse = {
  success: boolean;
  data?: string;
  error?: string;
};

/**
 * Logger utility following [ClassName][methodName] format
 */
class ControllerLogger {
  private readonly className: string;

  constructor(className: string) {
    this.className = className;
  }

  info(methodName: string, message: string): void {
    console.log(`[${this.className}][${methodName}] ${message}`);
  }

  error(methodName: string, message: string, details?: unknown): void {
    console.error(
      `[${this.className}][${methodName}] ${message}`,
      details ? JSON.stringify(details) : ""
    );
  }

  warn(methodName: string, message: string): void {
    console.warn(`[${this.className}][${methodName}] ${message}`);
  }

  debug(methodName: string, message: string): void {
    console.debug(`[${this.className}][${methodName}] ${message}`);
  }
}

/**
 * Example controller demonstrating Ignis coding standards
 *
 * Standards demonstrated:
 * - Class naming: [Feature]Controller pattern
 * - Logging: [ClassName][methodName] format
 * - Error handling: getError with context
 * - Request/Response typing: T prefix convention
 */
export class ExampleController {
  private readonly logger: ControllerLogger;
  private readonly component: ExampleComponent;

  constructor(component: ExampleComponent) {
    this.logger = new ControllerLogger("ExampleController");
    this.component = component;
    this.logger.info("constructor", "Controller initialized");
  }

  /**
   * Handle incoming request with proper logging and error handling
   */
  async handleRequest(request: TControllerRequest): Promise<TControllerResponse> {
    this.logger.info("handleRequest", `Processing ${request.action} request`);

    try {
      // Validate request
      this.validateRequest(request);

      // Route to appropriate handler
      const result = await this.routeRequest(request);

      this.logger.info("handleRequest", "Request processed successfully");
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        "handleRequest",
        "Request processing failed",
        error instanceof Error ? { message: error.message, name: error.name } : error
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate incoming request
   */
  private validateRequest(request: TControllerRequest): void {
    this.logger.debug("validateRequest", "Validating request structure");

    if (!request.action) {
      throw getError(
        "Action is required",
        "VALIDATION_ERROR",
        { request }
      );
    }

    const validActions = ["process", "status", "validate"];
    if (!validActions.includes(request.action)) {
      throw getError(
        `Invalid action: ${request.action}`,
        "VALIDATION_ERROR",
        { action: request.action, validActions }
      );
    }

    this.logger.debug("validateRequest", "Request validation passed");
  }

  /**
   * Route request to appropriate handler
   */
  private async routeRequest(request: TControllerRequest): Promise<string> {
    this.logger.debug("routeRequest", `Routing action: ${request.action}`);

    switch (request.action) {
      case "process":
        return this.handleProcess(request.data ?? "");
      case "status":
        return this.handleStatus();
      case "validate":
        return this.handleValidate(request.data ?? "");
      default:
        throw getError(
          `Unhandled action: ${request.action}`,
          "ROUTING_ERROR",
          { action: request.action }
        );
    }
  }

  /**
   * Handle process action
   */
  private async handleProcess(data: string): Promise<string> {
    this.logger.info("handleProcess", `Processing data: ${data}`);

    try {
      const result = await this.component.process({ input: data });
      this.logger.info("handleProcess", "Processing complete");
      return result;
    } catch (error) {
      this.logger.error("handleProcess", "Processing failed", error);
      throw error;
    }
  }

  /**
   * Handle status action
   */
  private handleStatus(): string {
    this.logger.info("handleStatus", "Retrieving component status");
    return this.component.getStatus();
  }

  /**
   * Handle validate action
   */
  private async handleValidate(data: string): Promise<string> {
    this.logger.info("handleValidate", `Validating data: ${data}`);

    try {
      const isValid = await this.component.validateInput(data);
      this.logger.info("handleValidate", `Validation result: ${isValid}`);
      return isValid ? "Valid" : "Invalid";
    } catch (error) {
      this.logger.error("handleValidate", "Validation failed", error);
      throw error;
    }
  }

  /**
   * Batch process multiple requests
   */
  async handleBatch(requests: TControllerRequest[]): Promise<TControllerResponse[]> {
    this.logger.info("handleBatch", `Processing batch of ${requests.length} requests`);

    const results: TControllerResponse[] = [];

    for (let i = 0; i < requests.length; i++) {
      this.logger.debug("handleBatch", `Processing request ${i + 1}/${requests.length}`);
      const result = await this.handleRequest(requests[i]);
      results.push(result);
    }

    this.logger.info("handleBatch", `Batch processing complete: ${results.length} results`);
    return results;
  }

  /**
   * Health check endpoint
   */
  healthCheck(): TControllerResponse {
    this.logger.info("healthCheck", "Health check requested");
    return {
      success: true,
      data: "OK",
    };
  }
}
