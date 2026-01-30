'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTodayRoute, getAgentRoutes } from '@/lib/firebase/services/routeService';
import type { Route } from '@/lib/firebase/schema';

export function useTodayRoute(agentId: string | undefined) {
    const [route, setRoute] = useState<Route | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!agentId) return;
        try {
            const data = await getTodayRoute(agentId);
            setRoute(data);
        } catch (err) {
            console.error('Error fetching route:', err);
        }
    }, [agentId]);

    useEffect(() => {
        if (!agentId) {
            setLoading(false);
            return;
        }
        refresh().finally(() => setLoading(false));
    }, [agentId, refresh]);

    return { route, loading, refresh };
}

export function useAgentRoutes(
    agentId: string | undefined,
    startDate: Date,
    endDate: Date
) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agentId) {
            setLoading(false);
            return;
        }

        const fetchRoutes = async () => {
            try {
                const data = await getAgentRoutes(agentId, startDate, endDate);
                setRoutes(data);
            } catch (err) {
                console.error('Error fetching routes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, [agentId, startDate, endDate]);

    return { routes, loading };
}
