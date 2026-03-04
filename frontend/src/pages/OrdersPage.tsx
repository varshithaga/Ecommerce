import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createApiUrl } from '../access/access.ts';
import PageMeta from '../components/common/PageMeta';
import { ToastContainer } from 'react-toastify';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total_price: number;
}

interface Order {
    id: number;
    order_id: string;
    total_amount: string;
    status: string;
    payment_method: string;
    created_at: string;
    items: OrderItem[];
}

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/customer-login');
                return;
            }
            try {
                const response = await fetch(createApiUrl('api/orders/'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Sort orders by most recent
                    const sortedOrders = data.sort((a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    setOrders(sortedOrders);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-600';
            case 'completed': return 'bg-green-500/10 text-green-600';
            case 'cancelled': return 'bg-red-500/10 text-red-600';
            default: return 'bg-blue-500/10 text-blue-600';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen pb-24">
            <PageMeta title="My Orders | E-Shop" description="Track your purchase history." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            Order <span className="text-brand-500">History</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 ml-1">
                            Tracking {orders.length} total orders
                        </p>
                    </div>
                    <Link to="/products" className="text-sm font-black text-brand-500 uppercase tracking-widest hover:underline flex items-center gap-2">
                        <span>Continue Shopping</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-2">No orders found</h2>
                        <p className="text-gray-500 font-bold mb-8">You haven't placed any orders yet. Start shopping to see them here!</p>
                        <Link to="/products" className="px-10 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-100 transition-transform active:scale-95">
                            Shop Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden group hover:border-brand-500/20 transition-all">
                                {/* Order Header */}
                                <div className="p-8 md:p-10 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase">#{order.order_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-sm font-black text-brand-500">${parseFloat(order.total_amount).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                            {order.payment_method}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-8 md:p-10">
                                    <div className="space-y-6">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center group/item">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                                                        <svg className="w-8 h-8 text-gray-100 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover/item:text-brand-500 transition-colors">{item.product_name}</h3>
                                                        <p className="text-xs font-bold text-gray-400 mt-1">Qty: {item.quantity} × ${parseFloat(item.price.toString()).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white font-mono">${parseFloat(item.total_price.toString()).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer (Action) */}
                                <div className="p-6 bg-white/50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                    <button className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-500 transition-colors">
                                        Download Invoice
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default OrdersPage;
