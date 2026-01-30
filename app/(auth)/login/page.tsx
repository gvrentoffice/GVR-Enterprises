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


    const handleWhatsAppLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (method === 'agent') {
                const agent = await getAgentByWhatsApp(whatsappNumber);
                if (agent) {
                    localStorage.setItem('agent_whatsapp_session', JSON.stringify(agent));
                    await createSession(agent.id, 'agent'); // Set session cookie
                    toast({
                        title: "Agent Login Successful",
                        description: `Welcome back, ${agent.name}!`,
                    });
                    setTimeout(() => router.push('/agent'), 1000);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Login Failed",
                        description: "No agent session found with this WhatsApp number.",
                    });
                }
            } else {
                // Customer Login via WhatsApp
                const customer = await getLeadByWhatsApp(whatsappNumber);
                if (customer) {
                    if (!['approved', 'converted'].includes(customer.status)) {
                        // Relaxed check: allow pending but warn? Or strictly duplicate checks.
                        // Keeping logic simple: if existing lead, let them in, access control middleware/components handle price visibility.
                    }
                    localStorage.setItem('customer', JSON.stringify(customer));
                    await createSession(customer.id, 'customer'); // Set session cookie
                    toast({
                        title: "Login Successful",
                        description: "Welcome to Ryth Bazar!",
                    });
                    setTimeout(() => router.push('/shop'), 1000);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Account Not Found",
                        description: "Please contact your agent for access.",
                    });
                }
            }

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred.",
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

            // Check if user is an existing lead
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
                // New Customer / Not Onboarded
                // For now, allow login but with restricted access or redirect to onboarding?
                // Prompt says "customer can access portal".
                // We'll create a session but they won't have a linked Lead ID maybe?
                // Or we deny access? 
                // "they need Agent approval to access prices". 
                // Let's deny if not onboarded for now to keep it strict as per "Account Not Found" logic above.
                // OR we can allow them to enter as a guest?
                // Let's stick to: Must be onboarded.
                toast({
                    variant: "destructive",
                    title: "Account Not Found",
                    description: `No account found for ${email}. Please contact an agent to onboard your shop.`,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Could not sign in with Google.",
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
                await createSession(user.uid, 'admin'); // Set session cookie
                localStorage.setItem('isAdminLoggedIn', 'true');
                toast({
                    title: "Admin Login Successful",
                    description: "Generating secure session...",
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
        <div className="w-full max-w-md mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-purple-200">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ryth Bazar</h1>
                <p className="text-gray-500">Secure Access Portal</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
                {/* Method Switcher */}
                <div className="flex bg-gray-50 p-1 rounded-xl mb-8 relative">
                    <div
                        className="absolute h-[calc(100%-8px)] top-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out border border-gray-100"
                        style={{
                            width: '33.33%',
                            left: method === 'customer' ? '4px' : method === 'agent' ? '33.33%' : 'calc(66.66% - 4px)'
                        }}
                    />
                    {(['customer', 'agent', 'admin'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMethod(m)}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200 capitalize ${method === m ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* Forms */}
                <div className="min-h-[300px]">
                    {method === 'admin' ? (
                        <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1.5">
                                <Label className="text-gray-700 font-medium">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="admin@rythbazar.com"
                                        className="pl-10 h-12 bg-white border-gray-200 focus:border-purple-600 focus:ring-purple-600/20 rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-700 font-medium">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-12 bg-white border-gray-200 focus:border-purple-600 focus:ring-purple-600/20 rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                                disabled={adminLoading}
                            >
                                {adminLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <>
                                        Sign In as Admin
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            {method === 'customer' && (
                                <Button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 flex items-center justify-center gap-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <GoogleIcon />
                                            Sign in with Google
                                        </>
                                    )}
                                </Button>
                            )}

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-medium">Or continue with Number</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <form onSubmit={handleWhatsAppLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-gray-700 font-medium">
                                        {method === 'agent' ? 'Agent Phone Number' : 'WhatsApp Number'}
                                    </Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <Input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="pl-10 h-12 bg-white border-gray-200 focus:border-purple-600 focus:ring-purple-600/20 rounded-xl"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                    <h4 className="font-semibold text-blue-900 text-sm mb-1">
                                        {method === 'agent' ? 'Agent Access' : 'Customer Access'}
                                    </h4>
                                    <p className="text-xs text-blue-700 leading-relaxed opacity-90">
                                        {method === 'agent'
                                            ? 'Enter your registered mobile number to access your dashboard and manage orders.'
                                            : 'Enter your WhatsApp number to browse products and track your orders.'}
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full h-12 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 ${method === 'agent'
                                        ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 text-white'
                                        : 'bg-green-600 hover:bg-green-700 shadow-green-200 text-white'
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            Continue with WhatsApp
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 text-center space-y-4">
                <p className="text-xs text-gray-400">
                    By accessing this portal, you agree to our Terms of Service & Privacy Policy.
                </p>
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
