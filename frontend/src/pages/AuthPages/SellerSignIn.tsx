import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SellerSignIn() {
    return (
        <>
            <PageMeta
                title="Seller Sign In | E-Shop"
                description="Authorized login for sales persons and partners to manage products."
            />
            <AuthLayout>
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Seller <span className="text-brand-500">Portal</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Authorized access for sales persons and partners.
                    </p>
                </div>
                <SignInForm />
            </AuthLayout>
        </>
    );
}
