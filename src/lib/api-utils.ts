import { NextResponse } from "next/server";

/**
 * Standardized API response utilities for consistent error handling and responses
 */

// ============================================================================
// Response Types
// ============================================================================

export interface ApiSuccessResponse<T = any> {
  ok: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  code?: string;
  details?: any;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Create a successful JSON response
 */
export function apiSuccess<T = any>(
  data?: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      ok: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error JSON response
 */
export function apiError(
  error: string,
  status = 400,
  code?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      ok: false,
      error,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  );
}

// ============================================================================
// Common Error Responses
// ============================================================================

export const ApiErrors = {
  badRequest: (message = "Bad request") => apiError(message, 400, "BAD_REQUEST"),
  unauthorized: (message = "Unauthorized") => apiError(message, 401, "UNAUTHORIZED"),
  forbidden: (message = "Forbidden") => apiError(message, 403, "FORBIDDEN"),
  notFound: (message = "Not found") => apiError(message, 404, "NOT_FOUND"),
  conflict: (message = "Conflict") => apiError(message, 409, "CONFLICT"),
  validationError: (message = "Validation error") => apiError(message, 422, "VALIDATION_ERROR"),
  serverError: (message = "Internal server error") => apiError(message, 500, "SERVER_ERROR"),
  
  // Domain-specific errors
  missingFields: (fields?: string[]) => 
    apiError(
      fields?.length ? `Missing required fields: ${fields.join(", ")}` : "Missing required fields",
      400,
      "MISSING_FIELDS"
    ),
  invalidCredentials: () => apiError("Invalid credentials", 401, "INVALID_CREDENTIALS"),
  usernameTaken: () => apiError("Username already taken", 409, "USERNAME_TAKEN"),
  emailTaken: () => apiError("Email already taken", 409, "EMAIL_TAKEN"),
  nameExists: (type = "item") => apiError(`${type} name already exists`, 409, "NAME_EXISTS"),
} as const;

// ============================================================================
// Error Handling Wrapper
// ============================================================================

/**
 * Wrap an API handler with standardized error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<any>>
) {
  return async (...args: T): Promise<NextResponse<any>> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API Error:", error);
      
      if (error instanceof Error) {
        // Handle known error types
        if (error.message.includes("UNIQUE constraint failed")) {
          return ApiErrors.conflict("Resource already exists");
        }
        if (error.message.includes("FOREIGN KEY constraint failed")) {
          return ApiErrors.badRequest("Invalid reference");
        }
        if (error.message.includes("NOT NULL constraint failed")) {
          return ApiErrors.validationError("Required field is missing");
        }
        
        return apiError(error.message, 400);
      }
      
      return ApiErrors.serverError();
    }
  };
}

// ============================================================================
// Request Validation
// ============================================================================

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  fields: string[]
): string[] {
  const missing: string[] = [];
  
  for (const field of fields) {
    const value = body[field];
    if (value === null || value === undefined || value === "") {
      missing.push(field);
    }
  }
  
  return missing;
}

/**
 * Validate and extract fields from request body
 */
export function extractFields<T extends Record<string, any>>(
  body: any,
  fieldMap: { [K in keyof T]: (value: any) => T[K] }
): T {
  const result = {} as T;
  
  for (const [key, transformer] of Object.entries(fieldMap)) {
    try {
      result[key as keyof T] = transformer(body[key]);
    } catch (error) {
      throw new Error(`Invalid value for field '${key}': ${error instanceof Error ? error.message : 'Invalid format'}`);
    }
  }
  
  return result;
}