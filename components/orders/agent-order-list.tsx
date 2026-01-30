import { OrderCard } from "./order-card";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";

interface AgentOrderListProps {
    orders: Order[];
    onViewOrder?: (order: Order) => void;
}

export function AgentOrderList({ orders, onViewOrder }: AgentOrderListProps) {
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search orders..." className="pl-8" />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} onViewDetails={onViewOrder} />
                ))}
            </div>
        </div>
    )
}
