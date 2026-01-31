'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail, Fingerprint, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setPasswordAction, setRecoveryEmailAction, getWebAuthnRegistrationOptionsAction, verifyWebAuthnRegistrationAction } from '@/app/actions/security';
import { startRegistration } from '@simplewebauthn/browser';

interface SecuritySetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userType: 'agent' | 'customer';
    userName: string; // Needed for WebAuthn
    missingFeatures: {
        password: boolean;
        recoveryEmail: boolean;
        biometrics: boolean;
    };
}

export function SecuritySetupModal({
    isOpen,
    onClose,
    userId,
    userType,
    userName,
    missingFeatures
}: SecuritySetupModalProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(0); // 0: Intro, 1: Password, 2: Email, 3: Biometrics, 4: Done
    const [loading, setLoading] = useState(false);

    // Form States
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');

    const nextStep = () => setStep(prev => prev + 1);

    const handlePasswordSubmit = async () => {
        if (password.length < 6) {
            toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
            return;
        }
        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
            return;
        }

        setLoading(true);
        try {
            await setPasswordAction(userId, userType, password);
            toast({ title: "Success", description: "Password set successfully." });
            nextStep();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to set password." });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async () => {
        if (!email.includes('@')) {
            toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address." });
            return;
        }
        setLoading(true);
        try {
            await setRecoveryEmailAction(userId, userType, email);
            toast({ title: "Success", description: "Recovery email saved." });
            nextStep();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to set recovery email." });
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricSetup = async () => {
        setLoading(true);
        try {
            const options = await getWebAuthnRegistrationOptionsAction(userId, userName);
            const attResp = await startRegistration(options);

            const verification = await verifyWebAuthnRegistrationAction(
                userId,
                userType,
                attResp,
                options.challenge
            );

            if (verification) {
                toast({ title: "Success", description: "Biometric login enabled!" });
                nextStep();
            } else {
                throw new Error("Verification failed");
            }
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message === 'The user aborted a request.'
                    ? "Setup cancelled."
                    : "Failed to enable biometrics. device might not support it."
            });
        } finally {
            setLoading(false);
        }
    };

    // Skip logic for optional steps
    const handleSkip = () => {
        nextStep();
    }

    // Determine content based on step
    const renderContent = () => {
        switch (step) {
            case 0: // INTRO
                return (
                    <div className="space-y-4 text-center py-2 sm:py-4">
                        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Secure Your Account</h3>
                        <p className="text-gray-600 text-sm sm:text-base px-2">
                            Enhance your account security by adding a password, recovery email, and enabling biometric login.
                        </p>
                        <div className="pt-2 sm:pt-4 space-y-2">
                            <Button onClick={nextStep} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl h-11 sm:h-12">
                                Get Started
                            </Button>
                            <Button variant="ghost" onClick={onClose} className="w-full rounded-xl h-11 sm:h-12">
                                Skip for Now
                            </Button>
                        </div>
                    </div>
                );

            case 1: // PASSWORD
                if (!missingFeatures.password) {
                    return (
                        <div className="text-center py-4 sm:py-6">
                            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm sm:text-base">Password already set.</p>
                            <Button onClick={nextStep} className="mt-4 rounded-xl">Continue</Button>
                        </div>
                    );
                }
                return (
                    <div className="space-y-4">
                        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                        </div>
                        <div className="text-center mb-3 sm:mb-4">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">Create a Password</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">So you can login without OTP</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">New Password</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                className="rounded-xl h-11 sm:h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Confirm Password</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                className="rounded-xl h-11 sm:h-12"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                            <Button variant="outline" onClick={handleSkip} className="flex-1 rounded-xl h-11 sm:h-12 order-2 sm:order-1">Skip</Button>
                            <Button onClick={handlePasswordSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl h-11 sm:h-12 order-1 sm:order-2">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Set Password
                            </Button>
                        </div>
                    </div>
                );

            case 2: // RECOVERY EMAIL
                if (!missingFeatures.recoveryEmail) {
                    return (
                        <div className="text-center py-4 sm:py-6">
                            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm sm:text-base">Recovery Email already set.</p>
                            <Button onClick={nextStep} className="mt-4 rounded-xl">Continue</Button>
                        </div>
                    );
                }
                return (
                    <div className="space-y-4">
                        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div className="text-center mb-3 sm:mb-4">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">Add Recovery Email</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 px-2">For account recovery if you lose your phone</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Email Address</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="rounded-xl h-11 sm:h-12"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                            <Button variant="outline" onClick={handleSkip} className="flex-1 rounded-xl h-11 sm:h-12 order-2 sm:order-1">Skip</Button>
                            <Button onClick={handleEmailSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl h-11 sm:h-12 order-1 sm:order-2">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Email
                            </Button>
                        </div>
                    </div>
                );

            case 3: // BIOMETRICS
                if (!missingFeatures.biometrics) {
                    return (
                        <div className="text-center py-4 sm:py-6">
                            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm sm:text-base">Biometric login already enabled.</p>
                            <Button onClick={nextStep} className="mt-4 rounded-xl">Continue</Button>
                        </div>
                    );
                }
                return (
                    <div className="space-y-4">
                        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                            <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        </div>
                        <div className="text-center mb-3 sm:mb-4">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">Enable Biometric Login</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 px-2">Use FaceID or TouchID for quick access</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                            <Button variant="outline" onClick={handleSkip} className="flex-1 rounded-xl h-11 sm:h-12 order-2 sm:order-1">Skip</Button>
                            <Button onClick={handleBiometricSetup} disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl h-11 sm:h-12 order-1 sm:order-2">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Enable Biometrics
                            </Button>
                        </div>
                    </div>
                );

            case 4: // DONE
                return (
                    <div className="text-center py-4 sm:py-6">
                        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">All Set!</h3>
                        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 px-2">
                            Your account is now more secure. You can manage these settings anytime from your profile.
                        </p>
                        <Button onClick={onClose} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl h-11 sm:h-12">
                            Continue to Dashboard
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-w-[90vw] rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
