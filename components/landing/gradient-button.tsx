import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonProps {
    gradient?: "primary" | "secondary" | "accent";
}

export function GradientButton({ className, gradient = "primary", children, ...props }: GradientButtonProps) {
    return (
        <Button
            className={cn(
                "border-0 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105",
                gradient === "primary" && "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white",
                gradient === "secondary" && "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white",
                gradient === "accent" && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white",
                className
            )}
            {...props}
        >
            {children}
        </Button>
    );
}
