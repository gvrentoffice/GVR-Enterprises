import { offlineStorage } from './storage';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';


const SYNC_INTERVAL = 30000;

export class SyncQueue {

    private syncing = false;
    private syncInterval?: NodeJS.Timer;

    startSync() {
        this.syncInterval = setInterval(() => this.processQueue(), SYNC_INTERVAL);
        window.addEventListener('online', () => this.processQueue());
    }

    stopSync() {
        if (this.syncInterval) clearInterval(this.syncInterval as unknown as number);
    }

    public async processQueue() {
        if (this.syncing || !navigator.onLine) {
            console.log('🔴 Offline or syncing');
            return;
        }

        this.syncing = true;
        console.log('🟢 Online - syncing');

        const unsynced = await offlineStorage.getUnsynced();

        for (const item of unsynced) {
            try {
                await this.syncItem(item);
                await offlineStorage.markSynced(item.id);
                console.log('✅ Synced:', item.id);
            } catch (error) {
                console.error('❌ Sync failed:', error);
            }
        }

        this.syncing = false;
    }

    private async syncItem(item: any) {
        const collectionName = item.type === 'order' ? 'orders' : item.type;
        const ref = collection(db, collectionName);
        await addDoc(ref, {
            ...item.data,
            syncedAt: new Date(),
        });
    }
}

export const syncQueue = new SyncQueue();
