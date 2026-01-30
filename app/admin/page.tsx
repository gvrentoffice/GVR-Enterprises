'use client';

import { useMemo } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { useOrderStats, useDailyRevenue, useLeadsCount, useActiveAgentsCount } from '@/hooks/useAnalytics';

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Last 30 days overview</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading analytics...</p>
                    </div>
                ) : !stats ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-600">No data available</p>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Orders */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Total Orders</h3>
                                    <ShoppingCart className="w-5 h-5 text-orange-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                                <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
                            </div>

                            {/* Total Revenue */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Total Revenue</h3>
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    {trendRevenue > 0 ? '↑' : '↓'} {Math.abs(trendRevenue).toFixed(1)}%
                                </p>
                            </div>

                            {/* Average Order */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Avg Order Value</h3>
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    ₹{stats.averageOrderValue.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">Per transaction</p>
                            </div>

                            {/* Total Items */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Total Items</h3>
                                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                                <p className="text-sm text-gray-600 mt-2">Units sold</p>
                            </div>

                            {/* Total Leads */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Total Leads</h3>
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{leadsCount}</p>
                                <p className="text-sm text-gray-600 mt-2">Potential customers</p>
                            </div>

                            {/* Active Agents */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Active Agents</h3>
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{agentsCount}</p>
                                <p className="text-sm text-gray-600 mt-2">Total on duty</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Revenue Trend */}
                            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Revenue Trend</h3>
                                <div className="h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded flex items-center justify-center">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-600 text-sm">
                                            {dailyRevenue.length > 0
                                                ? `${dailyRevenue.length} days of data`
                                                : 'No revenue data yet'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Status */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Pending</span>
                                            <span className="text-sm font-bold text-gray-900">{stats.pendingOrders}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(stats.pendingOrders / (stats.totalOrders || 1)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Delivered</span>
                                            <span className="text-sm font-bold text-gray-900">{stats.deliveredOrders}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(stats.deliveredOrders / (stats.totalOrders || 1)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Cancelled</span>
                                            <span className="text-sm font-bold text-gray-900">{stats.cancelledOrders}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-red-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(stats.cancelledOrders / (stats.totalOrders || 1)) * 100}%`,
                                                }}
                                            />
                                        </div>
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
