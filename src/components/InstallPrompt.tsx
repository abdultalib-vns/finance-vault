import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed or installed
    const hasDismissed = localStorage.getItem("finaura_install_dismissed");
    if (hasDismissed === "true") return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Detect if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);

    if (isStandalone) return;

    if (isIOSDevice) {
      setIsIOS(true);
      // Wait a few seconds before showing iOS prompt so it isn't too aggressive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop Chrome PWA standard event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a few seconds before showing
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("finaura_install_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 pb-20 sm:pb-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#1c1c1e] rounded-[28px] p-6 shadow-2xl border border-white/10 slide-in-from-bottom-8">
        
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
            <img src="/icon-192.png" alt="FinAura Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Install FinAura</h3>
            <p className="text-zinc-400 text-sm leading-tight">
              Get the native app experience. It works offline and takes almost no space.
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="bg-[#2c2c2e] rounded-xl p-4 mb-6 border border-white/5">
            <p className="text-sm text-zinc-300 mb-2">To install on iOS:</p>
            <ol className="text-sm text-zinc-400 list-decimal list-inside space-y-2">
              <li>Tap the <strong className="text-blue-400">Share</strong> button at the bottom of your screen.</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
            </ol>
          </div>
        ) : (
          <button 
            onClick={handleInstall}
            className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold py-3.5 rounded-xl mb-3 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            Install App
          </button>
        )}

        <button 
          onClick={handleDismiss}
          className="w-full bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors font-medium py-3 rounded-xl text-sm"
        >
          Not Now
        </button>

      </div>
    </div>
  );
}
