'use client';

import { useState } from 'react';
import { useCategories, useCategoryTree } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Layers,
    Plus,

    Trash2,
    Loader2,
    FolderTree,
    ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCategory, deleteCategory, getNextOrderNumber } from '@/lib/firebase/services/categoryService';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
    const { categories, loading } = useCategories();
    const { tree, loading: treeLoading } = useCategoryTree();
    const { toast } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: '',
    });

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const level = formData.parentId ? 1 : 0;
            const order = await getNextOrderNumber(formData.parentId || undefined);

            await createCategory({
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                description: formData.description,
                parentId: formData.parentId || undefined,
                level,
                order,
            });

            toast({
                title: 'Success',
                description: `Category "${formData.name}" created successfully`,
                className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            });

            setIsCreateModalOpen(false);
            setFormData({ name: '', slug: '', description: '', parentId: '' });

            // Refresh the page to show new category
            window.location.reload();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create category',
                variant: 'destructive',
            });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
        if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

        try {
            await deleteCategory(categoryId);
            toast({
                title: 'Success',
                description: `Category "${categoryName}" deleted successfully`,
                className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            });
            window.location.reload();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete category',
                variant: 'destructive',
            });
        }
    };

    if (loading || treeLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    const mainCategories = categories.filter(c => c.level === 0);

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                                <Layers className="w-6 h-6 text-amber-600" />
                                Category Management
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">
                                Organize your products with categories and subcategories
                            </p>
                        </div>

                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 transition-all active:scale-95">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <form onSubmit={handleCreateCategory}>
                                    <DialogHeader>
                                        <DialogTitle>Create New Category</DialogTitle>
                                        <DialogDescription>
                                            Add a new category or subcategory to organize your products.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase">
                                                Category Name *
                                            </Label>
                                            <Input
                                                placeholder="e.g., Tarpaulin"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase">
                                                Slug (URL-friendly)
                                            </Label>
                                            <Input
                                                placeholder="e.g., tarpaulin (auto-generated if empty)"
                                                value={formData.slug}
                                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            />
                                            <p className="text-xs text-zinc-400">
                                                Leave empty to auto-generate from name
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase">
                                                Parent Category (Optional)
                                            </Label>
                                            <Select
                                                value={formData.parentId}
                                                onValueChange={value => setFormData({ ...formData, parentId: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select parent (leave empty for main category)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">None (Main Category)</SelectItem>
                                                    {mainCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase">
                                                Description (Optional)
                                            </Label>
                                            <Textarea
                                                placeholder="Brief description of this category..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                            disabled={creating}
                                        >
                                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Create Category
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Tree View */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <FolderTree className="w-5 h-5 text-amber-600" />
                        <h2 className="text-lg font-bold text-zinc-900">Category Hierarchy</h2>
                    </div>

                    {tree.length === 0 ? (
                        <div className="text-center py-12">
                            <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500 font-medium">No categories yet</p>
                            <p className="text-zinc-400 text-sm mt-1">
                                Create your first category to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {tree.map(mainCat => (
                                <div key={mainCat.id} className="border border-zinc-200 rounded-2xl overflow-hidden">
                                    {/* Main Category */}
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-zinc-900">{mainCat.name}</h3>
                                                <p className="text-xs text-zinc-500">
                                                    {mainCat.children?.length || 0} subcategories
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteCategory(mainCat.id, mainCat.name)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Subcategories */}
                                    {mainCat.children && mainCat.children.length > 0 && (
                                        <div className="bg-white p-4 space-y-2">
                                            {mainCat.children.map(subCat => (
                                                <div
                                                    key={subCat.id}
                                                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                                                        <span className="font-medium text-zinc-700">
                                                            {subCat.name}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteCategory(subCat.id, subCat.name)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Categories List */}
                <div className="mt-8 bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-zinc-900 mb-4">All Categories ({categories.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(category => (
                            <div
                                key={category.id}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all",
                                    category.level === 0
                                        ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                                        : "bg-zinc-50 border-zinc-200"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-zinc-900">{category.name}</h3>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {category.level === 0 ? 'Main Category' : 'Subcategory'}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-1 font-mono">
                                            /{category.slug}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(category.id, category.name)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
