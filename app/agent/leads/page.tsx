'use client';

import { useState } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { useAgentLeads, useCreateLead } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, Phone, Building } from 'lucide-react';

export default function LeadsPage() {
    const { agent } = useAgent();
    const { leads } = useAgentLeads(agent?.id);
    const { create: createLead } = useCreateLead();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        phone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agent) return;

        try {
            await createLead({
                agentId: agent.id,
                agentName: agent.name,
                shopName: formData.companyName,
                ownerName: formData.contactPerson,
                whatsappNumber: formData.phone,
                status: 'pending',
                priceAccessApproved: false,
                primaryAddress: {
                    street: '',
                    city: '',
                    state: '',
                    pincode: ''
                },
                shopImageUrl: '',
                visitingCardUrl: ''
            });
            setIsDialogOpen(false);
            setFormData({ companyName: '', contactPerson: '', phone: '' });
            // Ideally refresh leads here
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
                    <p className="text-gray-500 mt-1">
                        Track and convert potential customers
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Lead
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Lead</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Company / Shop Name</label>
                                <Input
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Contact Person</label>
                                <Input
                                    value={formData.contactPerson}
                                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Phone Number</label>
                                <Input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-amber-600">
                                Save Lead
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leads.map(lead => (
                    <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Building className="w-5 h-5" />
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${lead.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                }`}>
                                {lead.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{lead.shopName}</h3>

                        <div className="space-y-2 mt-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {lead.ownerName}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {lead.whatsappNumber}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t flex gap-2">
                            <Button variant="outline" className="flex-1">Call</Button>
                            <Button className="flex-1">Convert</Button>
                        </div>
                    </div>
                ))}

                {leads.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                        No leads found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
