import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Stores user data
  isAuthenticated: false,
  loading: true,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('accessToken');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
});

export const { setCredentials, logoutUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
