
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './app/App.tsx';
import './styles/index.css';

let hasReloadedForServiceWorkerUpdate = false;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedForServiceWorkerUpdate) {
      return;
    }

    hasReloadedForServiceWorkerUpdate = true;
    window.location.reload();
  });
}

const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    void updateServiceWorker(true);
  },
});

createRoot(document.getElementById('root')!).render(<App />);
  