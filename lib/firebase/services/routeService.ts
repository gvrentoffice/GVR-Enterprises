import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    updateDoc,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';
import { TENANT_ID } from '../../constants';
import type { Route, Visit } from '../schema';

/**
 * Create a new route for agent
 */
export async function createRoute(
    routeData: Omit<Route, 'id' | 'createdAt'>
): Promise<string> {
    try {
        const routeId = doc(collection(db, 'routes')).id;
        const route: Route = {
            id: routeId,
            ...routeData,
            createdAt: Timestamp.now(),
        };

        await setDoc(doc(db, 'routes', routeId), route);
        return routeId;
    } catch (error) {
        console.error('Error creating route:', error);
        throw error;
    }
}

/**
 * Get today's route for agent
 */
export async function getTodayRoute(agentId: string): Promise<Route | null> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('agentId', '==', agentId),
            where('date', '>=', Timestamp.fromDate(today)),
            orderBy('date', 'desc'),
        ];

        const q = query(collection(db, 'routes'), ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as Route;
    } catch (error) {
        console.error('Error fetching today route:', error);
        return null;
    }
}

/**
 * Get agent's routes for date range
 */
export async function getAgentRoutes(
    agentId: string,
    startDate: Date,
    endDate: Date
): Promise<Route[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('agentId', '==', agentId),
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate)),
            orderBy('date', 'desc'),
        ];

        const q = query(collection(db, 'routes'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Route);
    } catch (error) {
        console.error('Error fetching routes:', error);
        return [];
    }
}

/**
 * Update visit status
 */
export async function updateVisitStatus(
    routeId: string,
    companyId: string,
    visitData: Partial<Visit>
): Promise<boolean> {
    try {
        const routeRef = doc(db, 'routes', routeId);
        const routeSnap = await getDocs(
            query(collection(db, 'routes'), where('id', '==', routeId))
        );

        if (!routeSnap.empty) {
            const route = routeSnap.docs[0].data() as Route;
            const updatedVisits = route.visits.map((visit) =>
                visit.companyId === companyId ? { ...visit, ...visitData } : visit
            );

            await updateDoc(routeRef, {
                visits: updatedVisits,
            });

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error updating visit:', error);
        return false;
    }
}

/**
 * Check in to a specific visit
 */
export async function checkInVisit(
    routeId: string,
    companyId: string
): Promise<boolean> {
    try {
        const routeRef = doc(db, 'routes', routeId);
        const q = query(collection(db, 'routes'), where('id', '==', routeId));
        const routeSnap = await getDocs(q);

        if (!routeSnap.empty) {
            const route = routeSnap.docs[0].data() as Route;
            const updatedVisits = route.visits.map((visit) =>
                visit.companyId === companyId
                    ? { ...visit, status: 'completed' as const, completedAt: Timestamp.now() }
                    : visit
            );

            await updateDoc(routeRef, {
                visits: updatedVisits,
            });

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking in visit:', error);
        return false;
    }
}
/**
 * Get all routes for today (all agents)
 */
export async function getAllTodayRoutes(): Promise<Route[]> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('date', '>=', Timestamp.fromDate(today)),
            orderBy('date', 'desc'),
        ];

        const q = query(collection(db, 'routes'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Route);
    } catch (error) {
        console.error('Error fetching all today routes:', error);
        return [];
    }
}
