import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PillFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
    className?: string;
}

export function PillFilter({ categories, selected, onSelect, className }: PillFilterProps) {
    return (
        <div className={cn("flex overflow-x-auto pb-4 gap-2 no-scrollbar", className)}>
            {categories.map((category) => (
                <Button
                    key={category}
                    variant={selected === category ? "default" : "outline"}
                    className={cn(
                        "rounded-full whitespace-nowrap px-6",
                        selected === category
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => onSelect(category)}
                >
                    {category}
                </Button>
            ))}
        </div>
    );
}
