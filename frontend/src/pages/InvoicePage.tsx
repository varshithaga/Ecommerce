import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createApiUrl, getAuthHeaders } from '../access/access.ts';
import PageMeta from '../components/common/PageMeta';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total_price: number;
}

interface ShippingAddress {
    phone: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface Order {
    id: number;
    order_id: string;
    customer_name: string;
    shipping_address_details: ShippingAddress;
    total_amount: string;
    payment_method: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

const InvoicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const headers = await getAuthHeaders();
                if (!headers) {
                    navigate('/customer-login');
                    return;
                }
                const response = await fetch(createApiUrl(`api/orders/${id}/`), {
                    headers: headers
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                } else {
                    setError('Invoice not found or unauthorized.');
                }
            } catch (err) {
                setError('Failed to load invoice.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    if (error || !order) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col gap-4">
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">{error || 'Invoice not found'}</h1>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-brand-500 text-white rounded-xl text-xs font-black uppercase">Go Back</button>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen py-10 print:bg-white print:py-0">
            <PageMeta title={`Invoice #${order.order_id.slice(0, 8)}`} description="View and print your order invoice." />

            <div className="container mx-auto max-w-4xl">
                {/* Print Button (Hidden while printing) */}
                <div className="mb-6 flex justify-end print:hidden px-4">
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                    >
                        Print Invoice
                    </button>
                </div>

                {/* The Invoice Document */}
                <div className="bg-white p-12 md:p-16 rounded-3xl shadow-sm print:shadow-none print:rounded-none">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-100 pb-10 mb-10 gap-8">
                        <div>
                            <h2 className="text-4xl font-black text-brand-500 uppercase tracking-tighter mb-2">E-Shop</h2>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Premium eCommerce</p>
                            <p className="text-xs text-gray-400 mt-4 leading-relaxed max-w-[200px]">
                                123 Business Avenue,<br />Tech District, San Francisco<br />CA 94107, United States
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                            <h1 className="text-5xl font-black text-gray-200 uppercase tracking-tight mb-2">Invoice</h1>
                            <p className="text-sm font-bold text-gray-900">#{order.order_id.toUpperCase()}</p>
                            <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">Date of Issue</p>
                            <p className="text-sm font-black text-gray-900">{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100 pb-2">Billed To</p>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">{order.customer_name}</h3>
                            <p className="text-sm text-gray-600 mb-1">{order.shipping_address_details?.phone || 'No Phone'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100 pb-2">Ship To</p>
                            {order.shipping_address_details ? (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {order.shipping_address_details.address_line}<br />
                                    {order.shipping_address_details.city}, {order.shipping_address_details.state} {order.shipping_address_details.postal_code}<br />
                                    {order.shipping_address_details.country}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No shipping details</p>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex gap-10 mb-12 bg-gray-50 p-6 rounded-2xl">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Payment Method</p>
                            <p className="text-sm font-black text-gray-900 uppercase">{order.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Order Status</p>
                            <p className={`text-sm font-black uppercase ${order.status === 'Cancelled' ? 'text-red-500' : 'text-brand-500'}`}>{order.status}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-left mb-10">
                        <thead className="border-b-2 border-gray-100">
                            <tr>
                                <th className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Qty</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Price</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {order.items?.map(item => (
                                <tr key={item.id}>
                                    <td className="py-6 pr-4">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.product_name}</p>
                                    </td>
                                    <td className="py-6 text-center text-sm font-bold text-gray-600">{item.quantity}</td>
                                    <td className="py-6 text-right text-sm font-bold text-gray-600">${parseFloat(item.price.toString()).toFixed(2)}</td>
                                    <td className="py-6 text-right text-sm font-black text-gray-900">${parseFloat(item.total_price.toString()).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end pt-6 border-t-[3px] border-gray-900 mb-16">
                        <div className="w-full md:w-1/2">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Subtotal</span>
                                <span className="text-sm font-bold text-gray-600">${parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Shipping</span>
                                <span className="text-sm font-bold text-gray-600">$0.00</span>
                            </div>
                            <div className="flex justify-between items-center py-6 border-t-2 border-gray-100 mt-4">
                                <span className="text-sm font-black uppercase tracking-widest text-gray-900">Total Due</span>
                                <span className="text-3xl font-black text-brand-500 tracking-tighter">${parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Messages */}
                    <div className="text-center pt-10 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Thank you for your business!</p>
                        <p className="text-[10px] text-gray-400 mt-2">If you have any questions about this invoice, please contact support.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePage;
