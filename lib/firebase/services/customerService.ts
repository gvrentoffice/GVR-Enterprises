import {
    collection,
    getDocs,
    query,
    where,
    QueryConstraint,
    orderBy,
} from 'firebase/firestore';
import { db } from '../config';
import type { Lead } from '../schema';

const TENANT_ID = 'ryth-bazar';

/**
 * Get customers (leads) assigned to agent
 */
export async function getAgentCustomers(agentId: string): Promise<Lead[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('agentId', '==', agentId),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Lead);
    } catch (error) {
        console.error('Error fetching agent customers:', error);
        return [];
    }
}

/**
 * Get all customers (leads) - for admin view
 */
export async function getAllCustomers(): Promise<Lead[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Lead);
    } catch (error) {
        console.error('Error fetching all customers:', error);
        return [];
    }
}

/**
 * Get approved customers only
 */
export async function getApprovedCustomers(): Promise<Lead[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Lead);
    } catch (error) {
        console.error('Error fetching approved customers:', error);
        return [];
    }
}

/**
 * Get pending customers (awaiting approval)
 */
export async function getPendingCustomers(): Promise<Lead[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Lead);
    } catch (error) {
        console.error('Error fetching pending customers:', error);
        return [];
    }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getAllCustomers instead
 */
export async function getActiveCustomers(): Promise<Lead[]> {
    return getApprovedCustomers();
}
