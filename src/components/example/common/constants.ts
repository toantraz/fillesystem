// Example constants using static class pattern (NOT enums)
// This pattern provides better tree-shaking and runtime validation

import type { TExampleStatus } from "./types";

/**
 * Example constants class
 * Static readonly classes instead of enums for:
 * - Better tree-shaking
 * - Runtime validation
 * - Better TypeScript intellisense
 */
export class ExampleStatus {
  // Private scheme set for O(1) validation
  private static readonly _SCHEME_SET = new Set<string>(["ACTIVE", "INACTIVE", "PENDING"]);
  private static readonly _currentStatus: TExampleStatus = "ACTIVE";

  // Static readonly values
  static readonly ACTIVE = "ACTIVE" as const;
  static readonly INACTIVE = "INACTIVE" as const;
  static readonly PENDING = "PENDING" as const;

  // Static Values object for enum-like access
  static readonly Values = {
    ACTIVE: "ACTIVE" as const,
    INACTIVE: "INACTIVE" as const,
    PENDING: "PENDING" as const,
  } as const;

  /**
   * Runtime validation method with type predicate
   * @param value - Value to validate
   * @returns True if value is a valid ExampleStatus
   */
  static isValid(value: string): value is TExampleStatus {
    return this._SCHEME_SET.has(value);
  }

  /**
   * Check if status is currently active
   * @returns True if status is active
   */
  static isActive(): boolean {
    return this._currentStatus === "ACTIVE";
  }
}

// Usage example:
// const status: TExampleStatus = ExampleStatus.ACTIVE;
// if (ExampleStatus.isValid(status)) {
//   // TypeScript knows status is valid
// }
// if (ExampleStatus.isActive()) {
//   // Component is active
// }

// Re-export TExampleStatus for convenience
export type { TExampleStatus };
