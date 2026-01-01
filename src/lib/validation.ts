/**
 * Input validation utilities for API routes
 */

/**
 * Validates a node ID format
 * Accepts alphanumeric IDs, UUIDs, or hex public keys
 * @param id - The node ID to validate
 * @returns true if the ID is valid, false otherwise
 */
export function isValidNodeId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // Accept alphanumeric IDs, UUIDs, or hex public keys (up to 128 chars)
  return /^[a-zA-Z0-9-_]{1,128}$/.test(id);
}

/**
 * Validates a positive integer parameter
 * @param value - The value to validate
 * @param max - Optional maximum value
 * @returns true if valid, false otherwise
 */
export function isValidPositiveInt(value: unknown, max?: number): boolean {
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return false;
    if (max !== undefined && num > max) return false;
    return true;
  }
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 1) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }
  return false;
}

/**
 * Validation error response helper
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Creates a standardized validation error message
 * @param field - The field that failed validation
 * @param message - The error message
 */
export function createValidationError(field: string, message: string): ValidationError {
  return { field, message };
}
