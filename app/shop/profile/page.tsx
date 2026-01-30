"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Loader2, Save } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [customer, setCustomer] = useState<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem('customer');
        if (saved) {
            const data = JSON.parse(saved);
            setCustomer({
                name: data.ownerName || "",
                email: data.email || "",
                phone: data.whatsapp || "",
                address: data.shopAddress || "",
                city: data.city || "",
                zip: data.zipCode || "",
                companyName: data.shopName || "",
                gstin: data.gstNumber || "",
                businessType: data.businessType || "Retailer",
                shopImageUrl: data.shopImageUrl || ""
            });
        }
    }, []);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    if (!customer) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your personal information and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center flex flex-col items-center">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 ring-1 ring-gray-100">
                                <img
                                    src={customer.shopImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-medium">Change</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Owner Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        value={customer.name}
                                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        value={customer.email}
                                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">WhatsApp Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        value={customer.phone}
                                        disabled
                                        className="pl-10 bg-gray-50 text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Address</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Shop Address</Label>
                                <Input
                                    id="address"
                                    value={customer.address}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={customer.city}
                                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input
                                        id="zip"
                                        value={customer.zip}
                                        onChange={(e) => setCustomer({ ...customer, zip: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <span className="text-xl">🏢</span>
                            </div>
                            <h3 className="text-lg font-semibold">Business Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Shop Name</Label>
                                <Input
                                    id="companyName"
                                    placeholder="e.g. Acme Corp"
                                    value={customer.companyName}
                                    onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gstin">GSTIN</Label>
                                <Input
                                    id="gstin"
                                    placeholder="22AAAAA0000A1Z5"
                                    value={customer.gstin}
                                    onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="businessType">Business Type</Label>
                                <Select
                                    value={customer.businessType}
                                    onValueChange={(value) => setCustomer({ ...customer, businessType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select business type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Retailer">Retailer</SelectItem>
                                        <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                                        <SelectItem value="Distributor">Distributor</SelectItem>
                                        <SelectItem value="Restaurant">Restaurant/Caterer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={isLoading} className="gap-2 rounded-full px-8">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
