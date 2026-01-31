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
        <aside className="space-y-6">
            {/* Search Box */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                        <Search className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Search Products</h3>
                </div>
                <div className="relative group">
                    <Input
                        type="text"
                        placeholder="Name, SKU, ID..."
                        value={localSearchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="h-11 bg-white/80 border-gray-200 rounded-xl pl-4 pr-10 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-medium placeholder:text-gray-400"
                    />
                    {localSearchTerm ? (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    )}
                </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
                        <Layers className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Categories</h3>
                </div>
                <div className="flex flex-col gap-2">
                    {/* All Categories Button */}
                    <button
                        onClick={() => onCategoryChange?.(undefined)}
                        className={cn(
                            "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm",
                            !selectedCategoryId
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                                : "bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-100"
                        )}
                    >
                        <span>All Collections</span>
                        {!selectedCategoryId && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </button>

                    {/* Category List */}
                    {categories.map((category) => {
                        const isSelected = selectedCategoryId === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange?.(category.id)}
                                className={cn(
                                    "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm",
                                    isSelected
                                        ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg shadow-gray-900/30"
                                        : "bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-100"
                                )}
                            >
                                <span>{category.name}</span>
                                {isSelected && <div className="w-2 h-2 bg-amber-400 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Filters */}
            {(selectedCategoryId || localSearchTerm) && (
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Active Filters</span>
                        </div>
                        <button
                            onClick={() => {
                                onCategoryChange?.(undefined);
                                handleClearSearch();
                            }}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
                        >
                            Reset All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedCategoryId && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900">
                                {categories.find(c => c.id === selectedCategoryId)?.name}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCategoryChange?.(undefined);
                                    }}
                                />
                            </span>
                        )}
                        {localSearchTerm && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900">
                                "{localSearchTerm}"
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
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
