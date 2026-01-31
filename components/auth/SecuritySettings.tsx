'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Mail, Fingerprint, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    getSecurityStatusAction,
    setPasswordAction,
    setRecoveryEmailAction,
    getWebAuthnRegistrationOptionsAction,
    verifyWebAuthnRegistrationAction
} from '@/app/actions/security';
import { startRegistration } from '@simplewebauthn/browser';

interface SecuritySettingsProps {
    userId: string;
    userType: 'agent' | 'customer';
    userName: string;
}

export function SecuritySettings({ userId, userType, userName }: SecuritySettingsProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<{
        hasPassword?: boolean;
        hasBiometrics?: boolean;
        recoveryEmail?: string;
        isEmailVerified?: boolean;
    }>({});

    // Actions Loading States
    const [passLoading, setPassLoading] = useState(false);
    const [bioLoading, setBioLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);

    // Form States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // UI Toggles
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, [userId]);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            if (!userId) return;
            const data = await getSecurityStatusAction(userId, userType);
            setStatus(data);
            if (data.recoveryEmail) setRecoveryEmail(data.recoveryEmail);
        } catch (e) {
            console.error("Failed to fetch security status", e);
            toast({ variant: "destructive", title: "Error", description: "Could not load security settings." });
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async () => {
        if (newPassword.length < 6) {
            toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
            return;
        }

        setPassLoading(true);
        try {
            await setPasswordAction(userId, userType, newPassword);
            toast({ title: "Success", description: "Password updated successfully." });
            setStatus(prev => ({ ...prev, hasPassword: true }));
            setShowChangePassword(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update password." });
        } finally {
            setPassLoading(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!recoveryEmail || !recoveryEmail.includes('@')) {
            toast({ variant: "destructive", title: "Invalid Email", description: "Enter a valid email address." });
            return;
        }
        setEmailLoading(true);
        try {
            await setRecoveryEmailAction(userId, userType, recoveryEmail);
            toast({ title: "Saved", description: "Recovery email updated successfully." });
            setStatus(prev => ({ ...prev, recoveryEmail }));
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save email." });
        } finally {
            setEmailLoading(false);
        }
    };

    const toggleBiometrics = async (enabled: boolean) => {
        if (enabled) {
            // Enable / Register
            setBioLoading(true);
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
                    setStatus(prev => ({ ...prev, hasBiometrics: true }));
                } else {
                    throw new Error("Verification failed");
                }
            } catch (error: any) {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message === 'The user aborted a request.'
                        ? "Biometric setup cancelled."
                        : "Failed to enable biometrics. Make sure your device supports it."
                });
            } finally {
                setBioLoading(false);
            }
        } else {
            // Disable - show info message
            toast({
                title: "Info",
                description: "To disable biometrics, please contact support or clear your browser data."
            });
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Security & Login</h3>
                    <p className="text-sm text-gray-500">Manage your account security settings</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. PASSWORD */}
                <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-gray-700" />
                                <h4 className="font-semibold text-gray-900">Password</h4>
                                {status.hasPassword ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">Set</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full">
                                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                                        <span className="text-xs font-medium text-amber-700">Not Set</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                {status.hasPassword ? "Your account is password protected" : "Set a password to secure your account"}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowChangePassword(!showChangePassword)}
                            className="rounded-xl border-gray-200 hover:border-amber-400 hover:bg-amber-50"
                        >
                            {status.hasPassword ? "Change" : "Set Password"}
                        </Button>
                    </div>

                    {showChangePassword && (
                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="pr-10 bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        className="pr-10 bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSetPassword}
                                    disabled={passLoading}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl"
                                >
                                    {passLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                    Save Password
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. RECOVERY EMAIL */}
                <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 border border-gray-100">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-gray-700" />
                                <h4 className="font-semibold text-gray-900">Recovery Email</h4>
                                {status.recoveryEmail ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">Set</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full">
                                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                                        <span className="text-xs font-medium text-amber-700">Not Set</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                Used to recover your account if you lose access to your phone
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="bg-white/80 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
                            />
                            <Button
                                onClick={handleSaveEmail}
                                disabled={emailLoading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6"
                            >
                                {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 3. BIOMETRICS */}
                <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-5 h-5 text-gray-700" />
                                <h4 className="font-semibold text-gray-900">Biometric Login</h4>
                                {status.hasBiometrics && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">Enabled</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                Use FaceID or TouchID to login instantly
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {bioLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">
                                    {status.hasBiometrics ? "ON" : "OFF"}
                                </span>
                                <Switch
                                    checked={!!status.hasBiometrics}
                                    onCheckedChange={toggleBiometrics}
                                    disabled={bioLoading}
                                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
