'use client';

import { useState } from 'react';
import { useAllCustomers } from '@/hooks/useCustomers';
import { Input } from '@/components/ui/input';
import {
    Search,
    Phone,
    Mail,
    Store,
    Loader2,
    ArrowRight,
    User,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
    const { customers, loading } = useAllCustomers();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = customers.filter(customer =>
        customer.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.whatsappNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && customers.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-amber-600" />
                                Registered Customers
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">View and manage all customer registrations</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700">
                                    {customers.filter(c => c.status === 'approved').length} Approved
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-bold text-amber-700">
                                    {customers.filter(c => c.status === 'pending').length} Pending
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                className="pl-10 bg-zinc-100/50 border-zinc-200 focus:bg-white transition-all rounded-2xl h-11"
                                placeholder="Search by shop name, owner, email or phone..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredCustomers.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-20 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">No customers found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mt-1">
                            {searchTerm ? 'Try adjusting your search' : 'New customer registrations will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCustomers.map(customer => (
                            <div key={customer.id} className="group bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-700 font-bold text-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                                        {customer.shopName?.charAt(0) || <Store className="w-6 h-6" />}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                                            customer.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                customer.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                        )}>
                                            {getStatusIcon(customer.status)}
                                            {customer.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium mt-1">
                                            <Clock className="w-3 h-3" />
                                            {customer.createdAt?.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                                            {customer.shopName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                                            <User className="w-3 h-3" />
                                            Owner: {customer.ownerName}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 space-y-2">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                            <Phone className="w-3 h-3" />
                                            {customer.whatsappNumber}
                                        </div>
                                        {customer.email && (
                                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                                <Mail className="w-3 h-3" />
                                                <span className="truncate">{customer.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">
                                                {customer.primaryAddress.city}, {customer.primaryAddress.state}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            Agent: {customer.agentName}
                                        </div>
                                        <button className="flex items-center gap-1 text-sm font-bold text-amber-600 hover:gap-2 transition-all">
                                            View Details
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
