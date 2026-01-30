'use client';

import {
    Calendar,
    Clock,
    TrendingUp,
    ShoppingCart,
    Users,
    Plus,
    CheckCircle2,
    Circle,
    ArrowUpRight,
    MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/hooks/useAgent';
import { useTodayRoute } from '@/hooks/useRoutes';
import { useAgentOrders } from '@/hooks/useOrders';
import { useAgentLeads } from '@/hooks/useLeads';
import { useAuthContext } from '@/app/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AgentDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuthContext();
    const { agent, checkIn, checkOut } = useAgent();
    const { route } = useTodayRoute(user?.uid);
    const { orders } = useAgentOrders(user?.uid || '');
    const { leads } = useAgentLeads(user?.uid || '');

    const salesTarget = 500000;
    const currentSales = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
    const salesProgress = (currentSales / salesTarget) * 100;

    const onboardingTarget = 20;
    const currentOnboarding = leads?.length || 0;
    const onboardingProgress = (currentOnboarding / onboardingTarget) * 100;

    const handleOnboardClick = (e: React.MouseEvent) => {
        if (agent?.status !== 'active') {
            e.preventDefault();
            toast({
                title: "Wait a moment! 😊",
                description: "To start onboarding new customers, please PUNCH IN first. It helps us keep track of your hard work today!",
                variant: "destructive",
            });
            return;
        }
        router.push('/agent/onboarding');
    };

    const toggleVisit = (_id: string) => {
        toast({
            title: "Success",
            description: "Visit status updated (Demo).",
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Hero Section / Punch In */}
            <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-700 rounded-3xl p-8 text-white shadow-xl shadow-amber-200/50">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Good Morning, {user?.displayName?.split(' ')[0] || 'Agent'}!
                        </h1>
                        <p className="text-amber-50/80 text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {agent?.status === 'active'
                                ? "You're currently ON DUTY. Let's make an impact today!"
                                : "You're currently OFF DUTY. Punch in to start your morning."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant={agent?.status === 'active' ? "secondary" : "default"}
                            size="lg"
                            className={`h-14 px-8 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${agent?.status === 'active'
                                ? "bg-white text-amber-700 hover:bg-amber-50"
                                : "bg-black text-white hover:bg-gray-900 border-none px-10"
                                }`}
                            onClick={() => agent?.status === 'active' ? checkOut() : checkIn({ latitude: 19.0760, longitude: 72.8777 })}
                        >
                            {agent?.status === 'active' ? 'End Shift' : 'Punch In'}
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-lg font-bold rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all active:scale-95"
                            onClick={handleOnboardClick}
                        >
                            <Plus className="w-6 h-6 mr-2" />
                            Onboard Shop
                        </Button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/5 rounded-full blur-2xl" />
            </section>

            {/* Monthly Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Monthly Sales Target */}
                <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Sales Target</CardTitle>
                        <div className="p-2 bg-green-50 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-6">
                        <div>
                            <div className="text-3xl font-black text-gray-900">₹{currentSales.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">Goal: ₹{salesTarget.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="space-y-2">
                            <Progress value={salesProgress} className="h-2 rounded-full bg-gray-100" />
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                <span>{Math.round(salesProgress)}% Achieved</span>
                                <span>₹{(salesTarget - currentSales).toLocaleString('en-IN')} left</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Customer Onboarding */}
                <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Customer Onboarding</CardTitle>
                        <div className="p-2 bg-amber-50 rounded-xl">
                            <Users className="w-5 h-5 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-6">
                        <div>
                            <div className="text-3xl font-black text-gray-900">{currentOnboarding}</div>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">Goal: {onboardingTarget} new shops</p>
                        </div>
                        <div className="space-y-2">
                            <Progress value={onboardingProgress} className="h-2 rounded-full bg-gray-100" />
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                <span>{Math.round(onboardingProgress)}% Achieved</span>
                                <span>{Math.max(0, onboardingTarget - currentOnboarding)} left</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Orders Card */}
                <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Orders</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-6">
                        <div>
                            <div className="text-3xl font-black text-gray-900">{orders?.length || 0}</div>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">Processed this month</p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 text-green-600 font-bold text-xs uppercase tracking-wider">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>12% above last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Route List */}
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-gray-50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">Today's Route List</CardTitle>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
                        </div>
                        <Badge variant="outline" className="px-4 py-1.5 bg-amber-50 text-amber-700 border-amber-100 rounded-full font-black uppercase text-[10px] tracking-widest">
                            {route?.visits?.length || 0} Scheduled
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                        {route?.visits && route.visits.length > 0 ? (
                            route.visits.map((visit: any, index: number) => (
                                <div key={visit.id || index} className="flex items-center gap-4 px-8 py-5 hover:bg-gray-50 transition-colors group">
                                    <button
                                        onClick={() => toggleVisit(visit.id)}
                                        className="transition-transform active:scale-90"
                                    >
                                        {visit.status === 'completed' ? (
                                            <CheckCircle2 className="w-7 h-7 text-green-500 fill-green-50" />
                                        ) : (
                                            <Circle className="w-7 h-7 text-gray-300 group-hover:text-amber-400" />
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg ${visit.status === 'completed' ? 'text-gray-400 line-through font-medium' : 'text-gray-900'}`}>
                                            {visit.shopName || visit.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1 uppercase tracking-wider">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {visit.area || 'Main Market'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        {visit.status === 'completed' ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 rounded-full uppercase text-[10px] tracking-widest font-black">
                                                Complete
                                            </Badge>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="rounded-full text-amber-600 font-bold hover:text-amber-700 hover:bg-amber-50 uppercase text-[10px] tracking-widest">
                                                Check In
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-8 text-center text-gray-400">
                                <div className="p-4 bg-gray-50 rounded-3xl mb-4">
                                    <Calendar className="w-12 h-12 text-gray-200" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No visits today</h3>
                                <p className="max-w-[250px] text-sm font-medium">Your daily schedule is clear. Use this time to onboard new shops!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions / Recent context */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders Overview */}
                <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 px-8 py-6">
                        <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
                        <Link href="/agent/orders" className="text-xs font-black text-amber-600 hover:underline uppercase tracking-widest">View All</Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {orders?.slice(0, 3).map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h4>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter mt-0.5">{order.shopName || 'Wholesale customer'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-gray-900 text-lg">₹{order.total?.toLocaleString('en-IN')}</div>
                                        <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-tighter font-bold border-gray-100 text-gray-500">
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Leads Overview */}
                <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 px-8 py-6">
                        <CardTitle className="text-lg font-bold">Recently Onboarded</CardTitle>
                        <Link href="/agent/customers" className="text-xs font-black text-amber-600 hover:underline uppercase tracking-widest">View All</Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {leads?.slice(0, 3).map((lead: any) => (
                                <div key={lead.id} className="flex items-center justify-between px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 font-black text-xl">
                                            {lead.companyName?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{lead.companyName}</h4>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{lead.contactPerson}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-widest">
                                        New
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
