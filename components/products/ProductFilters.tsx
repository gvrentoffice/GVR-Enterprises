'use client';

import { useState } from 'react';
import { Search, X, Layers, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Category } from '@/lib/firebase/schema';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
    categories: Category[];
    selectedCategoryId?: string;
    searchTerm?: string;
    onCategoryChange?: (categoryId: string | undefined) => void;
    onSearchChange?: (searchTerm: string) => void;
}

export function ProductFilters({
    categories,
    selectedCategoryId,
    searchTerm = '',
    onCategoryChange,
    onSearchChange,
}: ProductFiltersProps) {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    const handleSearchChange = (value: string) => {
        setLocalSearchTerm(value);
        onSearchChange?.(value);
    };

    const handleClearSearch = () => {
        setLocalSearchTerm('');
        onSearchChange?.('');
    };

    return (
        <aside className="space-y-8">
            {/* Search Box */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Search className="w-3.5 h-3.5 text-gray-500" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Search</h3>
                </div>
                <div className="relative group">
                    <Input
                        type="text"
                        placeholder="Name, SKU, ID..."
                        value={localSearchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="h-10 bg-white border-gray-100 rounded-xl pl-4 pr-10 focus:ring-4 focus:ring-gray-100 transition-all text-sm font-medium placeholder:text-gray-300"
                    />
                    {localSearchTerm ? (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200" />
                    )}
                </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Layers className="w-3.5 h-3.5 text-gray-500" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Collections</h3>
                </div>
                <div className="flex flex-col gap-1">
                    {/* All Categories Button */}
                    <button
                        onClick={() => onCategoryChange?.(undefined)}
                        className={cn(
                            "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300",
                            !selectedCategoryId
                                ? "bg-amber-100 text-amber-900 shadow-sm"
                                : "text-gray-500 hover:bg-white hover:text-gray-900"
                        )}
                    >
                        <span className="text-sm font-bold">All Collections</span>
                        {!selectedCategoryId && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />}
                    </button>

                    {/* Category List */}
                    {categories.map((category) => {
                        const isSelected = selectedCategoryId === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange?.(category.id)}
                                className={cn(
                                    "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300",
                                    isSelected
                                        ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                        : "text-gray-500 hover:bg-white hover:text-gray-900"
                                )}
                            >
                                <span className="text-sm font-bold">{category.name}</span>
                                {isSelected && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Subtle Filter Status */}
            {(selectedCategoryId || localSearchTerm) && (
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <Filter className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Active Filters</span>
                        </div>
                        <button
                            onClick={() => {
                                onCategoryChange?.(undefined);
                                handleClearSearch();
                            }}
                            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {selectedCategoryId && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600">
                                {categories.find(c => c.id === selectedCategoryId)?.name}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCategoryChange?.(undefined);
                                    }}
                                />
                            </span>
                        )}
                        {localSearchTerm && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600">
                                "{localSearchTerm}"
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearSearch();
                                    }}
                                />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
}
