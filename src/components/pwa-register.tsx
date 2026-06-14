"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedKey = "repassecheck_install_banner_dismissed";

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    const shouldRegisterServiceWorker = process.env.NODE_ENV === "production" && !isLocalhost;

    if ("serviceWorker" in navigator) {
      if (shouldRegisterServiceWorker) {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // O app continua funcionando online mesmo se o SW falhar.
        });
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
    }

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    setIsDismissed(localStorage.getItem(dismissedKey) === "true");

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsDismissed(localStorage.getItem(dismissedKey) === "true");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function installApp() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function dismiss() {
    localStorage.setItem(dismissedKey, "true");
    setIsDismissed(true);
  }

  if (!installPrompt || isStandalone || isDismissed) {
    return null;
  }

  return (
    <div className="install-banner" role="status">
      <div>
        <strong>Instalar RepasseCheck</strong>
        <span>Use como aplicativo no celular, com atalho na tela inicial.</span>
      </div>
      <button type="button" onClick={installApp}>
        Instalar
      </button>
      <button className="ghost-install" type="button" onClick={dismiss} aria-label="Fechar aviso de instalacao">
        Fechar
      </button>
    </div>
  );
}
