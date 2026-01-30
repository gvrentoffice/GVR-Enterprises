"use client";

import { useRouter } from "next/navigation";
import { ConfirmationCard } from "@/components/products/confirmation-card";

export default function CheckoutSuccessPage() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-xl p-8 max-w-md w-full">
                <ConfirmationCard
                    orderId={`ORDER-${Date.now()}`}
                    deliveryDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    onContinueShopping={() => router.push("/")}
                    onTrackOrder={() => router.push("/orders")}
                />
            </div>
        </div>
    );
}
