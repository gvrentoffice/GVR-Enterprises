"use client";

import { cn } from "@/lib/utils";
import { Play, Trophy, Sparkles } from "lucide-react";
import Image from "next/image";

// --- Avatar / Story Card ---
interface AvatarCardProps {
    name: string;
    role: string;
    imageUrl?: string; // Optional, fallback to initial
    color?: string; // Tailwind bg class
}

export function AvatarCard({ name, role, imageUrl, color = "bg-blue-100" }: AvatarCardProps) {
    return (
        <div className="flex flex-col items-center gap-3 min-w-[100px] snap-center">
            <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden group transition-transform active:scale-95",
                color
            )}>
                {/* 3D-style Avatar Placeholder */}
                <div className="text-2xl font-black text-black/20 group-hover:scale-110 transition-transform duration-500">
                    {name.charAt(0)}
                </div>
                {imageUrl && <Image src={imageUrl} alt={name} fill className="object-cover" />}
            </div>
            <div className="text-center">
                <h4 className="font-bold text-zinc-900 text-sm leading-tight">{name}</h4>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">{role}</span>
            </div>
        </div>
    )
}

// --- Pastel Feature Card ---
interface PastelCardProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    color: "pink" | "yellow" | "blue" | "green";
    className?: string;
}

export function PastelCard({ title, subtitle, icon, color, className }: PastelCardProps) {
    const colorStyles = {
        pink: "bg-[#F3E5F5] text-pink-900 border-pink-100", // Soft Pink
        yellow: "bg-[#FFF9C4] text-amber-900 border-amber-100", // Soft Yellow
        blue: "bg-[#E3F2FD] text-blue-900 border-blue-100", // Soft Blue
        green: "bg-[#E8F5E9] text-green-900 border-green-100", // Soft Green
    };

    return (
        <div className={cn(
            "rounded-[2rem] p-6 relative overflow-hidden transition-transform active:scale-[0.98] border shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)]",
            colorStyles[color],
            className
        )}>
            {/* Play Button / Action Icon */}
            <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center mb-4 shadow-sm">
                {icon || <Play className="w-5 h-5 fill-current opacity-80" />}
            </div>

            <h3 className="text-xl font-black mb-1">{title}</h3>
            {subtitle && <p className="text-sm font-medium opacity-60 flex items-center gap-1">{subtitle}</p>}

            {/* Decorative Blobs */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/20 blur-xl"></div>
        </div>
    )
}

// --- Leaderboard Item ---
interface LeaderboardItemProps {
    rank: number;
    name: string;
    score: string;
    subtext: string;
    avatarColor?: string;
}

export function LeaderboardItem({ rank, name, score, subtext, avatarColor = "bg-zinc-100" }: LeaderboardItemProps) {
    const isTop3 = rank <= 3;

    return (
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-zinc-50 shadow-sm mb-3">
            {/* Avatar */}
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg relative", avatarColor)}>
                {name.charAt(0)}
                {isTop3 && (
                    <div className="absolute -top-1 -right-1">
                        <Trophy className={cn("w-4 h-4", rank === 1 ? "text-amber-400 fill-amber-400" : rank === 2 ? "text-zinc-400 fill-zinc-400" : "text-orange-400 fill-orange-400")} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                <h4 className="font-bold text-zinc-900 text-sm">{name}</h4>
                <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">
                        {subtext}
                    </span>
                </div>
            </div>

            {/* Score & Rank */}
            <div className="text-right">
                <div className="font-black text-zinc-900 text-base">{score}</div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Rank #{rank}</div>
            </div>
        </div>
    )
}

// --- Section Header ---
export function SectionHeader({ title, action = "See All" }: { title: string, action?: string }) {
    return (
        <div className="flex items-center justify-between px-1 mb-4">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-zinc-900">{title}</h2>
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <button className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors">
                {action}
            </button>
        </div>
    )
}
