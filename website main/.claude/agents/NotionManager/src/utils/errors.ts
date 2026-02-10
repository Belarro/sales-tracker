/**
 * Error handling for Notion API operations
 */

export interface NotionErrorResponse {
  success: false;
  error: string;
  error_code: string;
  operation: string;
  rate_limit_remaining?: number;
  details?: any;
}

export interface NotionSuccessResponse<T = any> {
  success: true;
  data: T;
  operation: string;
  rate_limit_remaining?: number;
}

export type NotionResponse<T = any> =
  | NotionSuccessResponse<T>
  | NotionErrorResponse;

/**
 * Map of Notion API error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  object_not_found:
    'The requested page or database does not exist, or you do not have access to it',
  unauthorized:
    'Invalid Notion API token or insufficient permissions. Check your NOTION_API_TOKEN.',
  restricted_resource:
    'Access to this resource is restricted. Verify integration permissions.',
  rate_limited:
    'Rate limit exceeded (3 requests/second). Request will be retried automatically.',
  invalid_request:
    'Invalid request parameters. Check your input values.',
  conflict_error:
    'Conflict - resource was modified by another request. Please retry.',
  service_unavailable:
    'Notion API is temporarily unavailable. Please try again later.',
  validation_error: 'Request validation failed. Check parameter types and values.',
  internal_server_error:
    'Notion API experienced an internal error. Please retry.',
};

/**
 * Handle Notion API errors and return standardized error response
 */
export function handleNotionError(
  error: any,
  operation: string
): NotionErrorResponse {
  console.error(`[Notion Error] ${operation}:`, error);

  // Notion API specific errors
  if (error.code) {
    const errorMessage =
      ERROR_MESSAGES[error.code] ||
      error.message ||
      'Unknown Notion API error';

    const response: NotionErrorResponse = {
      success: false,
      error: errorMessage,
      error_code: error.code,
      operation,
    };

    // Extract rate limit info if available
    if (error.headers?.['x-ratelimit-remaining']) {
      response.rate_limit_remaining = parseInt(
        error.headers['x-ratelimit-remaining'],
        10
      );
    }

    // Add additional details for debugging
    if (error.status) {
      response.details = {
        status: error.status,
        message: error.message,
      };
    }

    return response;
  }

  // Network errors
  if (error.name === 'FetchError' || error.code === 'ECONNREFUSED') {
    return {
      success: false,
      error: 'Network error: Unable to reach Notion API. Check your connection.',
      error_code: 'network_error',
      operation,
    };
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
    return {
      success: false,
      error: 'Request timeout: Notion API took too long to respond.',
      error_code: 'timeout_error',
      operation,
    };
  }

  // Validation errors (from Zod)
  if (error.name === 'ZodError') {
    return {
      success: false,
      error: `Validation error: ${error.errors[0]?.message || 'Invalid input'}`,
      error_code: 'validation_error',
      operation,
      details: error.errors,
    };
  }

  // Generic error
  return {
    success: false,
    error: error.message || 'An unknown error occurred',
    error_code: 'unknown_error',
    operation,
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  operation: string,
  rateLimitRemaining?: number
): NotionSuccessResponse<T> {
  const response: NotionSuccessResponse<T> = {
    success: true,
    data,
    operation,
  };

  if (rateLimitRemaining !== undefined) {
    response.rate_limit_remaining = rateLimitRemaining;
  }

  return response;
}

/**
 * Check if response is an error
 */
export function isErrorResponse(
  response: NotionResponse
): response is NotionErrorResponse {
  return !response.success;
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(
  response: NotionResponse<T>
): response is NotionSuccessResponse<T> {
  return response.success;
}
