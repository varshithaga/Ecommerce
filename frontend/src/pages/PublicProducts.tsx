import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getProducts, Product, addToCart, PaginatedProductResponse } from './products/api';
import { getCategories, Category } from './category/api';
import { useLocation, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PublicProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalResults, setTotalResults] = useState(0);

    const location = useLocation();
    const observer = useRef<IntersectionObserver | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const query = new URLSearchParams(location.search);
    const categorySlug = query.get('category') || "";
    const searchQuery = query.get('search') || "";

    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(5000);
    const [sortOption, setSortOption] = useState<string>('newest');
    const [minRating, setMinRating] = useState<number>(0);

    const fetchInitialData = useCallback(async () => {
        setInitialLoading(true);
        try {
            const [prodData, catData] = await Promise.all([
                getProducts(searchQuery, 1, categorySlug, minPrice, maxPrice, sortOption, minRating),
                getCategories()
            ]);
            setProducts(prodData.results);
            setCategories(catData.results);
            setHasMore(prodData.next !== null);
            setPage(1);
            setTotalResults(prodData.count);
        } catch (err) {
            console.error(err);
        } finally {
            setInitialLoading(false);
        }
    }, [categorySlug, searchQuery, minPrice, maxPrice, sortOption, minRating]);

    const fetchMoreProducts = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const nextPage = page + 1;
            const data: PaginatedProductResponse = await getProducts(searchQuery, nextPage, categorySlug, minPrice, maxPrice, sortOption, minRating);
            setProducts(prev => [...prev, ...data.results]);
            setHasMore(data.next !== null);
            setPage(nextPage);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, hasMore, loading, categorySlug, searchQuery, minPrice, maxPrice, sortOption, minRating]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        if (initialLoading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchMoreProducts();
            }
        }, { threshold: 1.0 });

        if (bottomRef.current) {
            observer.current.observe(bottomRef.current);
        }

        return () => observer.current?.disconnect();
    }, [hasMore, loading, initialLoading, fetchMoreProducts]);

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



    if (initialLoading) return (
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
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest">Categories</h2>
                            <div className="flex flex-col gap-4">
                                <Link
                                    to="/products"
                                    className={`text-sm font-bold transition-colors uppercase tracking-widest ${!categorySlug ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500'}`}
                                >
                                    All Styles
                                </Link>
                                {categories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/products?category=${cat.slug}`}
                                        className={`text-sm font-bold transition-colors uppercase tracking-widest ${categorySlug === cat.slug ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500'}`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest">Price Range</h2>
                            <div className="space-y-6">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                    <span>${minPrice}</span>
                                    <span>${maxPrice}</span>
                                </div>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(Number(e.target.value))}
                                        className="w-1/2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="w-1/2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest">Customer Rating</h2>
                            <div className="flex flex-col gap-3">
                                {[4, 3, 2, 1].map((rating) => (
                                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={minRating === rating}
                                            onChange={() => setMinRating(rating)}
                                            className="w-5 h-5 text-brand-500 bg-gray-100 border-gray-300 focus:ring-brand-500 focus:ring-2 cursor-pointer"
                                        />
                                        <div className="flex text-yellow-400 text-sm">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-brand-500 transition-colors">& Up</span>
                                    </label>
                                ))}
                                <label className="flex items-center gap-3 cursor-pointer group mt-2">
                                    <input
                                        type="radio"
                                        name="rating"
                                        checked={minRating === 0}
                                        onChange={() => setMinRating(0)}
                                        className="w-5 h-5 text-brand-500 bg-gray-100 border-gray-300 focus:ring-brand-500 focus:ring-2 cursor-pointer"
                                    />
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-brand-500 transition-colors">Any Rating</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-8 bg-brand-500 rounded-[2rem] text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-brand-200">Catalog</span>
                            <h3 className="text-2xl font-black mb-4">Latest <br />Trends</h3>
                            <button className="text-xs font-black uppercase tracking-widest pb-1 border-b-2 border-white/40 hover:border-white transition-colors">
                                Browse New
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-12">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {searchQuery ? `Search: ${searchQuery}` : categorySlug ? categorySlug.replace(/-/g, ' ') : 'Our Collection'}
                            <span className="text-brand-500 text-lg ml-4 opacity-50 font-bold tracking-tighter">({totalResults} Items)</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:block">Sort By:</span>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="py-32 text-center bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 uppercase">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">No products found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold text-xs tracking-widest">Try adjusting your filters.</p>
                            <Link to="/products" className="px-10 py-4 bg-brand-500 text-white font-black rounded-full hover:bg-brand-600 transition shadow-xl text-xs tracking-widest">Clear Filters</Link>
                        </div>
                    ) : (
                        <div className="space-y-12">
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
                                            </div>
                                            <div className="absolute bottom-6 left-6 right-6 flex gap-2 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleAddToCart(product.id, product.name); }}
                                                    disabled={addingToCartId === product.id}
                                                    className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-500 hover:text-white transition disabled:opacity-50"
                                                >
                                                    {addingToCartId === product.id ? 'Adding...' : 'Add to Bag'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-1">
                                            <Link to={`/product/${product.id}`}>
                                                <h2 className="text-xl font-black text-gray-100 dark:text-white mb-2 group-hover:text-brand-500 transition-colors line-clamp-1 uppercase tracking-tight">{product.name}</h2>
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
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-brand-500 rounded-lg text-white overflow-hidden">
                                                        <span className="text-[10px] font-black tracking-widest uppercase">{product.average_rating || '5.0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sentinel for Infinite Scroll */}
                            <div ref={bottomRef} className="h-20 flex items-center justify-center">
                                {loading && (
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading More</span>
                                    </div>
                                )}
                                {!hasMore && totalResults > 0 && (
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">You've reached the end</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="bottom-right" theme="dark" />
        </div>
    );
};

export default PublicProducts;
