import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VisitLogFormProps {
    shopName: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function VisitLogForm({ shopName, onSubmit, onCancel }: VisitLogFormProps) {
    return (
        <div className="space-y-4">
            <div>
                <Label>Shop Name</Label>
                <Input value={shopName} disabled />
            </div>

            <div>
                <Label htmlFor="outcome">Visit Outcome</Label>
                <select id="outcome" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Order Taken</option>
                    <option>No Order</option>
                    <option>Shop Closed</option>
                    <option>Owner Not Available</option>
                </select>
            </div>

            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Any discussion points..." />
            </div>

            <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
                <Button className="flex-1" onClick={() => onSubmit({})}>Complete Visit</Button>
            </div>
        </div>
    )
}
