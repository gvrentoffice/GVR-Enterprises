import {
    collection,
    doc,
    getDocs,
    query,
    where,
    Timestamp,
    updateDoc,
    getDoc,
    setDoc,
    addDoc,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';
import { TENANT_ID } from '../../constants';
import type { Agent } from '../schema';

export type ActivityType = 'CHECK_IN' | 'CHECK_OUT' | 'ORDER_CREATED' | 'CUSTOMER_ONBOARDED' | 'PAYMENT_COLLECTED';

export interface AgentActivity {
    id?: string;
    agentId: string;
    agentName: string;
    type: ActivityType;
    description: string;
    metadata?: any;
    timestamp: Timestamp;
}

export async function logAgentActivity(activity: Omit<AgentActivity, 'id' | 'timestamp'>) {
    try {
        await addDoc(collection(db, 'agent_logs'), {
            ...activity,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Failed to log activity", e);
    }
}

/**
 * Get agent by user ID
 */
export async function getAgentByUserId(userId: string): Promise<Agent | null> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('userId', '==', userId),
        ];

        const q = query(collection(db, 'agents'), ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as Agent;
    } catch (error) {
        console.error('Error fetching agent:', error);
        return null;
    }
}

/**
 * Get agent by WhatsApp number
 */
export async function getAgentByWhatsApp(whatsappNumber: string): Promise<Agent | null> {
    try {
        const cleanNumber = whatsappNumber.replace(/\D/g, '');
        const formats = [
            `+${cleanNumber}`,
            cleanNumber,
            cleanNumber.replace(/^91/, '')
        ];
        const searchNumbers = [...new Set(formats)].filter(n => n.length >= 10);

        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('whatsappNumber', 'in', searchNumbers),
        ];

        const q = query(collection(db, 'agents'), ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as Agent;
    } catch (error) {
        console.error('Error fetching agent by WhatsApp:', error);
        return null;
    }
}

/**
 * Get all agents (admin)
 */
export async function getAllAgents(): Promise<Agent[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
        ];

        const q = query(collection(db, 'agents'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            ...(doc.data() as any),
            id: doc.id
        } as Agent));
    } catch (error) {
        console.error('Error fetching agents:', error);
        return [];
    }
}

/**
 * Update agent performance metrics
 */
export async function updateAgentMetrics(
    agentId: string,
    metrics: Partial<Agent['performance']>
): Promise<boolean> {
    try {
        const docRef = doc(db, 'agents', agentId);
        await updateDoc(docRef, {
            performance: metrics,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating agent metrics:', error);
        return false;
    }
}

/**
 * Check in agent (start day)
 */
export async function agentCheckIn(
    agentId: string,
    location: { latitude: number; longitude: number }
): Promise<boolean> {
    try {
        const docRef = doc(db, 'agents', agentId);
        await updateDoc(docRef, {
            'attendance.checkIn': Timestamp.now(),
            'attendance.checkInLocation': location,
            status: 'active',
        });

        // Log activity
        const agent = await getAgentById(agentId);
        if (agent) {
            await logAgentActivity({
                agentId,
                agentName: agent.name,
                type: 'CHECK_IN',
                description: 'Agent checked in',
                metadata: { location }
            });
        }

        return true;
    } catch (error) {
        console.error('Error checking in agent:', error);
        return false;
    }
}

/**
 * Check out agent (end day)
 */
export async function agentCheckOut(agentId: string): Promise<boolean> {
    try {
        const docRef = doc(db, 'agents', agentId);
        await updateDoc(docRef, {
            'attendance.checkOut': Timestamp.now(),
            status: 'inactive',
        });

        const agent = await getAgentById(agentId);
        if (agent) {
            await logAgentActivity({
                agentId,
                agentName: agent.name,
                type: 'CHECK_OUT',
                description: 'Agent checked out'
            });
        }

        return true;
    } catch (error) {
        console.error('Error checking out agent:', error);
        return false;
    }
}
/**
 * Create a new agent
 */
export async function createAgent(
    agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>
): Promise<string> {
    try {
        const agentId = doc(collection(db, 'agents')).id;
        const now = Timestamp.now();

        const agent: Agent = {
            id: agentId,
            tenantId: TENANT_ID,
            ...agentData,
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(doc(db, 'agents', agentId), agent);
        return agentId;
    } catch (error) {
        console.error('Error creating agent:', error);
        throw error;
    }
}

/**
 * Get agent by ID
 */
export async function getAgentById(agentId: string): Promise<Agent | null> {
    try {
        const docRef = doc(db, 'agents', agentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return docSnap.data() as Agent;
    } catch (error) {
        console.error('Error fetching agent by ID:', error);
        return null;
    }
}

/**
 * Update agent details
 */
export async function updateAgent(
    agentId: string,
    updates: Partial<Agent>
): Promise<void> {
    try {
        const docRef = doc(db, 'agents', agentId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating agent:', error);
        throw error;
    }
}
