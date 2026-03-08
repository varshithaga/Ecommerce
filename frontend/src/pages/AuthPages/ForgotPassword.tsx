import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ForgotPasswordForm from "../../components/auth/ForgotPassword";

export default function ForgotPassword() {
    return (
        <>
            <PageMeta
                title="Forgot Password Page"
                description="This is ForgotPassword Page"
            />
            <AuthLayout>
                <ForgotPasswordForm />
            </AuthLayout>
        </>
    );
}
