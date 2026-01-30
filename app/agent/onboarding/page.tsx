'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadImage } from '@/lib/storage';
import { createLead } from '@/lib/firebase/services/leadService';
import { useAgent } from '@/hooks/useAgent';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    const { agent } = useAgent();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

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

    const [shopImage, setShopImage] = useState<File | null>(null);
    const [visitingCard, setVisitingCard] = useState<File | null>(null);
    const [shopImagePreview, setShopImagePreview] = useState<string>('');
    const [visitingCardPreview, setVisitingCardPreview] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'shop' | 'card'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'shop') {
                setShopImage(file);
                setShopImagePreview(URL.createObjectURL(file));
            } else {
                setVisitingCard(file);
                setVisitingCardPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!shopImage || !visitingCard) {
                toast({
                    title: 'Missing Images',
                    description: 'Please upload both shop image and visiting card',
                    variant: 'destructive',
                });
                setLoading(false);
                return;
            }

            // Upload images to Firebase Storage
            const [shopImageUrl, visitingCardUrl] = await Promise.all([
                uploadImage(shopImage, 'leads/shop-images'),
                uploadImage(visitingCard, 'leads/visiting-cards'),
            ]);

            // Create lead in Firestore
            const leadId = await createLead({
                shopName: formData.shopName,
                ownerName: formData.ownerName,
                whatsappNumber: formData.whatsappNumber,
                email: formData.email,
                primaryAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                shopImageUrl,
                visitingCardUrl,
                agentId: agent?.id || 'unknown',
                agentName: agent?.employeeId || 'Agent',
                status: 'pending',
                priceAccessApproved: false,
            });

            toast({
                title: 'Success!',
                description: `Lead created successfully. ID: ${leadId}`,
                variant: 'success'
            });

            // Reset form
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
            setShopImage(null);
            setVisitingCard(null);
            setShopImagePreview('');
            setVisitingCardPreview('');

            // Navigate to customers page
            router.push('/agent/customers');
        } catch (error) {
            console.error('Error creating lead:', error);
            toast({
                title: 'Error',
                description: 'Failed to create lead. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card className="border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-2xl text-zinc-900">Customer Onboarding</CardTitle>
                    <CardDescription>
                        Capture new customer details and create a lead
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shop Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-zinc-900">Shop Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shopName">Shop Name *</Label>
                                    <Input
                                        id="shopName"
                                        name="shopName"
                                        value={formData.shopName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Modern Decor"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ownerName">Owner Name *</Label>
                                    <Input
                                        id="ownerName"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Rajesh Kumar"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-zinc-900">Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                                    <Input
                                        id="whatsappNumber"
                                        name="whatsappNumber"
                                        value={formData.whatsappNumber}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="shop@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-zinc-900">Primary Address</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="street">Street Address *</Label>
                                    <Input
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="123 Main Street"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Mumbai"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Maharashtra"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode *</Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="400001"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Uploads */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-zinc-900">Documentation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Shop Image */}
                                <div className="space-y-2">
                                    <Label htmlFor="shopImage">Shop Image *</Label>
                                    <div className="border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center hover:border-amber-600 transition-colors">
                                        {shopImagePreview ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={shopImagePreview}
                                                    alt="Shop preview"
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShopImage(null);
                                                        setShopImagePreview('');
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <label htmlFor="shopImage" className="cursor-pointer">
                                                <Camera className="w-12 h-12 mx-auto text-zinc-400 mb-2" />
                                                <p className="text-sm text-zinc-600">Click to upload shop image</p>
                                                <input
                                                    id="shopImage"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageChange(e, 'shop')}
                                                    required
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Visiting Card */}
                                <div className="space-y-2">
                                    <Label htmlFor="visitingCard">Visiting Card *</Label>
                                    <div className="border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center hover:border-amber-600 transition-colors">
                                        {visitingCardPreview ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={visitingCardPreview}
                                                    alt="Card preview"
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setVisitingCard(null);
                                                        setVisitingCardPreview('');
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <label htmlFor="visitingCard" className="cursor-pointer">
                                                <Upload className="w-12 h-12 mx-auto text-zinc-400 mb-2" />
                                                <p className="text-sm text-zinc-600">Click to upload visiting card</p>
                                                <input
                                                    id="visitingCard"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageChange(e, 'card')}
                                                    required
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating Lead...
                                    </>
                                ) : (
                                    'Create Lead'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
