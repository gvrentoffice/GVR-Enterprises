import { Order, Agent } from '../schema';

/**
 * Generate CSV from orders
 */
export function generateOrdersCSV(orders: Order[]): string {
    const headers = [
        'Order ID',
        'Order Number',
        'Customer ID',
        'Total',
        'Status',
        'Payment Status',
        'Created At',
    ];

    const rows = orders.map((order) => [
        order.id,
        order.orderNumber,
        order.companyId || 'N/A',
        order.total.toFixed(2),
        order.status,
        order.paymentStatus,
        new Date(order.createdAt.seconds * 1000).toISOString(),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
}

/**
 * Generate CSV from agents
 */
export function generateAgentsCSV(agents: Agent[]): string {
    const headers = ['Agent ID', 'Employee ID', 'Territory', 'Target Sales', 'Current Sales', 'Status'];

    const rows = agents.map((agent) => [
        agent.id,
        agent.employeeId,
        agent.territory.join('; '),
        agent.targetSales.toFixed(2),
        agent.performance?.monthlySales?.toFixed(2) || '0.00',
        agent.status,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Generate analytics report
 */
export interface AnalyticsReport {
    generatedAt: Date;
    period: {
        startDate: Date;
        endDate: Date;
    };
    stats: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    };
    topProducts: Array<{
        name: string;
        quantity: number;
        revenue: number;
    }>;
}

export function generateAnalyticsReport(data: AnalyticsReport): string {
    const report = `
RYTH-BAZAR ANALYTICS REPORT
${'='.repeat(50)}

Generated: ${data.generatedAt.toISOString()}
Period: ${data.period.startDate.toISOString()} to ${data.period.endDate.toISOString()}

SUMMARY STATISTICS
${'='.repeat(50)}
Total Orders: ${data.stats.totalOrders}
Total Revenue: ₹${data.stats.totalRevenue.toLocaleString('en-IN')}
Average Order Value: ₹${data.stats.averageOrderValue.toLocaleString('en-IN')}

TOP PRODUCTS
${'='.repeat(50)}
${data.topProducts
            .map(
                (p, i) =>
                    `${i + 1}. ${p.name}
   Quantity: ${p.quantity} | Revenue: ₹${p.revenue.toLocaleString('en-IN')}`
            )
            .join('\n')}

${'='.repeat(50)}
End of Report
`;

    return report;
}

export function downloadTextReport(content: string, filename: string) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
