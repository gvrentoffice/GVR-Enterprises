'use client';

import { useEffect, useState } from 'react';
import { getAgentCustomers, getAllCustomers, getApprovedCustomers, getPendingCustomers } from '@/lib/firebase/services/customerService';
import type { Lead } from '@/lib/firebase/schema';

export function useAgentCustomers(agentId: string | undefined) {
    const [customers, setCustomers] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agentId) {
            setLoading(false);
            return;
        }

        const fetchCustomers = async () => {
            try {
                const data = await getAgentCustomers(agentId);
                setCustomers(data);
            } catch (err) {
                console.error('Error fetching customers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [agentId]);

    return { customers, loading };
}

export function useAllCustomers() {
    const [customers, setCustomers] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getAllCustomers();
                setCustomers(data);
            } catch (err) {
                console.error('Error fetching customers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    return { customers, loading };
}

export function useApprovedCustomers() {
    const [customers, setCustomers] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getApprovedCustomers();
                setCustomers(data);
            } catch (err) {
                console.error('Error fetching approved customers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    return { customers, loading };
}

export function usePendingCustomers() {
    const [customers, setCustomers] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getPendingCustomers();
                setCustomers(data);
            } catch (err) {
                console.error('Error fetching pending customers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    return { customers, loading };
}

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useApprovedCustomers instead
 */
export function useActiveCustomers() {
    return useApprovedCustomers();
}
