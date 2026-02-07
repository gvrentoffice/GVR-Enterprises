'use server';

import type { Route, Visit } from '@/lib/firebase/schema';
import { getSession } from './auth';
import { TENANT_ID } from '@/lib/constants';

/**
 * Get or initialize Firebase Admin SDK Firestore
 */
async function getAdminFirestore() {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Firebase Admin SDK credentials not configured');
  }

  const admin = await import('firebase-admin');

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  return admin.firestore();
}

/**
 * Create a new route (server action for agents)
 */
export async function createRouteAction(
  routeData: {
    agentId: string;
    date: Date;
    visits: Visit[];
  }
): Promise<{ success: boolean; routeId?: string; error?: string }> {
  try {
    console.log('[createRouteAction] Starting route creation...');

    const session = await getSession('agent');
    if (!session) {
      console.log('[createRouteAction] No agent session found');
      return { success: false, error: 'Unauthorized - Agent session required' };
    }
    console.log('[createRouteAction] Agent session verified');

    const firestore = await getAdminFirestore();
    const routeRef = firestore.collection('routes').doc();
    const now = new Date();

    const route = {
      id: routeRef.id,
      tenantId: TENANT_ID,
      agentId: routeData.agentId,
      date: routeData.date,
      visits: routeData.visits,
      status: 'planned' as const,
      createdAt: now,
      updatedAt: now,
    };

    console.log('[createRouteAction] Creating route:', route.id);
    await routeRef.set(route);

    console.log('[createRouteAction] Route created successfully');
    return { success: true, routeId: routeRef.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create route';
    console.error('[createRouteAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update route status (server action for agents)
 */
export async function updateRouteStatusAction(
  routeId: string,
  status: Route['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('agent');
    if (!session) {
      return { success: false, error: 'Unauthorized - Agent session required' };
    }

    const firestore = await getAdminFirestore();
    const routeRef = firestore.collection('routes').doc(routeId);

    await routeRef.update({
      status,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update route status';
    console.error('[updateRouteStatusAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update visit status in a route (server action for agents)
 */
export async function updateVisitStatusAction(
  routeId: string,
  companyId: string,
  visitData: Partial<Visit>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('agent');
    if (!session) {
      return { success: false, error: 'Unauthorized - Agent session required' };
    }

    const firestore = await getAdminFirestore();
    const routeRef = firestore.collection('routes').doc(routeId);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      return { success: false, error: 'Route not found' };
    }

    const routeData = routeDoc.data() as Route;
    const updatedVisits = routeData.visits.map((visit) => {
      if (visit.companyId === companyId) {
        return { ...visit, ...visitData };
      }
      return visit;
    });

    await routeRef.update({
      visits: updatedVisits,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update visit';
    console.error('[updateVisitStatusAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Agent check-in (server action)
 */
export async function agentCheckInAction(
  agentId: string,
  location: { latitude: number; longitude: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('agent');
    if (!session) {
      return { success: false, error: 'Unauthorized - Agent session required' };
    }

    const firestore = await getAdminFirestore();
    const agentRef = firestore.collection('agents').doc(agentId);
    const now = new Date();

    await agentRef.update({
      'attendance.checkIn': now,
      'attendance.checkInLocation': location,
      status: 'active',
      updatedAt: now,
    });

    // Log activity
    try {
      const agentDoc = await agentRef.get();
      const agentData = agentDoc.data();

      const activityRef = firestore.collection('agent_logs').doc();
      await activityRef.set({
        agentId,
        agentName: agentData?.name || 'Unknown',
        type: 'CHECK_IN',
        description: 'Agent checked in',
        metadata: { location },
        timestamp: now,
      });
    } catch (logError) {
      console.warn('[agentCheckInAction] Failed to log activity:', logError);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check in';
    console.error('[agentCheckInAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Agent check-out (server action)
 */
export async function agentCheckOutAction(
  agentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('agent');
    if (!session) {
      return { success: false, error: 'Unauthorized - Agent session required' };
    }

    const firestore = await getAdminFirestore();
    const agentRef = firestore.collection('agents').doc(agentId);
    const now = new Date();

    await agentRef.update({
      'attendance.checkOut': now,
      status: 'inactive',
      updatedAt: now,
    });

    // Log activity
    try {
      const agentDoc = await agentRef.get();
      const agentData = agentDoc.data();

      const activityRef = firestore.collection('agent_logs').doc();
      await activityRef.set({
        agentId,
        agentName: agentData?.name || 'Unknown',
        type: 'CHECK_OUT',
        description: 'Agent checked out',
        timestamp: now,
      });
    } catch (logError) {
      console.warn('[agentCheckOutAction] Failed to log activity:', logError);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check out';
    console.error('[agentCheckOutAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
