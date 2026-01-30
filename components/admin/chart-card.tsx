import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
    title: string;
    data: number[];
    labels: string[];
    type: "bar" | "line";
    className?: string;
}

export function ChartCard({ title, data, labels, type, className }: ChartCardProps) {
    const max = Math.max(...data);

    return (
        <Card className={cn("col-span-1 border-none shadow-sm bg-white overflow-visible", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-900">{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex items-end justify-between gap-3 pt-4 px-6">
                {data.map((value, i) => {
                    const height = Math.max((value / max) * 100, 4); // Min 4% height
                    const isMax = value === max;

                    return (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                            <div className="relative w-full flex items-end justify-center h-full">
                                <div
                                    className={cn(
                                        "w-full max-w-[12px] md:max-w-[20px] rounded-full transition-all duration-500",
                                        type === "bar"
                                            ? (isMax ? "bg-amber-500 shadow-lg shadow-amber-500/30" : "bg-zinc-100 group-hover:bg-zinc-800")
                                            : "bg-amber-500" // For line layout placeholder (simplified)
                                    )}
                                    style={{ height: `${height}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 whitespace-nowrap z-20 shadow-xl pointer-events-none">
                                        {value}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] md:text-xs text-zinc-400 font-medium truncate w-full text-center group-hover:text-zinc-900 transition-colors">
                                {labels[i]}
                            </span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
