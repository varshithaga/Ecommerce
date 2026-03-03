import React, { useEffect, useState } from 'react';
import { getProducts, Product, addToCart } from './products/api';
import { getCategories, Category } from './category/api';
import { useLocation, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PublicProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
    const location = useLocation();

    // Simple way to get query params
    const query = new URLSearchParams(location.search);
    const categorySlug = query.get('category');

    const handleAddToCart = async (productId: number, productName: string) => {
        setAddingToCartId(productId);
        try {
            await addToCart(productId, 1);
            toast.success(`${productName} added to bag!`);
        } catch (err: any) {
            toast.error(err.message || 'Error adding to bag');
        } finally {
            setAddingToCartId(null);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([getProducts(), getCategories()])
            .then(([prodData, catData]) => {
                let filtered = prodData;
                if (categorySlug) {
                    filtered = prodData.filter(p => p.category_slug === categorySlug || p.category_name.toLowerCase().includes(categorySlug.toLowerCase()));
                }
                setProducts(filtered);
                setCategories(catData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [categorySlug]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Filters */}
                <aside className="lg:w-72 flex-shrink-0">
                    <div className="sticky top-28 space-y-12">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8">Categories</h2>
                            <div className="flex flex-col gap-4">
                                <a
                                    href="/products"
                                    className={`text-sm font-bold transition-colors ${!categorySlug ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500'}`}
                                >
                                    All Styles
                                </a>
                                {categories.map(cat => (
                                    <a
                                        key={cat.id}
                                        href={`/products?category=${cat.slug}`}
                                        className={`text-sm font-bold transition-colors ${categorySlug === cat.slug ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500'}`}
                                    >
                                        {cat.name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8">Price Range</h2>
                            <div className="space-y-6">
                                <input type="range" className="w-full accent-brand-500" min="0" max="1000" />
                                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <span>$0</span>
                                    <span>$1000+</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-brand-500 rounded-[2rem] text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-brand-200">Sale</span>
                            <h3 className="text-2xl font-black mb-4">Up to <br />30% Off</h3>
                            <button className="text-xs font-black uppercase tracking-widest pb-1 border-b-2 border-white/40 hover:border-white transition-colors">
                                View Deals
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-12">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {categorySlug ? categorySlug.replace('-', ' ') : 'Our Collection'}
                            <span className="text-brand-500 text-lg ml-4 opacity-50 font-bold tracking-tighter">({products.length} Items)</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:block">Sort By:</span>
                            <select className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none cursor-pointer">
                                <option>Newest First</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Most Popular</option>
                            </select>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="py-32 text-center bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                            <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No products found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Try adjusting your filters or search terms.</p>
                            <a href="/products" className="px-10 py-4 bg-brand-500 text-white font-black rounded-full hover:bg-brand-600 transition shadow-xl">Back to Collection</a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                            {products.map(product => (
                                <div key={product.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-3xl hover:border-brand-500/20 transition-all duration-500 flex flex-col">
                                    <div className="h-80 relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                                        <Link to={`/product/${product.id}`}>
                                            <img
                                                src={product.images?.[0]?.image || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop`}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </Link>
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <span className="px-3 py-1 bg-white/90 dark:bg-brand-500/90 backdrop-blur-sm text-[10px] font-black tracking-tighter uppercase text-gray-900 dark:text-white rounded-lg shadow-sm">
                                                {product.category_name}
                                            </span>
                                            {product.is_bestseller && (
                                                <span className="px-3 py-1 bg-yellow-400 text-[10px] font-black tracking-tighter uppercase text-yellow-900 rounded-lg shadow-sm">
                                                    Bestseller
                                                </span>
                                            )}
                                            {product.is_new && (
                                                <span className="px-3 py-1 bg-green-500 text-[10px] font-black tracking-tighter uppercase text-white rounded-lg shadow-sm">
                                                    New
                                                </span>
                                            )}
                                            {product.is_featured && (
                                                <span className="px-3 py-1 bg-brand-500 text-[10px] font-black tracking-tighter uppercase text-white rounded-lg shadow-sm">
                                                    Featured
                                                </span>
                                            )}
                                            {product.discount_price && (
                                                <span className="px-3 py-1 bg-red-600 text-[10px] font-black tracking-tighter uppercase text-white rounded-lg shadow-sm">
                                                    Offer
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute bottom-6 left-6 right-6 flex gap-2 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleAddToCart(product.id, product.name); }}
                                                disabled={addingToCartId === product.id}
                                                className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-500 hover:text-white transition disabled:opacity-50"
                                            >
                                                {addingToCartId === product.id ? 'Adding...' : 'Add to Bag'}
                                            </button>
                                            <button className="w-12 h-12 bg-white text-gray-900 rounded-2xl flex items-center justify-center hover:bg-brand-500 hover:text-white transition shadow-xl">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <Link to={`/product/${product.id}`}>
                                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors line-clamp-1">{product.name}</h2>
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black text-gray-900 dark:text-white">${product.final_price}</span>
                                                {product.discount_price && (
                                                    <span className="text-xs text-gray-400 line-through font-bold">${product.price}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-70">
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-brand-500 rounded text-white overflow-hidden">
                                                    <span className="text-[10px] font-black">{product.average_rating || '0.0'}</span>
                                                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400"> ({product.review_count || '0'})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-20 flex justify-center items-center gap-4">
                        <button className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500 transition shadow-sm opacity-50 cursor-not-allowed">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="w-12 h-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-brand-500/20">1</button>
                        <button className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center font-black text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500 transition">2</button>
                        <button className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center font-black text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500 transition">3</button>
                        <button className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500 transition shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default PublicProducts;
