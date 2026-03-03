import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './app.css';
import { DEV_MODE } from './constants';

if (DEV_MODE) {
  import('./lib/dev-mock').then(({ injectDevInit }) => {
    injectDevInit();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
