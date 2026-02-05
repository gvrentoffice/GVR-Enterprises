'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLeadByWhatsApp, createLeadFromGoogleSignIn, getLeadByEmail } from '@/lib/firebase/services/leadService';
import { getAgentByWhatsApp } from '@/lib/firebase/services/agentService';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/app/AuthContext';
import { auth } from '@/lib/firebase/config';
import { Loader2, Phone, Mail, Lock } from 'lucide-react';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '@/lib/firebase/auth';
import { createSession } from '@/app/actions/auth';
import { WhatsAppNumberModal } from '@/components/auth/WhatsAppNumberModal';
import { SecuritySetupModal } from '@/components/auth/SecuritySetupModal';
import { MpinSetupModal } from '@/components/auth/MpinSetupModal';
import { checkAuthMethodsAction, verifyPasswordAction, getWebAuthnLoginOptionsAction, verifyWebAuthnLoginAction } from '@/app/actions/security';
import { checkMpinStatusAction } from '@/app/actions/mpin';
import { startAuthentication } from '@simplewebauthn/browser';

// Helper for Google Icon
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isStaffMode = searchParams.get('mode') === 'staff';

    const { toast } = useToast();
    const { login: adminLogin, loading: adminLoading } = useAuthContext();

    const [loading, setLoading] = useState(false);

    // Auth State
    const [authStage, setAuthStage] = useState<'phone' | 'password' | 'otp' | 'otp-verify'>('phone');
    // unused: const [authMethod, setAuthMethod] = useState<'password' | 'biometric'>('password');
    const [userAuthData, setUserAuthData] = useState<{
        userId: string;
        userType: 'agent' | 'customer';
        hasPassword?: boolean;
        hasBiometrics?: boolean;
        authPreferences?: any;
    } | null>(null);

    // Inputs
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [email, setEmail] = useState(''); // Added for Admin Login

    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Security Setup Modal State
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [securityModalData, setSecurityModalData] = useState<{
        userId: string;
        userType: 'agent' | 'customer';
        userName: string;
        missingFeatures: {
            password: boolean;
            recoveryEmail: boolean;
            biometrics: boolean;
        }
    } | null>(null);


    // WhatsApp Modal State for Google Sign-In
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [pendingGoogleUser, setPendingGoogleUser] = useState<{
        email: string;
        displayName: string;
        photoURL?: string;
    } | null>(null);

    // MPIN Setup Modal State
    const [showMpinModal, setShowMpinModal] = useState(false);
    const [mpinModalData, setMpinModalData] = useState<{
        userId: string;
        userType: 'agent' | 'customer';
        userName: string;
    } | null>(null);

    // Auto-redirect if already logged in
    useEffect(() => {
        // Removed Admin redirection to allow dual login (Admin + Customer)
        // const adminSession = localStorage.getItem('isAdminLoggedIn');
        // if (adminSession === 'true') {
        //     router.push('/admin');
        //     return;
        // }

        // Removed Agent redirection to allow dual login (Agent + Customer)
        // const agentSession = localStorage.getItem('agent_whatsapp_session');
        // if (agentSession) {
        //     router.push('/agent');
        //     return;
        // }

        const customerSession = localStorage.getItem('customer');
        if (customerSession) {
            router.push('/shop');
            return;
        }
    }, [router]);

    // Cleanup Recaptcha on unmount
    useEffect(() => {
        return () => {
            const win = window as unknown as { recaptchaVerifier: RecaptchaVerifier | null };
            if (win?.recaptchaVerifier) {
                try {
                    win.recaptchaVerifier.clear();
                    win.recaptchaVerifier = null;
                } catch (e) {
                    console.warn("Recaptcha cleanup error", e);
                }
            }
        };
    }, []);

    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    const setupRecaptcha = () => {
        if (typeof window === 'undefined') return;
        const win = window as any;

        if (win.recaptchaVerifier) return;

        try {
            const container = document.getElementById('recaptcha-container');
            if (container) container.innerHTML = '';

            win.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });
            console.log("Recaptcha initialized (invisible)");
        } catch (error) {
            console.error("Recaptcha Setup Error:", error);
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Normalize phone number
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            const normalizedNumber = cleanNumber.startsWith('91') && cleanNumber.length > 10
                ? cleanNumber.slice(2)
                : cleanNumber;
            const formattedNumber = `+91${normalizedNumber}`;

            // CHECK USER AUTH METHODS via Server Action
            // Pass the RAW clean number to the server, let the server handle formats
            console.log("Checking auth methods for:", cleanNumber);
            const methods = await checkAuthMethodsAction(cleanNumber);
            console.log("Auth methods Check Result:", methods);

            if (methods.exists && methods.userId && methods.userType) {
                // Determine preferred method
                const preferences = methods.authPreferences || {};
                const canUsePassword = methods.hasPassword && preferences.enablePasswordLogin !== false;
                // const canUseBiometrics = methods.hasBiometrics && preferences.enableBiometricLogin !== false;

                setUserAuthData({
                    userId: methods.userId,
                    userType: methods.userType,
                    hasPassword: methods.hasPassword,
                    hasBiometrics: methods.hasBiometrics,
                    authPreferences: methods.authPreferences
                });

                if (canUsePassword) {
                    setAuthStage('password');
                    setLoading(false);
                    return;
                }

                // If biometric only, maybe auto-trigger? For now, fallback to OTP if no password
            }

            // 3. FALLBACK TO OTP (New User or No Password)
            await sendOtp(formattedNumber);

        } catch (error) {
            console.error('Phone Check Error:', error);
            toast({ variant: "destructive", title: "Error", description: "Something went wrong. Please try again." });
            setLoading(false);
        }
    };

    const sendOtp = async (formattedNumber: string) => {
        try {
            setupRecaptcha();
            const appVerifier = (window as unknown as { recaptchaVerifier: RecaptchaVerifier }).recaptchaVerifier;

            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            setAuthStage('otp-verify');
            toast({
                title: "OTP Sent",
                description: `Verification code sent to ${formattedNumber}`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.code === 'auth/invalid-app-credential'
                    ? "Configuration Error: authorized domain missing or invalid credentials."
                    : (error.message || "Could not verify number."),
            });
            // Clear recaptcha
            try {
                const win = window as unknown as { recaptchaVerifier: RecaptchaVerifier | null };
                if (win?.recaptchaVerifier) {
                    win.recaptchaVerifier.clear();
                    win.recaptchaVerifier = null;
                }
            } catch (e) {
                console.warn("Recaptcha clear error", e);
            }
        } finally {
            setLoading(false);
        }
    }

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAuthData) return;
        setLoading(true);

        try {
            const isValid = await verifyPasswordAction(userAuthData.userId, userAuthData.userType, password);
            if (isValid) {
                await handleSuccessfulLogin(userAuthData.userId, userAuthData.userType);
            } else {
                toast({ variant: "destructive", title: "Incorrect Password", description: "Please try again or login with OTP." });
            }
        } catch (error) {
            console.error("Password Login Error", error);
            toast({ variant: "destructive", title: "Error", description: "Could not verify password." });
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        if (!userAuthData) return;
        setLoading(true);
        try {
            const options = await getWebAuthnLoginOptionsAction(userAuthData.userId, userAuthData.userType);
            const asseResp = await startAuthentication(options);

            const verification = await verifyWebAuthnLoginAction(
                userAuthData.userId,
                userAuthData.userType,
                asseResp,
                options.challenge
            );

            if (verification) {
                await handleSuccessfulLogin(userAuthData.userId, userAuthData.userType);
            } else {
                toast({ variant: "destructive", title: "Failed", description: "Biometric verification failed." });
            }
        } catch (error) {
            console.error("Biometric Error", error);
            toast({ variant: "destructive", title: "Error", description: "Biometric login failed." });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!confirmationResult) throw new Error("No confirmation result");
            await confirmationResult.confirm(otpCode);

            // Fetch user to confirm existence/create new
            // Normalize phone number
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            const normalizedNumber = cleanNumber.startsWith('91') && cleanNumber.length > 10
                ? cleanNumber.slice(2)
                : cleanNumber;
            const formattedNumber = `+91${normalizedNumber}`;

            // Check Agent
            let existingAgent = await getAgentByWhatsApp(formattedNumber);
            if (!existingAgent) existingAgent = await getAgentByWhatsApp(normalizedNumber);

            if (existingAgent) {
                await handleSuccessfulLogin(existingAgent.id, 'agent', existingAgent);
                return;
            }

            // Check Customer
            let existingLead = await getLeadByWhatsApp(formattedNumber);
            if (!existingLead) existingLead = await getLeadByWhatsApp(normalizedNumber);

            if (existingLead) {
                await handleSuccessfulLogin(existingLead.id, 'customer', existingLead);
                return;
            }

            // New User
            await createLeadFromGoogleSignIn(
                `user${normalizedNumber}@rythbazar.com`,
                `User ${normalizedNumber}`,
                formattedNumber,
                ""
            );
            const newLead = await getLeadByWhatsApp(formattedNumber);
            if (newLead) {
                await handleSuccessfulLogin(newLead.id, 'customer', newLead, true); // Mark as new user
            }

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Invalid Code",
                description: "The verification code is incorrect.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessfulLogin = async (userId: string, role: string, userData?: any, isNewUser: boolean = false) => {
        // Create Session
        await createSession(userId, role);

        let finalUserData = userData;
        const storageData = finalUserData || { id: userId };
        if (role === 'agent') {
            localStorage.setItem('agent_whatsapp_session', JSON.stringify(storageData));
        } else {
            localStorage.setItem('customer', JSON.stringify(storageData));
        }

        // --- CHECK MPIN STATUS FOR NEW USERS ---
        if (isNewUser && (role === 'agent' || role === 'customer')) {
            try {
                const hasMpin = await checkMpinStatusAction(userId, role);

                if (!hasMpin) {
                    // Show MPIN setup modal for new users
                    setMpinModalData({
                        userId: userId,
                        userType: role as 'agent' | 'customer',
                        userName: finalUserData?.shopName || finalUserData?.name || 'User'
                    });
                    setShowMpinModal(true);
                    // Don't route yet
                    return;
                }
            } catch (e) {
                console.warn("Failed to check MPIN status", e);
            }
        }

        // --- CHECK SECURITY STATUS FOR EXISTING USERS ---
        if (!isNewUser) {
            let checkNumber = whatsappNumber;
            if (!checkNumber && finalUserData?.whatsappNumber) checkNumber = finalUserData.whatsappNumber;

            if (checkNumber) {
                const cleanNumber = checkNumber.replace(/\D/g, '');
                const formattedNumber = `+91${cleanNumber.startsWith('91') ? cleanNumber.slice(2) : cleanNumber}`;

                try {
                    const methods = await checkAuthMethodsAction(formattedNumber);

                    const missingPassword = !methods.hasPassword;
                    const missingBiometrics = !methods.hasBiometrics;
                    const missingRecovery = !methods.recoveryEmail;

                    // If any feature is missing, show the modal
                    if (missingPassword || missingBiometrics || missingRecovery) {
                        setSecurityModalData({
                            userId: userId,
                            userType: role as 'agent' | 'customer',
                            userName: finalUserData?.shopName || finalUserData?.name || 'User',
                            missingFeatures: {
                                password: missingPassword,
                                recoveryEmail: missingRecovery,
                                biometrics: missingBiometrics
                            }
                        });
                        setShowSecurityModal(true);
                        // Don't route yet
                        return;
                    }

                } catch (e) {
                    console.warn("Failed to check security status on login", e);
                }
            }
        }

        toast({ title: "Login Successful", description: `Welcome back!` });

        if (role === 'agent') router.push('/agent');
        else router.push('/shop');
    }

    const handleSecurityModalClose = () => {
        setShowSecurityModal(false);
        // Redirect after modal close
        const role = securityModalData?.userType;
        if (role === 'agent') router.push('/agent');
        else router.push('/shop');
    }

    const handleMpinModalClose = () => {
        setShowMpinModal(false);
        // Redirect after modal close
        const role = mpinModalData?.userType;
        if (role === 'agent') router.push('/agent');
        else router.push('/shop');
    }

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const firebaseUser = await loginWithGoogle();
            const email = firebaseUser.email;
            const displayName = firebaseUser.displayName || 'Customer';
            const photoURL = firebaseUser.photoURL || undefined;

            if (!email) throw new Error("No email provided by Google");

            // Check if customer already exists
            const customer = await getLeadByEmail(email);

            if (customer) {
                // Existing customer - log them in
                // Use unified success handler which checks for security setup
                await handleSuccessfulLogin(customer.id, 'customer', customer);
            } else {
                // New customer - collect WhatsApp number
                setPendingGoogleUser({ email, displayName, photoURL });
                setShowWhatsAppModal(true);
            }
        } catch (error) {
            console.error('Google Login Error:', error);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Make sure your domain is authorized in Firebase Console.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppSubmit = async (whatsappNumber: string) => {
        if (!pendingGoogleUser) return;

        setLoading(true);
        try {
            // Normalize WhatsApp number to +91XXXXXXXXXX format
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            const normalizedNumber = cleanNumber.startsWith('91')
                ? `+${cleanNumber}`
                : `+91${cleanNumber}`;

            // Create new lead with pending approval
            await createLeadFromGoogleSignIn(
                pendingGoogleUser.email,
                pendingGoogleUser.displayName,
                normalizedNumber,
                pendingGoogleUser.photoURL
            );

            // Fetch the newly created lead
            const newCustomer = await getLeadByEmail(pendingGoogleUser.email);

            if (newCustomer) {
                setShowWhatsAppModal(false);
                setPendingGoogleUser(null);

                // Use unified success handler
                await handleSuccessfulLogin(newCustomer.id, 'customer', newCustomer);
            }
        } catch (error) {
            console.error('WhatsApp submission error:', error);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "Could not complete registration. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppCancel = async () => {
        setShowWhatsAppModal(false);
        setPendingGoogleUser(null);
        await logoutUser(); // Sign out from Google
        toast({
            title: "Registration Cancelled",
            description: "You have been signed out.",
        });
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await adminLogin(email, password);
            if (user) {
                await createSession(user.uid, 'admin');
                localStorage.setItem('isAdminLoggedIn', 'true');
                toast({
                    title: "Admin Login Successful",
                    description: "Accessing dashboard...",
                });
                setTimeout(() => router.push('/admin'), 1000);
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: "Invalid credentials.",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-zinc-50 via-amber-50/30 to-orange-50/20">
            <div className="w-full max-w-[440px] mx-auto px-4 py-4 md:py-8">
                {/* Logo Section */}
                <div className="text-center mb-6 pt-[10px]">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6">
                        {/* Outer glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/40 to-orange-500/40 rounded-[28px] blur-2xl"></div>

                        {/* Logo container */}
                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-[20px] md:rounded-[28px] overflow-hidden shadow-2xl shadow-orange-500/30 ring-4 ring-white/50 transform hover:scale-105 transition-transform duration-300">
                            <img
                                src="/apple-icon.png"
                                alt="Ryth Bazar Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ryth Bazar</h1>
                    <p className="text-sm text-gray-600">Sign in to continue</p>
                </div>

                {/* Login Card */}
                <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-2xl shadow-amber-500/10 rounded-3xl p-5 md:p-8 space-y-6">

                    {isStaffMode ? (
                        /* Admin Login */
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Staff Login</h2>
                                <p className="text-sm text-gray-600">Admin and Agent access only</p>
                            </div>

                            <form onSubmit={handleAdminLogin} className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">
                                        Email Address
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="admin@rythbazar.com"
                                            className="pl-12 h-12 md:h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all rounded-2xl text-base"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">
                                        Password
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-12 h-12 md:h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all rounded-2xl text-base"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 md:h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
                                    disabled={adminLoading}
                                >
                                    {adminLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In as Admin"}
                                </Button>
                            </form>
                            {/* Back to Customer Login */}
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => router.push('/login')}
                                    className="w-full text-center text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    ← Back to Customer Login
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Unified Login content */
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {authStage === 'password' ? 'Enter Password' :
                                            authStage === 'otp-verify' ? 'Verify OTP' :
                                                'Sign in with Mobile Number'}
                                    </span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                </div>

                                {/* FORM SWITCHER */}
                                {authStage === 'phone' && (
                                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                <Input
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    className="pl-12 h-12 md:h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all rounded-2xl text-base"
                                                    value={whatsappNumber}
                                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 ml-1">
                                                We'll check if you have an account
                                            </p>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                                        </Button>
                                    </form>
                                )}

                                {authStage === 'password' && (
                                    <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    className="pl-12 h-12 md:h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all rounded-2xl text-base"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    autoFocus
                                                    required
                                                />
                                            </div>
                                            {userAuthData?.hasBiometrics && (
                                                <div className="text-center">
                                                    <Button variant="ghost" type="button" onClick={handleBiometricLogin} className="text-emerald-600">
                                                        Use Biometrics / FaceID instead
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                                        </Button>
                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Fallback to OTP
                                                    sendOtp(`+91${whatsappNumber.replace(/\D/g, '').slice(-10)}`);
                                                }}
                                                className="text-xs text-gray-500 hover:text-gray-800 underline"
                                            >
                                                Forgot Password? Login with OTP
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {authStage === 'otp-verify' && (
                                    <form onSubmit={handleOtpVerify} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">
                                                Enter Verification Code
                                            </Label>
                                            <Input
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="h-16 bg-gray-50/50 border-gray-200 text-center text-3xl tracking-[0.25em] md:tracking-[0.5em] font-bold focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all rounded-2xl"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                required
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={() => setAuthStage('phone')}
                                                className="text-xs text-emerald-600 p-0 h-auto hover:bg-transparent hover:underline"
                                            >
                                                ← Change number
                                            </Button>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                                        </Button>
                                    </form>
                                )}
                            </div>

                            {/* Divider */}
                            {authStage === 'phone' && (
                                <div className="relative flex py-3 items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-xs text-gray-400 uppercase font-semibold tracking-wider">Or</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>
                            )}

                            {/* Google Sign-In Section */}
                            {authStage === 'phone' && (
                                <div className="space-y-4">
                                    <Button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full h-12 md:h-14 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-2xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-semibold text-base"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <GoogleIcon />
                                                Continue with Google
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-gray-500 leading-relaxed">
                                        By signing in, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </div>
                            )}

                            {/* Staff Login Link */}
                            {authStage === 'phone' && (
                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/login?mode=staff')}
                                        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                                    >
                                        Staff Login
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* reCAPTCHA */}
                <div ref={recaptchaContainerRef} id="recaptcha-container"></div>

                {/* WhatsApp Number Modal for Google Sign-In */}
                <WhatsAppNumberModal
                    isOpen={showWhatsAppModal}
                    onSubmit={handleWhatsAppSubmit}
                    onCancel={handleWhatsAppCancel}
                    loading={loading}
                />

                {/* Security Setup Modal */}
                {showSecurityModal && securityModalData && (
                    <SecuritySetupModal
                        isOpen={showSecurityModal}
                        onClose={handleSecurityModalClose}
                        userId={securityModalData.userId}
                        userType={securityModalData.userType}
                        userName={securityModalData.userName}
                        missingFeatures={securityModalData.missingFeatures}
                    />
                )}

                {/* MPIN Setup Modal */}
                {showMpinModal && mpinModalData && (
                    <MpinSetupModal
                        isOpen={showMpinModal}
                        onClose={handleMpinModalClose}
                        userId={mpinModalData.userId}
                        userType={mpinModalData.userType}
                        userName={mpinModalData.userName}
                    />
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
