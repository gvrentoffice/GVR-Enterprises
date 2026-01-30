"use client";

import { useForm } from "react-hook-form";
import { GradientButton } from "@/components/landing/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Mail, Lock, User, Briefcase } from "lucide-react";

export function SignupForm() {
    const { register, handleSubmit, setValue } = useForm();

    const onSubmit = (data: any) => {
        console.log("Signup Data:", data);
        // TODO: Integrate Firebase Auth
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                        {...register("name")}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                        {...register("email")}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300">I am a...</Label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-5 w-5 z-10 text-gray-500" />
                    <Select onValueChange={(val) => setValue("role", val)}>
                        <SelectTrigger className="pl-10 bg-white/5 border-white/10 text-white focus:ring-purple-500/20">
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            <SelectItem value="customer">Customer (Shopper)</SelectItem>
                            <SelectItem value="agent">Sales Agent (Field)</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                        {...register("password")}
                    />
                </div>
            </div>

            <GradientButton type="submit" gradient="secondary" className="w-full h-12 text-lg mt-4">
                Create Account
            </GradientButton>

            <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 hover:underline font-semibold">
                    Sign in
                </Link>
            </div>
        </form>
    );
}
