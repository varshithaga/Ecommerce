import React, { useState, useEffect } from 'react';
import { createApiUrl, getAuthHeaders } from '../../access/access.ts';
import { Mail, Search, Eye, AlertCircle, ShoppingBag, X } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Customer {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    is_active: boolean;
    date_joined?: string;
}

interface Order {
    id: number;
    order_id: string;
    total_amount: string;
    status: string;
    created_at: string;
}

const MasterCustomerList = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [page, search]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeaders();
            const url = new URL(createApiUrl('api/users/'));
            url.searchParams.append('role', 'customer');
            url.searchParams.append('page', page.toString());
            if (search) url.searchParams.append('search', search);

            const response = await fetch(url.toString(), { headers });
            if (response.ok) {
                const data = await response.json();
                setCustomers(data.results || []);
                setTotalPages(data.total_pages || 1);
                setTotalCount(data.count || 0);
            } else {
                toast.error("Failed to fetch customers");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const openCustomerModal = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
        setLoadingOrders(true);

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(createApiUrl(`api/orders/?user_id=${customer.id}`), { headers });
            if (response.ok) {
                const data = await response.json();
                setCustomerOrders(data.results || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load customer orders");
        } finally {
            setLoadingOrders(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        setCustomerOrders([]);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageMeta title="Customer Management | Admin Dashboard" description="Manage customers and view their orders" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Customer <span className="text-brand-500">Directory</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-400 mt-1">Manage all registered customers in the system.</p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                        placeholder="Search by name, email, or username..."
                        value={search}
                        onChange={handleSearch}
                    />
                </div>

                <div className="text-xs font-black text-gray-500 uppercase tracking-widest px-4">
                    Total Customers: {totalCount}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                                            <span className="text-sm font-bold uppercase tracking-widest">No customers found.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center font-black uppercase shadow-sm">
                                                    {customer.first_name?.[0] || customer.username[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">
                                                        {customer.first_name} {customer.last_name}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">@{customer.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {customer.email}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-500">
                                                {customer.phone_number || "—"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openCustomerModal(customer)}
                                                className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-brand-500 rounded-lg transition-colors border border-gray-100 dark:border-gray-700 hover:border-brand-500 hover:shadow-sm"
                                                title="View Customer Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 text-sm font-bold text-gray-500">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="uppercase tracking-widest text-[10px]">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden animate-fadeIn">

                        <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-2xl font-black uppercase shadow-lg shadow-brand-500/20">
                                    {selectedCustomer.first_name?.[0] || selectedCustomer.username[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                                    </h2>
                                    <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">Customer Profile</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">

                            {/* Profile Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Username</span>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">@{selectedCustomer.username}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Address</span>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-brand-500" />
                                        {selectedCustomer.email}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Registration</span>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-brand-500" />
                                        {selectedCustomer.is_active ? 'Active Account' : 'Inactive Account'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-gray-900 dark:text-white mb-6">
                                    <ShoppingBag className="w-5 h-5 text-brand-500" />
                                    Order History
                                </h3>

                                {loadingOrders ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                                    </div>
                                ) : customerOrders.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No orders found for this customer.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {customerOrders.map(order => (
                                                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                        <td className="px-6 py-4 font-black text-gray-900 dark:text-white text-sm">#{order.order_id.slice(0, 8)}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-500 text-sm">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 font-black text-brand-500 text-sm">${order.total_amount}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                                                                : order.status === 'Cancelled' ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400'
                                                                    : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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

export default MasterCustomerList;
