import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiUrl, getAuthHeaders } from '../access/access.ts';
import PageMeta from '../components/common/PageMeta';
import { toast, ToastContainer } from 'react-toastify';

interface CartItem {
    id: number;
    product_details: {
        id: number;
        name: string;
        final_price: number;
    };
    quantity: number;
}

interface ShippingAddress {
    id: number;
    phone: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [existingAddresses, setExistingAddresses] = useState<ShippingAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [newAddress, setNewAddress] = useState({
        phone: '',
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = await getAuthHeaders();
                // Fetch Cart
                const cartRes = await fetch(createApiUrl('api/cart/'), {
                    headers: headers
                });
                if (cartRes.ok) {
                    const data = await cartRes.json();
                    if (data.length > 0) {
                        setCartItems(data[0].items || []);
                        setTotalAmount(data[0].total_cart_price || 0);
                    } else {
                        toast.error("Your cart is empty");
                        navigate('/cart');
                    }
                }

                // Fetch Addresses
                const addrRes = await fetch(createApiUrl('api/addresses/'), {
                    headers: headers
                });
                if (addrRes.ok) {
                    const addrData = await addrRes.json();
                    setExistingAddresses(addrData);
                    if (addrData.length > 0) {
                        setSelectedAddressId(addrData[0].id);
                    } else {
                        setShowNewAddressForm(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error instanceof Error && error.message.includes('No refresh token')) {
                    navigate('/customer-login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const headers = await getAuthHeaders();
            const addrResponse = await fetch(createApiUrl('api/addresses/'), {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(newAddress)
            });

            if (!addrResponse.ok) throw new Error("Failed to save address");
            const savedAddress: ShippingAddress = await addrResponse.json();

            setExistingAddresses([...existingAddresses, savedAddress]);
            setShowNewAddressForm(false);
            setNewAddress({
                phone: '',
                address_line: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'India'
            });
            toast.success("Address saved successfully!");
        } catch (error: any) {
            toast.error(error.message || "An error occurred while saving address");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAddressId) {
            toast.error("Please select a shipping address");
            return;
        }

        setSubmitting(true);
        try {
            const headers = await getAuthHeaders();
            const orderResponse = await fetch(createApiUrl('api/orders/'), {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    shipping_address: selectedAddressId,
                    payment_method: 'COD'
                })
            });

            if (orderResponse.ok) {
                toast.success("Order placed successfully!");
                setTimeout(() => navigate('/'), 2000);
            } else {
                const errData = await orderResponse.json();
                toast.error(errData.message || "Failed to place order");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen pb-24">
            <PageMeta title="Checkout | E-Shop" description="Complete your purchase safely." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-12">
                    Secured <span className="text-brand-500">Checkout</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Shipping Section */}
                    <div className="lg:w-2/3">
                        <div className="space-y-8">
                            {/* Address Selection */}
                            <div className="bg-gray-50 dark:bg-gray-900/40 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 transition-all">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">Select Shipping Address</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showNewAddressForm ? 'bg-error-500 text-white' : 'bg-brand-500 text-white shadow-lg shadow-brand-200 dark:shadow-none'}`}
                                    >
                                        {showNewAddressForm ? 'Cancel' : '+ Add New'}
                                    </button>
                                </div>

                                {showNewAddressForm ? (
                                    <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Phone Number</label>
                                            <input
                                                type="text" name="phone" required value={newAddress.phone} onChange={handleInputChange}
                                                className="w-full h-16 px-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-bold"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Detailed Address</label>
                                            <textarea
                                                name="address_line" required value={newAddress.address_line} onChange={handleInputChange} rows={3}
                                                className="w-full px-8 py-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-bold resize-none"
                                                placeholder="House No., Street, Area..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">City</label>
                                            <input type="text" name="city" required value={newAddress.city} onChange={handleInputChange} className="w-full h-16 px-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">State</label>
                                            <input type="text" name="state" required value={newAddress.state} onChange={handleInputChange} className="w-full h-16 px-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Postal Code</label>
                                            <input type="text" name="postal_code" required value={newAddress.postal_code} onChange={handleInputChange} className="w-full h-16 px-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Country</label>
                                            <input type="text" name="country" required value={newAddress.country} onChange={handleInputChange} className="w-full h-16 px-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-bold" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                type="submit" disabled={submitting}
                                                className="w-full h-16 bg-brand-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-600 transition-all shadow-xl shadow-brand-100 disabled:opacity-50"
                                            >
                                                {submitting ? 'Saving...' : 'Save This Address'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {existingAddresses.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                                {existingAddresses.map((addr) => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => setSelectedAddressId(addr.id)}
                                                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group ${selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50/5 dark:bg-brand-500/5 shadow-inner' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-200'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAddressId === addr.id ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                                                                {selectedAddressId === addr.id && (
                                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            {selectedAddressId === addr.id && (
                                                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Selected</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{addr.address_line}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{addr.city}, {addr.state} - {addr.postal_code}</p>
                                                        <p className="text-[10px] text-gray-500 font-black mt-4 uppercase tracking-[0.1em]">Phone: <span className="text-gray-900 dark:text-white ml-2">{addr.phone}</span></p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </div>
                                                <p className="text-sm font-bold text-gray-400">No saved addresses found.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/40 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-black uppercase tracking-widest mb-8 text-gray-900 dark:text-white">Payment Method</h2>
                                <div className="p-8 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-brand-500 flex items-center justify-between shadow-xl shadow-brand-500/5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200 dark:shadow-none">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Cash on Delivery</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pay when you receive the product</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-200 dark:shadow-none">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {!showNewAddressForm && (
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={submitting || !selectedAddressId}
                                    className="w-full h-20 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-brand-500 hover:text-white transition-all shadow-2xl shadow-gray-200 dark:shadow-none translate-y-0 active:translate-y-1 disabled:opacity-50"
                                >
                                    {submitting ? 'Processing Order...' : 'Confirm Order'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-28 p-8 bg-gray-900 dark:bg-white rounded-[3rem] text-white dark:text-gray-900 shadow-2xl">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Summary</h2>
                            <div className="space-y-6 mb-8 overflow-y-auto max-h-[40vh] pr-2 scrollbar-hide">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-white/5 dark:bg-gray-50 p-4 rounded-xl">
                                        <div className="flex-1 pr-4">
                                            <p className="text-xs font-black uppercase tracking-tight truncate">{item.product_details.name}</p>
                                            <p className="text-[10px] font-bold opacity-60">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-xs font-black">${(item.product_details.final_price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-8 pt-6 border-t border-white/10 dark:border-gray-100">
                                <div className="flex justify-between text-sm font-bold opacity-60">
                                    <span>Subtotal</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold opacity-60">
                                    <span>Shipping</span>
                                    <span className="text-brand-500">FREE</span>
                                </div>
                                <div className="pt-4 flex justify-between">
                                    <span className="text-xl font-black uppercase">Grand Total</span>
                                    <span className="text-xl font-black">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 dark:bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.033A12.006 12.006 0 002.25 10.5c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.321-.66-4.487-1.802-6.321z" /></svg>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Safe & Secure Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default CheckoutPage;
