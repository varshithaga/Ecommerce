import React, { useEffect, useState, useCallback } from 'react';
import { getProducts, Product, deleteProduct } from './api';
import ProductFormModal from './ProductFormModal';
import { Search, ChevronLeft, ChevronRight, Plus, Package } from 'lucide-react';

const ProductPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalResults, setTotalResults] = useState(0);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProducts(searchQuery, currentPage);
            setProducts(data.results);
            setTotalPages(data.total_pages);
            setTotalResults(data.count);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery, fetchProducts]);

    const handleAdd = () => {
        setSelectedProduct(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Inventory <span className="text-indigo-600">Control</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Managing {totalResults} unique product listings
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Search name, brand, model..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] text-sm focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all shadow-sm"
                        />
                        <Search className="absolute left-4.5 top-4.5 w-5 h-5 text-gray-400 ml-1" />
                    </div>

                    <button
                        onClick={handleAdd}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 dark:shadow-none font-black text-sm uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" />
                        New Product
                    </button>
                </div>
            </div>

            {loading && products.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map(product => (
                            <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-500 flex flex-col">
                                <div className="h-64 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0].image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-200 dark:text-gray-700">
                                            <Package className="w-16 h-16 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className="px-4 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-[9px] font-black text-gray-900 dark:text-white rounded-xl shadow-sm uppercase tracking-widest border border-gray-100/50 dark:border-gray-700">
                                            {product.category_name}
                                        </span>
                                        {product.is_bestseller && (
                                            <span className="px-4 py-1.5 bg-yellow-400 text-[9px] font-black text-yellow-900 rounded-xl shadow-lg uppercase tracking-widest">
                                                Bestseller
                                            </span>
                                        )}
                                        {product.is_new && (
                                            <span className="px-4 py-1.5 bg-green-500 text-[9px] font-black text-white rounded-xl shadow-lg uppercase tracking-widest">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase tracking-widest">
                                            ${product.final_price}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-7 flex-1 flex flex-col">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition truncate uppercase tracking-tight">
                                        {product.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${product.stock > 10 ? 'bg-green-500 shadow-lg shadow-green-100' : 'bg-orange-500 shadow-lg shadow-orange-100'}`}></div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {product.stock} Units left
                                            </span>
                                        </div>
                                        {product.discount_price && (
                                            <span className="text-xs font-bold text-red-500 line-through opacity-40">
                                                ${product.price}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-gray-50 dark:border-gray-700">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 px-4 py-3 text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-2xl hover:bg-indigo-200 transition-all uppercase tracking-widest"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="px-5 py-3 text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-2xl hover:bg-red-200 transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 && !loading && (
                        <div className="text-center py-32 bg-gray-50/50 dark:bg-gray-800/20 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                            <Package className="w-20 h-20 text-gray-100 mx-auto mb-8" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No products found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2 font-medium">Try adjusting your filters or search terms.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-12 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-4 bg-white dark:bg-gray-800 text-gray-500 disabled:opacity-30 rounded-[1.5rem] transition-all shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500/30"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-4 bg-white dark:bg-gray-800 text-gray-500 disabled:opacity-30 rounded-[1.5rem] transition-all shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500/30"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProducts}
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductPage;
