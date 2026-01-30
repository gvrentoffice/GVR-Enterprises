"use client";

import { GlassCard } from "./glass-card";
import { GradientButton } from "./gradient-button";
import { LayoutDashboard, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a] text-white">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]" />

            <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl space-y-4 mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        The Future of Commerce
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-[600px] mx-auto">
                        Unified ecosystem connecting customers, field agents, and admin operations in one seamless platform.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    {/* Customer Portal Card */}
                    <PortalCard
                        title="Shop Now"
                        description="Browse products & place orders"
                        icon={<ShoppingBag className="w-8 h-8 text-pink-400" />}
                        href="/shop"
                        gradient="secondary"
                        delay={0.1}
                    />

                    {/* Agent Portal Card */}
                    <PortalCard
                        title="Agent Portal"
                        description="Manage routes & leads"
                        icon={<Users className="w-8 h-8 text-blue-400" />}
                        href="/agent"
                        gradient="primary"
                        delay={0.2}
                    />

                    {/* Admin Portal Card */}
                    <PortalCard
                        title="Admin Console"
                        description="Global oversight & inventory"
                        icon={<LayoutDashboard className="w-8 h-8 text-amber-400" />}
                        href="/admin"
                        gradient="accent"
                        delay={0.3}
                    />
                </div>
            </div>
        </div>
    );
}

function PortalCard({ title, description, icon, href, gradient, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            <GlassCard className="h-full p-8 flex flex-col items-center text-center group cursor-pointer">
                <div className="mb-6 p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-400 mb-8">{description}</p>
                <Link href={href} className="mt-auto">
                    <GradientButton gradient={gradient} className="w-full">
                        Enter Portal
                    </GradientButton>
                </Link>
            </GlassCard>
        </motion.div>
    );
}
