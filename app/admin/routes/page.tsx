'use client';

import { useState, useEffect } from 'react';
import { useAllAgents } from '@/hooks/useAgents';
import { getAllTodayRoutes } from '@/lib/firebase/services/routeService';
import type { Route } from '@/lib/firebase/schema';
import {
    Map as MapIcon,
    Navigation,
    CheckCircle2,
    Search,
    Loader2,
    Calendar,
    ArrowRight,
    MapPin,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function RoutesMapPage() {
    const { agents, loading: agentsLoading } = useAllAgents();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await getAllTodayRoutes();
                setRoutes(data);
            } catch (error) {
                console.error('Error fetching today routes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    const getAgentRoute = (agentId: string) => {
        return routes.find(r => r.agentId === agentId);
    };

    const filteredAgents = agents.filter(agent =>
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if ((loading || agentsLoading) && agents.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                                <MapIcon className="w-6 h-6 text-amber-600" />
                                Live Route Monitoring
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">Track sales agent movements and visit status in real-time</p>
                        </div>
                        <div className="flex items-center gap-3 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                            <Button variant="ghost" className="rounded-xl px-4 py-2 text-xs font-bold text-amber-600 bg-white shadow-sm">
                                <Activity className="w-4 h-4 mr-2" />
                                Active Now
                            </Button>
                            <Button variant="ghost" className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                Planner
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Agents</p>
                            <p className="text-xl font-black text-zinc-900 mt-1">{agents.length}</p>
                        </div>
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">On Field</p>
                            <p className="text-xl font-black text-emerald-600 mt-1">{routes.length}</p>
                        </div>
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Visits Done</p>
                            <p className="text-xl font-black text-amber-600 mt-1">
                                {routes.reduce((acc, r) => acc + r.visits.filter(v => v.status === 'completed').length, 0)}
                            </p>
                        </div>
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Efficiency</p>
                            <p className="text-xl font-black text-zinc-900 mt-1">
                                {Math.round((routes.reduce((acc, r) => acc + r.visits.filter(v => v.status === 'completed').length, 0) /
                                    Math.max(1, routes.reduce((acc, r) => acc + r.visits.length, 0))) * 100)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Agents List Side */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                placeholder="Filter agents..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-3">
                            {filteredAgents.map(agent => {
                                const route = getAgentRoute(agent.id);
                                const completed = route?.visits.filter(v => v.status === 'completed').length || 0;
                                const total = route?.visits.length || 0;

                                return (
                                    <div key={agent.id} className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer group",
                                        route ? "bg-white border-zinc-200 shadow-sm hover:shadow-md" : "bg-zinc-50 border-transparent opacity-60"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                                                route ? "bg-amber-100 text-amber-700" : "bg-zinc-200 text-zinc-400"
                                            )}>
                                                {agent.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-zinc-900 truncate">{agent.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        route ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"
                                                    )} />
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                        {route ? "On Route" : "Idle / No Route"}
                                                    </span>
                                                </div>
                                            </div>
                                            {route && (
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-zinc-900">{completed}/{total}</p>
                                                    <p className="text-[10px] font-bold text-zinc-400">Visits</p>
                                                </div>
                                            )}
                                        </div>
                                        {route && (
                                            <div className="mt-4">
                                                <div className="w-full bg-zinc-100 rounded-full h-1">
                                                    <div
                                                        className="bg-amber-500 h-1 rounded-full transition-all duration-700"
                                                        style={{ width: `${(completed / total) * 100}%` }}
                                                    />
                                                </div>
                                                <button className="w-full mt-3 flex items-center justify-center gap-2 text-[10px] font-bold text-amber-600 py-1 rounded-lg hover:bg-amber-50 transition-colors">
                                                    TRACK LIVE <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Map / Visualization Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 h-[600px] relative overflow-hidden shadow-2xl group">
                            {/* Map Placeholder Graphic */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                                    backgroundSize: '40px 40px'
                                }}></div>
                                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-white/10"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full border border-white/10"></div>
                            </div>

                            {/* Center Marker Simulation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-amber-500/10 rounded-full animate-ping absolute -inset-10 opacity-20"></div>
                                    <div className="w-20 h-20 bg-amber-500/20 rounded-full animate-pulse absolute -inset-4 opacity-40"></div>
                                    <div className="relative z-10 p-6 bg-zinc-800 border border-white/10 rounded-3xl backdrop-blur-xl flex flex-col items-center">
                                        <MapPin className="w-8 h-8 text-amber-500 mb-2" />
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Head Office</p>
                                    </div>
                                </div>
                            </div>

                            {/* Agent Markers Simulation */}
                            {routes.map((r, i) => (
                                <div key={r.id} className="absolute transition-all duration-1000" style={{
                                    top: `${20 + (i * 15)}%`,
                                    left: `${30 + (i * 20)}%`
                                }}>
                                    <div className="relative group/marker">
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-xl border border-white/20 whitespace-nowrap scale-0 group-hover/marker:scale-100 transition-all origin-bottom">
                                            <p className="text-[10px] font-black text-zinc-900 leading-none">Agent Active</p>
                                            <p className="text-[9px] text-zinc-500 mt-0.5">Last seen: Just now</p>
                                        </div>
                                        <div className="w-4 h-4 bg-amber-500 rounded-full ring-4 ring-amber-500/30 ring-offset-2 ring-offset-zinc-900 animate-bounce"></div>
                                    </div>
                                </div>
                            ))}

                            {/* UI Overlays */}
                            <div className="absolute top-8 left-8 p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Live View Enabled</p>
                                </div>
                            </div>

                            <div className="absolute bottom-8 right-8 flex gap-3">
                                <button className="p-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
                                    <Navigation className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-zinc-800 border border-white/10 rounded-2xl text-white hover:bg-zinc-700 transition-all shadow-xl">
                                    Center Map
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity Mini-Feed */}
                        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                            <h3 className="font-bold text-zinc-900 mb-6 flex items-center justify-between">
                                Recent Check-ins
                                <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black">LATEST</span>
                            </h3>
                            <div className="space-y-4">
                                {routes.flatMap(r => r.visits.filter(v => v.status === 'completed').slice(-1)).map((visit, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-3 hover:bg-zinc-50 rounded-2xl transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-zinc-900">{visit.companyName}</p>
                                            <p className="text-xs text-zinc-500">
                                                Visited by <span className="text-zinc-900 font-bold">
                                                    {agents.find(a => a.id === routes.find(r => r.visits.some(v => v.companyId === visit.companyId))?.agentId)?.name || 'Unknown Agent'}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-zinc-900">
                                                {visit.checkOut?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
