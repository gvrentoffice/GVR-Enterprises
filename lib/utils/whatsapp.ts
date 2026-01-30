/**
 * WhatsApp Utility for generating pre-filled message links
 */

interface WhatsAppOrderMsg {
    orderNumber: string;
    customerName: string;
    total: number;
    shopName: string;
    status: string;
}

export const getWhatsAppUrl = (phone: string, message: string) => {
    // Remove non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    // Ensure international format (assuming India +91 if not present)
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

export const formatOrderMessage = (data: WhatsAppOrderMsg) => {
    const { orderNumber, customerName, total, shopName, status } = data;

    let message = `*Order Update: #${orderNumber}*\n\n`;
    message += `Hello ${customerName} from *${shopName}*,\n\n`;

    if (status === 'confirmed') {
        message += `✅ Your order has been *confirmed*!\n`;
    } else if (status === 'shipped') {
        message += `🚚 Good news! Your order has been *shipped*.\n`;
    } else if (status === 'delivered') {
        message += `🎉 Your order has been *delivered*. Enjoy your stock!\n`;
    } else if (status === 'pending') {
        message += `⏳ We've received your order. Our agent is reviewing it now.\n`;
    }

    message += `\n*Total Amount:* ₹${total.toLocaleString('en-IN')}\n`;
    message += `\nThank you for choosing Ryth Bazar!\n_Generated via Ryth Bazar Agent App_`;

    return message;
};

export const formatPlacementMessage = (orderNumber: string, total: number) => {
    return `*New Order Placed!* 🛒\n\nOrder ID: #${orderNumber}\nTotal: ₹${total.toLocaleString('en-IN')}\n\nPlease review and confirm my order. Thank you!`;
};
