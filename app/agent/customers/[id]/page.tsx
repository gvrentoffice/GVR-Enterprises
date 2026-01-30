'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useLead } from '@/hooks/useLeads';
import { CustomerOrderHistory } from '@/components/agent/CustomerOrderHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    Phone,
    Mail,
    MapPin,
    History as HistoryIcon,
    Loader2,
    ShoppingCart
} from 'lucide-react';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { lead, loading, error } = useLead(id);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="container mx-auto p-6 text-center space-y-4">
                <h2 className="text-2xl font-bold text-zinc-900">Customer Not Found</h2>
                <p className="text-zinc-500">The customer you are looking for does not exist or has been removed.</p>
                <Button onClick={() => router.push('/agent/customers')}>
                    Back to Customers
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Customer Profile</h1>
                    <p className="text-zinc-500 text-sm">View details and order history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 border-zinc-200">
                    <CardHeader className="text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 font-bold text-3xl mx-auto mb-4">
                            {lead.shopName.charAt(0)}
                        </div>
                        <CardTitle className="text-xl">{lead.shopName}</CardTitle>
                        <CardDescription className="font-medium text-zinc-600 uppercase tracking-wider">
                            {lead.ownerName}
                        </CardDescription>
                        <Badge
                            variant={lead.priceAccessApproved ? 'default' : 'secondary'}
                            className={`mt-2 ${lead.priceAccessApproved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                                }`}
                        >
                            {lead.priceAccessApproved ? 'Approved' : 'Pending Approval'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 border-t border-zinc-100">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-900 font-medium">{lead.whatsappNumber}</span>
                            </div>
                            {lead.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-zinc-400" />
                                    <span className="text-zinc-600">{lead.email}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                                <span className="text-zinc-600 leading-relaxed">
                                    {lead.primaryAddress.street}, {lead.primaryAddress.city},<br />
                                    {lead.primaryAddress.state} - {lead.primaryAddress.pincode}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <Button
                                className="w-full bg-zinc-900 hover:bg-zinc-800"
                                onClick={() => router.push(`/agent/orders/create?customerId=${lead.id}`)}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Create Order
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* History Section */}
                <Card className="md:col-span-2 border-zinc-200">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <HistoryIcon className="w-5 h-5 text-amber-600" />
                            Order History
                        </CardTitle>
                        <CardDescription>
                            All orders placed by this customer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomerOrderHistory leadId={lead.id!} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
