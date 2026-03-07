import React, { useState, useEffect } from 'react';
import { createApiUrl, getAuthHeaders } from '../access/access.ts';
import PageMeta from '../components/common/PageMeta';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, MapPin, Shield, Edit2, Plus, Trash2 } from 'lucide-react';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
}

interface Address {
    id: number;
    phone: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

const CustomerProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'security'>('personal');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});

    // Password State
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });

    // Address State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState<Partial<Address>>({});

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const headers = await getAuthHeaders();
            const profileRes = await fetch(createApiUrl('api/profile/'), { headers });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData[0] || profileData);
                setProfileForm(profileData[0] || profileData);
            }

            const addressRes = await fetch(createApiUrl('api/addresses/'), { headers });
            if (addressRes.ok) {
                const addressData = await addressRes.json();
                setAddresses(addressData);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(createApiUrl(`api/profile/${profile?.id}/`), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });

            if (response.ok) {
                toast.success("Profile updated!");
                setEditingProfile(false);
                fetchProfileData();
            } else {
                toast.error("Update failed.");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            toast.error("New passwords do not match!");
            return;
        }

        try {
            const token = localStorage.getItem('access');
            const response = await fetch(createApiUrl('api/profile/change_password/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: passwords.old_password,
                    new_password: passwords.new_password
                })
            });

            if (response.ok) {
                toast.success("Password changed successfully!");
                setPasswords({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                const data = await response.json();
                toast.error(data.old_password?.[0] || "Failed to change password.");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access');
            const isEditing = !!addressForm.id;
            const url = isEditing ? `api/addresses/${addressForm.id}/` : 'api/addresses/';
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(createApiUrl(url), {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(addressForm)
            });

            if (response.ok) {
                toast.success(isEditing ? "Address updated!" : "Address added!");
                setIsAddingAddress(false);
                setAddressForm({});
                fetchProfileData();
            } else {
                toast.error("Failed to save address.");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const deleteAddress = async (id: number) => {
        if (!confirm("Remove this address?")) return;
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(createApiUrl(`api/addresses/${id}/`), {
                method: 'DELETE',
                headers
            });

            if (response.status === 204) {
                toast.success("Address removed");
                setAddresses(prev => prev.filter(a => a.id !== id));
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen pb-24">
            <PageMeta title="My Account | E-Shop" description="Manage your profile, addresses, and security settings." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12">

                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">
                        My <span className="text-brand-500">Account</span>
                    </h1>
                    <nav className="space-y-3">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'personal' ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/20' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <User className="w-5 h-5" /> Personal Details
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'addresses' ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/20' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <MapPin className="w-5 h-5" /> Saved Addresses
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/20' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Shield className="w-5 h-5" /> Security
                        </button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1">

                    {/* PERSONAL DETAILS TAB */}
                    {activeTab === 'personal' && profile && (
                        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative animate-fadeIn">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Personal Information</h2>
                                {!editingProfile && (
                                    <button onClick={() => setEditingProfile(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors bg-brand-50 px-4 py-2 rounded-xl">
                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                )}
                            </div>

                            {editingProfile ? (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">First Name</label>
                                            <input type="text" value={profileForm.first_name || ''} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Last Name</label>
                                            <input type="text" value={profileForm.last_name || ''} onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email</label>
                                            <input type="email" value={profileForm.email || ''} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setEditingProfile(false)} className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                                        <button type="submit" className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all">Save Changes</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Full Name</span>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.first_name} {profile.last_name}</p>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email Address</span>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.email}</p>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Username</span>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">@{profile.username}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADDRESSES TAB */}
                    {activeTab === 'addresses' && (
                        <div className="animate-fadeIn space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Saved Addresses</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage where your orders go</p>
                                </div>
                                {!isAddingAddress && (
                                    <button onClick={() => { setAddressForm({}); setIsAddingAddress(true); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-brand-500 dark:hover:bg-brand-500 dark:hover:text-white transition-all px-6 py-3.5 rounded-2xl shadow-xl">
                                        <Plus className="w-4 h-4" /> Add New
                                    </button>
                                )}
                            </div>

                            {isAddingAddress ? (
                                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-8">Add New Address</h3>
                                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Address Line</label>
                                                <input required type="text" value={addressForm.address_line || ''} onChange={e => setAddressForm({ ...addressForm, address_line: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">City</label>
                                                <input required type="text" value={addressForm.city || ''} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">State</label>
                                                <input required type="text" value={addressForm.state || ''} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Postal Code</label>
                                                <input required type="text" value={addressForm.postal_code || ''} onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Country</label>
                                                <input required type="text" value={addressForm.country || ''} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone</label>
                                                <input required type="text" value={addressForm.phone || ''} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={() => setIsAddingAddress(false)} className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                                            <button type="submit" className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all">Save Address</button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map(address => (
                                        <div key={address.id} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
                                            {address.is_default && (
                                                <span className="absolute top-8 right-8 px-3 py-1 bg-brand-50 text-brand-500 text-[8px] font-black uppercase tracking-widest rounded-lg">Default</span>
                                            )}

                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed uppercase tracking-tight">
                                                        {address.address_line}<br />
                                                        {address.city}, {address.state} {address.postal_code}<br />
                                                        {address.country}
                                                    </p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Phone: {address.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                                                <button onClick={() => { setAddressForm(address); setIsAddingAddress(true); }} className="text-[10px] font-black text-gray-500 hover:text-brand-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                                                <button onClick={() => deleteAddress(address.id)} className="text-[10px] font-black text-error-400 hover:text-error-600 uppercase tracking-widest transition-colors flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <div className="col-span-1 md:col-span-2 py-20 text-center bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                                            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No saved addresses</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative animate-fadeIn">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-brand-500" />
                                    Change Password
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Ensure your account is using a long, random password to stay secure.</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Current Password</label>
                                    <input required type="password" value={passwords.old_password} onChange={e => setPasswords({ ...passwords, old_password: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">New Password</label>
                                        <input required type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Confirm Password</label>
                                        <input required type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all">Update Password</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default CustomerProfilePage;
