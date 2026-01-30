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
import { Eye } from "lucide-react";

interface OrderTableProps {
    orders: any[]; // Using any for demo, should be proper Order interface
}

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case "delivered": return "success";
        case "processing": return "warning";
        case "cancelled": return "danger";
        case "shipped": return "default"; // or blue if available
        default: return "default";
    }
};

export function OrderTable({ orders }: OrderTableProps) {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 font-semibold text-gray-700">Order ID</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Date</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Shop / Customer</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Amount</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="text-right py-4 font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                <TableCell className="font-medium py-4 text-gray-900">{order.id}</TableCell>
                                <TableCell className="py-4 text-gray-600">{new Date(order.date).toLocaleDateString()}</TableCell>
                                <TableCell className="py-4 text-gray-900 font-medium">{order.shopName || "Unknown Shop"}</TableCell>
                                <TableCell className="py-4 font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant={getStatusVariant(order.status)} className="px-2.5 py-0.5 rounded-full font-medium capitalize">
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-medium text-gray-500">{order.id}</span>
                            <Badge variant={getStatusVariant(order.status)} className="text-[10px] px-2 py-0.5 capitalize">
                                {order.status}
                            </Badge>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{order.shopName || "Unknown Shop"}</h4>
                            <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Total Amount</span>
                            <span className="text-lg font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                        </div>

                        <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-2">
                            <Eye className="h-3 w-3" /> View Details
                        </Button>
                    </div>
                ))}
            </div>
        </>
    );
}
