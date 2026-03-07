import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, Product, addToCart, getRelatedProducts } from './products/api';
import PageMeta from '../components/common/PageMeta';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Star, MessageSquare, ShieldCheck, User as UserIcon, Heart } from 'lucide-react';
import { createApiUrl } from '../access/access.ts';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [activeImage, setActiveImage] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [inWishlist, setInWishlist] = useState(false);
    const isLoggedIn = !!localStorage.getItem('access');

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            await addToCart(product.id, quantity);
            toast.success(`${product.name} added to bag!`);
        } catch (err: any) {
            toast.error(err.message || 'Error adding to bag');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleToggleWishlist = async () => {
        if (!isLoggedIn) {
            toast.error("Please sign in to add to wishlist");
            return;
        }
        if (!product) return;

        try {
            const token = localStorage.getItem('access');
            const response = await fetch(createApiUrl('api/wishlist/toggle/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: product.id })
            });

            if (response.ok) {
                const data = await response.json();
                setInWishlist(data.in_wishlist);
                if (data.in_wishlist) {
                    toast.success("Added to wishlist!");
                } else {
                    toast.success("Removed from wishlist.");
                }
            } else {
                toast.error("Failed to update wishlist.");
            }
        } catch (error) {
            console.error("Wishlist toggle error", error);
            toast.error("An error occurred");
        }
    };

    useEffect(() => {
        if (id) {
            setLoading(true);
            window.scrollTo(0, 0); // scroll to top on navigate
            getProductById(id)
                .then(data => {
                    setProduct(data);
                    setActiveImage(data.images?.[0]?.image || '');
                    setLoading(false);
                    return getRelatedProducts(id);
                })
                .then(relatedData => {
                    setRelatedProducts(relatedData);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });

            // Check wishlist status if logged in
            if (isLoggedIn) {
                const token = localStorage.getItem('access');
                fetch(createApiUrl('api/wishlist/'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.products) {
                            const inWish = data.products.some((p: any) => p.id === parseInt(id));
                            setInWishlist(inWish);
                        }
                    })
                    .catch(err => console.error("Could not fetch wishlist", err));
            }
        }
    }, [id, isLoggedIn]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    if (!product) return (
        <div className="container mx-auto px-4 py-32 text-center">
            <h2 className="text-2xl font-black mb-4">Product not found</h2>
            <Link to="/products" className="text-brand-500 font-bold hover:underline">Back to products</Link>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-950">
            <PageMeta title={`${product.name} | E-Shop`} description={product.description} />

            {/* Breadcrumbs */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <nav className="flex text-xs font-black uppercase tracking-widest text-gray-400 gap-2">
                    <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to={`/products?category=${product.category_slug}`} className="hover:text-brand-500 transition-colors">{product.category_name}</Link>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                </nav>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Left: Image Gallery */}
                    <div className="lg:w-1/2 flex flex-col gap-6">
                        <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-800 relative group">
                            <img
                                src={activeImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {product.discount_price && (
                                <div className="absolute top-8 left-8 bg-success-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Special Offer
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(img.image)}
                                        className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img.image ? 'border-brand-500 scale-95' : 'border-gray-100 dark:border-gray-800 hover:border-brand-300'}`}
                                    >
                                        <img src={img.image} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="lg:w-1/2 flex flex-col">
                        <div className="mb-8">
                            {product.brand && (
                                <span className="text-brand-500 text-xs font-black uppercase tracking-[0.2em] mb-3 block">
                                    {product.brand}
                                </span>
                            )}
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] uppercase tracking-tighter">
                                    {product.name}
                                </h1>
                                <button
                                    onClick={handleToggleWishlist}
                                    title="Add to Wishlist"
                                    className={`p-3 rounded-full border-2 transition-all flex-shrink-0 ${inWishlist
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-500'
                                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-red-200 hover:text-red-500'
                                        }`}
                                >
                                    <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1 px-2 py-1 bg-brand-500 rounded-lg text-white">
                                    <span className="text-sm font-black">{product.average_rating || '4.5'}</span>
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                </div>
                                <span className="text-sm font-bold text-gray-400">
                                    {product.review_count || '128'} Reviews
                                </span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                                    ${product.final_price}
                                </span>
                                {product.discount_price && (
                                    <>
                                        <span className="text-2xl text-gray-400 line-through font-bold">${product.price}</span>
                                        <span className="text-success-500 font-black text-lg">
                                            {Math.round((1 - parseFloat(product.final_price) / parseFloat(product.price)) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Offers & Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Delivery</span>
                                </div>
                                <p className="text-sm text-gray-500 font-bold">{product.delivery_info}</p>
                            </div>
                            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                    </svg>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Returns</span>
                                </div>
                                <p className="text-sm text-gray-500 font-bold">{product.return_policy}</p>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-6 mb-10">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Quantity</span>
                            <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-2xl p-1 border border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                                </button>
                                <span className="w-12 text-center text-sm font-black text-gray-900 dark:text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                            <span className="text-xs font-bold text-gray-400">
                                {product.stock > 0 ? `${product.stock} items left` : 'Out of stock'}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="flex-1 h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-500 hover:text-white transition-all shadow-xl shadow-gray-200 dark:shadow-none translate-y-0 active:translate-y-1 disabled:opacity-50"
                            >
                                {addingToCart ? 'Adding...' : 'Add to Bag'}
                            </button>
                            <button className="flex-1 h-16 bg-brand-500 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-600 transition-all shadow-xl shadow-brand-100 dark:shadow-none translate-y-0 active:translate-y-1">
                                Buy Now
                            </button>
                        </div>

                        {/* Highlights */}
                        {product.highlights && (
                            <div className="mb-12">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Key Highlights</h3>
                                <ul className="space-y-4">
                                    {product.highlights.split('\n').map((point, i) => (
                                        <li key={i} className="flex gap-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                                            <div className="w-5 h-5 bg-brand-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
                                            </div>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Sections */}
                <div className="mt-24 space-y-24">
                    {/* Description */}
                    <div className="max-w-4xl">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Description</h3>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {product.description.split('\n').map((p, i) => (
                                <p key={i} className="mb-4">{p}</p>
                            ))}
                        </div>
                    </div>

                    {/* Specifications & Warranty */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-24">
                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Specifications</h3>
                                <div className="border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden">
                                    <table className="w-full text-left">
                                        <tbody>
                                            {Object.entries(product.specifications).map(([key, value], idx) => (
                                                <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-950'}>
                                                    <td className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 w-1/3">{key}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Warranty & Returns */}
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Warranty & Info</h3>
                            <div className="space-y-6">
                                {product.warranty_summary && (
                                    <div className="p-6 bg-brand-50/50 dark:bg-brand-950/20 rounded-3xl border border-brand-100 dark:border-brand-900/30">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-brand-500 text-white rounded-2xl flex items-center justify-center">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.033A12.006 12.006 0 002.25 10.5c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.321-.66-4.487-1.802-6.321z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-brand-500 uppercase tracking-widest">Warranty</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">{product.warranty_summary}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            {product.warranty_period && (
                                                <div>
                                                    <p className="text-gray-400 font-bold uppercase mb-1">Period</p>
                                                    <p className="text-gray-900 dark:text-white font-black">{product.warranty_period}</p>
                                                </div>
                                            )}
                                            {product.warranty_service_type && (
                                                <div>
                                                    <p className="text-gray-400 font-bold uppercase mb-1">Service</p>
                                                    <p className="text-gray-900 dark:text-white font-black">{product.warranty_service_type}</p>
                                                </div>
                                            )}
                                            {product.warranty_covered && (
                                                <div className="col-span-2">
                                                    <p className="text-gray-400 font-bold uppercase mb-1">Covered</p>
                                                    <p className="text-gray-900 dark:text-white font-bold leading-relaxed">{product.warranty_covered}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {product.return_policy && (
                                        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Returns</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{product.return_policy}</p>
                                        </div>
                                    )}
                                    {product.country_of_origin && (
                                        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Origin</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{product.country_of_origin}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manufacturer details footer-style card */}
                    {(product.manufacturer_details || product.packer_details || product.importer_details) && (
                        <div className="p-10 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 mt-24">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-10 text-center">Manufacturer & Compliance Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {product.manufacturer_details && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Manufacturer</h4>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-loose">{product.manufacturer_details}</p>
                                    </div>
                                )}
                                {product.packer_details && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Packer</h4>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-loose">{product.packer_details}</p>
                                    </div>
                                )}
                                {product.importer_details && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Importer</h4>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-loose">{product.importer_details}</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-8">
                                {product.net_quantity && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Net Quantity</h4>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{product.net_quantity}</p>
                                    </div>
                                )}
                                {product.product_weight && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Weight</h4>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{product.product_weight}</p>
                                    </div>
                                )}
                                {product.product_dimensions && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Dimensions</h4>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{product.product_dimensions}</p>
                                    </div>
                                )}
                                {product.generic_name && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Generic Name</h4>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{product.generic_name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Reviews Section */}
                    <div id="reviews" className="mt-32">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4 sm:px-0">
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                    Customer <span className="text-brand-500">Reviews</span>
                                </h3>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 rounded-xl text-white shadow-lg shadow-brand-500/20">
                                        <span className="text-lg font-black">{product.average_rating || '0.0'}</span>
                                        <Star className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        Based on {product.review_count} verified reviews
                                    </span>
                                </div>
                            </div>

                            {!isLoggedIn && (
                                <Link to="/customer-login" className="px-8 py-4 bg-gray-900 dark:bg-gray-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-500 transition-all shadow-xl">
                                    Sign in to write a review
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            {/* Review Form (Only for logged in users) */}
                            {isLoggedIn && (
                                <div className="lg:col-span-4 transition-all sticky top-24 h-fit">
                                    <div className="p-10 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Share your <span className="text-brand-500">Experience.</span></h4>
                                        <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                                            You can only review products you have bought. To write a review, please visit your order history.
                                        </p>
                                        <Link to="/orders" className="w-full inline-block py-5 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-3xl hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20">
                                            View Order History
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className={`${isLoggedIn ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-10`}>
                                {product.reviews?.length === 0 ? (
                                    <div className="p-20 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                                        <MessageSquare className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                                        <h5 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">No reviews yet</h5>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Be the first to share your thoughts about this product!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-8">
                                        {product.reviews?.map((review) => (
                                            <div key={review.id} className="group p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 hover:border-brand-500/20 transition-all shadow-sm">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500">
                                                            <UserIcon className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                                                {review.username && review.username.includes('@') ? review.username.split('@')[0] : review.username}
                                                            </h5>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <div className="flex items-center gap-0.5 text-brand-500">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    {new Date(review.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {review.is_verified_purchase && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 rounded-full">
                                                            <ShieldCheck className="w-3.5 h-3.5" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Verified Buyer</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed text-lg italic">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Carousel */}
            {relatedProducts.length > 0 && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            You Might Also <span className="text-brand-500">Like</span>
                        </h2>
                        <Link to={`/products?category=${product.category_slug}`} className="text-xs font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors">
                            View Category
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map(related => (
                            <div key={related.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-3xl hover:border-brand-500/20 transition-all duration-500 flex flex-col">
                                <div className="h-64 relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                                    <Link to={`/product/${related.id}`}>
                                        <img
                                            src={related.images?.[0]?.image || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop`}
                                            alt={related.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </Link>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <Link to={`/product/${related.id}`}>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors line-clamp-1 uppercase tracking-tight">{related.name}</h3>
                                    </Link>
                                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50 dark:border-gray-800">
                                        <span className="text-xl font-black text-gray-900 dark:text-white">${related.final_price}</span>
                                        <div className="flex items-center gap-1.5 opacity-70">
                                            <div className="flex items-center gap-1 px-2 py-1 bg-brand-500 rounded-lg text-white overflow-hidden">
                                                <span className="text-[10px] font-black tracking-widest uppercase">{related.average_rating || '5.0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" theme="dark" />
        </div>
    );
};

export default ProductDetail;
