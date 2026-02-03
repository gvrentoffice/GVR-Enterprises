'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import { Activity, Clock, Package, UserPlus } from 'lucide-react';

interface TimelineEvent {
    id: string;
    type: 'CHECK_IN' | 'CHECK_OUT' | 'ORDER_CREATED' | 'CUSTOMER_ONBOARDED' | 'PAYMENT_COLLECTED';
    description: string;
    timestamp: any; // Firestore timestamp
    metadata?: any;
}

interface AgentTimelineProps {
    agentId: string;
}

export function AgentTimeline({ agentId }: AgentTimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startOfDay = Timestamp.fromDate(today);

                const q = query(
                    collection(db, 'agent_logs'),
                    where('agentId', '==', agentId),
                    where('timestamp', '>=', startOfDay),
                    orderBy('timestamp', 'desc')
                );

                const snapshot = await getDocs(q);
                const fetchedEvents = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as TimelineEvent));

                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching timeline:", error);
            } finally {
                setLoading(false);
            }
        };

        if (agentId) {
            fetchEvents();
        }
    }, [agentId]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'CHECK_IN': return <Clock className="w-4 h-4 text-green-500" />;
            case 'CHECK_OUT': return <Clock className="w-4 h-4 text-gray-500" />;
            case 'ORDER_CREATED': return <Package className="w-4 h-4 text-blue-500" />;
            case 'CUSTOMER_ONBOARDED': return <UserPlus className="w-4 h-4 text-purple-500" />;
            default: return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    if (loading) return <div className="text-center p-4 text-sm text-gray-500">Loading timeline...</div>;

    if (events.length === 0) {
        return <div className="text-center p-4 text-sm text-gray-500">No activity recorded today.</div>;
    }

    return (
        <div className="h-[300px] w-full pr-4 overflow-y-auto">
            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event.id} className="relative pl-6 pb-4 border-l border-gray-200 last:pb-0">
                        {/* Dot */}
                        <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary" />

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                {getIcon(event.type)}
                                <span>{event.description}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                                {event.timestamp?.toDate ? format(event.timestamp.toDate(), 'h:mm a') : '--'}
                            </span>
                            {event.metadata && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">
                                    {event.type === 'ORDER_CREATED' && (
                                        <>
                                            Amount: ₹{event.metadata.total?.toLocaleString() ?? 0}
                                        </>
                                    )}
                                    {event.type === 'CHECK_IN' && event.metadata.location && (
                                        <a
                                            href={`https://www.google.com/maps?q=${event.metadata.location.latitude},${event.metadata.location.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View Location
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
