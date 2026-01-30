'use client';

import { use } from 'react';
import { useAgent } from '@/hooks/useAgents';
import { useAgentOrders } from '@/hooks/useOrders';
import {
    Phone,
    MapPin,
    Calendar,
    TrendingUp,
    CheckCircle2,
    Users,
    ArrowLeft,
    Package,
    Loader2,
    XCircle,
    Activity,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// KPI Component - Simplified
const KPIStats = ({ value, max, label, icon: Icon, unit = '', color = 'text-zinc-900' }: any) => {
    const percentage = Math.min((value / (max || 1)) * 100, 100);
    return (
        <Card className="shadow-none border-zinc-200">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-zinc-50 ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-400">{Math.round(percentage)}%</span>
                </div>
                <p className="text-sm font-medium text-zinc-500">{label}</p>
                <h4 className="text-xl font-bold mt-1">
                    {unit}{value.toLocaleString()}
                </h4>
            </CardContent>
        </Card>
    );
};

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const { agent, loading: agentLoading } = useAgent(id);
    const { orders, loading: ordersLoading } = useAgentOrders(id);

    if (agentLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="p-8 text-center max-w-md mx-auto mt-20">
                <XCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold">Agent Not Found</h2>
                <Link href="/admin/agents">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Simple Header */}
            <div className="border-b border-zinc-100">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-900 text-2xl font-bold">
                                {agent.name?.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900">{agent.name}</h1>
                                <div className="flex items-center gap-3 mt-1 text-zinc-500">
                                    <span className="text-sm font-medium">{agent.employeeId}</span>
                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">{agent.status}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/agents" className="flex">
                                <Button variant="outline" className="text-sm font-bold">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> All Agents
                                </Button>
                            </Link>
                            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-6">Edit Profile</Button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Simplified Sidebar */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Contact & Territory</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-zinc-600">
                                    <Phone className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-medium">{agent.whatsappNumber}</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-600">
                                    <MapPin className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-medium">{agent.territory.join(', ')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-600">
                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-medium">Joined {new Date(agent.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-zinc-100">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Availability</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm py-2">
                                    <span className="text-zinc-500">Check In</span>
                                    <span className="font-bold text-zinc-900">{agent.attendance?.checkIn ? new Date(agent.attendance.checkIn.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-2">
                                    <span className="text-zinc-500">Check Out</span>
                                    <span className="font-bold text-zinc-900">{agent.attendance?.checkOut ? new Date(agent.attendance.checkOut.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KPIStats
                                label="Total Sales"
                                value={agent.performance?.currentSales || 0}
                                max={agent.targetSales}
                                icon={TrendingUp}
                                unit="₹"
                                color="text-amber-600"
                            />
                            <KPIStats
                                label="Tasks Done"
                                value={agent.performance?.tasksCompleted || 0}
                                max={20}
                                icon={CheckCircle2}
                                color="text-blue-600"
                            />
                            <KPIStats
                                label="Leads"
                                value={agent.performance?.leadsGenerated || 0}
                                max={10}
                                icon={Users}
                                color="text-purple-600"
                            />
                        </div>

                        {/* Activity Tabs */}
                        <Tabs defaultValue="orders" className="w-full">
                            <TabsList className="bg-transparent border-b border-zinc-100 w-full justify-start rounded-none h-auto p-0 mb-6">
                                <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-6 py-3 font-bold text-sm">Orders</TabsTrigger>
                                <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-6 py-3 font-bold text-sm">Activity</TabsTrigger>
                            </TabsList>

                            <TabsContent value="orders" className="m-0">
                                {ordersLoading ? (
                                    <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-zinc-100 rounded-2xl">
                                        <Package className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                                        <p className="text-zinc-400 text-sm">No orders yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="p-4 border border-zinc-100 rounded-xl flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 font-bold text-xs">
                                                        #{order.orderNumber?.slice(-3) || order.id.slice(-3)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900">{(order as any).customer?.companyName || order.shippingAddress?.name || 'Unknown Client'}</p>
                                                        <p className="text-[10px] text-zinc-400 mt-0.5 uppercase font-bold tracking-wider">
                                                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'} • {order.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-zinc-900">₹{order.total.toLocaleString()}</p>
                                                    <Link href="/admin/orders" className="text-[10px] text-zinc-400 hover:text-zinc-600 underline font-bold uppercase mt-1 block">Details</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="activity">
                                <div className="p-12 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                                    <Activity className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                                    <p className="text-zinc-400 text-sm">Activity feed coming soon</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
