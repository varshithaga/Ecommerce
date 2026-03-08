import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import loginUser from "./signinApi";
import { toast } from 'react-toastify';
import { createApiUrl } from '../../access/access';

export default function CustomerSignInForm() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address to receive an OTP.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(createApiUrl('api/request-otp/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsOtpSent(true);
                toast.success('OTP sent successfully to your email.');
            } else {
                toast.error(data.error || "Failed to send OTP.");
            }
        } catch (error) {
            toast.error("Network error occurred while sending OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        if (!otp) {
            toast.error("Please enter the OTP.");
            return;
        }

        setIsLoading(true);

        try {
            // For customer login, we use email as the username 
            // and the default password set during simplified registration.
            const result = await loginUser({
                username: email,
                password: "DefaultPassword123!", // Internal default for simplified customer flow
                otp: otp,
                rememberMe: rememberMe
            });

            if (result.success) {
                toast.success('Successfully logged in!');
                setTimeout(() => {
                    navigate("/"); // Go to main website
                }, 1000);
            } else {
                toast.error("Invalid email or account does not exist.");
            }
        } catch (err) {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 w-full max-w-md mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                    Login to <span className="text-brand-500">Shop</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Enter your email to access your account, orders, and wishlist.
                </p>
            </div>

            <form onSubmit={isOtpSent ? handleSubmit : handleSendOtp} className="space-y-6">
                <div>
                    <Label>Email Address <span className="text-error-500">*</span></Label>
                    <Input
                        type="email"
                        placeholder="johndoe@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isOtpSent}
                        className="h-14 rounded-2xl border-gray-100 focus:ring-brand-500/10"
                    />
                </div>

                {isOtpSent && (
                    <div>
                        <Label>OTP Code <span className="text-error-500">*</span></Label>
                        <Input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="h-14 rounded-2xl border-gray-100 focus:ring-brand-500/10"
                        />
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <Label htmlFor="rememberMe" className="cursor-pointer mb-0">
                            Remember me
                        </Label>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-brand-100 dark:shadow-none"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (isOtpSent ? 'Continue to Shop' : 'Send OTP')}
                    </Button>
                </div>
            </form>

            <div className="mt-8 space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                        <span className="px-4 text-gray-400 bg-white dark:bg-gray-900">New to E-Shop?</span>
                    </div>
                </div>

                <Link to="/customer-registration">
                    <button className="w-full h-14 rounded-2xl border-2 border-gray-100 dark:border-gray-800 text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Create your account
                    </button>
                </Link>
            </div>

            <p className="mt-6 text-xs text-center text-gray-400 leading-relaxed">
                By continuing, you agree to E-Shop's <span className="text-brand-500 cursor-pointer hover:underline">Terms of Use</span> and <span className="text-brand-500 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
        </div>
    );
}
