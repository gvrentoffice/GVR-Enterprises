import { useEffect, useState } from 'react';
import { syncQueue } from '@/lib/offline/syncQueue';
import { offlineStorage } from '@/lib/offline/storage';

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        syncQueue.startSync();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            syncQueue.stopSync();
        };
    }, []);

    const handleOnline = () => {
        setIsOnline(true);
        setIsSyncing(true);
        syncQueue.processQueue();
        setTimeout(() => setIsSyncing(false), 2000);
    };

    const handleOffline = () => setIsOnline(false);

    useEffect(() => {
        const updateCount = async () => {
            const unsynced = await offlineStorage.getUnsynced();
            setPendingCount(unsynced.length);
        };
        updateCount();
        // Update count periodically or when online status changes
        const interval = setInterval(updateCount, 2000);
        return () => clearInterval(interval);
    }, [isOnline]);

    return {
        isOnline,
        pendingCount,
        isSyncing,
        saveOffline: offlineStorage.save,
    };
}
