import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomCode: null,
  votesToSkip: 2,
  guestCanPause: true,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom(state, action) {
      state.roomCode = action.payload.roomCode;
      state.votesToSkip = action.payload.votesToSkip;
      state.guestCanPause = action.payload.guestCanPause;
    },
    clearRoom(state) {
      state.roomCode = null;
    },
  },
});

export const { setRoom, clearRoom } = roomSlice.actions;
export default roomSlice.reducer;