'use client';

import {
    User,
    Mail,
    Phone,
    BadgeCheck,
    Building2,
    Target,
    ChevronLeft,
    LogOut,
    Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAgent } from '@/hooks/useAgent';
import { useAuthContext } from '@/app/AuthContext';
import { deleteSession } from '@/app/actions/auth';
import { SecuritySettings } from '@/components/auth/SecuritySettings';

export default function AgentProfilePage() {
    const { user } = useAuthContext();
    const { agent } = useAgent();

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-red-50/50 pb-20 sm:pb-24">
            <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <Link href="/agent">
                        <Button variant="ghost" className="rounded-full hover:bg-white/80 h-10 sm:h-auto px-3 sm:px-4">
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={async () => {
                        await deleteSession();
                        localStorage.removeItem('agent_whatsapp_session');
                        window.location.href = '/agent/login';
                    }} className="text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50 rounded-xl h-10 sm:h-auto px-3 sm:px-4">
                        <LogOut className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>

                {/* Profile Hero */}
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl shadow-orange-500/10 border border-white/50 flex flex-col md:flex-row items-center gap-4 sm:gap-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-white shadow-lg">
                        <User className="w-12 h-12 sm:w-16 sm:h-16" />
                    </div>
                    <div className="text-center md:text-left flex-1 w-full">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{user?.displayName || 'Agent Name'}</h1>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none uppercase text-[9px] sm:text-[10px] font-black tracking-widest px-2 sm:px-3 py-1">
                                Sales Agent
                            </Badge>
                        </div>
                        <p className="text-gray-500 font-medium text-base sm:text-lg flex items-center justify-center md:justify-start gap-2 mb-3 sm:mb-4">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                            ID: {agent?.employeeId || 'EMP101'}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="truncate max-w-[150px] sm:max-w-none">{user?.email}</span>
                            </div>
                            {user?.phoneNumber && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium">
                                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {user.phoneNumber}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Agent Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="backdrop-blur-xl bg-white/70 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 border border-white/50 shadow-xl shadow-orange-500/10 flex flex-col gap-3 sm:gap-4">
                        <CardHeader className="p-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2">
                                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-bold">Sales & Targets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-50">
                                <span className="text-sm sm:text-base text-gray-500 font-medium">Monthly Target</span>
                                <span className="text-sm sm:text-base font-bold text-gray-900">₹{(agent?.targetSales || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 sm:py-3">
                                <span className="text-sm sm:text-base text-gray-500 font-medium">Current Status</span>
                                <Badge className={agent?.status === 'active' ? 'bg-green-100 text-green-700 border-none text-xs' : 'bg-gray-100 text-gray-600 border-none text-xs'}>
                                    {agent?.status === 'active' ? 'Active Duty' : 'Offline'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-xl bg-white/70 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 border border-white/50 shadow-xl shadow-orange-500/10 flex flex-col gap-3 sm:gap-4">
                        <CardHeader className="p-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-bold">Territory Info</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-3 sm:space-y-4">
                            <div className="flex flex-wrap gap-2 pt-2">
                                {agent?.territory?.length ? agent.territory.map((t, i) => (
                                    <Badge key={i} variant="secondary" className="rounded-xl px-3 sm:px-4 py-1 sm:py-1.5 font-bold text-xs sm:text-sm text-gray-700 bg-gray-100 border-none">
                                        {t}
                                    </Badge>
                                )) : (
                                    <span className="text-sm text-gray-500 italic">No territory assigned</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Verification Info */}
                <Card className="backdrop-blur-xl bg-zinc-900/95 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl text-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-amber-600/10 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <BadgeCheck className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Verified Agent Account</h3>
                        <p className="text-sm sm:text-base text-gray-400 max-w-sm mb-4 sm:mb-6 px-2">
                            Your account is verified and managed by the head office. For updates to your territory or target, contact HR.
                        </p>
                        <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                            Member since {agent?.createdAt?.toDate ? agent.createdAt.toDate().toLocaleDateString() : '2024'}
                        </div>
                    </div>
                </Card>

                {/* Security Settings */}
                {user?.uid && (
                    <div className="backdrop-blur-xl bg-white/70 rounded-2xl sm:rounded-[2.5rem] border border-white/50 shadow-2xl shadow-orange-500/10">
                        <SecuritySettings
                            userId={user.uid}
                            userType="agent"
                            userName={user.displayName || 'Agent'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
