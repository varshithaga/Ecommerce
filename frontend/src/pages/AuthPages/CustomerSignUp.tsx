import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import CustomerSignUpForm from "../../components/auth/CustomerSignUpForm";

export default function CustomerSignUp() {
    return (
        <>
            <PageMeta
                title="Customer Registration | E-Shop"
                description="Register as a customer and provide your shipping details for a seamless shopping experience."
            />
            <AuthLayout>
                <CustomerSignUpForm />
            </AuthLayout>
        </>
    );
}
