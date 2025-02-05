// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'; // Import configureStore from Redux Toolkit
import roomReducer from './reducers/roomReducer';
import userReducer from './reducers/userReducer';

// Create the store using configureStore
const store = configureStore({
  reducer: {
    room: roomReducer,
    user: userReducer,
  },
  // Redux DevTools is automatically enabled, no need for extra configuration
});

export default store;
