'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { approvePriceAccess, revokePriceAccess } from '@/lib/firebase/services/leadService';
import { useToast } from '@/hooks/use-toast';
import {
    Search,
    Phone,
    Mail,
    MapPin,
    CheckCircle,
    Clock,
    Image as ImageIcon,
    Loader2,
    ShoppingCart,
    Eye,
    History as HistoryIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/hooks/useAgent';
import { useAgentLeads } from '@/hooks/useLeads';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerOrderHistory } from '@/components/agent/CustomerOrderHistory';

export default function CustomersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { agent } = useAgent();
    const { leads, loading: leadsLoading } = useAgentLeads(agent?.id);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const cities = Array.from(new Set(leads.map(l => l.primaryAddress.city))).sort();

    const filteredLeads = leads.filter(
        (lead) => {
            const matchesSearch =
                lead.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.whatsappNumber.includes(searchTerm);

            const matchesCity = selectedCity === 'all' || lead.primaryAddress.city === selectedCity;

            return matchesSearch && matchesCity;
        }
    );

    const handleApprovePriceAccess = async (leadId: string) => {
        setProcessingId(leadId);
        try {
            await approvePriceAccess(leadId);

            toast({
                title: 'Price Access Approved',
                description: 'Customer can now view prices and place orders.',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error approving price access:', error);
            toast({
                title: 'Error',
                description: 'Failed to approve price access. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleRevokePriceAccess = async (leadId: string) => {
        setProcessingId(leadId);
        try {
            await revokePriceAccess(leadId);

            toast({
                title: 'Price Access Revoked',
                description: 'Customer can no longer view prices or place orders.',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error revoking price access:', error);
            toast({
                title: 'Error',
                description: 'Failed to revoke price access. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (leadsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl text-zinc-900">My Customers</CardTitle>
                            <CardDescription>
                                Manage onboarded customers and approve price access
                            </CardDescription>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <select
                                className="h-10 px-3 rounded-md border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="all">All Cities</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    placeholder="Search by name or phone..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-zinc-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">Total Leads</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{leads.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">Approved</p>
                                <h3 className="text-2xl font-bold text-zinc-900">
                                    {leads.filter((l) => l.priceAccessApproved).length}
                                </h3>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">Pending Approval</p>
                                <h3 className="text-2xl font-bold text-zinc-900">
                                    {leads.filter((l) => !l.priceAccessApproved).length}
                                </h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leads List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLeads.map((lead) => (
                    <Card key={lead.id} className="border-zinc-200 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-bold text-lg">
                                        {lead.shopName.charAt(0)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-zinc-900">{lead.shopName}</CardTitle>
                                        <CardDescription>{lead.ownerName}</CardDescription>
                                    </div>
                                </div>
                                <Badge
                                    variant={lead.priceAccessApproved ? 'default' : 'secondary'}
                                    className={
                                        lead.priceAccessApproved
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    }
                                >
                                    {lead.priceAccessApproved ? 'Approved' : 'Pending'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Contact Info */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-zinc-600">
                                    <Phone className="w-4 h-4 text-zinc-400" />
                                    {lead.whatsappNumber}
                                </div>
                                {lead.email && (
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <Mail className="w-4 h-4 text-zinc-400" />
                                        {lead.email}
                                    </div>
                                )}
                                <div className="flex items-start gap-2 text-zinc-600">
                                    <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                                    <span>
                                        {lead.primaryAddress.street}, {lead.primaryAddress.city},{' '}
                                        {lead.primaryAddress.state} - {lead.primaryAddress.pincode}
                                    </span>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="border border-zinc-200 rounded-lg p-2 text-center">
                                    <ImageIcon className="w-4 h-4 mx-auto text-zinc-400 mb-1" />
                                    <p className="text-xs text-zinc-500">Shop Image</p>
                                </div>
                                <div className="border border-zinc-200 rounded-lg p-2 text-center">
                                    <ImageIcon className="w-4 h-4 mx-auto text-zinc-400 mb-1" />
                                    <p className="text-xs text-zinc-500">Visiting Card</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 pt-2">
                                {!lead.priceAccessApproved ? (
                                    <Button
                                        className="w-full bg-amber-600 hover:bg-amber-700"
                                        onClick={() => handleApprovePriceAccess(lead.id!)}
                                        disabled={processingId === lead.id}
                                    >
                                        {processingId === lead.id ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Grant Price Access
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                                        <Button
                                            variant="outline"
                                            className="w-full text-green-700 border-green-200 bg-green-50 hover:bg-green-100 h-10"
                                            onClick={() => handleRevokePriceAccess(lead.id!)}
                                            disabled={processingId === lead.id}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
                                            <span className="truncate">Revoke Access</span>
                                        </Button>
                                        <Button
                                            variant="default"
                                            className="w-full bg-zinc-900 hover:bg-zinc-800 h-10"
                                            onClick={() => router.push(`/agent/orders/create?customerId=${lead.id}`)}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2 shrink-0" />
                                            Order
                                        </Button>
                                    </div>
                                )}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl flex items-center gap-3">
                                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                                                    {lead.shopName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p>{lead.shopName}</p>
                                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest leading-none mt-1">
                                                        {lead.ownerName}
                                                    </p>
                                                </div>
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-8 py-4">
                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        <Phone className="w-4 h-4" /> Contact
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <p className="font-bold text-gray-900">{lead.whatsappNumber}</p>
                                                        <p className="text-gray-600">{lead.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" /> Address
                                                    </h4>
                                                    <p className="text-gray-600 line-clamp-3">
                                                        {lead.primaryAddress.street}, {lead.primaryAddress.city},<br />
                                                        {lead.primaryAddress.state} - {lead.primaryAddress.pincode}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* History Section */}
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                    <HistoryIcon className="w-4 h-4" /> Order History
                                                </h4>
                                                <CustomerOrderHistory leadId={lead.id!} />
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredLeads.length === 0 && (
                    <div className="col-span-full text-center py-12 text-zinc-500">
                        {searchTerm ? `No customers found matching "${searchTerm}"` : "You haven't onboarded any customers yet."}
                    </div>
                )}
            </div>
        </div>
    );
}

