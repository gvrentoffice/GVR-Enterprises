import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";

interface ProductTableProps {
    products: any[];
}

export function ProductTable({ products }: ProductTableProps) {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-semibold text-gray-900">Inventory</h3>
                    <Button size="sm" className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </div>
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 font-semibold text-gray-700">Product Name</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Category</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Price</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Stock</TableHead>
                            <TableHead className="text-right py-4 font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                                <TableCell className="font-medium py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200" />
                                        <span className="text-gray-900 font-medium">{product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="outline" className="font-normal text-gray-600">
                                        {product.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4 font-semibold text-gray-900">₹{product.price}</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant={product.stock < 20 ? "danger" : "outline"} className={product.stock < 20 ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200"}>
                                        {product.stock} units
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                            <Edit className="h-4 w-4 text-gray-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-900">Products</h3>
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </div>
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h4>
                                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                                    <span className="font-bold text-primary">₹{product.price}</span>
                                </div>
                            </div>
                            <Badge variant={product.stock < 20 ? "danger" : "outline"} className="shrink-0">
                                {product.stock} left
                            </Badge>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                            <Button variant="outline" size="sm" className="h-8 flex-1">
                                <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 flex-1 text-red-600 border-red-100 hover:bg-red-50">
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
