import React, { useEffect, useState } from 'react';
import { createApiUrl } from '../access/access.ts';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CartItem {
    id: number;
    product: {
        id: number;
        name: string;
        price: string;
        final_price: string;
        images: { image: string }[];
    };
    quantity: number;
}

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(createApiUrl('api/cart/'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setCartItems(data[0].items || []);
                }
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const removeFromCart = async (itemId: number) => {
        toast.info("Remove functionality coming soon!");
        console.log("Removing item:", itemId);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    const totalPrice = cartItems.reduce((acc: number, item: CartItem) => acc + (parseFloat(item.product.final_price) * item.quantity), 0);

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen pb-24">
            <PageMeta title="Your Shopping Bag | E-Shop" description="Review your selected items and proceed to checkout." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-12">
                    Shopping <span className="text-brand-500">Bag</span>
                    <span className="text-lg ml-4 opacity-50">({cartItems.length} Items)</span>
                </h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Your bag is empty</h2>
                        <Link to="/products" className="px-10 py-4 bg-brand-500 text-white font-black rounded-full hover:bg-brand-600 transition shadow-xl">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Cart Items List */}
                        <div className="lg:w-2/3 space-y-8">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-6 p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all">
                                    <div className="w-32 h-32 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                                        <img
                                            src={item.product.images?.[0]?.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.product.name}</h3>
                                                <span className="text-xl font-black text-brand-500">${item.product.final_price}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-800">
                                            <button className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-brand-500 transition-colors">
                                                Save for later
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-xs font-black text-error-500 uppercase tracking-widest hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-28 p-8 bg-gray-900 dark:bg-white rounded-[3rem] text-white dark:text-gray-900 shadow-2xl">
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Order Summary</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm font-bold opacity-60">
                                        <span>Subtotal</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold opacity-60">
                                        <span>Shipping</span>
                                        <span>FREE</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold opacity-60">
                                        <span>Estimated Tax</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 dark:border-gray-100 flex justify-between">
                                        <span className="text-xl font-black uppercase">Total</span>
                                        <span className="text-xl font-black">${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button className="w-full py-5 bg-brand-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 active:translate-y-1">
                                    Checkout Now
                                </button>

                                <div className="mt-8 pt-8 border-t border-white/10 dark:border-gray-100 grid grid-cols-2 gap-4 opacity-50">
                                    <div className="flex flex-col items-center text-center">
                                        <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.033A12.006 12.006 0 002.25 10.5c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.321-.66-4.487-1.802-6.321z" /></svg>
                                        <span className="text-[10px] font-black uppercase">Secure Payment</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
                                        <span className="text-[10px] font-black uppercase">Easy Returns</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default CartPage;
