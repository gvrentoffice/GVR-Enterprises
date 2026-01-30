import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, CheckCircle } from "lucide-react";

interface RouteStop {
    id: string;
    shopName: string;
    address: string;
    status: "pending" | "completed" | "skipped";
    distance?: string;
}

interface RouteListProps {
    stops: RouteStop[];
    onStartVisit: (id: string) => void;
}

export function RouteList({ stops, onStartVisit }: RouteListProps) {
    return (
        <div className="space-y-4">
            {stops.map((stop) => (
                <Card key={stop.id} className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">{stop.shopName}</h3>
                                    <Badge variant={stop.status === "completed" ? "default" : "secondary"}>
                                        {stop.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {stop.address}
                                </div>
                                {stop.distance && (
                                    <div className="text-xs text-blue-600 font-medium ml-5">
                                        {stop.distance} away
                                    </div>
                                )}
                            </div>
                            {stop.status === "pending" && (
                                <Button size="sm" onClick={() => onStartVisit(stop.id)}>
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Visit
                                </Button>
                            )}
                            {stop.status === "completed" && (
                                <div className="text-green-600">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
