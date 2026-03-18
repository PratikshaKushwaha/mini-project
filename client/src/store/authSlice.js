import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  accessToken: null, // stays ONLY in memory
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken || state.accessToken;
      state.isAuthenticated = !!state.user;
      state.loading = false;
    },

    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logoutUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;