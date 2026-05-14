import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Persists an auth token securely on-device.
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

/**
 * Retrieves the stored auth token, or null if not present.
 */
export const getAuthToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};

/**
 * Clears the auth token (used on logout / 401).
 */
export const clearAuthToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
};

/**
 * Persists a refresh token securely.
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

/**
 * Retrieves the stored refresh token, or null if not present.
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

/**
 * Clears all auth-related secure storage.
 */
export const clearAllTokens = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
};
