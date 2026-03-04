import React, { useEffect, useState } from 'react';
import { getCategories, Category } from './category/api';
import { Link } from 'react-router-dom';

const PublicCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories()
            .then(data => {
                setCategories(data.results);
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center mb-16 max-w-2xl mx-auto">
                <span className="text-brand-500 font-black text-xs uppercase tracking-widest mb-2 block">Our Taxonomy</span>
                <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Browse by <span className="text-brand-500">Category.</span></h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    Explore our diverse collections across various departments. From lifestyle essentials to tech-forward gadgets, find exactly what you're looking for.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {categories.map(category => (
                    <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        className="group relative h-[450px] rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                    >
                        <img
                            src={category.image || `https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=2070&auto=format&fit=crop`}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                        <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start gap-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                            <span className="px-4 py-1.5 bg-brand-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-brand-500/20">
                                Global Collection
                            </span>
                            <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">{category.name}</h3>
                            <p className="text-sm text-gray-300 font-bold max-w-xs mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {category.description || 'Discover our curated selection for this premium category.'}
                            </p>
                            <button className="flex items-center gap-3 text-white text-xs font-black uppercase tracking-widest hover:text-brand-400 transition-colors group-hover:gap-5">
                                Explore All Products
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </div>

                        <div className="absolute top-10 right-10 w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-all opacity-0 group-hover:opacity-100">
                            <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-24 p-12 lg:p-20 bg-gray-900 rounded-[3rem] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="0.1" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Can't find what you're looking for?</h2>
                <p className="text-gray-400 font-bold mb-10 max-w-lg mx-auto">Our catalog is constantly expanding with new designers and emerging brands. Tell us what you'd love to see next.</p>
                <button className="px-10 py-4 bg-white text-gray-900 font-black rounded-full hover:bg-brand-500 hover:text-white transition shadow-xl">Contact Concierge</button>
            </div>
        </div>
    );
};

export default PublicCategories;
