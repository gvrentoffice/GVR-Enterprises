'use client';

import { useState } from 'react';
import { useAllAgents } from '@/hooks/useAgents';
import { MapPin, Clock, Circle, User, History } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AgentTimeline } from './AgentTimeline';


// Helper to safely format timestamp or date string
const formatTime = (time: any) => {
    if (!time) return '--:--';

    try {
        // Handle Firestore Timestamp (has toDate method)
        if (time && typeof time.toDate === 'function') {
            return format(time.toDate(), 'h:mm a');
        }

        // Handle ISO string or Date object
        const date = new Date(time);
        if (!isNaN(date.getTime())) {
            return format(date, 'h:mm a');
        }

        return '--:--';
    } catch (e) {
        console.error('Error formatting time:', e);
        return '--:--';
    }
};

export default function LiveActiveAgents() {
    const { agents, loading } = useAllAgents();
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);

    // Sort agents: Active first, then by name
    const sortedAgents = [...agents].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return (a.name || '').localeCompare(b.name || '');
    });

    const activeCount = agents.filter(a => a.status === 'active').length;

    if (loading) {
        return (
            <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-xl p-6 h-full flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h3 className="font-black text-zinc-900 text-lg flex items-center gap-2">
                        <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
                        Live Agent Status
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        {activeCount} active • {agents.length - activeCount} offline
                    </p>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {sortedAgents.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        No agents found.
                    </div>
                ) : (
                    sortedAgents.map((agent) => {
                        const isActive = agent.status === 'active';
                        return (
                            <div
                                key={agent.id}
                                className={`rounded-2xl p-4 border transition-all group ${isActive
                                    ? 'bg-white/60 border-amber-100 hover:border-amber-300 shadow-sm'
                                    : 'bg-zinc-50/50 border-zinc-100 opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isActive
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-zinc-200 text-zinc-500'
                                            }`}>
                                            {agent.name?.charAt(0) || <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900">{agent.name}</h4>
                                            <p className="text-xs text-zinc-500 font-mono">{agent.employeeId}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-zinc-100 text-zinc-500'
                                        }`}>
                                        {isActive ? 'Active' : 'Offline'}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-xs text-zinc-600 bg-white/50 px-3 py-1.5 rounded-lg border border-transparent group-hover:border-zinc-200 transition-colors">
                                        <Clock className={`w-3 h-3 ${isActive ? 'text-amber-500' : 'text-zinc-400'}`} />
                                        <span>
                                            {isActive ? `In: ${formatTime(agent.attendance?.checkIn)}` : 'Not Checked In'}
                                        </span>
                                    </div>

                                    {isActive && agent.attendance?.checkInLocation && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[10px] gap-1 px-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                            onClick={() => window.open(
                                                `https://www.google.com/maps?q=${agent.attendance?.checkInLocation?.latitude},${agent.attendance?.checkInLocation?.longitude}`,
                                                '_blank'
                                            )}
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Map
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-[10px] gap-1 px-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                                        onClick={() => {
                                            setSelectedAgentId(agent.id);
                                            setIsTimelineOpen(true);
                                        }}
                                    >
                                        <History className="w-3 h-3" />
                                        Timeline
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>


            <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Agent Daily Timeline</DialogTitle>
                    </DialogHeader>
                    {selectedAgentId && <AgentTimeline agentId={selectedAgentId} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
