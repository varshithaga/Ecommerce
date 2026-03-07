from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    User, Category, Product, ProductImage, ProductVariant, 
    ProductReview, Wishlist, Cart, CartItem, ShippingAddress, Order, OrderItem,
    Notification, FCMDevice
)

# ===============================
# 1️⃣ USER SERIALIZER
# ===============================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'is_seller', 'is_customer', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    # Optional Shipping Address Fields for Customer Registration
    phone_address = serializers.CharField(required=False, allow_blank=True)
    address_line = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'is_seller',
            'phone_address', 'address_line', 'city', 'state', 'postal_code', 'country'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        password_confirm = validated_data.pop('password_confirm')
        
        # Extract address data
        address_data = {
            'phone': validated_data.pop('phone_address', ''),
            'address_line': validated_data.pop('address_line', ''),
            'city': validated_data.pop('city', ''),
            'state': validated_data.pop('state', ''),
            'postal_code': validated_data.pop('postal_code', ''),
            'country': validated_data.pop('country', '')
        }

        is_seller = validated_data.get('is_seller', False)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_seller=is_seller,
            is_customer=not is_seller
        )

        # If any address field is provided, create the address
        if any(address_data.values()):
            ShippingAddress.objects.create(user=user, is_default=True, **address_data)
            
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['role'] = 'master' if user.is_staff or user.is_superuser or user.is_seller else 'customer'
        return token


# ===============================
# 2️⃣ CATEGORY SERIALIZER
# ===============================
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# ===============================
# 3️⃣ PRODUCT SERIALIZER
# ===============================
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_feature_image', 'uploaded_at']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ProductReview
        fields = [
            'id', 'product', 'user', 'username', 'rating', 'comment', 
            'image', 'is_verified_purchase', 'created_at'
        ]
        read_only_fields = ['user']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    final_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['seller', 'slug', 'average_rating', 'review_count']

class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'products', 'created_at']

# ===============================
# 4️⃣ CART SERIALIZER
# ===============================
class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    subtotal = serializers.ReadOnlyField(source='total_price')

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'quantity', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.ReadOnlyField(source='get_total_price')

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cart_price', 'created_at']

# ===============================
# 5️⃣ SHIPPING ADDRESS SERIALIZER
# ===============================
class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'
        read_only_fields = ['user']

# ===============================
# 6️⃣ ORDER SERIALIZER
# ===============================
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address_details = ShippingAddressSerializer(source='shipping_address', read_only=True)
    customer_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'user', 'customer_name', 'shipping_address', 'shipping_address_details',
            'total_amount', 'payment_method', 'status', 'is_paid', 'items', 'cancel_reason', 'created_at'
        ]
        read_only_fields = ['user', 'total_amount']

# ===============================
# 7️⃣ NOTIFICATION SERIALIZER
# ===============================
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'body', 'is_read', 'created_at']
        read_only_fields = ['user', 'created_at']


# ===============================
# 8️⃣ FCM DEVICE SERIALIZER
# ===============================
class FCMDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMDevice
        fields = ['id', 'user', 'token', 'created_at']
        read_only_fields = ['user', 'created_at']
