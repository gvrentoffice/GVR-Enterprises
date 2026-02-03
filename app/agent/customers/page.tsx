'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { approvePriceAccess, revokePriceAccess, createLead } from '@/lib/firebase/services/leadService';
import { useToast } from '@/hooks/use-toast';
import {
    Search,
    Phone,
    MapPin,
    CheckCircle,
    Clock,
    Loader2,
    ShoppingCart,
    Eye,
    History as HistoryIcon,
    Edit,
    UserPlus,
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
    DialogDescription,
} from "@/components/ui/dialog";
import { CustomerOrderHistory } from '@/components/agent/CustomerOrderHistory';
import type { Lead } from '@/lib/firebase/schema';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function CustomersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { agent, loading: agentLoading } = useAgent();
    const { leads, loading: leadsLoading } = useAgentLeads(agent?.id);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        whatsappNumber: '',
        email: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

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

    const resetForm = () => {
        setFormData({
            shopName: '',
            ownerName: '',
            whatsappNumber: '',
            email: '',
            street: '',
            city: '',
            state: '',
            pincode: '',
        });
    };

    const handleOpenEdit = (lead: Lead) => {
        setEditingLead(lead);
        setFormData({
            shopName: lead.shopName,
            ownerName: lead.ownerName,
            whatsappNumber: lead.whatsappNumber,
            email: lead.email || '',
            street: lead.primaryAddress.street,
            city: lead.primaryAddress.city,
            state: lead.primaryAddress.state,
            pincode: lead.primaryAddress.pincode,
        });
        setIsEditOpen(true);
    };

    const handleSubmitOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('=== ONBOARDING FORM SUBMITTED ===', { agent, formData });

        if (!agent) {
            toast({
                title: 'Error',
                description: 'Agent information not loaded. Please refresh the page.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Validate phone number
            const cleanNumber = formData.whatsappNumber.replace(/\D/g, '');
            if (cleanNumber.length < 10) {
                toast({
                    title: 'Invalid Phone Number',
                    description: 'Please enter a valid 10-digit phone number',
                    variant: 'destructive',
                });
                setIsSubmitting(false);
                return;
            }

            // Validate pincode
            if (formData.pincode.length !== 6) {
                toast({
                    title: 'Invalid Pincode',
                    description: 'Please enter a valid 6-digit pincode',
                    variant: 'destructive',
                });
                setIsSubmitting(false);
                return;
            }

            await createLead({
                shopName: formData.shopName,
                ownerName: formData.ownerName,
                whatsappNumber: formData.whatsappNumber,
                email: formData.email || null,
                primaryAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                shopImageUrl: '',
                visitingCardUrl: '',
                agentId: agent.id,
                agentName: agent.name,
                status: 'pending',
                priceAccessApproved: false,
            });

            toast({
                title: 'Customer Onboarded Successfully',
                description: `${formData.shopName} has been added to your customers`,
            });

            resetForm();
            setIsOnboardingOpen(false);
        } catch (error) {
            console.error('Error onboarding customer:', error);
            toast({
                title: 'Error',
                description: 'Failed to onboard customer. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead) return;

        setIsSubmitting(true);
        try {
            // Validate phone number
            const cleanNumber = formData.whatsappNumber.replace(/\D/g, '');
            if (cleanNumber.length < 10) {
                toast({
                    title: 'Invalid Phone Number',
                    description: 'Please enter a valid 10-digit phone number',
                    variant: 'destructive',
                });
                setIsSubmitting(false);
                return;
            }

            // Validate pincode
            if (formData.pincode.length !== 6) {
                toast({
                    title: 'Invalid Pincode',
                    description: 'Please enter a valid 6-digit pincode',
                    variant: 'destructive',
                });
                setIsSubmitting(false);
                return;
            }

            const docRef = doc(db, 'leads', editingLead.id);
            await updateDoc(docRef, {
                shopName: formData.shopName,
                ownerName: formData.ownerName,
                whatsappNumber: formData.whatsappNumber,
                email: formData.email || null,
                primaryAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                updatedAt: Timestamp.now(),
            });

            toast({
                title: 'Customer Updated Successfully',
                description: `${formData.shopName} details have been updated`,
            });

            setIsEditOpen(false);
            setEditingLead(null);
            resetForm();
        } catch (error) {
            console.error('Error updating customer:', error);
            toast({
                title: 'Error',
                description: 'Failed to update customer. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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



    if (agentLoading || leadsLoading) {
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
                            <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Onboard Customer
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-xl border-emerald-100/50 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl text-emerald-950">Onboard New Customer</DialogTitle>
                                        <DialogDescription className="text-emerald-900/60">
                                            Add a new customer to your portfolio
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CustomerForm
                                        onSubmit={handleSubmitOnboarding}
                                        formData={formData}
                                        setFormData={setFormData}
                                        isSubmitting={isSubmitting}
                                        onCancel={() => {
                                            setIsOnboardingOpen(false);
                                            resetForm();
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>

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

            {/* Leads Grid - 2 columns mobile, 5 columns desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredLeads.map((lead) => (
                    <Card key={lead.id} className="border-zinc-200 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-start gap-2 min-w-0">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                                        {lead.shopName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-sm text-zinc-900 truncate">{lead.shopName}</CardTitle>
                                        <CardDescription className="text-xs truncate">{lead.ownerName}</CardDescription>
                                    </div>
                                </div>
                                <Badge
                                    variant={lead.priceAccessApproved ? 'default' : 'secondary'}
                                    className={`text-[10px] px-1.5 py-0.5 shrink-0 ${lead.priceAccessApproved
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                        }`}
                                >
                                    {lead.priceAccessApproved ? 'OK' : 'Pending'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            {/* Contact Info */}
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5 text-zinc-600">
                                    <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                                    <span className="truncate">{lead.whatsappNumber}</span>
                                </div>
                                <div className="flex items-start gap-1.5 text-zinc-600">
                                    <MapPin className="w-3 h-3 text-zinc-400 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2 text-[11px]">
                                        {lead.primaryAddress.city}, {lead.primaryAddress.state}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1.5 pt-1">
                                {!lead.priceAccessApproved ? (
                                    <Button
                                        size="sm"
                                        className="w-full bg-amber-600 hover:bg-amber-700 h-8 text-xs"
                                        onClick={() => handleApprovePriceAccess(lead.id!)}
                                        disabled={processingId === lead.id}
                                    >
                                        {processingId === lead.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Grant Access
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-1.5 w-full">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100 h-8 text-[10px] px-1"
                                            onClick={() => handleRevokePriceAccess(lead.id!)}
                                            disabled={processingId === lead.id}
                                        >
                                            <CheckCircle className="w-3 h-3 shrink-0" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-zinc-900 hover:bg-zinc-800 h-8 text-[10px] px-1"
                                            onClick={() => router.push(`/agent/orders/create?customerId=${lead.id}`)}
                                        >
                                            <ShoppingCart className="w-3 h-3 shrink-0" />
                                        </Button>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-1.5">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-[10px] px-1"
                                        onClick={() => handleOpenEdit(lead)}
                                    >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="h-8 text-[10px] px-1">
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
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

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-xl border-emerald-100/50 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-emerald-950">Edit Customer Details</DialogTitle>
                        <DialogDescription className="text-emerald-900/60">
                            Update customer information
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerForm
                        onSubmit={handleSubmitEdit}
                        isEdit={true}
                        formData={formData}
                        setFormData={setFormData}
                        isSubmitting={isSubmitting}
                        onCancel={() => {
                            setIsEditOpen(false);
                            setEditingLead(null);
                            resetForm();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface CustomerFormProps {
    formData: {
        shopName: string;
        ownerName: string;
        whatsappNumber: string;
        email: string;
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    isEdit?: boolean;
    onCancel: () => void;
}

function CustomerForm({ formData, setFormData, onSubmit, isSubmitting, isEdit = false, onCancel }: CustomerFormProps) {
    const inputClasses = "bg-white/50 border-emerald-100/50 focus:border-emerald-500 focus:ring-emerald-500/20 backdrop-blur-sm transition-all duration-300";
    const labelClasses = "text-emerald-950/80 font-medium";

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Shop Name */}
                <div className="space-y-2">
                    <Label htmlFor="shopName" className={labelClasses}>Shop Name *</Label>
                    <Input
                        id="shopName"
                        required
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        placeholder="Enter shop name"
                        className={inputClasses}
                    />
                </div>

                {/* Owner Name */}
                <div className="space-y-2">
                    <Label htmlFor="ownerName" className={labelClasses}>Owner Name *</Label>
                    <Input
                        id="ownerName"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="Enter owner name"
                        className={inputClasses}
                    />
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className={labelClasses}>WhatsApp Number *</Label>
                    <Input
                        id="whatsappNumber"
                        required
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="10-digit mobile number"
                        className={inputClasses}
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className={labelClasses}>Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className={inputClasses}
                    />
                </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4 p-5 bg-emerald-50/30 rounded-xl border border-emerald-100/50 backdrop-blur-sm">
                <h3 className="font-semibold text-sm text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address Details
                </h3>

                <div className="space-y-2">
                    <Label htmlFor="street" className={labelClasses}>Street Address *</Label>
                    <Input
                        id="street"
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        placeholder="Building, Street, Area"
                        className={inputClasses}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city" className={labelClasses}>City *</Label>
                        <Input
                            id="city"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="City"
                            className={inputClasses}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state" className={labelClasses}>State *</Label>
                        <Input
                            id="state"
                            required
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="State"
                            className={inputClasses}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pincode" className={labelClasses}>Pincode *</Label>
                        <Input
                            id="pincode"
                            required
                            maxLength={6}
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                            placeholder="6-digit pincode"
                            className={inputClasses}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/50"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isEdit ? 'Updating...' : 'Onboarding...'}
                        </>
                    ) : (
                        <>
                            {isEdit ? 'Update Customer' : 'Onboard Customer'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
