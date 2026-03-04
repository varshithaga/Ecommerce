from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CategoryViewSet, ProductViewSet, 
    CartViewSet, ShippingAddressViewSet, OrderViewSet,
    ProfileViewSet, RegisterView, MyTokenObtainPairView, ProductReviewViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reviews', ProductReviewViewSet, basename='review')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'addresses', ShippingAddressViewSet, basename='address')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
]

