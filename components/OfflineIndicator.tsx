'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';

export function OfflineIndicator() {
    const { isOnline, pendingCount, isSyncing } = useOfflineSync();

    if (isOnline && pendingCount === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {!isOnline ? (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>📡 Offline Mode</span>
                </div>
            ) : isSyncing ? (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span>🔄 Syncing {pendingCount} items...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>✅ Synced</span>
                </div>
            )}
        </div>
    );
}
