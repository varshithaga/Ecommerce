import React, { useEffect, useState } from 'react';
import { getCategories, Category } from './api';

const CategoryPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories()
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-6">Loading categories...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h1>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <div key={category.id} className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition cursor-pointer group">
                        <div className="w-16 h-16 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden mr-4">
                            {category.image ? (
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                            ) : (
                                category.name.substring(0, 1)
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                                {category.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {category.description || 'No description provided'}
                            </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                Edit
                            </button>
                            <button className="p-1 text-red-400 hover:text-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No categories found.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
