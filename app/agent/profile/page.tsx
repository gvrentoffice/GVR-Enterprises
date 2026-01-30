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

export default function AgentProfilePage() {
    const { user } = useAuthContext();
    const { agent } = useAgent();

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/agent">
                    <Button variant="ghost" className="rounded-full hover:bg-white">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Dashboard
                    </Button>
                </Link>
                <Button variant="outline" onClick={async () => {
                    await deleteSession();
                    localStorage.removeItem('agent_whatsapp_session');
                    window.location.href = '/login';
                }} className="text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50 rounded-xl">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>

            {/* Profile Hero */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-amber-100 rounded-[2rem] flex items-center justify-center text-amber-700">
                    <User className="w-16 h-16" />
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-3xl font-black text-gray-900">{user?.displayName || 'Agent Name'}</h1>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none uppercase text-[10px] font-black tracking-widest px-3 py-1">
                            Sales Agent
                        </Badge>
                    </div>
                    <p className="text-gray-500 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                        <Briefcase className="w-5 h-5" />
                        ID: {agent?.employeeId || 'EMP101'}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full font-medium">
                            <Mail className="w-4 h-4" />
                            {user?.email}
                        </div>
                        {user?.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full font-medium">
                                <Phone className="w-4 h-4" />
                                {user.phoneNumber}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Agent Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] p-6 border-none shadow-sm flex flex-col gap-4">
                    <CardHeader className="p-0">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-2">
                            <Target className="w-6 h-6 text-amber-600" />
                        </div>
                        <CardTitle className="text-xl font-bold">Sales & Targets</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-gray-500 font-medium">Monthly Target</span>
                            <span className="font-bold text-gray-900">₹{(agent?.targetSales || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-500 font-medium">Current Status</span>
                            <Badge className={agent?.status === 'active' ? 'bg-green-100 text-green-700 border-none' : 'bg-gray-100 text-gray-600 border-none'}>
                                {agent?.status === 'active' ? 'Active Duty' : 'Offline'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] p-6 border-none shadow-sm flex flex-col gap-4">
                    <CardHeader className="p-0">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-2">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl font-bold">Territory Info</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {agent?.territory?.length ? agent.territory.map((t, i) => (
                                <Badge key={i} variant="secondary" className="rounded-xl px-4 py-1.5 font-bold text-gray-700 bg-gray-100 border-none">
                                    {t}
                                </Badge>
                            )) : (
                                <span className="text-gray-500 italic">No territory assigned</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Verification Info */}
            <Card className="rounded-[2.5rem] p-8 border-none shadow-sm text-center bg-zinc-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <BadgeCheck className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Verified Agent Account</h3>
                    <p className="text-gray-400 max-w-sm mb-6">
                        Your account is verified and managed by the head office. For updates to your territory or target, contact HR.
                    </p>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                        Member since {agent?.createdAt?.toDate ? agent.createdAt.toDate().toLocaleDateString() : '2024'}
                    </div>
                </div>
            </Card>
        </div>
    );
}
