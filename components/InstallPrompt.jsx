"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share2, X } from "lucide-react";

const DISMISS_KEY = "tp_install_prompt_dismissed";

function isIosSafari() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
  return isIos && isSafari;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.localStorage.getItem(DISMISS_KEY);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (dismissed || isStandalone) return;

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowAndroid(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    let iosTimer = null;
    if (isIosSafari()) {
      iosTimer = window.setTimeout(() => setShowIos(true), 1800);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setShowAndroid(false);
    setShowIos(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      dismiss();
    }
  }

  if (!showAndroid && !showIos) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[22rem] z-[999]">
      <div className="rounded-2xl border border-border bg-white shadow-lg p-4 flex items-start gap-3">
        <Image
          src="/icons/icon-192.png"
          alt=""
          className="w-11 h-11 rounded-xl bg-brand-50 object-cover shrink-0"
          width={44}
          height={44}
        />
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-sm text-ink">
            Install TruePower
          </p>
          {showAndroid ? (
            <>
              <p className="text-sub text-xs mt-0.5 mb-3">
                Add the site to your home screen and open it like an app.
              </p>
              <button
                type="button"
                onClick={handleInstall}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <Download size={14} /> Install
              </button>
            </>
          ) : (
            <>
              <p className="text-sub text-xs mt-0.5">
                Tap <Share2 size={12} className="inline -mt-0.5" /> Share, then
                choose <span className="font-semibold">Add to Home Screen</span>.
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-faint hover:text-ink shrink-0"
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
