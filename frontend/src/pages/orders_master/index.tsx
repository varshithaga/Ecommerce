import React, { useEffect, useState } from 'react';
import { createApiUrl, getAuthHeaders } from '../../access/access.ts';
import { ToastContainer, toast } from 'react-toastify';
import { Eye, X, MapPin, User, Package, Clock, CreditCard } from 'lucide-react';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total_price: number;
}

interface ShippingAddress {
    phone: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface Order {
    id: number;
    order_id: string;
    user: number;
    customer_name: string;
    shipping_address_details: ShippingAddress;
    total_amount: string;
    status: string;
    payment_method: string;
    created_at: string;
    items: OrderItem[];
}

const MasterOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(createApiUrl('api/orders/'), {
                headers: headers
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markAsDelivered = async (orderId: number) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(createApiUrl(`api/orders/${orderId}/`), {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({ status: 'Delivered' })
            });

            if (response.ok) {
                toast.success("Order marked as delivered!");
                fetchOrders(); // Refresh list
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Manage <span className="text-brand-500">Orders</span>
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Manage and track all customer orders
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">#{order.order_id.slice(0, 8)}...</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{order.customer_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-brand-500">${order.total_amount}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-success-50 text-success-500' : 'bg-brand-50 text-brand-500'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-brand-500 rounded-xl transition-all shadow-sm"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {order.status !== 'Delivered' && (
                                                <button
                                                    onClick={() => markAsDelivered(order.id)}
                                                    className="px-4 py-2.5 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-100"
                                                >
                                                    Deliver
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Order Details */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/20">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Order <span className="text-brand-500">Details</span></h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Order ID: #{selectedOrder.order_id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-3 bg-white dark:bg-gray-800 text-gray-400 hover:text-brand-500 rounded-2xl shadow-sm transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <User className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Customer Information</h4>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{selectedOrder.customer_name}</p>
                                        <p className="text-xs font-bold text-gray-500 mt-1">{selectedOrder.shipping_address_details.phone}</p>
                                    </div>
                                </div>

                                {/* Order Meta */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <Clock className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Order Info</h4>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Date</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Payment</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{selectedOrder.payment_method}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <MapPin className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Shipping Address</h4>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {selectedOrder.shipping_address_details.address_line},<br />
                                            {selectedOrder.shipping_address_details.city}, {selectedOrder.shipping_address_details.state} - {selectedOrder.shipping_address_details.postal_code},<br />
                                            {selectedOrder.shipping_address_details.country}
                                        </p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <Package className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Ordered Items</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-brand-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-gray-300">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.product_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">Qty: {item.quantity} × ${item.price}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white font-mono">${item.total_price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                                <span className="text-2xl font-black text-brand-500 tracking-tighter">${selectedOrder.total_amount}</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    Close
                                </button>
                                {selectedOrder.status !== 'Delivered' && (
                                    <button
                                        onClick={() => {
                                            markAsDelivered(selectedOrder.id);
                                            setSelectedOrder(null);
                                        }}
                                        className="px-8 py-3 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 transition shadow-xl shadow-brand-100"
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default MasterOrders;
