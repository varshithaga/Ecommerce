import React, { useEffect, useState } from 'react';
import { getProducts, Product } from './api';

const ProductPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-6">Loading products...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition">
                        <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0].image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No Image
                                </div>
                            )}
                            {product.discount_price && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    SALE
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">
                                {product.category_name}
                            </p>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">
                                {product.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    ${product.final_price}
                                </span>
                                {product.discount_price && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ${product.price}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                    Edit
                                </button>
                                <button className="px-3 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No products found. Add your first product to get started!</p>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
