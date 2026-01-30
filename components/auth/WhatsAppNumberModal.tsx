'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Loader2 } from 'lucide-react';

interface WhatsAppNumberModalProps {
    isOpen: boolean;
    onSubmit: (whatsappNumber: string) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function WhatsAppNumberModal({
    isOpen,
    onSubmit,
    onCancel,
    loading = false,
}: WhatsAppNumberModalProps) {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate phone number
        const cleanNumber = whatsappNumber.replace(/\D/g, '');
        if (cleanNumber.length < 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            await onSubmit(whatsappNumber);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save number');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-emerald-100">
                        <Phone className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        One More Step
                    </h2>
                    <p className="text-sm text-gray-500">
                        Please provide your WhatsApp number to complete registration
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                            WhatsApp Number *
                        </Label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                            <Input
                                type="tel"
                                placeholder="+91 98765 43210"
                                className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all rounded-2xl"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <p className="text-xs text-red-600 ml-1 mt-1">{error}</p>
                        )}
                        <p className="text-xs text-gray-400 ml-1 mt-2">
                            This number will be used for order updates and support
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 h-12 rounded-xl border-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Continue'
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>Note:</strong> You can browse products now, but dealer prices will be visible only after approval by our team.
                    </p>
                </div>
            </div>
        </div>
    );
}
