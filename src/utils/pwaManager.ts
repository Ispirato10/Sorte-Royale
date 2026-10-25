import { registerSW } from 'virtual:pwa-register';

export function setupPWA(onUpdateApplied?: () => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Automatically activate new service worker and refresh seamlessly
        console.log('Sorte Royale: Nova atualização detectada. Aplicando...');
        if (onUpdateApplied) {
          onUpdateApplied();
        }
        updateSW(true);
      },
      onOfflineReady() {
        console.log('Sorte Royale: Aplicativo pronto para uso offline.');
      },
      onRegisteredSW(swUrl, registration) {
        console.log('Sorte Royale: Service Worker registrado em:', swUrl);
        if (registration) {
          // Check for updates every 30 minutes
          setInterval(() => {
            registration.update().catch(() => {});
          }, 30 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.warn('Sorte Royale: Falha no registro do Service Worker:', error);
      },
    });

    // Check on visibility change (when user returns to the tab/app)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg) reg.update().catch(() => {});
        }).catch(() => {});
      }
    });

    // Check on network reconnection
    window.addEventListener('online', () => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) reg.update().catch(() => {});
      }).catch(() => {});
    });
  } catch (err) {
    console.warn('PWA initialization error:', err);
  }
}
