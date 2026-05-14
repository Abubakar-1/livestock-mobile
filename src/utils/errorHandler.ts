import { AxiosError } from 'axios';

/**
 * Extracts a human-readable error message from any error type.
 * Works with Axios errors, standard Error objects, and unknown throws.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Server returned a structured error body
    const serverMessage =
      error.response?.data?.message ??
      error.response?.data?.error ??
      null;
    if (serverMessage) return serverMessage;

    // Network-level error
    if (error.message) return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
