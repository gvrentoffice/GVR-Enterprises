"use client";

import { useForm } from "react-hook-form";
import { GradientButton } from "@/components/landing/gradient-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export function LoginForm() {
    const { register, handleSubmit } = useForm();

    const onSubmit = (data: any) => {
        // TODO: Integrate Firebase Auth

        // Demo Login Logic
        if (data.email === "agent@demo.com" && data.password === "agent123") {
            window.location.href = "/demo-agent/dashboard";
            return;
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>

                {/* Demo Credentials Tip */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200 mb-4">
                    <p className="font-semibold mb-1">Demo Credentials:</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="opacity-70">Agent:</span> <code className="bg-black/30 px-1 rounded">agent@demo.com</code>
                        </div>
                        <div>
                            <span className="opacity-70">Pass:</span> <code className="bg-black/30 px-1 rounded">agent123</code>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        {...register("email")}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Link href="#" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        {...register("password")}
                    />
                </div>
            </div>

            <GradientButton type="submit" gradient="primary" className="w-full h-12 text-lg">
                Sign In
            </GradientButton>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0a0a1a] px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
            </Button>

            <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold">
                    Sign up
                </Link>
            </div>
        </form>
    );
}
