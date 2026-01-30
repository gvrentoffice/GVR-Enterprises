'use client';

import { useEffect, useState } from 'react';
import { getAgentCustomers, getActiveCustomers } from '@/lib/firebase/services/customerService';
import type { Company } from '@/lib/firebase/schema';

export function useAgentCustomers(agentId: string | undefined) {
    const [customers, setCustomers] = useState<Company[]>([]);
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

export function useActiveCustomers() {
    const [customers, setCustomers] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getActiveCustomers();
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
