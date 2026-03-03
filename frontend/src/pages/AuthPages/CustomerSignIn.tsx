import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import CustomerSignInForm from "../../components/auth/CustomerSignInForm";

export default function CustomerSignIn() {
    return (
        <>
            <PageMeta
                title="Customer Login | E-Shop"
                description="Sign in to your account with just your email."
            />
            <AuthLayout>
                <CustomerSignInForm />
            </AuthLayout>
        </>
    );
}
