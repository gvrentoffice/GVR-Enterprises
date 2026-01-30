"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/landing/glass-card";
import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a1a] text-white p-4">
            {/* Background Effects (Matches HeroSection) */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2 hover:opacity-80 transition-opacity">
                        Ryth Bazar
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-gray-400">{subtitle}</p>
                </div>

                <GlassCard className="p-8 border-white/10" hoverEffect={false}>
                    {children}
                </GlassCard>
            </motion.div>
        </div>
    );
}
