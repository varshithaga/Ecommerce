import React, { useEffect, useState } from 'react';
import { createApiUrl, getAuthHeaders } from '../access/access.ts';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Product {
    id: number;
    name: string;
    price: string;
    final_price: number;
    images: { image: string }[];
}

const WishlistPage: React.FC = () => {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(createApiUrl('api/wishlist/'), {
                headers: headers
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.products) {
                    setWishlistItems(data.products);
                }
            } else if (response.status === 401) {
                setWishlistItems([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId: number) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(createApiUrl('api/wishlist/toggle/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: productId })
            });

            if (response.ok) {
                const data = await response.json();
                if (!data.in_wishlist) {
                    setWishlistItems(prev => prev.filter(item => item.id !== productId));
                    toast.success("Removed from wishlist.");
                }
            } else {
                toast.error("Failed to remove from wishlist.");
            }
        } catch (error) {
            console.error("Wishlist toggle error", error);
            toast.error("An error occurred");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen pb-24">
            <PageMeta title="My Wishlist | E-Shop" description="View and manage your saved products." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-12">
                    My <span className="text-brand-500">Wishlist</span>
                    <span className="text-lg ml-4 opacity-50">({wishlistItems.length} Items)</span>
                </h1>

                {wishlistItems.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Your wishlist is empty</h2>
                        <Link to="/products" className="px-10 py-4 bg-brand-500 text-white font-black rounded-full hover:bg-brand-600 transition shadow-xl">
                            Discover Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlistItems.map(product => (
                            <div key={product.id} className="group p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all flex flex-col justify-between">
                                <Link to={`/product/${product.id}`} className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-6 block hover:opacity-80 transition-opacity">
                                    <img
                                        src={product.images?.[0]?.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </Link>

                                <div>
                                    <Link to={`/product/${product.id}`}>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-2 hover:text-brand-500 transition-colors mb-2">{product.name}</h3>
                                    </Link>
                                    <span className="text-2xl font-black text-brand-500 block mb-6">${product.final_price}</span>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="text-xs font-black text-error-500 bg-error-50 dark:bg-error-500/10 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-error-100 dark:hover:bg-error-500/20 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                        Remove
                                    </button>
                                    <Link to={`/product/${product.id}`} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-500 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5">
                                        View Details
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </Link>
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

export default WishlistPage;
