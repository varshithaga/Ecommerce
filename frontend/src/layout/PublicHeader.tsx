import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createApiUrl, getAuthHeaders } from '../access/access.ts';

const PublicHeader: React.FC = () => {
    const [user, setUser] = useState<{ first_name: string; last_name: string; email: string } | null>(null);
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('access');
    const [cartCount, setCartCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(createApiUrl('api/cart/'), {
                    headers: headers
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        const items = data[0].items || [];
                        setCartCount(items.length);
                    }
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        };

        const fetchProfile = async () => {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(createApiUrl('api/profile/'), {
                    headers: headers
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    fetchCartData();
                } else if (response.status === 401) {
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    setUser(null);
                    setCartCount(0);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        if (isLoggedIn) {
            fetchProfile();
            fetchCartData();
        } else {
            setUser(null);
            setCartCount(0);
        }
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        setCartCount(0);
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200 dark:shadow-none transition-transform group-hover:scale-105">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                E-Shop<span className="text-brand-500">.</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Home</Link>
                            <Link to="/products" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Products</Link>
                            <Link to="/categories" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Categories</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearchSubmit} className="relative group hidden sm:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="block w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all sm:w-64"
                            />
                        </form>

                        {/* Orders Button */}
                        {user && (
                            <Link to="/orders" className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-brand-500 rounded-xl transition-all" title="My Orders">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </Link>
                        )}

                        {/* Wishlist Button */}
                        {user && (
                            <Link to="/wishlist" className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-red-500 rounded-xl transition-all" title="My Wishlist">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </Link>
                        )}

                        {/* Cart Button */}
                        <Link to="/cart" className="relative p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-brand-500 rounded-xl transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-gray-900">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4 border-l border-gray-100 dark:border-gray-800 pl-4">
                                <Link to="/my-profile" className="flex flex-col items-end hidden lg:flex hover:text-brand-500 transition-colors">
                                    <span className="text-sm font-black text-gray-900 dark:text-white leading-none">
                                        {user.first_name} {user.last_name}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                        {user.email}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-error-500 rounded-xl transition-colors"
                                    title="Logout"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/customer-login" className="px-6 py-2.5 bg-brand-500 text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-brand-600 transition shadow-lg shadow-brand-100 dark:shadow-none">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PublicHeader;
