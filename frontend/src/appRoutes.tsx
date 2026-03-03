import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const MasterDashboard = lazy(() => import("./pages/Dashboard/index"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const MasterLayout = lazy(() => import("./layout/MasterLayout/MasterLayout"));
const PublicLayout = lazy(() => import("./layout/PublicLayout"));
const Blank = lazy(() => import("./pages/Blank"));

const Home = lazy(() => import("./pages/Home"));
const PublicProducts = lazy(() => import("./pages/PublicProducts"));
const PublicCategories = lazy(() => import("./pages/PublicCategories"));
const CustomerSignUp = lazy(() => import("./pages/AuthPages/CustomerSignUp"));
const CustomerSignIn = lazy(() => import("./pages/AuthPages/CustomerSignIn"));
const SellerSignIn = lazy(() => import("./pages/AuthPages/SellerSignIn"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CartPage = lazy(() => import("./pages/CartPage"));

import ClientPage from "./pages/registration/client";
import SupplierPage from "./pages/registration/supplier";
import ProductPage from "./pages/products/index";
import CategoryPage from "./pages/category/index";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
  </div>
);

export function appRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<PublicProducts />} />
          <Route path="/categories" element={<PublicCategories />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* Dashboard Layout */}
        <Route element={<MasterLayout />}>
          <Route path="master/master-dashboard" element={<MasterDashboard />} />
          <Route path="master/client" element={<ClientPage />} />
          <Route path="master/supplier" element={<SupplierPage />} />
          <Route path="master/products" element={<ProductPage />} />
          <Route path="master/productcategory" element={<CategoryPage />} />

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Ui Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

        <Route path="/customer-registration" element={<CustomerSignUp />} />
        <Route path="/customer-login" element={<CustomerSignIn />} />
        <Route path="/seller-login" element={<SellerSignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
