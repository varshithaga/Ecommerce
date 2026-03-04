import React, { useState, useEffect } from 'react';
import { Product, createProduct, updateProduct } from './api';
import { getCategories, Category } from '../category/api';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: Product;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        stock: '',
        category: '',
        is_available: true,
        brand: '',
        model_name: '',
        model_number: '',
        sku: '',
        hsn_code: '',
        generic_name: '',
        highlights: '',
        return_days: '7',
        return_policy: '7-Day Return Policy',
        replacement_policy: '7-Day Replacement Policy',
        delivery_info: 'Free Delivery in 3-5 business days',
        warranty_summary: '',
        warranty_period: '',
        warranty_service_type: '',
        warranty_covered: '',
        warranty_not_covered: '',
        country_of_origin: '',
        manufacturer_details: '',
        packer_details: '',
        importer_details: '',
        net_quantity: '',
        product_weight: '',
        product_dimensions: '',
        is_bestseller: false,
        is_featured: false,
        is_new: true,
        meta_title: '',
        meta_description: '',
        video_url: ''
    });
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch categories for the dropdown
        getCategories().then(data => setCategories(data.results)).catch(console.error);
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                discount_price: product.discount_price || '',
                stock: product.stock.toString(),
                category: product.category.toString(),
                is_available: product.is_available,
                brand: product.brand || '',
                model_name: product.model_name || '',
                model_number: product.model_number || '',
                sku: product.sku || '',
                hsn_code: product.hsn_code || '',
                generic_name: product.generic_name || '',
                highlights: product.highlights || '',
                return_days: product.return_days.toString(),
                return_policy: product.return_policy || '',
                replacement_policy: product.replacement_policy || '',
                delivery_info: product.delivery_info || '',
                warranty_summary: product.warranty_summary || '',
                warranty_period: product.warranty_period || '',
                warranty_service_type: product.warranty_service_type || '',
                warranty_covered: product.warranty_covered || '',
                warranty_not_covered: product.warranty_not_covered || '',
                country_of_origin: product.country_of_origin || '',
                manufacturer_details: product.manufacturer_details || '',
                packer_details: product.packer_details || '',
                importer_details: product.importer_details || '',
                net_quantity: product.net_quantity || '',
                product_weight: product.product_weight || '',
                product_dimensions: product.product_dimensions || '',
                is_bestseller: product.is_bestseller,
                is_featured: product.is_featured,
                is_new: product.is_new,
                meta_title: product.meta_title || '',
                meta_description: product.meta_description || '',
                video_url: product.video_url || ''
            });
            setPreviewUrls(product.images?.map(img => img.image) || []);
            setImages([]);
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                discount_price: '',
                stock: '',
                category: '',
                is_available: true,
                brand: '',
                model_name: '',
                model_number: '',
                sku: '',
                hsn_code: '',
                generic_name: '',
                highlights: '',
                return_days: '7',
                return_policy: '7-Day Return Policy',
                replacement_policy: '7-Day Replacement Policy',
                delivery_info: 'Free Delivery in 3-5 business days',
                warranty_summary: '',
                warranty_period: '',
                warranty_service_type: '',
                warranty_covered: '',
                warranty_not_covered: '',
                country_of_origin: '',
                manufacturer_details: '',
                packer_details: '',
                importer_details: '',
                net_quantity: '',
                product_weight: '',
                product_dimensions: '',
                is_bestseller: false,
                is_featured: false,
                is_new: true,
                meta_title: '',
                meta_description: '',
                video_url: ''
            });
            setImages([]);
            setPreviewUrls([]);
        }
    }, [product, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    data.append(key, String(value));
                }
            });

            // Append multiple images
            images.forEach(file => {
                data.append('uploaded_images', file);
            });

            if (product) {
                await updateProduct(product.id, data);
            } else {
                await createProduct(data);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* 🏢 Basic Identification */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="e.g. iPhone 15 Pro Max" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                                    <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Name</label>
                                    <input type="text" name="model_name" value={formData.model_name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Number</label>
                                    <input type="text" name="model_number" value={formData.model_number} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HSN Code</label>
                                    <input type="text" name="hsn_code" value={formData.hsn_code} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        {/* 💰 Pricing & Inventory */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Pricing & Inventory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($) *</label>
                                    <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Price ($)</label>
                                    <input type="number" step="0.01" name="discount_price" value={formData.discount_price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock *</label>
                                    <input type="number" name="stock" required value={formData.stock} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        {/* 📝 Content */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Description & Highlights</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Highlights (Bullet points)</label>
                                    <textarea name="highlights" value={formData.highlights} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" rows={3} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Description *</label>
                                    <textarea name="description" required value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" rows={5} />
                                </div>
                            </div>
                        </div>

                        {/* 🛡️ Warranty & Policies */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Warranty & Policies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Summary</label>
                                    <input type="text" name="warranty_summary" value={formData.warranty_summary} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="1 Year Manufacturer Warranty" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Period</label>
                                    <input type="text" name="warranty_period" value={formData.warranty_period} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="12 Months" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Return Days</label>
                                    <input type="number" name="return_days" value={formData.return_days} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Info</label>
                                    <input type="text" name="delivery_info" value={formData.delivery_info} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        {/* 🏭 Manufacturer info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Manufacturer & Origin</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country of Origin</label>
                                    <input type="text" name="country_of_origin" value={formData.country_of_origin} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Net Quantity</label>
                                    <input type="text" name="net_quantity" value={formData.net_quantity} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="1 unit" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer Details</label>
                                    <textarea name="manufacturer_details" value={formData.manufacturer_details} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" rows={2} />
                                </div>
                            </div>
                        </div>

                        {/* 🖼️ Images & Flags */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Media & Status</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Images</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden group">
                                                <img src={url} alt="Preview" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                                <button type="button" onClick={() => setPreviewUrls(p => p.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition duration-200">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            <span className="mt-1 text-xs text-gray-500">Upload</span>
                                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" name="is_available" id="is_available" checked={formData.is_available} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                                        <label htmlFor="is_available" className="text-sm text-gray-700 dark:text-gray-300">Available</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" name="is_featured" id="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                                        <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">Featured</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" name="is_bestseller" id="is_bestseller" checked={formData.is_bestseller} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                                        <label htmlFor="is_bestseller" className="text-sm text-gray-700 dark:text-gray-300">Bestseller</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" name="is_new" id="is_new" checked={formData.is_new} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                                        <label htmlFor="is_new" className="text-sm text-gray-700 dark:text-gray-300">New Arrival</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition font-semibold shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
