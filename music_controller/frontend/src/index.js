import App from "./components/App";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <Provider store={store}>  {/* Wrap App with Provider to pass down Redux state */}
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);