import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,

    Timestamp,
    updateDoc,
    getDoc,
    QueryConstraint,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config';
import { TENANT_ID } from '../../constants';
import type { Lead } from '../schema';

/**
 * Create new lead
 */
export async function createLead(
    leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>
): Promise<string> {
    try {
        const leadId = doc(collection(db, 'leads')).id;
        const now = Timestamp.now();

        const lead: Lead = {
            id: leadId,
            tenantId: TENANT_ID,
            ...leadData,
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(doc(db, 'leads', leadId), lead);
        return leadId;
    } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
    }
}

/**
 * Get agent's leads
 */
export async function getAgentLeads(agentId: string): Promise<Lead[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('agentId', '==', agentId),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Lead);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
}

/**
 * Subscribe to agent's leads
 */
export function subscribeToAgentLeads(
    agentId: string,
    callback: (leads: Lead[]) => void
): Unsubscribe {
    const constraints: QueryConstraint[] = [
        where('tenantId', '==', TENANT_ID),
        where('agentId', '==', agentId),
    ];

    const q = query(collection(db, 'leads'), ...constraints);

    return onSnapshot(q, (snapshot) => {
        const leads = snapshot.docs.map((doc) => doc.data() as Lead);
        callback(leads);
    }, (error) => {
        console.error('Error subscribing to leads:', error);
    });
}

/**
 * Get leads by status
 */
export async function getLeadsByStatus(
    agentId: string,
    status: Lead['status']
): Promise<Lead[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('agentId', '==', agentId),
            where('status', '==', status),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Lead);
    } catch (error) {
        console.error('Error fetching leads by status:', error);
        return [];
    }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
    leadId: string,
    newStatus: Lead['status']
): Promise<boolean> {
    try {
        const docRef = doc(db, 'leads', leadId);
        await updateDoc(docRef, {
            status: newStatus,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating lead:', error);
        return false;
    }
}

/**
 * Approve price access for a lead
 */
export async function approvePriceAccess(leadId: string): Promise<void> {
    try {
        const docRef = doc(db, 'leads', leadId);
        await updateDoc(docRef, {
            priceAccessApproved: true,
            status: 'approved',
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error approving price access:', error);
        throw new Error('Failed to approve price access');
    }
}

/**
 * Revoke price access for a lead
 */
export async function revokePriceAccess(leadId: string): Promise<void> {
    try {
        const docRef = doc(db, 'leads', leadId);
        await updateDoc(docRef, {
            priceAccessApproved: false,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error revoking price access:', error);
        throw new Error('Failed to revoke price access');
    }
}

/**
 * Convert lead to customer
 */
export async function convertLeadToCustomer(
    leadId: string,
    companyId: string
): Promise<boolean> {
    try {
        const docRef = doc(db, 'leads', leadId);
        await updateDoc(docRef, {
            status: 'converted',
            convertedToCompanyId: companyId,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error converting lead:', error);
        return false;
    }
}

/**
 * Get lead by ID
 */
export async function getLeadById(leadId: string): Promise<Lead | null> {
    try {
        const docRef = doc(db, 'leads', leadId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Lead;
        }
        return null;
    } catch (error) {
        console.error('Error fetching lead:', error);
        return null;
    }
}

/**
 * Get lead by WhatsApp number
 */
export async function getLeadByWhatsApp(whatsappNumber: string): Promise<Lead | null> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('whatsappNumber', '==', whatsappNumber),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        return snapshot.docs[0].data() as Lead;
    } catch (error) {
        console.error('Error fetching lead by WhatsApp:', error);
        return null;
    }
}
/**
 * Get lead by Email
 */
export async function getLeadByEmail(email: string): Promise<Lead | null> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('email', '==', email),
        ];

        const q = query(collection(db, 'leads'), ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        return snapshot.docs[0].data() as Lead;
    } catch (error) {
        console.error('Error fetching lead by Email:', error);
        return null;
    }
}

/**
 * Create lead from Google Sign-In
 * Creates a new customer with pending approval status
 */
export async function createLeadFromGoogleSignIn(
    email: string,
    displayName: string,
    whatsappNumber: string,
    photoURL?: string
): Promise<string> {
    try {
        const leadId = doc(collection(db, 'leads')).id;
        const now = Timestamp.now();

        const lead: Lead = {
            id: leadId,
            tenantId: TENANT_ID,
            shopName: displayName || 'New Customer',
            ownerName: displayName || 'Customer',
            whatsappNumber: whatsappNumber,
            email: email,
            primaryAddress: {
                street: '',
                city: '',
                state: '',
                pincode: '',
            },
            shopImageUrl: photoURL || '',
            visitingCardUrl: '',
            agentId: 'google-signup', // Special marker for Google sign-ups
            agentName: 'Self Registration',
            status: 'pending',
            priceAccessApproved: false, // Not approved by default
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(doc(db, 'leads', leadId), lead);
        return leadId;
    } catch (error) {
        console.error('Error creating lead from Google Sign-In:', error);
        throw error;
    }
}

