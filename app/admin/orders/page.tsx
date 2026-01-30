'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Search, Loader2, XCircle, Package, Clock, CheckCircle } from 'lucide-react';
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useAllAgents } from '@/hooks/useAgents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/lib/firebase/schema';

// Status Color Mapping
const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    processing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    draft: 'bg-zinc-100 text-zinc-700 border-zinc-200'
};

export default function AdminOrdersPage() {
    const { orders, loading: ordersLoading, error } = useAllOrders();
    const { agents, loading: agentsLoading } = useAllAgents();
    const { update: updateStatus } = useUpdateOrderStatus();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [agentFilter, setAgentFilter] = useState<string>('all');

    console.log('[AdminOrdersPage] Agents:', agents.map(a => `${a.name}(${a.id})`));

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            (order.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.shippingAddress?.street?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.shippingAddress?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || order.status === statusFilter;

        const matchesAgent =
            agentFilter === 'all' || order.agentId === agentFilter;

        return matchesSearch && matchesStatus && matchesAgent;
    });

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updateStatus(orderId, newStatus);
        window.location.reload();
    };

    if (ordersLoading || agentsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center max-w-md mx-auto mt-20">
                <XCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold">Error Loading Orders</h2>
                <p className="text-zinc-500 text-sm mt-2">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Retry Connection
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Simple Header */}
            <div className="border-b border-zinc-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Order Management</h1>
                            <p className="text-sm text-zinc-500 mt-1">Manage all sales records and delivery statuses</p>
                        </div>
                        <Button variant="outline" className="text-sm font-bold">
                            Export CSV
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Status Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-8">
                    {[
                        { label: 'All Orders', status: 'all', color: 'zinc', icon: Package },
                        { label: 'Pending', status: 'pending', color: 'amber', icon: Clock },
                        { label: 'Confirmed', status: 'confirmed', color: 'blue', icon: Package },
                        { label: 'Processing', status: 'processing', color: 'indigo', icon: Loader2 },
                        { label: 'Shipped', status: 'shipped', color: 'purple', icon: Package },
                        { label: 'Delivered', status: 'delivered', color: 'emerald', icon: CheckCircle },
                        { label: 'Cancelled', status: 'cancelled', color: 'red', icon: XCircle },
                    ].map((item) => {
                        const count = item.status === 'all'
                            ? orders.length
                            : orders.filter(o => o.status === item.status).length;
                        const isActive = statusFilter === item.status;

                        return (
                            <button
                                key={item.status}
                                onClick={() => setStatusFilter(item.status)}
                                className={`flex flex-col p-3 md:p-4 rounded-2xl border transition-all text-left relative overflow-hidden group ${isActive
                                    ? `bg-${item.color === 'zinc' ? 'zinc' : item.color}-50 border-${item.color === 'zinc' ? 'zinc' : item.color}-200 ring-2 ring-${item.color === 'zinc' ? 'zinc' : item.color}-500/10`
                                    : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm'
                                    }`}
                            >
                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center mb-2 md:mb-3 ${isActive
                                    ? item.color === 'zinc' ? 'bg-zinc-900 text-white' : `bg-${item.color}-500 text-white`
                                    : item.color === 'zinc' ? 'bg-zinc-100 text-zinc-600' : `bg-${item.color}-50 text-${item.color}-600`
                                    }`}>
                                    <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">
                                    {item.label}
                                </p>
                                <p className={`text-lg md:text-xl font-black ${isActive
                                    ? item.color === 'zinc' ? 'text-zinc-900' : `text-${item.color}-700`
                                    : 'text-zinc-900'
                                    }`}>
                                    {count}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Filters Section */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Search Order ID, Client or Address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-50 border-zinc-200 rounded-xl py-5 pl-10 h-11 w-full"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[160px] rounded-xl bg-white border-zinc-200 h-11">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-200 shadow-xl bg-white">
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Object.keys(statusColors).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${statusColors[status as OrderStatus].split(' ')[0]}`} />
                                            <span className="capitalize">{status}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={agentFilter} onValueChange={setAgentFilter}>
                            <SelectTrigger className="w-full sm:w-[160px] rounded-xl bg-white border-zinc-200 h-11">
                                <SelectValue placeholder="All Agents" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-200 shadow-xl bg-white">
                                <SelectItem value="all">All Agents</SelectItem>
                                {agents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                        <div className="flex flex-col py-1">
                                            <span className="font-bold text-zinc-900">{agent.name || 'Unnamed Agent'}</span>
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-tight">{agent.employeeId || 'No ID'}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Mobile Order Cards (Hidden on Desktop) */}
                <div className="lg:hidden space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-zinc-200 p-12 text-center">
                            <Package className="w-10 h-10 text-zinc-100 mx-auto mb-2" />
                            <p className="text-zinc-400 text-sm font-medium">No results found</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900">
                                            {order.orderNumber || `ORD-${order.id.slice(0, 8)}`}
                                        </p>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">
                                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <Badge className={`border text-[9px] font-bold uppercase py-0.5 px-2 rounded-lg ${statusColors[order.status] || statusColors.pending}`}>
                                        {order.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center bg-zinc-50 rounded-xl p-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-zinc-400">Customer</span>
                                            <span className="text-sm font-medium text-zinc-900 leading-tight">
                                                {(order as any).customer?.companyName || order.shippingAddress?.name || 'Client'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] uppercase font-bold text-zinc-400">Revenue</span>
                                            <span className="text-sm font-bold text-zinc-900 leading-tight">₹{order.total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                                            {order.agentName?.charAt(0) || 'D'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-zinc-900">{order.agentName || 'Direct'}</span>
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">
                                                {order.agentId ? agents.find(a => a.id === order.agentId)?.employeeId || '' : 'HQ DIRECT'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-zinc-50">
                                    <Link href={`/agent/orders/${order.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full text-xs font-bold h-10 rounded-xl">
                                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                                        </Button>
                                    </Link>
                                    <Select
                                        defaultValue={order.status}
                                        onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                                    >
                                        <SelectTrigger className="flex-1 h-10 text-xs font-bold uppercase rounded-xl border-zinc-200">
                                            <SelectValue placeholder="Update" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-zinc-200 shadow-xl bg-white">
                                            {Object.keys(statusColors).map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${statusColors[status as OrderStatus].split(' ')[0]}`} />
                                                        <span className="capitalize">{status}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table Container (Hidden on Mobile) */}
                <div className="hidden lg:block border border-zinc-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Order Details</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Customer</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Revenue</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Status</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Agent</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-24 text-center">
                                            <Package className="w-12 h-12 text-zinc-100 mx-auto mb-3" />
                                            <p className="text-zinc-400 text-base font-medium">No results found</p>
                                            <p className="text-zinc-300 text-xs mt-1">Try adjusting your filters or search terms</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-zinc-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-zinc-900 tracking-tight">
                                                    {order.orderNumber || `ORD-${order.id.slice(0, 8)}`}
                                                </p>
                                                <p className="text-[11px] text-zinc-400 font-medium mt-1">
                                                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-semibold text-zinc-900">
                                                    {(order as any).customer?.companyName || order.shippingAddress?.name || 'Client'}
                                                </p>
                                                <p className="text-[11px] text-zinc-400 mt-1 font-medium italic truncate max-w-[150px]">
                                                    {order.shippingAddress?.city || 'Direct Entry'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-zinc-900">₹{order.total.toLocaleString()}</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1 tracking-tighter">{order.paymentStatus || 'pending'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge className={`border text-[10px] font-black uppercase py-1 px-3 rounded-xl shadow-sm ${statusColors[order.status] || statusColors.pending}`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-2xl bg-zinc-100 flex items-center justify-center text-[11px] font-black text-zinc-400 border border-zinc-200/50">
                                                        {order.agentName?.charAt(0) || 'D'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-zinc-900 truncate max-w-[120px]">
                                                            {order.agentName || 'HQ Direct'}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                            {order.agentId ? agents.find(a => a.id === order.agentId)?.employeeId || '' : 'SUPER ADMIN'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link href={`/agent/orders/${order.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-100 rounded-2xl transition-all active:scale-90">
                                                            <Eye className="w-4 h-4 text-zinc-400" />
                                                        </Button>
                                                    </Link>
                                                    <Select
                                                        defaultValue={order.status}
                                                        onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                                                    >
                                                        <SelectTrigger className="w-[140px] h-10 text-[10px] font-black uppercase rounded-2xl border-zinc-200 bg-white">
                                                            <SelectValue placeholder="Update Status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-zinc-200 shadow-2xl bg-white p-1">
                                                            {Object.keys(statusColors).map((status) => (
                                                                <SelectItem key={status} value={status} className="rounded-xl">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${statusColors[status as OrderStatus].split(' ')[0]}`} />
                                                                        <span className="capitalize text-xs font-bold">{status}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
