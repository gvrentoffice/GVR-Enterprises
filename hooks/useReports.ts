'use client';

import { useCallback } from 'react';
import { generateOrdersCSV, generateAgentsCSV, downloadCSV } from '@/lib/firebase/services/reportService';
import type { Order, Agent } from '@/lib/firebase/schema';

export function useReports() {
    const downloadOrdersReport = useCallback((orders: Order[]) => {
        const csv = generateOrdersCSV(orders);
        const filename = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(csv, filename);
    }, []);

    const downloadAgentsReport = useCallback((agents: Agent[]) => {
        const csv = generateAgentsCSV(agents);
        const filename = `agents-${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(csv, filename);
    }, []);

    return {
        downloadOrdersReport,
        downloadAgentsReport,
    };
}
