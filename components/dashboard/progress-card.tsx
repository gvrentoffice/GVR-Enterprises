import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
    title: string;
    target: number;
    achieved: number;
    unit?: string;
    className?: string;
}

export function ProgressCard({ title, target, achieved, unit = "", className }: ProgressCardProps) {
    // Calculate percentage
    const percentage = Math.min(Math.round((achieved / target) * 100), 100);

    return (
        <Card className={cn("border-gray-200 shadow-sm bg-white", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                    <div className="text-2xl font-bold">{achieved.toLocaleString()} {unit}</div>
                    <div className="text-xs text-muted-foreground">Target: {target.toLocaleString()} {unit}</div>
                    <div className="text-xs font-medium text-green-600 mt-2 bg-green-50 px-2 py-1 rounded-full inline-block">
                        {percentage}% Achieved
                    </div>
                </div>

                <CircularProgress
                    value={percentage}
                    size={80}
                    strokeWidth={8}
                    progressColor="text-blue-600"
                    className="ml-4"
                >
                    <span className="text-sm font-bold text-gray-700">{percentage}%</span>
                </CircularProgress>
            </CardContent>
        </Card>
    );
}
