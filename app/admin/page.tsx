'use client';

import { useMemo } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, TrendingDown } from 'lucide-react';
import { useOrderStats, useDailyRevenue, useLeadsCount, useActiveAgentsCount } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import LiveActiveAgents from '@/components/admin/LiveActiveAgents';

export default function AdminDashboardPage() {
    // Get last 30 days
    const { startDate, endDate } = useMemo(() => {
        const end = new Date();
        const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { startDate: start, endDate: end };
    }, []);

    const { stats, loading: statsLoading } = useOrderStats(startDate, endDate);
    const { data: dailyRevenue, loading: revenueLoading } = useDailyRevenue(startDate, endDate);
    const { count: leadsCount, loading: leadsLoading } = useLeadsCount();
    const { count: agentsCount, loading: agentsLoading } = useActiveAgentsCount();

    const isLoading = statsLoading || revenueLoading || leadsLoading || agentsLoading;

    // Calculate trend (compare to previous 30 days)
    const trendRevenue = useMemo(() => {
        if (!stats) return 0;
        // In real scenario, fetch previous period data
        return ((stats.totalRevenue - stats.totalRevenue) / stats.totalRevenue) * 100;
    }, [stats]);

    return (
        <div className="min-h-screen">
            {/* Header with Glassmorphism */}
            <div className="backdrop-blur-2xl bg-white/40 border-b border-white/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-zinc-600 mt-2 text-sm sm:text-base font-medium">Last 30 days overview</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-zinc-600 font-medium">Loading analytics...</p>
                    </div>
                ) : !stats ? (
                    <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-xl p-12 text-center">
                        <p className="text-zinc-600 font-medium">No data available</p>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards with Glassmorphism */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                            {/* Total Orders */}
                            <div className="group backdrop-blur-xl bg-white/60 rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                    <h3 className="font-bold text-zinc-700 text-xs sm:text-sm">Total Orders</h3>
                                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/30">
                                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-900 truncate">
                                    {stats.totalOrders}
                                </p>
                                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 sm:mt-2 font-medium">Last 30 days</p>
                            </div>

                            {/* Total Revenue */}
                            <div className="group backdrop-blur-xl bg-white/60 rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                    <h3 className="font-bold text-zinc-700 text-xs sm:text-sm">Revenue</h3>
                                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/30">
                                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-lg sm:text-2xl lg:text-3xl font-normal text-zinc-900 truncate">
                                    ₹{(stats.totalRevenue / 1000).toFixed(0)}k
                                </p>
                                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                                    {trendRevenue >= 0 ? (
                                        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                                    )}
                                    <p className={cn(
                                        "text-[10px] sm:text-xs font-bold",
                                        trendRevenue >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                        {Math.abs(trendRevenue).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            {/* Average Order */}
                            <div className="group backdrop-blur-xl bg-white/60 rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                    <h3 className="font-bold text-zinc-700 text-xs sm:text-sm">Avg Order</h3>
                                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30">
                                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-lg sm:text-2xl lg:text-3xl font-normal text-zinc-900 truncate">
                                    ₹{(stats.averageOrderValue / 1000).toFixed(0)}k
                                </p>
                                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 sm:mt-2 font-medium">Per order</p>
                            </div>

                            {/* Total Items */}
                            <div className="group backdrop-blur-xl bg-white/60 rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                    <h3 className="font-bold text-zinc-700 text-xs sm:text-sm">Items</h3>
                                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-500/30">
                                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-900 truncate">
                                    {stats.totalItems}
                                </p>
                                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 sm:mt-2 font-medium">Units sold</p>
                            </div>

                            {/* Total Leads */}
                            <div className="group backdrop-blur-xl bg-white/60 rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                    <h3 className="font-bold text-zinc-700 text-xs sm:text-sm">Leads</h3>
                                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg shadow-cyan-500/30">
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-900 truncate">
                                    {leadsCount}
                                </p>
                                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 sm:mt-2 font-medium">Potential</p>
                            </div>

                            {/* Active Agents */}
                            <div className="group backdrop-blur-xl bg-white/60 rounded-2xl sm:rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                    <h3 className="font-bold text-zinc-700 text-xs sm:text-sm">Agents</h3>
                                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/30">
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-900 truncate">
                                    {agentsCount}
                                </p>
                                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 sm:mt-2 font-medium">On duty</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Live Agents Tracking - New Column 1 */}
                            <div className="lg:col-span-1 h-full">
                                <LiveActiveAgents />
                            </div>

                            {/* Revenue Trend - Column 2 & 3 */}
                            <div className="lg:col-span-2 backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-xl p-6">
                                <h3 className="font-black text-zinc-900 mb-4 text-lg">Revenue Trend</h3>
                                <div className="h-64 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                                        <p className="text-zinc-600 text-sm font-medium">
                                            {dailyRevenue.length > 0
                                                ? `${dailyRevenue.length} days of data`
                                                : 'No revenue data yet'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Status Section */}
                        <div className="mt-6 backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-xl p-6 max-w-full">
                            <h3 className="font-black text-zinc-900 mb-4 text-lg">Order Status Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-zinc-600 font-medium">Pending</span>
                                        <span className="text-sm font-black text-amber-600">{stats.pendingOrders}</span>
                                    </div>
                                    <div className="w-full bg-zinc-200/50 rounded-full h-2.5 backdrop-blur-sm">
                                        <div
                                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full shadow-lg shadow-amber-500/30 transition-all duration-500"
                                            style={{
                                                width: `${(stats.pendingOrders / (stats.totalOrders || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-zinc-600 font-medium">Delivered</span>
                                        <span className="text-sm font-black text-green-600">{stats.deliveredOrders}</span>
                                    </div>
                                    <div className="w-full bg-zinc-200/50 rounded-full h-2.5 backdrop-blur-sm">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full shadow-lg shadow-green-500/30 transition-all duration-500"
                                            style={{
                                                width: `${(stats.deliveredOrders / (stats.totalOrders || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-zinc-600 font-medium">Cancelled</span>
                                        <span className="text-sm font-black text-red-600">{stats.cancelledOrders}</span>
                                    </div>
                                    <div className="w-full bg-zinc-200/50 rounded-full h-2.5 backdrop-blur-sm">
                                        <div
                                            className="bg-gradient-to-r from-red-400 to-red-600 h-2.5 rounded-full shadow-lg shadow-red-500/30 transition-all duration-500"
                                            style={{
                                                width: `${(stats.cancelledOrders / (stats.totalOrders || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
