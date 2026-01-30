'use client';

import { useState } from 'react';
import { useActiveCustomers } from '@/hooks/useCustomers';
import { Input } from '@/components/ui/input';
import {
    Search,
    Phone,
    Mail,
    CreditCard,
    TrendingUp,
    Loader2,
    ArrowRight,
    User,
    Building2,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
    const { customers, loading } = useActiveCustomers();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && customers.length === 0) {
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
                                <Building2 className="w-6 h-6 text-amber-600" />
                                B2B Customers
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">Manage registered shops and their credit limits</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                className="pl-10 bg-zinc-100/50 border-zinc-200 focus:bg-white transition-all rounded-2xl h-11"
                                placeholder="Search by shop name, email or phone..."
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
                            Try adjusting your search or check for new leads to onboard.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCustomers.map(customer => (
                            <div key={customer.id} className="group bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-700 font-bold text-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                                        {customer.name?.charAt(0) || <User className="w-6 h-6" />}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            customer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                customer.status === 'suspended' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                        )}>
                                            {customer.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium mt-1">
                                            <Clock className="w-3 h-3" />
                                            Joined {customer.createdAt?.toDate().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                                            {customer.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                                            <CreditCard className="w-3 h-3" />
                                            GST: {customer.gstNumber || 'Not Provided'}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> Limit
                                            </p>
                                            <p className="font-bold text-zinc-900">₹{customer.creditLimit?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                                                Available
                                            </p>
                                            <p className={cn(
                                                "font-bold",
                                                (customer.creditLimit - customer.creditUsed) < 10000 ? "text-red-600" : "text-emerald-600"
                                            )}>
                                                ₹{(customer.creditLimit - customer.creditUsed).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2">
                                        <div
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-500",
                                                (customer.creditUsed / (customer.creditLimit || 1)) > 0.8 ? "bg-red-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${Math.min(((customer.creditUsed || 0) / (customer.creditLimit || 1)) * 100, 100)}%` }}
                                        />
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                            <Phone className="w-3 h-3" />
                                            {customer.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            Terms: {customer.paymentTerms?.replace('_', ' ')}
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
