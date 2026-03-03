import React, { useEffect, useState } from 'react';
import { getProducts, Product, deleteProduct } from './api';
import ProductFormModal from './ProductFormModal';

const ProductPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    const fetchProducts = () => {
        setLoading(true);
        getProducts()
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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

    if (loading && products.length === 0) return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your inventory and shop items</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none font-semibold"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300 flex flex-col">
                        <div className="h-56 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0].image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-[10px] font-bold text-gray-900 dark:text-white rounded-full shadow-sm uppercase tracking-wider border border-gray-100 dark:border-gray-700">
                                    {product.category_name}
                                </span>
                                {product.is_bestseller && (
                                    <span className="px-3 py-1 bg-yellow-400 text-[10px] font-bold text-yellow-900 rounded-full shadow-sm uppercase tracking-wider">
                                        Bestseller
                                    </span>
                                )}
                                {product.is_new && (
                                    <span className="px-3 py-1 bg-green-500 text-[10px] font-bold text-white rounded-full shadow-sm uppercase tracking-wider">
                                        New Arrival
                                    </span>
                                )}
                                {product.is_featured && (
                                    <span className="px-3 py-1 bg-indigo-500 text-[10px] font-bold text-white rounded-full shadow-sm uppercase tracking-wider">
                                        Featured
                                    </span>
                                )}
                            </div>
                            {product.discount_price && (
                                <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                                    OFFER
                                </span>
                            )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition truncate">
                                {product.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                                {product.description}
                            </p>

                            <div className="flex items-end justify-between mb-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                                            ${product.final_price}
                                        </span>
                                        {product.discount_price && (
                                            <span className="text-sm text-gray-400 line-through">
                                                ${product.price}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                            {product.stock} IN STOCK
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 px-3 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-100 dark:shadow-none">
                        <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inventory is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2">Start adding products to showcase your collection.</p>
                    <button
                        onClick={handleAdd}
                        className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 dark:shadow-none font-bold text-lg"
                    >
                        Add Product
                    </button>
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
