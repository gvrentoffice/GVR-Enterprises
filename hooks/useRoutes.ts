'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTodayRoute, getAgentRoutes } from '@/lib/firebase/services/routeService';
import { createRouteAction, updateRouteStatusAction, updateVisitStatusAction } from '@/app/actions/routeActions';
import type { Route, Visit } from '@/lib/firebase/schema';

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

/**
 * Hook for agents to create routes
 * Uses server action to bypass Firestore security rules
 */
export function useCreateRoute() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(async (routeData: {
        agentId: string;
        date: Date;
        visits: Visit[];
    }) => {
        try {
            setLoading(true);
            setError(null);
            const result = await createRouteAction(routeData);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create route');
            }
            return result.routeId;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create route';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}

/**
 * Hook for agents to update route status
 */
export function useUpdateRouteStatus() {
    const [loading, setLoading] = useState(false);

    const update = useCallback(async (routeId: string, status: Route['status']) => {
        try {
            setLoading(true);
            const result = await updateRouteStatusAction(routeId, status);
            return result.success;
        } catch (err) {
            console.error('Error updating route status:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, loading };
}

/**
 * Hook for agents to update visit status in a route
 */
export function useUpdateVisitStatus() {
    const [loading, setLoading] = useState(false);

    const update = useCallback(async (routeId: string, companyId: string, visitData: Partial<Visit>) => {
        try {
            setLoading(true);
            const result = await updateVisitStatusAction(routeId, companyId, visitData);
            return result.success;
        } catch (err) {
            console.error('Error updating visit status:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, loading };
}
