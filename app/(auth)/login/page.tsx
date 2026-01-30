'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLeadByWhatsApp } from '@/lib/firebase/services/leadService';
import { getAgentByWhatsApp } from '@/lib/firebase/services/agentService';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/app/AuthContext';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Loader2, Phone, ShieldCheck, Mail, Lock, ChevronRight } from 'lucide-react';

type LoginMethod = 'customer' | 'agent' | 'admin';

import { loginWithGoogle } from '@/lib/firebase/auth';
import { createSession } from '@/app/actions/auth';
import { getLeadByEmail } from '@/lib/firebase/services/leadService';
// Wait, Lucide doesn't have Google icon, use custom SVG or text

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
    const initialMethod = (searchParams.get('role') as LoginMethod) || (isStaffMode ? 'agent' : 'customer');

    const { toast } = useToast();
    const { login: adminLogin, loading: adminLoading } = useAuthContext();

    const [method, setMethod] = useState<LoginMethod>(initialMethod);
    const [loading, setLoading] = useState(false);

    // WhatsApp State
    const [whatsappNumber, setWhatsappNumber] = useState('');

    // Admin State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [showOtp, setShowOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

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

    useEffect(() => {
        if (initialMethod) {
            setMethod(initialMethod);
        }
    }, [initialMethod]);


    const setupRecaptcha = () => {
        if (typeof window !== 'undefined' && !(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });
        }
    };

    const handleWhatsAppLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (showOtp) {
                // VERIFY OTP PHASE
                if (!confirmationResult) throw new Error("No confirmation result");
                const result = await confirmationResult.confirm(otpCode);
                const user = result.user;

                let userData = null;
                if (method === 'agent') {
                    userData = await getAgentByWhatsApp(whatsappNumber);
                } else {
                    userData = await getLeadByWhatsApp(whatsappNumber);
                }

                if (userData) {
                    if (method === 'agent') {
                        localStorage.setItem('agent_whatsapp_session', JSON.stringify(userData));
                        await createSession(userData.id, 'agent');
                    } else {
                        localStorage.setItem('customer', JSON.stringify(userData));
                        await createSession(userData.id, 'customer');
                    }
                    toast({
                        title: "Login Successful",
                        description: "Identity verified. Redirecting...",
                    });
                    router.push(method === 'agent' ? '/agent' : '/shop');
                } else {
                    toast({
                        variant: "destructive",
                        title: "Account Missing",
                        description: "Identity verified but no linked account found.",
                    });
                }
                return;
            }

            // SEND OTP PHASE
            let userData = null;
            if (method === 'agent') {
                userData = await getAgentByWhatsApp(whatsappNumber);
            } else {
                userData = await getLeadByWhatsApp(whatsappNumber);
            }

            if (!userData) {
                toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: "This number is not registered. Please contact an agent.",
                });
                setLoading(false);
                return;
            }

            setupRecaptcha();
            const appVerifier = (window as any).recaptchaVerifier;
            const formattedNumber = whatsappNumber.startsWith('+') ? whatsappNumber : `+91${whatsappNumber}`;

            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            setShowOtp(true);
            toast({
                title: "OTP Sent",
                description: `A code has been sent to ${formattedNumber}`,
            });

        } catch (error: any) {
            console.error('OTP Error:', error);
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error.message || "Could not send OTP.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const firebaseUser = await loginWithGoogle();
            const email = firebaseUser.email;

            if (!email) throw new Error("No email provided by Google");

            const customer = await getLeadByEmail(email);

            if (customer) {
                localStorage.setItem('customer', JSON.stringify(customer));
                await createSession(customer.id, 'customer');
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${customer.shopName}!`,
                });
                router.push('/shop');
            } else {
                toast({
                    variant: "destructive",
                    title: "Account Not Onboarded",
                    description: `The email ${email} is not linked to any shop. Please contact an agent.`,
                });
                await logoutUser(); // Clean up if not onboarded
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
        <div className="min-h-screen flex flex-col justify-center bg-gray-50/50">
            <div className="w-full max-w-[420px] mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-indigo-100">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Ryth Bazar</h1>
                    <p className="text-sm text-gray-500">Secure Access Portal</p>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-5 md:p-8">
                    {/* Method Switcher */}
                    <div className="flex bg-gray-100/80 p-1 rounded-2xl mb-6 relative">
                        <div
                            className="absolute h-[calc(100%-8px)] top-1 bg-white rounded-xl shadow-sm transition-all duration-300 ease-out"
                            style={{
                                width: '33.33%',
                                left: method === 'customer' ? '4px' : method === 'agent' ? '33.33%' : 'calc(66.66% - 4px)'
                            }}
                        />
                        {(['customer', 'agent', 'admin'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setMethod(m);
                                    setShowOtp(false);
                                }}
                                className={`flex-1 relative z-10 py-2.5 text-xs font-semibold transition-colors duration-200 capitalize ${method === m ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[320px]">
                        {method === 'admin' ? (
                            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="admin@rythbazar.com"
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all rounded-2xl"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all rounded-2xl"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-lg shadow-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] mt-6"
                                    disabled={adminLoading}
                                >
                                    {adminLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In as Admin"}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                                {method === 'customer' && !showOtp && (
                                    <Button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full h-14 bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-gray-700 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 font-semibold"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <GoogleIcon />
                                                Continue with Google
                                            </>
                                        )}
                                    </Button>
                                )}

                                {!showOtp && (
                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-gray-100"></div>
                                        <span className="flex-shrink-0 mx-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest">Or use phone number</span>
                                        <div className="flex-grow border-t border-gray-100"></div>
                                    </div>
                                )}

                                <form onSubmit={handleWhatsAppLogin} className="space-y-4">
                                    {!showOtp ? (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                                                {method === 'agent' ? 'Agent Mobile' : 'WhatsApp Number'}
                                            </Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <Input
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all rounded-2xl"
                                                    value={whatsappNumber}
                                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 ml-1 mt-2">
                                                We will verify your number before granting access.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 slide-in-from-bottom-2 animate-in duration-300">
                                            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">Enter Verification Code</Label>
                                            <Input
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="h-14 bg-gray-50/50 border-gray-200 text-center text-2xl tracking-[1em] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all rounded-2xl"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                required
                                            />
                                            <Button variant="link" size="sm" onClick={() => setShowOtp(false)} className="text-xs text-indigo-600 p-0 h-auto">
                                                Change number
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className={`w-full h-14 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] font-bold text-white mt-2 ${method === 'agent'
                                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                                            }`}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            showOtp ? "Verify & Log In" : "Get OTP via SMS"
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-400 px-8 leading-relaxed">
                    By accessing Ryth Bazar, you agree to our <span className="underline decoration-indigo-200 text-gray-500">Terms</span> and <span className="underline decoration-indigo-200 text-gray-500">Privacy Policy</span>.
                </p>
            </div>
            <div id="recaptcha-container"></div>
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
