'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllAgents, getAgentById } from '@/lib/firebase/services/agentService';
import type { Agent } from '@/lib/firebase/schema';

export function useAllAgents() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAgents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllAgents();
            setAgents(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch agents');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    return { agents, loading, error, refresh: fetchAgents };
}

export function useAgent(agentId: string | undefined) {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!agentId) {
            setLoading(false);
            return;
        }

        const fetchAgent = async () => {
            try {
                setLoading(true);
                const data = await getAgentById(agentId);
                setAgent(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch agent');
            } finally {
                setLoading(false);
            }
        };

        fetchAgent();
    }, [agentId]);

    return { agent, loading, error };
}

export function useCreateAgent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(async (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>) => {
        try {
            setLoading(true);
            setError(null);
            const { createAgentAction } = await import('@/app/actions/agentActions');
            const result = await createAgentAction(agentData);

            if (!result.success) {
                throw new Error(result.error || 'Failed to create agent');
            }

            return result.agentId || '';
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}

export function useUpdateAgent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (agentId: string, updates: Partial<Agent>) => {
        try {
            setLoading(true);
            setError(null);
            const { updateAgentAction } = await import('@/app/actions/agentActions');
            const result = await updateAgentAction(agentId, updates);

            if (!result.success) {
                throw new Error(result.error || 'Failed to update agent');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update agent';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, loading, error };
}
