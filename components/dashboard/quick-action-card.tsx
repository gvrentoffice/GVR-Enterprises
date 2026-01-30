import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickActionCardProps {
    title: string;
    icon: LucideIcon;
    onClick?: () => void;
    href?: string;
    color?: string; // e.g. "text-blue-600 bg-blue-50"
}

export function QuickActionCard({ title, icon: Icon, onClick, href, color = "text-primary bg-primary/10" }: QuickActionCardProps) {
    const Content = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className={cn("p-3 rounded-full", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="font-medium text-sm text-center">{title}</span>
        </div>
    );

    if (href) {
        return (
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md">
                <CardContent className="pt-6">
                    <Link href={href} className="w-full h-full block">
                        {Content}
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className="hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md"
            onClick={onClick}
        >
            <CardContent className="pt-6">
                {Content}
            </CardContent>
        </Card>
    );
}
