'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLeadByWhatsApp, createLeadFromGoogleSignIn, getLeadByEmail } from '@/lib/firebase/services/leadService';
import { getAgentByWhatsApp, createAgent } from '@/lib/firebase/services/agentService';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/app/AuthContext';
import { auth } from '@/lib/firebase/config';
import { Loader2, Phone, Mail, Lock } from 'lucide-react';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '@/lib/firebase/auth';
import { createSession } from '@/app/actions/auth';
import { WhatsAppNumberModal } from '@/components/auth/WhatsAppNumberModal';

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

    // WhatsApp State
    const [whatsappNumber, setWhatsappNumber] = useState('');

    // Admin State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [showOtp, setShowOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // WhatsApp Modal State for Google Sign-In
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [pendingGoogleUser, setPendingGoogleUser] = useState<{
        email: string;
        displayName: string;
        photoURL?: string;
    } | null>(null);

    // Auto-redirect if already logged in
    useEffect(() => {
        const adminSession = localStorage.getItem('isAdminLoggedIn');
        if (adminSession === 'true') {
            router.push('/admin');
            return;
        }

        const agentSession = localStorage.getItem('agent_whatsapp_session');
        if (agentSession) {
            router.push('/agent');
            return;
        }

        const customerSession = localStorage.getItem('customer');
        if (customerSession) {
            router.push('/shop');
            return;
        }
    }, [router]);

    const setupRecaptcha = () => {
        const win = window as unknown as { recaptchaVerifier: RecaptchaVerifier | null };
        if (typeof window !== 'undefined' && !win.recaptchaVerifier) {
            win.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });
        }
    };

    const handleWhatsAppLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Normalize phone number
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            const normalizedNumber = cleanNumber.startsWith('91') && cleanNumber.length > 10
                ? cleanNumber.slice(2)
                : cleanNumber;

            const formattedNumber = `+91${normalizedNumber}`;

            // CONSTANTS
            const REGISTERED_AGENT = '7676739800';
            const REGISTERED_ADMIN = '8050181994';

            // 1. CHECK HARDCODED NUMBERS (Bypass OTP)
            if (!showOtp) {
                if (normalizedNumber === REGISTERED_ADMIN) {
                    toast({
                        title: "Admin Verified",
                        description: "Logging in as Administrator...",
                    });
                    await createSession('admin-user-id', 'admin');
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    router.push('/admin');
                    setLoading(false);
                    return;
                }

                if (normalizedNumber === REGISTERED_AGENT) {
                    // Auto-ensure agent exists
                    let agentData = await getAgentByWhatsApp(formattedNumber);
                    if (!agentData) {
                        try {
                            const newId = await createAgent({
                                userId: `auth-agent-${normalizedNumber}`,
                                name: "Verified Agent",
                                whatsappNumber: formattedNumber,
                                employeeId: `AGT-${normalizedNumber.slice(-4)}`,
                                territory: ["General Territory"],
                                targetSales: 100000,
                                status: "active",
                                performance: { currentSales: 0, monthlySales: 0, tasksCompleted: 0, leadsGenerated: 0 }
                            });
                            agentData = {
                                id: newId,
                                userId: `auth-agent-${normalizedNumber}`,
                                name: "Verified Agent",
                                whatsappNumber: formattedNumber,
                                employeeId: `AGT-${normalizedNumber.slice(-4)}`,
                                territory: ["General Territory"],
                                targetSales: 100000,
                                status: "active",
                                tenantId: 'ryth-bazar',
                                createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                                updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                            };
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    if (agentData) {
                        localStorage.setItem('agent_whatsapp_session', JSON.stringify(agentData));
                        await createSession(agentData.id, 'agent');
                        toast({ title: "Welcome Back", description: "Logged in as Agent" });
                        router.push('/agent');
                    }
                    setLoading(false);
                    return;
                }

                // 2. CHECK DATABASE FOR EXISTING USERS (Bypass OTP per request)
                // Check Agent
                let existingAgent = await getAgentByWhatsApp(formattedNumber);
                if (!existingAgent) {
                    existingAgent = await getAgentByWhatsApp(normalizedNumber);
                }

                if (existingAgent) {
                    localStorage.setItem('agent_whatsapp_session', JSON.stringify(existingAgent));
                    await createSession(existingAgent.id, 'agent');
                    toast({ title: "Welcome Back", description: "Logged in as Agent" });
                    router.push('/agent');
                    setLoading(false);
                    return;
                }

                // Check Customer
                let existingLead = await getLeadByWhatsApp(formattedNumber);
                if (!existingLead) {
                    existingLead = await getLeadByWhatsApp(normalizedNumber);
                }

                if (existingLead) {
                    localStorage.setItem('customer', JSON.stringify(existingLead));
                    await createSession(existingLead.id, 'customer');
                    toast({ title: "Welcome Back", description: "Logged in as Customer" });
                    router.push('/shop');
                    setLoading(false);
                    return;
                }
            }

            // 3. IF UNKNOWN -> SEND OTP (New Registration)
            if (showOtp) {
                // VERIFY OTP PHASE
                if (!confirmationResult) throw new Error("No confirmation result");
                await confirmationResult.confirm(otpCode);

                // Note: user is already signed in to Firebase Auth here.

                await createLeadFromGoogleSignIn(
                    `user${normalizedNumber}@rythbazar.com`, // Placeholder email
                    `User ${normalizedNumber}`, // Placeholder name
                    formattedNumber,
                    ""
                );
                // Fetch it back
                const newLead = await getLeadByWhatsApp(formattedNumber);
                if (newLead) {
                    localStorage.setItem('customer', JSON.stringify(newLead));
                    await createSession(newLead.id, 'customer');
                    toast({ title: "Welcome!", description: "Account created successfully." });
                    router.push('/shop');
                }
                return;
            }

            // SEND OTP PHASE
            setupRecaptcha();
            const appVerifier = (window as unknown as { recaptchaVerifier: RecaptchaVerifier }).recaptchaVerifier;

            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            setShowOtp(true);
            toast({
                title: "OTP Sent",
                description: `Verification code sent to ${formattedNumber}`,
            });

        } catch (error) {
            const err = error as Error;
            console.error('Login Error:', err);
            const win = window as unknown as { recaptchaVerifier: RecaptchaVerifier | null };
            if (win.recaptchaVerifier) {
                win.recaptchaVerifier.clear();
                win.recaptchaVerifier = null;
            }
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: err.message || "Could not verify number.",
            });
            setLoading(false);
        }
    };

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
                localStorage.setItem('customer', JSON.stringify(customer));
                await createSession(customer.id, 'customer');
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${customer.shopName}!`,
                });
                router.push('/shop');
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
                localStorage.setItem('customer', JSON.stringify(newCustomer));
                await createSession(newCustomer.id, 'customer');

                setShowWhatsAppModal(false);
                setPendingGoogleUser(null);

                toast({
                    title: "Registration Successful",
                    description: "You can browse products. Dealer prices will be visible after approval.",
                });
                router.push('/shop');
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
        <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            <div className="w-full max-w-[440px] mx-auto px-4 py-8">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        {/* Outer glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/40 to-orange-500/40 rounded-[28px] blur-2xl"></div>

                        {/* Logo container */}
                        <div className="relative w-32 h-32 bg-white rounded-[28px] overflow-hidden shadow-2xl shadow-orange-500/30 ring-4 ring-white/50 transform hover:scale-105 transition-transform duration-300">
                            <img
                                src="/apple-icon.png"
                                alt="Ryth Bazar Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ryth Bazar</h1>
                    <p className="text-sm text-gray-600">Sign in to continue</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8 space-y-6">

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
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all rounded-2xl text-base"
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
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all rounded-2xl text-base"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
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
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sign in with Mobile Number</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                </div>

                                <form onSubmit={handleWhatsAppLogin} className="space-y-4">
                                    {!showOtp ? (
                                        <div className="space-y-3">
                                            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">
                                                Mobile Number
                                            </Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                <Input
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all rounded-2xl text-base"
                                                    value={whatsappNumber}
                                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 ml-1">
                                                We'll detect your account type automatically
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">
                                                Enter Verification Code
                                            </Label>
                                            <Input
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="h-16 bg-gray-50/50 border-gray-200 text-center text-3xl tracking-[0.5em] font-bold focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all rounded-2xl"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                required
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={() => setShowOtp(false)}
                                                className="text-xs text-emerald-600 p-0 h-auto hover:bg-transparent hover:underline"
                                            >
                                                ← Change number
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : showOtp ? (
                                            "Verify & Sign In"
                                        ) : (
                                            "Continue"
                                        )}
                                    </Button>
                                </form>
                            </div>

                            {/* Divider */}
                            {!showOtp && (
                                <div className="relative flex py-3 items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-xs text-gray-400 uppercase font-semibold tracking-wider">Or</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>
                            )}

                            {/* Google Sign-In Section */}
                            {!showOtp && (
                                <div className="space-y-4">
                                    <Button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full h-14 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-2xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-semibold text-base"
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
                            {!showOtp && (
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
                <div id="recaptcha-container"></div>

                {/* WhatsApp Number Modal for Google Sign-In */}
                <WhatsAppNumberModal
                    isOpen={showWhatsAppModal}
                    onSubmit={handleWhatsAppSubmit}
                    onCancel={handleWhatsAppCancel}
                    loading={loading}
                />
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
