import React, { useEffect, useState } from 'react';
import { getCategories, Category, deleteCategory } from './api';
import CategoryFormModal from './CategoryFormModal';

const CategoryPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

    const fetchCategories = () => {
        setLoading(true);
        getCategories()
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = () => {
        setSelectedCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                fetchCategories();
            } catch (err) {
                alert('Failed to delete category');
            }
        }
    };

    if (loading && categories.length === 0) return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your product categories</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none font-semibold"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className="flex flex-col p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/40 transition group relative"
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden border border-indigo-100/50 dark:border-indigo-800/50">
                                {category.image ? (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl uppercase">{category.name.substring(0, 1)}</span>
                                )}
                            </div>
                            <div className="ml-4 flex-1">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                                    {category.name}
                                </h2>
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full font-medium uppercase tracking-wider">
                                    {category.slug}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                            {category.description || 'No description provided for this category.'}
                        </p>

                        <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-700">
                            <button
                                onClick={() => handleEdit(category)}
                                className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(category.id)}
                                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && !loading && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No categories found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-1">Get started by creating your first product category.</p>
                    <button
                        onClick={handleAdd}
                        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none font-semibold"
                    >
                        Add Your First Category
                    </button>
                </div>
            )}

            <CategoryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCategories}
                category={selectedCategory}
            />
        </div>
    );
};

export default CategoryPage;
