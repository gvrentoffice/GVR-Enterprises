'use client';

import { useState } from 'react';
import { useAllAgents, useCreateAgent } from '@/hooks/useAgents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Users,
    Plus,
    Search,
    MapPin,
    Phone,
    Target,
    TrendingUp,
    Loader2,
    ArrowRight,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AgentsPage() {
    const { agents, loading, refresh } = useAllAgents();
    const { create, loading: creating } = useCreateAgent();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        whatsappNumber: '',
        employeeId: '',
        userId: '',
        targetSales: 0,
        territory: ''
    });

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await create({
                name: formData.name,
                whatsappNumber: formData.whatsappNumber,
                employeeId: formData.employeeId,
                userId: formData.userId || formData.employeeId, // Fallback if no userId
                status: 'active',
                targetSales: Number(formData.targetSales),
                territory: formData.territory.split(',').map(t => t.trim()),
                performance: {
                    currentSales: 0,
                    monthlySales: 0,
                    tasksCompleted: 0,
                    leadsGenerated: 0
                }
            });
            toast({ title: 'Success', description: 'Agent created successfully' });
            setIsCreateModalOpen(false);
            setFormData({ name: '', whatsappNumber: '', employeeId: '', userId: '', targetSales: 0, territory: '' });
            refresh();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create agent', variant: 'destructive' });
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && agents.length === 0) {
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
                                <Users className="w-6 h-6 text-amber-600" />
                                Agent Management
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">Monitor and manage your sales team performance</p>
                        </div>

                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 transition-all active:scale-95">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Agent
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <form onSubmit={handleCreateAgent}>
                                    <DialogHeader>
                                        <DialogTitle>Add New Sales Agent</DialogTitle>
                                        <DialogDescription>
                                            Create a new agent profile to start tracking their performance.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 uppercase">Agent Name</label>
                                                <Input
                                                    placeholder="Full Name"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 uppercase">Employee ID</label>
                                                <Input
                                                    placeholder="EMP001"
                                                    value={formData.employeeId}
                                                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">WhatsApp Number</label>
                                            <Input
                                                placeholder="+91..."
                                                value={formData.whatsappNumber}
                                                onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 uppercase">Target Sales (₹)</label>
                                                <Input
                                                    type="number"
                                                    placeholder="500000"
                                                    value={formData.targetSales}
                                                    onChange={e => setFormData({ ...formData, targetSales: Number(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 uppercase">Territories (CSV)</label>
                                                <Input
                                                    placeholder="Mumbai, Pune"
                                                    value={formData.territory}
                                                    onChange={e => setFormData({ ...formData, territory: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={creating}>
                                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Create Agent Account
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                className="pl-10 bg-zinc-100/50 border-zinc-200 focus:bg-white transition-all"
                                placeholder="Search agents by name or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredAgents.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-20 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">No agents found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mt-1">
                            Try adjusting your search or add a new agent to your sales team.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map(agent => (
                            <Link key={agent.id} href={`/admin/agents/${agent.id}`}>
                                <div className="group bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 font-bold text-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            {agent.name?.charAt(0) || <User className="w-6 h-6" />}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${agent.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-zinc-100 text-zinc-600'
                                                }`}>
                                                {agent.status}
                                            </span>
                                            <p className="text-[10px] text-zinc-400 font-mono mt-1">{agent.employeeId}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                                                {agent.name || 'Unnamed Agent'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {agent.territory.slice(0, 2).join(', ')}
                                                {agent.territory.length > 2 && ` +${agent.territory.length - 2}`}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                                                    <Target className="w-3 h-3" /> Target
                                                </p>
                                                <p className="font-bold text-zinc-900">₹{agent.targetSales.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> Current
                                                </p>
                                                <p className="font-bold text-amber-600">
                                                    ₹{agent.performance?.currentSales?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2">
                                            <div
                                                className="bg-amber-500 h-1.5 rounded-full"
                                                style={{ width: `${Math.min(((agent.performance?.currentSales || 0) / (agent.targetSales || 1)) * 100, 100)}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-1 text-zinc-400">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-xs">{agent.whatsappNumber}</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
