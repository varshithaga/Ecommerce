import React, { useEffect, useState, useCallback } from 'react';
import { getCategories, Category, deleteCategory } from './api';
import CategoryFormModal from './CategoryFormModal';
import { Search, ChevronLeft, ChevronRight, Plus, Folder } from 'lucide-react';

const CategoryPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalResults, setTotalResults] = useState(0);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCategories(searchQuery, currentPage);
            setCategories(data.results);
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
            fetchCategories();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery, fetchCategories]);

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

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Product <span className="text-indigo-600">Categories</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Managing {totalResults} categories in your catalog
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all shadow-sm"
                        />
                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    </div>

                    <button
                        onClick={handleAdd}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 dark:shadow-none font-bold text-sm uppercase tracking-wider"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>
            </div>

            {loading && categories.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {categories.map(category => (
                            <div
                                key={category.id}
                                className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300 group relative"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden border border-indigo-100/50 dark:border-indigo-800/50">
                                        {category.image ? (
                                            <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <Folder className="w-8 h-8 opacity-40" />
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h2 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition truncate uppercase">
                                            {category.name}
                                        </h2>
                                        <span className="text-[10px] px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-black uppercase tracking-widest mt-1 inline-block">
                                            {category.slug}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10 leading-relaxed font-medium">
                                    {category.description || 'No description provided for this category.'}
                                </p>

                                <div className="flex gap-3 pt-6 border-t border-gray-50 dark:border-gray-700">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="flex-1 px-4 py-2.5 text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 transition-all uppercase tracking-widest"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="px-4 py-2.5 text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl hover:bg-red-200 transition-all uppercase tracking-widest"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {categories.length === 0 && !loading && (
                        <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                            <Plus className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No categories found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2 font-medium">Try adjusting your search or add a new category.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-3 bg-white dark:bg-gray-800 text-gray-500 disabled:opacity-30 rounded-2xl transition-all shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500/30"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-3 bg-white dark:bg-gray-800 text-gray-500 disabled:opacity-30 rounded-2xl transition-all shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500/30"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
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
