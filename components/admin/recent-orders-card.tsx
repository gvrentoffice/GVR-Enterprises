import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function RecentOrdersCard() {
    const orders = [
        { id: "#ORD-7829", customer: "Rajesh Kumar", amount: "₹1,240", status: "Pending", items: 4 },
        { id: "#ORD-7828", customer: "Priya Singh", amount: "₹850", status: "Delivered", items: 2 },
        { id: "#ORD-7827", customer: "Amit Patel", amount: "₹2,100", status: "Processing", items: 6 },
        { id: "#ORD-7826", customer: "Sneha Gupta", amount: "₹450", status: "Cancelled", items: 1 },
        { id: "#ORD-7825", customer: "Vikram Malhotra", amount: "₹3,200", status: "Delivered", items: 8 },
    ];

    return (
        <Card className="border-gray-200 shadow-sm bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gray-500" />
                    Recent Orders
                </CardTitle>
                <Link href="/demo-admin/orders">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100 pb-2 last:pb-0">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-sm text-gray-900">{order.id}</span>
                                <span className="text-xs text-gray-500">{order.customer} • {order.items} items</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="font-semibold text-sm">{order.amount}</span>
                                <Badge variant={
                                    order.status === "Delivered" ? "default" :
                                        order.status === "Pending" ? "secondary" :
                                            order.status === "Processing" ? "outline" : "danger"
                                } className={
                                    order.status === "Delivered" ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none" :
                                        order.status === "Pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 shadow-none" :
                                            order.status === "Processing" ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-none" : "shadow-none"
                                }>
                                    {order.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
