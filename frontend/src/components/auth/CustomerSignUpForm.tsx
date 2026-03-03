import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { registerUser } from "./signupApi.ts";
import { toast } from 'react-toastify';

interface CustomerFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone_address: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export default function CustomerSignUpForm() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CustomerFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone_address: '',
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        country: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.first_name ||
            !formData.last_name ||
            !formData.email ||
            !formData.address_line ||
            !formData.city
        ) {
            toast.error("Please fill in all required fields (Name, Email, and Address)");
            return;
        }

        setIsLoading(true);

        try {
            const result = await registerUser({
                ...formData,
                username: formData.email, // Use email as username
                password: "DefaultPassword123!", // Required by backend
                password_confirm: "DefaultPassword123!",
                role: "customer"
            });

            if (result.success) {
                toast.success("Registration successful! You can now sign in.");
                setTimeout(() => navigate("/customer-login"), 2000);
            } else {
                const errors = result.details;
                if (typeof errors === "object") {
                    Object.entries(errors).forEach(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            messages.forEach((msg) => toast.error(`${msg}`));
                        } else {
                            toast.error(`${field}: ${messages}`);
                        }
                    });
                } else {
                    toast.error(result.error || "Registration failed");
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar py-10">
            <div className="flex flex-col justify-center flex-1 w-full max-w-xl mx-auto px-4">
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="mb-2 font-black text-gray-900 text-3xl dark:text-white uppercase tracking-tighter">
                        Customer <span className="text-brand-500">Registration</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Join us to start shopping. Please provide your account and delivery details.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Account Information */}
                    <div className="bg-gray-50/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-5">
                        <h3 className="text-xs font-black text-brand-500 uppercase tracking-widest px-1">1. Account Details</h3>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <Label>First Name <span className="text-error-500">*</span></Label>
                                <Input type="text" name="first_name" placeholder="John" value={formData.first_name} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label>Last Name <span className="text-error-500">*</span></Label>
                                <Input type="text" name="last_name" placeholder="Doe" value={formData.last_name} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div>
                            <Label>Email <span className="text-error-500">*</span></Label>
                            <Input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-gray-50/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-5">
                        <h3 className="text-xs font-black text-brand-500 uppercase tracking-widest px-1">2. Delivery Address</h3>
                        <div>
                            <Label>Contact Phone</Label>
                            <Input type="text" name="phone_address" placeholder="+1 234 567 890" value={formData.phone_address} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label>Street Address <span className="text-error-500">*</span></Label>
                            <Input type="text" name="address_line" placeholder="123 Shopping St, Apt 4B" value={formData.address_line} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>City <span className="text-error-500">*</span></Label>
                                <Input type="text" name="city" placeholder="New York" value={formData.city} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label>State</Label>
                                <Input type="text" name="state" placeholder="NY" value={formData.state} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Postal Code</Label>
                                <Input type="text" name="postal_code" placeholder="10001" value={formData.postal_code} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input type="text" name="country" placeholder="USA" value={formData.country} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-6 py-4 text-sm font-black text-white uppercase tracking-tighter transition rounded-2xl bg-brand-500 hover:bg-brand-600 shadow-xl shadow-brand-100 dark:shadow-none disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Complete Registration'}
                    </button>

                    <p className="text-center text-sm font-bold text-gray-500">
                        Already have an account? <Link to="/customer-login" className="text-brand-500 hover:underline">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
