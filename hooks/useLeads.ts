'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    getLeadsByStatus,
    createLead,
    getLeadById,
    subscribeToAgentLeads,
} from '@/lib/firebase/services/leadService';
import type { Lead } from '@/lib/firebase/schema';

export function useLead(leadId: string | undefined) {
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!leadId) {
            setLoading(false);
            return;
        }

        const fetchLead = async () => {
            try {
                setLoading(true);
                const data = await getLeadById(leadId);
                setLead(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch lead');
            } finally {
                setLoading(false);
            }
        };

        fetchLead();
    }, [leadId]);

    return { lead, loading, error };
}

export function useAgentLeads(agentId: string | undefined) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agentId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToAgentLeads(agentId, (updatedLeads) => {
            setLeads(updatedLeads);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [agentId]);

    return { leads, loading };
}

export function useLeadsByStatus(
    agentId: string | undefined,
    status: Lead['status']
) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agentId) {
            setLoading(false);
            return;
        }

        const fetchLeads = async () => {
            try {
                const data = await getLeadsByStatus(agentId, status);
                setLeads(data);
            } catch (err) {
                console.error('Error fetching leads:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [agentId, status]);

    return { leads, loading };
}

export function useCreateLead() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(
        async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
            try {
                setLoading(true);
                setError(null);
                const leadId = await createLead(leadData);
                return leadId;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to create lead';
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { create, loading, error };
}
