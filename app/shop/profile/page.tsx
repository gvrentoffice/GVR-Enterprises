"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Loader2, Save, Building2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { SecuritySettings } from "@/components/auth/SecuritySettings";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [customer, setCustomer] = useState<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem('customer');
        if (saved) {
            const data = JSON.parse(saved);
            setCustomer({
                id: data.id,
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-red-50/50 pb-20 sm:pb-24">
            <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
                {/* Profile Card with Glassmorphism */}
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl sm:rounded-[2rem] border border-white/50 shadow-2xl shadow-orange-500/10 p-4 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Avatar Section */}
                        <div className="lg:col-span-1 flex flex-col items-center">
                            <div className="relative group mb-4 sm:mb-6">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur opacity-25 group-hover:opacity-40 transition"></div>
                                <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                                    <img
                                        src={customer.shopImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-full flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-sm font-semibold">Change Photo</span>
                                </div>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{customer.name}</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 truncate max-w-full px-2">{customer.email}</p>
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">{customer.phone}</span>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Personal Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Owner Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                value={customer.name}
                                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                                className="pl-10 bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                value={customer.email}
                                                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                                className="pl-10 bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Address</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Shop Address</Label>
                                        <Input
                                            value={customer.address}
                                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                            className="bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-gray-700">City</Label>
                                            <Input
                                                value={customer.city}
                                                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                                                className="bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-gray-700">ZIP Code</Label>
                                            <Input
                                                value={customer.zip}
                                                onChange={(e) => setCustomer({ ...customer, zip: e.target.value })}
                                                className="bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Details */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
                                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Business Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Shop Name</Label>
                                        <Input
                                            placeholder="e.g. Acme Corp"
                                            value={customer.companyName}
                                            onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                                            className="bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">GSTIN</Label>
                                        <Input
                                            placeholder="22AAAAA0000A1Z5"
                                            value={customer.gstin}
                                            onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                                            className="bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-semibold text-gray-700">Business Type</Label>
                                        <Select
                                            value={customer.businessType}
                                            onValueChange={(value) => setCustomer({ ...customer, businessType: value })}
                                        >
                                            <SelectTrigger className="bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl">
                                                <SelectValue placeholder="Select business type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Retailer">Retailer</SelectItem>
                                                <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                                                <SelectItem value="Distributor">Distributor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl px-8 shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings with Glassmorphism */}
                {customer?.id && (
                    <div className="backdrop-blur-xl bg-white/70 rounded-[2rem] border border-white/50 shadow-2xl shadow-orange-500/10">
                        <SecuritySettings
                            userId={customer.id}
                            userType="customer"
                            userName={customer.name}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
