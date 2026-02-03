'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Check } from 'lucide-react';
import { setMpinAction } from '@/app/actions/mpin';

interface MpinSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userType: 'agent' | 'customer';
    userName: string;
}

export function MpinSetupModal({
    isOpen,
    onClose,
    userId,
    userType,
    userName
}: MpinSetupModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [mpin, setMpin] = useState('');
    const [confirmMpin, setConfirmMpin] = useState('');

    const handleSetMpin = async () => {
        // Validate MPIN
        if (!/^\d{4,6}$/.test(mpin)) {
            toast({
                variant: "destructive",
                title: "Invalid MPIN",
                description: "MPIN must be 4-6 digits",
            });
            return;
        }

        if (step === 'enter') {
            setStep('confirm');
            return;
        }

        // Confirm MPIN
        if (mpin !== confirmMpin) {
            toast({
                variant: "destructive",
                title: "MPIN Mismatch",
                description: "The MPINs you entered do not match",
            });
            setConfirmMpin('');
            return;
        }

        setLoading(true);
        try {
            const result = await setMpinAction(userId, userType, mpin);

            if (result.success) {
                toast({
                    title: "MPIN Set Successfully",
                    description: "You can now use your MPIN to login",
                });
                onClose();
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to Set MPIN",
                    description: result.error || "Please try again",
                });
            }
        } catch (error) {
            console.error('MPIN setup error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        toast({
            title: "MPIN Setup Skipped",
            description: "You can set up MPIN later from your profile settings",
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] bg-gradient-to-br from-white to-gray-50 border-2 border-emerald-100">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-emerald-600" />
                        </div>
                        Set Up Your MPIN
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-base">
                        Welcome, <span className="font-semibold text-gray-900">{userName}</span>!
                        Set up a 4-6 digit MPIN for quick and secure login.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {step === 'enter' ? (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">
                                    Enter MPIN (4-6 digits)
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        placeholder="••••"
                                        className="h-16 text-center text-3xl tracking-[0.5em] font-bold bg-gray-50 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
                                        value={mpin}
                                        onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Choose a memorable 4-6 digit PIN
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <p className="text-sm text-emerald-800">
                                    MPIN entered successfully. Please confirm below.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">
                                    Confirm MPIN
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        placeholder="••••"
                                        className="h-16 text-center text-3xl tracking-[0.5em] font-bold bg-gray-50 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
                                        value={confirmMpin}
                                        onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Re-enter your MPIN to confirm
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                            className="flex-1 h-12 border-2 border-gray-200 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Skip for Now
                        </Button>
                        <Button
                            onClick={handleSetMpin}
                            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                            disabled={loading || (step === 'enter' && mpin.length < 4) || (step === 'confirm' && confirmMpin.length < 4)}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : step === 'enter' ? (
                                "Continue"
                            ) : (
                                "Set MPIN"
                            )}
                        </Button>
                    </div>

                    {step === 'confirm' && (
                        <button
                            type="button"
                            onClick={() => {
                                setStep('enter');
                                setMpin('');
                                setConfirmMpin('');
                            }}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            ← Change MPIN
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
