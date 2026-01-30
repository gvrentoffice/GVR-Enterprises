'use client';

import { useEffect, useState } from 'react';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if user dismissed the prompt previously
        const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (isDismissed) return;

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setShowPrompt(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-80 bg-zinc-900/95 backdrop-blur-xl text-white p-5 rounded-[2rem] shadow-2xl z-[60] border border-white/10 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-600/20">
                    <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm tracking-tight">Add to Home Screen</p>
                    <p className="text-[11px] text-zinc-400 font-medium leading-tight mt-0.5">Experience Ryth Bazar as a standalone app on your device.</p>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleInstall}
                    className="flex-1 bg-white text-zinc-900 h-10 rounded-xl font-bold text-xs hover:bg-zinc-100 transition-colors shadow-sm"
                >
                    Install Now
                </button>
                <button
                    onClick={handleDismiss}
                    className="px-4 h-10 rounded-xl font-bold text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    Not Now
                </button>
            </div>
        </div>
    );
}
