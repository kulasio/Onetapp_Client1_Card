import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installConsoleGuard } from './utils/consoleGuard';

installConsoleGuard();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
