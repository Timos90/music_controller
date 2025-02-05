import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logOut(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logOut } = userSlice.actions;
export default userSlice.reducer;