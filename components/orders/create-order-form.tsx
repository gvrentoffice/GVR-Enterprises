import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";

export function CreateOrderForm() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Select Shop</Label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search shops..." className="pl-8" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base">Order Items</Label>
                    <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </div>

                {/* Placeholder for order items list */}
                <Card className="border-dashed bg-gray-50">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-muted-foreground text-sm">
                        No items added yet. Search and add products.
                    </CardContent>
                </Card>
            </div>

            <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold mb-4">
                    <span>Total Amount</span>
                    <span>₹0.00</span>
                </div>
                <Button className="w-full size-lg">Confirm Order</Button>
            </div>
        </div>
    )
}
