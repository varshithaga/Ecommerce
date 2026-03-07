import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createApiUrl } from '../access/access.ts';
import PageMeta from '../components/common/PageMeta';
import { ToastContainer, toast } from 'react-toastify';
import { submitReview } from './products/api';
import { Star } from 'lucide-react';

interface OrderItem {
    id: number;
    product: number;
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
    cancel_reason?: string;
}

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Cancel Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [submittingCancel, setSubmittingCancel] = useState(false);

    const handleOpenReview = async (productId: number, productName: string) => {
        setSelectedProduct({ id: productId, name: productName });
        setRating(5);
        setComment('');

        try {
            const token = localStorage.getItem('access');
            if (token) {
                const response = await fetch(createApiUrl(`api/reviews/my_review/?product=${productId}`), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.rating) {
                        setRating(data.rating);
                        setComment(data.comment || '');
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching existing review:", error);
        }

        setReviewModalOpen(true);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !comment.trim()) return;

        setSubmittingReview(true);
        try {
            await submitReview(selectedProduct.id, rating, comment);
            toast.success("Review submitted! Thank you.");
            setReviewModalOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleOpenCancel = (orderId: number) => {
        setOrderToCancel(orderId);
        setCancelReason('');
        setCancelModalOpen(true);
    };

    const handleSubmitCancel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderToCancel || !cancelReason.trim()) return;

        setSubmittingCancel(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(createApiUrl(`api/orders/${orderToCancel}/cancel_order/`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: cancelReason })
            });

            if (response.ok) {
                toast.success("Order cancelled successfully.");
                setOrders(orders.map(o => o.id === orderToCancel ? { ...o, status: 'Cancelled' } : o));
                setCancelModalOpen(false);
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to cancel order.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel order.");
        } finally {
            setSubmittingCancel(false);
        }
    };

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
                    // Handle paginated response
                    const results = Array.isArray(data) ? data : (data.results || []);
                    // Sort orders by most recent
                    const sortedOrders = results.sort((a: any, b: any) =>
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

    const handleReorder = async (orderId: number) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(createApiUrl(`api/orders/${orderId}/reorder/`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                toast.success('Items successfully added to cart!');
                // Wait briefly, then redirect cart
                setTimeout(() => navigate('/cart'), 1500);
            } else {
                toast.error('Failed to add items to cart.');
            }
        } catch (error) {
            toast.error('An error occurred while reordering.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-600';
            case 'completed':
            case 'delivered': return 'bg-green-500/10 text-green-600';
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

                                {/* Order Tracking Timeline */}
                                <div className="px-8 md:px-10 py-6 bg-white dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-800">
                                    {order.status === 'Cancelled' ? (
                                        <div className="flex flex-col gap-2 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <span className="text-sm font-black uppercase tracking-widest">Order Cancelled</span>
                                            </div>
                                            {order.cancel_reason && <p className="text-xs font-bold opacity-80 pl-7">Reason: {order.cancel_reason}</p>}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="flex justify-between items-center w-full relative z-10">
                                                {['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, idx, arr) => {
                                                    const statusIndex = arr.indexOf(order.status);
                                                    const isCompleted = statusIndex >= idx;
                                                    const isCurrent = statusIndex === idx;

                                                    return (
                                                        <div key={idx} className="flex flex-col items-center flex-1 relative">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-brand-500 border-brand-100 dark:border-brand-500/30' : 'bg-gray-200 dark:bg-gray-800 border-white dark:border-gray-950'} z-10 transition-colors`}>
                                                                {isCompleted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest mt-2 ${isCurrent ? 'text-brand-500' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step}</span>
                                                            {idx < arr.length - 1 && (
                                                                <div className={`absolute top-4 left-[50%] w-full h-1 -z-10 ${statusIndex > idx ? 'bg-brand-500' : 'bg-gray-100 dark:bg-gray-800'}`}></div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
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
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white font-mono">${parseFloat(item.total_price.toString()).toFixed(2)}</p>
                                                    {order.status === 'Delivered' && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); handleOpenReview(item.product, item.product_name); }}
                                                            className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1.5 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full mt-2"
                                                        >
                                                            <Star className="w-3 h-3" /> Write Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer (Action) */}
                                <div className="p-6 bg-white/50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    {!['Delivered', 'Cancelled'].includes(order.status) ? (
                                        <button
                                            onClick={() => handleOpenCancel(order.id)}
                                            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Cancel Order
                                        </button>
                                    ) : <div></div>}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleReorder(order.id)}
                                            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-lg shadow-brand-500/20"
                                        >
                                            Buy It Again
                                        </button>
                                        <Link to={`/invoice/${order.id}`} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-500 border border-gray-200 dark:border-gray-700 hover:border-brand-500 rounded-xl transition-all">
                                            Download Invoice
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Review Modal */}
            {reviewModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-lg p-10 border border-gray-100 dark:border-gray-800 shadow-2xl transform transition-all">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Write a Review</h3>
                        <p className="text-sm font-bold text-gray-500 mb-8 max-w-md break-words line-clamp-2">
                            Share your thoughts on <span className="text-brand-500">{selectedProduct.name}</span>
                        </p>

                        <form onSubmit={handleSubmitReview} className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-4">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`p-3 rounded-2xl transition-all ${rating >= star ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-700'}`}
                                        >
                                            <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-4">Your Feedback</label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full p-6 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400 min-h-[150px] dark:text-white"
                                    placeholder="What did you like or dislike?"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setReviewModalOpen(false)}
                                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black uppercase tracking-widest rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="flex-1 py-5 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-3xl hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50"
                                >
                                    {submittingReview ? 'Publishing...' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Cancel Modal */}
            {cancelModalOpen && orderToCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-lg p-10 border border-gray-100 dark:border-gray-800 shadow-2xl transform transition-all">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Cancel Order</h3>
                        <p className="text-sm font-bold text-gray-500 mb-8 max-w-md break-words line-clamp-2">
                            Please provide a reason for cancelling your order.
                        </p>

                        <form onSubmit={handleSubmitCancel} className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-4">Reason for Cancellation</label>
                                <textarea
                                    required
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full p-6 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-400 min-h-[150px] dark:text-white"
                                    placeholder="Why are you cancelling?"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCancelModalOpen(false)}
                                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black uppercase tracking-widest rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                >
                                    Go Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingCancel}
                                    className="flex-1 py-5 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-3xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                                >
                                    {submittingCancel ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default OrdersPage;
