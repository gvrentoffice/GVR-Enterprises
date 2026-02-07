'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from '@/app/AuthContext';
import { getAgentByUserId } from '@/lib/firebase/services/agentService';
import { agentCheckInAction, agentCheckOutAction } from '@/app/actions/routeActions';
import type { Agent } from '@/lib/firebase/schema';

export function useAgent() {
    const { user } = useAuthContext();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                setLoading(true);

                // 1. Try Firebase Auth User
                if (user) {
                    const agentData = await getAgentByUserId(user.uid);
                    if (agentData) {
                        setAgent(agentData);
                        setError(null);
                        setLoading(false);
                        return;
                    }
                }

                // 2. Fallback to Prototype WhatsApp Session
                const sessionStr = localStorage.getItem('agent_whatsapp_session');
                if (sessionStr) {
                    const sessionData = JSON.parse(sessionStr);
                    setAgent(sessionData);
                    setError(null);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch agent';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchAgent();
    }, [user]);

    const performCheckIn = useCallback(async (location: { latitude: number; longitude: number }) => {
        if (!agent) return false;
        // Use server action instead of client-side Firebase
        const result = await agentCheckInAction(agent.id, location);
        if (result.success) {
            setAgent(prev => prev ? { ...prev, status: 'active', attendance: { ...prev.attendance, checkIn: new Date() as any } } : null);
        }
        return result.success;
    }, [agent]);

    const performCheckOut = useCallback(async () => {
        if (!agent) return false;
        // Use server action instead of client-side Firebase
        const result = await agentCheckOutAction(agent.id);
        if (result.success) {
            setAgent(prev => prev ? { ...prev, status: 'inactive', attendance: { ...prev.attendance, checkOut: new Date() as any } } : null);
        }
        return result.success;
    }, [agent]);

    return { agent, loading, error, checkIn: performCheckIn, checkOut: performCheckOut };
}
