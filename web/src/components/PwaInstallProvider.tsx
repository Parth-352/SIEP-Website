"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Image from 'next/image';

interface PwaInstallContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  installApp: () => Promise<void>;
  openInstallModal: () => void;
  closeInstallModal: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextType>({
  isInstallable: false,
  isInstalled: false,
  isStandalone: false,
  isIOS: false,
  installApp: async () => {},
  openInstallModal: () => {},
  closeInstallModal: () => {},
});

export function usePwaInstall() {
  return useContext(PwaInstallContext);
}

const DISMISS_KEY = 'siep_pwa_banner_dismissed_v1';

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (standalone) {
      setIsInstalled(true);
      setIsStandalone(true);
      // If standalone app opens on a marketing/public route, redirect immediately to /dashboard
      const path = window.location.pathname;
      if (path === '/' || path === '/about' || path === '/competition' || path === '/bike' || path === '/contact') {
        window.location.replace('/dashboard');
      }
      return;
    }

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
    setIsIOS(isIosDevice);

    // 3. Register Service Worker in production
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA service worker registration notice:', err);
      });
    }

    // 4. Capture native beforeinstallprompt (Chromium / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check banner dismissal cooldown
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS Safari, show banner if not recently dismissed
    if (isIosDevice && isSafari) {
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setShowBanner(true);
      }
    }

    // Detect when successfully installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const openInstallModal = () => setIsInstallModalOpen(true);
  const closeInstallModal = () => setIsInstallModalOpen(false);

  const installApp = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    } else {
      // If no native prompt (e.g. iOS or desktop safari), open helper modal
      setIsInstallModalOpen(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    // Dismiss for 5 days
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 5 * 24 * 60 * 60 * 1000));
  };

  const isInstallable = !isInstalled && (Boolean(deferredPrompt) || isIOS);

  return (
    <PwaInstallContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isStandalone,
        isIOS,
        installApp,
        openInstallModal,
        closeInstallModal,
      }}
    >
      {children}

      {/* Floating Bottom Mobile Install Banner */}
      {showBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[999] animate-fade-in pointer-events-auto">
          <div className="bg-jet-black/95 backdrop-blur-md text-alice-blue p-4 rounded-2xl shadow-xl border border-orange/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange/20 border border-orange/40 flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/icons/icon-192.png"
                  alt="SIEP Log System"
                  width={36}
                  height={36}
                  className="rounded-lg object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold font-sans text-white flex items-center gap-1.5">
                  <span>SIEP Log System</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange text-jet-black font-extrabold uppercase">
                    APP
                  </span>
                </h4>
                <p className="text-[11px] font-mono text-grey line-clamp-1">
                  Install for offline logs & background uploads
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={installApp}
                className="px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orange/90 text-jet-black font-sans font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                className="w-7 h-7 rounded-lg text-grey hover:text-white flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS & Browser Install Instructions Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-jet-black/15 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-jet-black">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange/15 border border-orange/30 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/icons/icon-192.png"
                    alt="SIEP App Icon"
                    width={40}
                    height={40}
                    className="rounded-xl object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-jet-black">
                    Install SIEP Log System
                  </h3>
                  <span className="text-xs font-mono text-grey">
                    Official Workshop Engineering Logbook App
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeInstallModal}
                className="w-8 h-8 rounded-full bg-alice-blue hover:bg-jet-black hover:text-white flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Core Benefits */}
            <div className="p-3.5 rounded-2xl bg-alice-blue/60 border border-jet-black/5 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-jet-black font-semibold">
                <span className="text-orange">⚡</span>
                <span>Instant Home Screen &amp; Dock Launch</span>
              </div>
              <div className="flex items-center gap-2 text-jet-black font-semibold">
                <span className="text-emerald-600">✓</span>
                <span>Full-Screen Standalone Workspace</span>
              </div>
              <div className="flex items-center gap-2 text-jet-black font-semibold">
                <span className="text-sky-600">📶</span>
                <span>Fast Offline Workshop Resiliency</span>
              </div>
            </div>

            {/* Platform Instructions */}
            {isIOS ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs font-mono text-grey">
                  To install on your <strong>iPhone or iPad</strong>:
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-alice-blue/80 border border-jet-black/10">
                    <span className="w-6 h-6 rounded-lg bg-orange text-white font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button at the bottom of Safari (<span className="text-base">⎋</span>)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-alice-blue/80 border border-jet-black/10">
                    <span className="w-6 h-6 rounded-lg bg-orange text-white font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </span>
                    <span>
                      Scroll down and tap <strong>Add to Home Screen</strong> (<span className="text-base">⊞</span>)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-xs font-mono text-grey">
                  To install on <strong>Desktop or Android</strong>:
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-alice-blue/80 border border-jet-black/10">
                    <span className="w-6 h-6 rounded-lg bg-orange text-white font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </span>
                    <span>
                      Look for the <strong>Install App</strong> icon in your browser address bar or menu (<span className="text-base">⊕</span>)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-alice-blue/80 border border-jet-black/10">
                    <span className="w-6 h-6 rounded-lg bg-orange text-white font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </span>
                    <span>
                      Click <strong>Install</strong> to add the app to your Home Screen or Dock.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Dismiss */}
            <button
              type="button"
              onClick={closeInstallModal}
              className="w-full py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-sans font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Got It
            </button>

          </div>
        </div>
      )}
    </PwaInstallContext.Provider>
  );
}
