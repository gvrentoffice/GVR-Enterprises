import {
    collection,
    getDocs,
    query,
    where,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';
import type { Company } from '../schema';

const TENANT_ID = 'ryth-bazar';

/**
 * Get customers assigned to agent
 */
export async function getAgentCustomers(agentId: string): Promise<Company[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('assignedAgent', '==', agentId),
        ];

        const q = query(collection(db, 'companies'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Company);
    } catch (error) {
        console.error('Error fetching agent customers:', error);
        return [];
    }
}

/**
 * Get all active customers
 */
export async function getActiveCustomers(): Promise<Company[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('status', '==', 'active'),
        ];

        const q = query(collection(db, 'companies'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Company);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}
