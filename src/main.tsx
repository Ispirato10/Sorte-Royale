import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {setupPWA} from './utils/pwaManager';

createRoot(document.getElementById('root')!).render(<App />);

// Register Service Worker and enable auto-updates
setupPWA(() => {
  window.dispatchEvent(new CustomEvent('sorte-royale-pwa-updated'));
});
