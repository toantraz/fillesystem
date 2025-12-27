// Example types following Ignis naming conventions
// Interfaces: I prefix (IUser, IConfig, etc.)
// Type aliases: T prefix (TUserRequest, TConfigOptions, etc.)

/**
 * Example interface - note the I prefix
 */
export interface IExampleService {
  processData(input: string): Promise<string>;
}

/**
 * Example type alias - note the T prefix
 */
export type TExampleRequest = {
  data: string;
  timestamp: number;
};

/**
 * Example type alias for discriminated unions
 */
export type TExampleEvent = TSuccessEvent | TErrorEvent;

export type TSuccessEvent = {
  type: "success";
  data: string;
};

export type TErrorEvent = {
  type: "error";
  error: string;
};

/**
 * Example status type alias
 * This should match the values from ExampleStatus static class
 */
export type TExampleStatus = "ACTIVE" | "INACTIVE" | "PENDING";
