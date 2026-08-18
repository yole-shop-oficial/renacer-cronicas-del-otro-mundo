import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ui/App';
import './ui/theme.css';

// §81: restaurar escala de texto elegida.
const savedScale = localStorage.getItem('textscale');
if (savedScale && savedScale !== 'normal') {
  document.documentElement.dataset.textscale = savedScale;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
