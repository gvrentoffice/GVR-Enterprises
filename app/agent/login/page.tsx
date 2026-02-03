'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone } from 'lucide-react';
import { verifyAgentAction } from '@/app/actions/agentAuth';
import { createSession } from '@/app/actions/auth';

export default function AgentLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Verify agent credentials
            const result = await verifyAgentAction(phoneNumber);

            if (result.success && result.agentId && result.agent) {
                // Clear any existing sessions first to prevent conflicts
                // await deleteSession('admin');
                // await deleteSession('customer');

                // Create agent session
                await createSession(result.agentId, 'agent');

                // Store full agent data in localStorage for useAgent hook
                localStorage.setItem('agent_whatsapp_session', JSON.stringify(result.agent));
                localStorage.setItem('isAgentLoggedIn', 'true');
                localStorage.setItem('agentId', result.agentId);

                toast({
                    title: "Agent Login Successful",
                    description: `Welcome back, ${result.agent.name}!`,
                });

                // Redirect to agent dashboard
                router.push('/agent');
            } else {
                toast({
                    title: "Login Failed",
                    description: result.error || "Invalid phone number",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Error",
                description: "An error occurred during login",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-[#F5F3EF]">
            <div className="w-full max-w-[440px] mx-auto px-4 py-8">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="relative w-28 h-28 mx-auto mb-6">
                        <div className="w-28 h-28 bg-[#F5A623] rounded-[24px] overflow-hidden shadow-lg">
                            <img
                                src="/apple-icon.png"
                                alt="GVR's Ryth Bazar Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Agent Portal</h1>
                    <p className="text-sm text-gray-600">Sign in to continue</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
                    <div className="text-center mb-2">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sign in with mobile number</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                WhatsApp Number
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="pl-12 h-14 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all rounded-xl text-base"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                We'll check if you have an account
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all hover:shadow-lg font-semibold text-base"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">OR</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-14 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-base"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            Need help? Contact your administrator
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
