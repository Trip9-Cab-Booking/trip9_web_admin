// features/auth/authSlice.ts
'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import { encryptData, decryptData } from '@/utils/secureData';

export interface UserData {
    id: string;
    email: string;
    firstName: string;
    role: string;
}

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  loading: boolean;
}

// Initialize state
let initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
};

if (typeof window !== 'undefined') {
  const persisted = localStorage.getItem('_trip9_auth_state');
  if (persisted) {
    try {
      const decrypted = decryptData(persisted);
      initialState = {
        ...initialState,
        ...decrypted,
      };
    } catch (error) {
      console.error('Failed to decrypt persisted auth state:', error);
      localStorage.removeItem('_trip9_auth_state');
    }
  }
}

const persistState = async (state: AuthState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      '_trip9_auth_state',
      encryptData(({
        user: state.user,
        accessToken: state.accessToken,
      }))
    );
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: UserData;
        accessToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      persistState(state);
    },

    updateAccessToken: (state, action: PayloadAction<string | null>) => {
        state.accessToken = action.payload;
        persistState(state);
      },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('_trip9_auth_state');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCredentials,
  updateAccessToken,
  logout,
  setLoading,
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer;
