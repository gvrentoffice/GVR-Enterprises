'use client';

import { useAgent } from '@/hooks/useAgent';
import { useTodayRoute } from '@/hooks/useRoutes';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkInVisit } from '@/lib/firebase/services/routeService';

export default function RoutesPage() {
    const { agent } = useAgent();
    const { route, loading, refresh } = useTodayRoute(agent?.id);
    const { toast } = useToast();

    const handleVisitCheckIn = async (companyId: string) => {
        if (!route) return;
        try {
            const success = await checkInVisit(route.id, companyId);
            if (success) {
                toast({ title: 'Checked In', description: 'Visit marked as completed.' });
                refresh();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to mark visit.', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Route Planner</h1>
                    <p className="text-gray-500 mt-1">
                        {route ? `Route for ${new Date(route.date.seconds * 1000).toLocaleDateString()}` : 'No active route'}
                    </p>
                </div>
                <Button>
                    <Navigation className="w-4 h-4 mr-2" />
                    Optimize Route
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Scheduled Visits</h2>
                    {!route || route.visits.length === 0 ? (
                        <p className="text-gray-500">No visits scheduled.</p>
                    ) : (
                        <div className="space-y-4">
                            {route.visits.map((visit, index) => (
                                <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                                        <div className="h-full w-0.5 bg-gray-200"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900">{visit.companyName}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${visit.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {visit.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            <MapPin className="w-3 h-3 inline mr-1" />
                                            {visit.status === 'completed' ? 'Visit Completed' : 'Pending Visit'}
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <Button size="sm" variant="outline">Navigation</Button>
                                            <Button
                                                size="sm"
                                                disabled={visit.status === 'completed'}
                                                onClick={() => handleVisitCheckIn(visit.companyId)}
                                            >
                                                {visit.status === 'completed' ? 'Visited' : 'Check In'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 bg-gray-50 flex items-center justify-center min-h-[400px]">
                    <div className="text-center text-gray-400">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Map View Placeholder</p>
                        <p className="text-xs">Google Maps integration coming in future update</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
