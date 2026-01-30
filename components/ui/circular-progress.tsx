"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    circleColor?: string;
    progressColor?: string;
}

export function CircularProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 10,
    circleColor = "text-gray-100",
    progressColor = "text-primary",
    className,
    children,
    ...props
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(Math.max(value, 0), max);
    const strokeDashoffset = circumference - (percentage / max) * circumference;

    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90 transition-all duration-500 ease-in-out"
            >
                {/* Background Circle */}
                <circle
                    className={cn("stroke-current", circleColor)}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />

                {/* Progress Circle */}
                <circle
                    className={cn("stroke-current transition-all duration-1000 ease-out", progressColor)}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                    }}
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                {children}
            </div>
        </div>
    );
}
