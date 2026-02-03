'use server';

import { getAgentByWhatsApp } from '@/lib/firebase/services/agentService';
// import type { Agent } from '@/lib/firebase/schema';

export async function verifyAgentAction(
    phoneNumber: string
): Promise<{ success: boolean; agentId?: string; agent?: any; error?: string }> {
    try {
        console.log('🔍 Verifying agent with phone:', phoneNumber);

        // Get agent by WhatsApp number
        const agent = await getAgentByWhatsApp(phoneNumber);

        if (!agent) {
            console.log('❌ No agent found with phone:', phoneNumber);
            return { success: false, error: 'Agent not found with this phone number' };
        }

        console.log('✅ Agent found:', { id: agent.id, name: agent.name, phone: agent.whatsappNumber });

        // Convert Firestore Timestamps to plain objects for client components
        const serializedAgent = {
            ...agent,
            createdAt: agent.createdAt?.toDate?.()?.toISOString() || agent.createdAt,
            updatedAt: agent.updatedAt?.toDate?.()?.toISOString() || agent.updatedAt,
            attendance: agent.attendance ? {
                checkIn: agent.attendance.checkIn?.toDate?.()?.toISOString() || agent.attendance.checkIn,
                checkOut: agent.attendance.checkOut?.toDate?.()?.toISOString() || agent.attendance.checkOut,
                checkInLocation: agent.attendance.checkInLocation,
            } : undefined,
        };

        // Return success with serialized agent data
        return {
            success: true,
            agentId: agent.id,
            agent: serializedAgent
        };
    } catch (error) {
        console.error('Agent verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}
