import { createSlice } from '@reduxjs/toolkit';
import type { AuthState } from './auth.types';
import { authApi } from './authApi';
import { saveAuthToken, clearAllTokens } from '../../utils/storage';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAllTokens();
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Listen to login and register fulfillment
    builder.addMatcher(
      (action) => 
        authApi.endpoints.login.matchFulfilled(action) || 
        authApi.endpoints.register.matchFulfilled(action),
      (state, { payload }) => {
        state.user = payload.data.user;
        state.accessToken = payload.data.access_token;
        state.isAuthenticated = true;
        saveAuthToken(payload.data.access_token);
      }
    );
    // Listen to profile updates
    builder.addMatcher(
      (action) => action.type.endsWith('/executeMutation/fulfilled') && action.meta?.arg?.endpointName === 'updateProfile',
      (state, { payload }: any) => {
        if (state.user) {
          state.user = { ...state.user, ...payload.data };
        }
      }
    );
    // Listen to profile fetch to keep store in sync
    builder.addMatcher(
      (action) => action.type.endsWith('/executeQuery/fulfilled') && action.meta?.arg?.endpointName === 'getProfile',
      (state, { payload }: any) => {
        if (state.user) {
          state.user = { ...state.user, ...payload.data };
        }
      }
    );
  },
});

export const { clearAuth, setCredentials } = authSlice.actions;
export default authSlice.reducer;

