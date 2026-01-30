import localforage from 'localforage';

localforage.config({
    name: 'ryth-bazar',
    storeName: 'offline_cache',
    version: 1.0,
});

interface CachedData {
    id: string;
    type: 'order' | 'lead' | 'visit' | 'route';
    data: any;
    timestamp: number;
    synced: boolean;
}

export const offlineStorage = {
    async save(type: string, data: any) {
        const item: CachedData = {
            id: `${type}-${Date.now()}`,
            type: type as any,
            data,
            timestamp: Date.now(),
            synced: false,
        };
        await localforage.setItem(item.id, item);
        return item.id;
    },

    async getUnsynced() {
        const items: CachedData[] = [];
        await localforage.iterate((value: CachedData) => {
            if (!value.synced) items.push(value);
        });
        return items;
    },

    async markSynced(id: string) {
        const item = await localforage.getItem<CachedData>(id);
        if (item) {
            item.synced = true;
            await localforage.setItem(id, item);
        }
    },

    async clear() {
        await localforage.clear();
    },
};
