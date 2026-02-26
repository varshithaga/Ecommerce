import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { registerUser } from "./signupApi.ts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Form data interface
interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  is_seller: boolean;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    is_seller: false
  });

  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPasswordError, setShowPasswordError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Real-time password validation
    if (name === 'password' || name === 'password_confirm') {
      const password = name === 'password' ? value : formData.password;
      const confirmPassword = name === 'password_confirm' ? value : formData.password_confirm;

      if (confirmPassword.length > 0) {
        const match = password === confirmPassword;
        setPasswordsMatch(match);
        setShowPasswordError(!match);
      } else {
        setShowPasswordError(false);
        setPasswordsMatch(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch || formData.password !== formData.password_confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.username ||
      !formData.password ||
      !formData.password_confirm
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        ...formData,
        role: formData.is_seller ? "seller" : "master"
      });

      if (result.success) {
        toast.success("Registration successful. You can now Sign In.");
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          username: "",
          password: "",
          password_confirm: "",
          is_seller: false
        });
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
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 text-center sm:text-left">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              theme="light"
              className="z-[99999]"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create an account to start shopping or selling!
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>First Name<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="first_name"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Last Name<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label>Email<span className="text-error-500">*</span></Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Username<span className="text-error-500">*</span></Label>
                <Input
                  type="text"
                  name="username"
                  placeholder="johndoe123"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Password<span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
                  </span>
                </div>
              </div>

              <div>
                <Label>Confirm Password<span className="text-error-500">*</span></Label>
                <Input
                  placeholder="••••••••"
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  className={!passwordsMatch && showPasswordError ? "border-red-500" : ""}
                />
                {showPasswordError && <p className="mt-1 text-sm text-red-500">Passwords do not match</p>}
                {passwordsMatch && formData.password_confirm.length > 0 && <p className="mt-1 text-sm text-green-500">Passwords match ✓</p>}
              </div>

              <div className="flex items-center gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/5">
                <input
                  type="checkbox"
                  id="is_seller"
                  name="is_seller"
                  checked={formData.is_seller}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                />
                <div>
                  <Label htmlFor="is_seller" className="cursor-pointer mb-0">
                    Register as a Seller
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Check this if you want to sell products.
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
              Already have an account? {""}
              <Link to="/" className="text-brand-500 font-bold hover:text-brand-600 dark:text-brand-400">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
