import React, { useEffect, useState, useCallback } from 'react';
import { createApiUrl, getAuthHeaders } from '../../access/access.ts';
import { ToastContainer, toast } from 'react-toastify';
import { Eye, X, MapPin, User, Package, Clock, Search, ChevronLeft, ChevronRight, Download, DollarSign, ChevronUp, ChevronDown, Printer } from 'lucide-react';
import DatePicker from '../../components/form/date-picker';

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
    user: number;
    customer_name: string;
    shipping_address_details: ShippingAddress;
    total_amount: string;
    status: string;
    payment_method: string;
    created_at: string;
    items: OrderItem[];
    cancel_reason?: string;
    delivery_date?: string;
}

const MasterOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [period, setPeriod] = useState("this_month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [totalResults, setTotalResults] = useState(0);
    const [totalSales, setTotalSales] = useState(0);

    // Sorting State
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeaders();
            const url = new URL(createApiUrl('api/orders/'));
            url.searchParams.append('page', currentPage.toString());
            url.searchParams.append('search', searchQuery);
            url.searchParams.append('status', statusFilter);
            url.searchParams.append('payment_method', paymentMethod);

            const orderingParam = sortDirection === "desc" ? `-${sortField}` : sortField;
            url.searchParams.append('ordering', orderingParam);

            if (period !== "all") {
                url.searchParams.append('period', period);
                if (period === "custom_range" && startDate && endDate) {
                    url.searchParams.append('start_date', startDate);
                    url.searchParams.append('end_date', endDate);
                }
            }

            const response = await fetch(url.toString(), {
                headers: headers
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.results);
                setTotalPages(data.total_pages);
                setTotalResults(data.count);
                setTotalSales(data.total_sales || 0);
                setStatusCounts(data.status_counts || {});
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, statusFilter, period, startDate, endDate, paymentMethod, sortField, sortDirection]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleExportCSV = async () => {
        try {
            const headers = await getAuthHeaders();
            const url = new URL(createApiUrl('api/orders/export_csv/'));
            url.searchParams.append('search', searchQuery);
            url.searchParams.append('status', statusFilter);
            url.searchParams.append('period', period);
            url.searchParams.append('payment_method', paymentMethod);
            if (period === "custom_range" && startDate && endDate) {
                url.searchParams.append('start_date', startDate);
                url.searchParams.append('end_date', endDate);
            }

            const response = await fetch(url.toString(), {
                headers: headers
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                toast.error("Export failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Export error");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(createApiUrl(`api/orders/${orderId}/`), {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Order marked as ${newStatus}!`);
                fetchOrders();

                // Update selected order if modal is open
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    return (
        <div className="p-6">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-modal, #printable-modal * {
                        visibility: visible;
                    }
                    #printable-modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                        height: auto !important;
                    }
                    #printable-modal-buttons {
                        display: none !important;
                    }
                }
            `}} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-2xl">
                            <Package className="w-6 h-6 text-brand-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{totalResults}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-success-50 dark:bg-success-500/10 rounded-2xl">
                            <DollarSign className="w-6 h-6 text-success-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Revenue</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">${totalSales.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl"
                    >
                        <Download className="w-4 h-4" />
                        Export Orders (CSV)
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search Order ID, Name, Email, Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all shadow-sm"
                        />
                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    </form>

                    {/* Period Filter */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={period}
                            onChange={(e) => { setPeriod(e.target.value); setCurrentPage(1); }}
                            className="px-5 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-brand-500/30 transition-all text-gray-700 dark:text-gray-300"
                        >
                            <option value="all">All Periods</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this_week">This Week</option>
                            <option value="this_month">This Month</option>
                            <option value="last_month">Last Month</option>
                            <option value="this_quarter">This Quarter</option>
                            <option value="this_year">This Year</option>
                            <option value="custom_range">Custom Range</option>
                        </select>

                        <select
                            value={paymentMethod}
                            onChange={(e) => { setPaymentMethod(e.target.value); setCurrentPage(1); }}
                            className="px-5 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-brand-500/30 transition-all text-gray-700 dark:text-gray-300"
                        >
                            <option value="all">All Payments</option>
                            <option value="COD">Cash on Delivery</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="NetBanking">Net Banking</option>
                        </select>

                        {period === "custom_range" && (
                            <div className="flex items-center gap-2 animate-fadeIn min-w-[320px]">
                                <div className="flex-1">
                                    <DatePicker
                                        id="order_start_date"
                                        placeholder="From Date"
                                        onChange={(_d, ds) => { setStartDate(ds); setCurrentPage(1); }}
                                        defaultDate={startDate}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">to</span>
                                <div className="flex-1">
                                    <DatePicker
                                        id="order_end_date"
                                        placeholder="To Date"
                                        onChange={(_d, ds) => { setEndDate(ds); setCurrentPage(1); }}
                                        defaultDate={endDate}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto no-scrollbar max-w-full">
                    {["all", "Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                ? "bg-brand-500 text-white shadow-lg shadow-brand-100"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                }`}
                        >
                            {status}
                            {statusCounts[status] !== undefined && status !== "all" && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded-md ${statusFilter === status ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                                    {statusCounts[status]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-brand-500 transition-colors"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Ordered On
                                        {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Pref. Delivery</th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-brand-500 transition-colors"
                                    onClick={() => handleSort('total_amount')}
                                >
                                    <div className="flex items-center gap-1">
                                        Amount
                                        {sortField === 'total_amount' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {orders.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Package className="w-12 h-12 text-gray-200 mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">#{order.order_id.slice(0, 8)}...</span>
                                        </td>
                                        <td className="px-6 py-4 font-black">
                                            <span className="text-sm text-gray-900 dark:text-white uppercase">{order.customer_name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-brand-500">${order.total_amount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-success-50 text-success-500' : 'bg-brand-50 text-brand-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-brand-500 rounded-2xl transition-all shadow-sm"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm outline-none border border-transparent hover:border-brand-500/20 cursor-pointer ${order.status === 'Delivered' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                                                        : order.status === 'Cancelled' ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400'
                                                            : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Out for Delivery">Out For Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 disabled:opacity-30 rounded-2xl transition-all shadow-sm border border-transparent hover:border-brand-500/30"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-11 h-11 text-[10px] font-black uppercase rounded-2xl transition-all ${currentPage === i + 1
                                        ? "bg-brand-500 text-white shadow-lg shadow-brand-100"
                                        : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-brand-500"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 disabled:opacity-30 rounded-2xl transition-all shadow-sm border border-transparent hover:border-brand-500/30"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Order Details */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div id="printable-modal" className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
                        {/* Modal Header */}
                        <div className="p-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Order <span className="text-brand-500">Details</span></h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {selectedOrder.order_id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-brand-500 rounded-3xl shadow-sm transition-all border border-gray-100 dark:border-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Details Sections */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <User className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Customer</h4>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{selectedOrder.customer_name}</p>
                                        <p className="text-xs font-bold text-gray-500 mt-1">{selectedOrder.shipping_address_details.phone}</p>
                                    </div>
                                    {selectedOrder.delivery_date && (
                                        <div className="mt-4 bg-brand-50/50 dark:bg-brand-500/10 p-4 rounded-2xl border border-brand-100 dark:border-brand-500/20">
                                            <p className="text-[10px] font-black uppercase text-brand-500 tracking-widest">Pref. Delivery Date</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase mt-1">{selectedOrder.delivery_date}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <Clock className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Payment & Status</h4>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Method</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{selectedOrder.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Status</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${selectedOrder.status === 'Delivered' ? 'bg-success-500 text-white' : selectedOrder.status === 'Cancelled' ? 'bg-error-500 text-white' : 'bg-brand-500 text-white'
                                                }`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        {selectedOrder.status === 'Cancelled' && selectedOrder.cancel_reason && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cancel Reason</span>
                                                <p className="text-xs font-bold text-error-500 mt-1">{selectedOrder.cancel_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <MapPin className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Shipping Destination</h4>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed uppercase tracking-tight">
                                            {selectedOrder.shipping_address_details.address_line}<br />
                                            {selectedOrder.shipping_address_details.city}, {selectedOrder.shipping_address_details.state} - {selectedOrder.shipping_address_details.postal_code}<br />
                                            {selectedOrder.shipping_address_details.country}
                                        </p>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex items-center gap-3 text-brand-500">
                                        <Package className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Ordered Items</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-all shadow-sm">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-300">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.product_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Qty: {item.quantity} × ${item.price}</p>
                                                    </div>
                                                </div>
                                                <p className="text-base font-black text-brand-500">${item.total_price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div id="printable-modal-buttons" className="p-10 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Valuation</span>
                                <h4 className="text-3xl font-black text-brand-500 tracking-tighter">${selectedOrder.total_amount}</h4>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="px-6 py-4 bg-white dark:bg-gray-800 text-brand-500 hover:text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition shadow-sm border border-brand-100 flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" /> Print
                                </button>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    Dismiss
                                </button>
                                {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                                    <button
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'Delivered'); setSelectedOrder(null); }}
                                        className="px-10 py-4 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-600 transition shadow-xl shadow-brand-100"
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default MasterOrders;
