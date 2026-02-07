'use server';

import type { Agent } from '@/lib/firebase/schema';
import { getSession } from './auth';
import { TENANT_ID } from '@/lib/constants';

/**
 * Get or initialize Firebase Admin SDK
 */
async function getAdminFirestore() {
  // Check for required env vars
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Firebase Admin SDK credentials not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local');
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
 * Create a new agent (server action)
 * Uses Firebase Admin SDK to bypass Firestore security rules
 */
export async function createAgentAction(
  agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>
): Promise<{ success: boolean; agentId?: string; error?: string }> {
  try {
    console.log('[createAgentAction] Starting agent creation...');

    // Verify admin session exists
    const session = await getSession('admin');
    if (!session) {
      console.log('[createAgentAction] No admin session found');
      return { success: false, error: 'Unauthorized - Admin session required' };
    }
    console.log('[createAgentAction] Admin session verified');

    // Use Firebase Admin SDK to write directly to Firestore
    const firestore = await getAdminFirestore();
    console.log('[createAgentAction] Firestore initialized');

    const agentRef = firestore.collection('agents').doc();
    const now = new Date();

    // Create agent object with defaults for optional fields
    const agent = {
      id: agentRef.id,
      tenantId: TENANT_ID,
      userId: agentData.userId || agentRef.id, // Use agent ID as userId if not provided
      name: agentData.name,
      whatsappNumber: agentData.whatsappNumber,
      employeeId: agentData.employeeId,
      territory: agentData.territory || [],
      targetSales: agentData.targetSales || 0,
      status: agentData.status || 'active',
      performance: agentData.performance || {
        currentSales: 0,
        monthlySales: 0,
        tasksCompleted: 0,
        leadsGenerated: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    console.log('[createAgentAction] Creating agent:', agent.id, agent.name);
    await agentRef.set(agent);
    console.log('[createAgentAction] Agent created successfully');

    return {
      success: true,
      agentId: agentRef.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create agent';
    console.error('[createAgentAction] Error:', errorMessage);
    console.error('[createAgentAction] Full error:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update an existing agent (server action)
 * Uses Firebase Admin SDK to bypass Firestore security rules
 */
export async function updateAgentAction(
  agentId: string,
  updates: Partial<Agent>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify admin session exists
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    // Use Firebase Admin SDK to write directly to Firestore
    const firestore = await getAdminFirestore();
    const agentRef = firestore.collection('agents').doc(agentId);

    await agentRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update agent';
    console.error('Error updating agent:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
