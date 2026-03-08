from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CategoryViewSet, ProductViewSet, 
    CartViewSet, ShippingAddressViewSet, OrderViewSet,
    ProfileViewSet, RegisterView, MyTokenObtainPairView, ProductReviewViewSet,
    WishlistViewSet, NotificationViewSet, FCMDeviceViewSet, RequestOTPView, VerifyOTPView, ResetPasswordView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reviews', ProductReviewViewSet, basename='review')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'addresses', ShippingAddressViewSet, basename='address')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'fcm-devices', FCMDeviceViewSet, basename='fcm-device')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('sendotp/', RequestOTPView.as_view(), name='send-otp'), # Alias for the frontend
    path('verifyotp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resetpassword/', ResetPasswordView.as_view(), name='reset-password'),
]

