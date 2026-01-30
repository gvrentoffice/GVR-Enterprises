"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    active?: boolean;
}

interface BottomNavigationProps {
    items: NavItem[];
    primaryAction?: {
        label: string;
        href: string;
        icon?: React.ReactNode;
    };
}

/**
 * Bottom Navigation Component - Responsive
 * Max 4-5 items + Optional primary action
 * Source: docs/notion_sync/unified_ui_rules.md
 * 
 * Responsive Features:
 * - Touch targets: min 44px × 44px (iOS/Android guidelines)
 * - Adaptive spacing based on screen size
 * - Icon size scales with viewport
 */
export function BottomNavigation({
    items,
    primaryAction,
}: BottomNavigationProps) {
    return (
        <div className="flex items-center justify-around p-2 sm:p-4">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        // Ensure min 44px touch target
                        "flex flex-col items-center justify-center gap-1",
                        "min-w-[44px] min-h-[44px]",
                        "px-2 py-2 sm:px-3",
                        "rounded-lg transition-colors",
                        item.active
                            ? "text-primary"
                            : "text-gray-600 hover:text-primary"
                    )}
                >
                    {/* Icon with responsive sizing */}
                    <div className="w-5 h-5 sm:w-6 sm:h-6">
                        {item.icon}
                    </div>
                    {/* Label - smaller on mobile */}
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">
                        {item.label}
                    </span>
                </Link>
            ))}

            {/* Primary Action (Optional) */}
            {primaryAction && (
                <Link
                    href={primaryAction.href}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1",
                        "min-w-[44px] min-h-[44px]",
                        "px-3 py-2 sm:px-4",
                        "bg-primary text-white rounded-lg shadow-lg",
                        "transition-transform hover:scale-105 active:scale-95"
                    )}
                >
                    <div className="w-5 h-5 sm:w-6 sm:h-6">
                        {primaryAction.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">
                        {primaryAction.label}
                    </span>
                </Link>
            )}
        </div>
    );
}
