'use server';

import type { Lead } from '@/lib/firebase/schema';
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
 * Create a new lead/customer (server action for agents)
 */
export async function createLeadAction(
  leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>
): Promise<{ success: boolean; leadId?: string; error?: string }> {
  try {
    console.log('[createLeadAction] Starting lead creation...');

    // Verify agent session exists
    const session = await getSession('agent');
    if (!session) {
      console.log('[createLeadAction] No agent session found');
      return { success: false, error: 'Unauthorized - Agent session required' };
    }
    console.log('[createLeadAction] Agent session verified');

    const firestore = await getAdminFirestore();
    const leadRef = firestore.collection('leads').doc();
    const now = new Date();

    const lead = {
      id: leadRef.id,
      tenantId: TENANT_ID,
      shopName: leadData.shopName,
      ownerName: leadData.ownerName,
      whatsappNumber: leadData.whatsappNumber,
      email: leadData.email || null,
      primaryAddress: leadData.primaryAddress || {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      shopImageUrl: leadData.shopImageUrl || '',
      visitingCardUrl: leadData.visitingCardUrl || '',
      agentId: leadData.agentId,
      agentName: leadData.agentName,
      status: leadData.status || 'pending',
      priceAccessApproved: leadData.priceAccessApproved || false,
      createdAt: now,
      updatedAt: now,
    };

    console.log('[createLeadAction] Creating lead:', lead.id, lead.shopName);
    await leadRef.set(lead);

    // Log agent activity
    try {
      const activityRef = firestore.collection('agent_logs').doc();
      await activityRef.set({
        agentId: leadData.agentId,
        agentName: leadData.agentName,
        type: 'CUSTOMER_ONBOARDED',
        description: `Onboarded customer ${leadData.shopName}`,
        metadata: { leadId: lead.id, shopName: leadData.shopName },
        timestamp: now,
      });
    } catch (logError) {
      console.warn('[createLeadAction] Failed to log activity:', logError);
    }

    console.log('[createLeadAction] Lead created successfully');
    return { success: true, leadId: leadRef.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create lead';
    console.error('[createLeadAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update lead status (server action for admin)
 */
export async function updateLeadStatusAction(
  leadId: string,
  newStatus: Lead['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify admin session
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const leadRef = firestore.collection('leads').doc(leadId);

    await leadRef.update({
      status: newStatus,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update lead';
    console.error('[updateLeadStatusAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Approve price access for a lead (server action for admin)
 */
export async function approvePriceAccessAction(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const leadRef = firestore.collection('leads').doc(leadId);

    await leadRef.update({
      priceAccessApproved: true,
      status: 'approved',
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to approve price access';
    console.error('[approvePriceAccessAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Revoke price access for a lead (server action for admin)
 */
export async function revokePriceAccessAction(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const leadRef = firestore.collection('leads').doc(leadId);

    await leadRef.update({
      priceAccessApproved: false,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to revoke price access';
    console.error('[revokePriceAccessAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
