import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, Category } from './category/api';
import { getProducts, Product } from './products/api';

const Home: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getCategories(), getProducts()])
            .then(([catData, prodData]) => {
                setCategories(catData.results.slice(0, 4));
                setProducts(prodData.results.slice(0, 8));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center overflow-hidden">
                <div className="absolute inset-0 bg-brand-500 dark:bg-brand-900/40">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero"
                        className="w-full h-full object-cover mix-blend-overlay opacity-50"
                    />
                </div>
                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <span className="inline-block px-4 py-1.5 bg-brand-500/20 backdrop-blur-sm text-brand-300 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-brand-500/30">
                            New Collection 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8">
                            ELEVATE YOUR <br />
                            <span className="text-brand-400">DAILY STYLE.</span>
                        </h1>
                        <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-lg">
                            Experience the pinnacle of fashion and technology with our latest curated collections. Pure quality, delivered to your door.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/products" className="px-10 py-4 bg-brand-500 text-white font-black rounded-full hover:bg-white hover:text-brand-500 transition shadow-2xl shadow-brand-500/20">
                                Shop All Products
                            </Link>
                            <Link to="/categories" className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black rounded-full hover:bg-white/20 transition">
                                Explore Categories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-24 bg-white dark:bg-gray-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-brand-500 font-black text-xs uppercase tracking-widest mb-2 block">Departments</span>
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Shop by <span className="text-brand-500">Category.</span></h2>
                        </div>
                        <Link to="/categories" className="text-sm font-bold text-gray-400 hover:text-brand-500 transition-colors uppercase tracking-widest flex items-center gap-2">
                            Full Catalog
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map(category => (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.slug}`}
                                className="group relative h-80 rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                            >
                                <img
                                    src={category.image || `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop`}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <h3 className="text-2xl font-black text-white mb-2">{category.name}</h3>
                                    <p className="text-sm text-gray-300 font-medium group-hover:text-brand-300 transition-colors">
                                        Browse Collection
                                    </p>
                                </div>
                                <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform opacity-0 group-hover:opacity-100">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24 bg-gray-50 dark:bg-gray-900/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-brand-500 font-black text-xs uppercase tracking-widest mb-2 block">Our Favorites</span>
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Featured <span className="text-brand-500">Selection.</span></h2>
                        </div>
                        <Link to="/products" className="text-sm font-bold text-gray-400 hover:text-brand-500 transition-colors uppercase tracking-widest flex items-center gap-2">
                            All Products
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <div key={product.id} className="group flex flex-col bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-3xl hover:border-brand-500/20 transition-all duration-500">
                                <div className="h-72 relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={product.images?.[0]?.image || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </Link>
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <span className="px-3 py-1 bg-white/90 dark:bg-brand-500/90 backdrop-blur-sm text-[10px] font-black tracking-tighter uppercase text-gray-900 dark:text-white rounded-lg shadow-sm">
                                            {product.category_name}
                                        </span>
                                    </div>
                                    <button className="absolute bottom-6 right-6 w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hover:bg-brand-500 shadow-xl shadow-black/10">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <Link to={`/product/${product.id}`}>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors line-clamp-1">{product.name}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow line-clamp-2 leading-relaxed">{product.description}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-gray-900 dark:text-white">${product.final_price}</span>
                                            {product.discount_price && (
                                                <span className="text-xs text-gray-400 line-through font-bold">${product.price}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <svg key={s} className="w-3 h-3 text-orange-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">(42)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter section */}
            <section className="py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-brand-500 rounded-[3rem] p-12 md:p-24 relative overflow-hidden shadow-3xl shadow-brand-500/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-600 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                        <div className="relative z-1 max-w-2xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">Stay in the <span className="text-black/20">Loop.</span></h2>
                            <p className="text-lg text-white/80 mb-10 font-bold">Sign up for our newsletter and get 15% off your first luxury purchase.</p>
                            <form className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-grow px-8 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition shadow-inner"
                                />
                                <button className="px-10 py-4 bg-white text-brand-500 font-black rounded-full hover:bg-gray-100 transition shadow-xl">
                                    Subscribe Now
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
