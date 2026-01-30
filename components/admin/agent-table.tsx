import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin } from "lucide-react";

interface AgentTableProps {
    agents: any[];
}

export function AgentTable({ agents }: AgentTableProps) {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 font-semibold text-gray-700">Agent Name</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Contact</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Assigned Area</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-700">Performance</TableHead>
                            <TableHead className="text-right py-4 font-semibold text-gray-700">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agents.map((agent) => (
                            <TableRow key={agent.id} className="group hover:bg-gray-50/50 transition-colors">
                                <TableCell className="font-medium py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-white group-hover:ring-primary/20 transition-all">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className="text-gray-900 font-semibold">{agent.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-3.5 w-3.5" /> {agent.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400" /> {agent.area}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="text-sm">
                                        <div className="font-bold text-gray-900">₹{agent.totalSales.toLocaleString()}</div>
                                        <div className="text-xs text-green-600 font-medium">{agent.ordersCount} Orders</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                        Active
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {agents.map((agent) => (
                    <div key={agent.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                                    <p className="text-xs text-gray-500">{agent.area}</p>
                                </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                                Active
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-50">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Sales</p>
                                <p className="font-bold text-gray-900">₹{agent.totalSales.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Orders</p>
                                <p className="font-medium text-gray-900">{agent.ordersCount}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" /> {agent.phone}
                            </span>
                            <Button size="sm" variant="outline" className="h-8">Details</Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
