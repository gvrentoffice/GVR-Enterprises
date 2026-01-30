import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, Package, UserPlus } from "lucide-react";

const activities = [
    {
        id: 1,
        title: "Order #1024 Delivered",
        time: "10:30 AM",
        type: "order",
        description: "Delivered to Green Valley Store",
        icon: Package,
        color: "text-blue-500"
    },
    {
        id: 2,
        title: "New Lead Added",
        time: "09:15 AM",
        type: "lead",
        description: "Added 'Fresh Mart' to leads",
        icon: UserPlus,
        color: "text-purple-500"
    },
    {
        id: 3,
        title: "Visit Completed",
        time: "08:45 AM",
        type: "visit",
        description: "Weekly visit at City Supermarket",
        icon: MapPin,
        color: "text-green-500"
    },
    {
        id: 4,
        title: "Route Started",
        time: "08:00 AM",
        type: "system",
        description: "Started 'North Sector' route",
        icon: CheckCircle2,
        color: "text-gray-500"
    }
];

export function ActivityFeedCard() {
    return (
        <Card className="border-gray-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {activities.map((activity) => (
                        <div key={activity.id} className="relative flex items-start group is-active">
                            <div className={`absolute left-0 ml-2 h-6 w-6 rounded-full border-2 border-white bg-white flex items-center justify-center z-10 ${activity.color}`}>
                                <activity.icon className="h-4 w-4" />
                            </div>
                            <div className="pl-10 w-full">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
