import PageMeta from "../../components/common/PageMeta";
import CustomerSignUpForm from "../../components/auth/CustomerSignUpForm";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function CustomerSignUp() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-950 overflow-hidden">
            <PageMeta
                title="Register | E-Shop"
                description="Create your account to start your fashion journey with us."
            />

            {/* Left Side: Illustration & Marketing */}
            <div className="hidden lg:flex flex-col justify-between p-16 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/auth_marketing.png"
                        alt="E-Shop Marketing"
                        className="w-full h-full object-cover opacity-70 scale-110 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
                </div>

                <Link to="/" className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight uppercase">
                        E-Shop<span className="text-brand-500">.</span>
                    </span>
                </Link>

                <div className="relative z-10 space-y-6 max-w-md">
                    <div className="inline-flex px-4 py-1.5 rounded-full bg-brand-500/20 text-brand-500 text-[10px] font-black uppercase tracking-[0.2em] border border-brand-500/30">
                        Join the Movement
                    </div>
                    <h2 className="text-6xl font-black text-white leading-[1.1] uppercase tracking-tighter">
                        Start Your <br />Journey<span className="text-brand-500">.</span>
                    </h2>
                    <p className="text-xl text-gray-300 font-medium leading-relaxed">
                        Join the most exclusive fashion community. Get early access to seasonal collections and personalized styling.
                    </p>
                </div>

                <div className="relative z-10 flex justify-between items-center text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>Universal Access</span>
                    <span>© 2026 E-Shop Corp</span>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-950 relative overflow-y-auto no-scrollbar">
                {/* Mobile Header */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className="text-lg font-black text-gray-900 dark:text-white uppercase">E-Shop</span>
                    </Link>
                </div>

                <div className="w-full max-w-xl space-y-12">
                    <CustomerSignUpForm />
                </div>

                <div className="fixed bottom-6 right-6 z-50">
                    <ThemeTogglerTwo />
                </div>
            </div>
        </div>
    );
}
