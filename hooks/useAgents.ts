'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllAgents, createAgent, getAgentById } from '@/lib/firebase/services/agentService';
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
            const agentId = await createAgent(agentData);
            return agentId;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create agent');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}
