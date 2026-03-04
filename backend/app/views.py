from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Sum
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Category, Product, ProductImage, Cart, CartItem, ShippingAddress, Order, OrderItem
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer, 
    CartSerializer, CartItemSerializer, ShippingAddressSerializer, OrderSerializer,
    RegisterSerializer, MyTokenObtainPairSerializer
)


# --- Permissions ---
class IsSellerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_seller

# --- Pagination ---
class Pagination(PageNumberPagination):
    page_query_param = "page"
    page_size_query_param = "limit"
    page_size = 10
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "next": self.page.next_page_number() if self.page.has_next() else None,
            "previous": self.page.previous_page_number() if self.page.has_previous() else None,
            "current_page": self.page.number,
            "total_pages": self.page.paginator.num_pages,
            "results": data,
        })

# --- ViewSets ---

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            # If user asks for their own ID or is admin, allow it
            if pk == 'me' or str(pk) == str(request.user.id) or request.user.is_staff:
                user = User.objects.get(id=request.user.id) if pk == 'me' else User.objects.get(pk=pk)
                serializer = UserSerializer(user)
                return Response(serializer.data)
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        try:
            if str(pk) == str(request.user.id) or request.user.is_staff:
                user = User.objects.get(pk=pk)
                serializer = UserSerializer(user, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "status": "success",
                "message": "User registered successfully",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsSellerOrReadOnly]
    pagination_class = Pagination

    def get_queryset(self):
        queryset = Category.objects.all()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(slug__icontains=search) |
                Q(description__icontains=search)
            )
        return queryset.order_by("name")

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly]
    pagination_class = Pagination

    def get_queryset(self):
        queryset = Product.objects.all()
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")

        if category and category.lower() != "all":
            if category.isdigit():
                queryset = queryset.filter(category_id=category)
            else:
                queryset = queryset.filter(
                    Q(category__name__icontains=category) |
                    Q(category__slug__icontains=category)
                )

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(model_name__icontains=search) |
                Q(brand__name__icontains=search)
            )
        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        product = serializer.save(seller=self.request.user)
        self.handle_images(product)

    def perform_update(self, serializer):
        product = serializer.save()
        self.handle_images(product)

    def handle_images(self, product):
        images = self.request.FILES.getlist('uploaded_images')
        for image in images:
            ProductImage.objects.create(product=product, image=image)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def add_to_cart(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        return Response({"message": "Item added to cart"}, status=status.HTTP_200_OK)

class ShippingAddressViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = Pagination

    def get_queryset(self):
        queryset = Order.objects.all()
        user = self.request.user
        
        if not (user.is_staff or user.is_seller):
            queryset = queryset.filter(user=user)

        # Apply search and status filtering
        search = self.request.query_params.get("search")
        status_filter = self.request.query_params.get("status")

        if status_filter and status_filter.lower() != "all":
            queryset = queryset.filter(status=status_filter)

        if search:
            queryset = queryset.filter(
                Q(order_id__icontains=search) |
                Q(user__username__icontains=search) |
                Q(status__icontains=search) |
                Q(total_amount__icontains=search)
            )

        return queryset.order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        limit = request.query_params.get("limit")

        # Calculate status counts for the sidebar/tabs
        status_counts = (
            queryset.values("status")
            .annotate(count=Count("id"))
            .order_by()
        )
        status_summary = {entry["status"]: entry["count"] for entry in status_counts}

        if limit and str(limit).lower() == "all":
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                "count": queryset.count(),
                "status_counts": status_summary,
                "results": serializer.data
            })

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data["status_counts"] = status_summary
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "status_counts": status_summary,
            "results": serializer.data
        })

    def perform_create(self, serializer):
        # Professional Checkout Logic:
        # Transfer items from Cart to Order
        user = self.request.user
        cart = user.cart
        cart_items = cart.items.all()

        if not cart_items:
            raise serializers.ValidationError("Cart is empty")

        total_amount = cart.get_total_price()
        order = serializer.save(user=user, total_amount=total_amount)

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.final_price()
            )
            # Reduce stock
            item.product.stock -= item.quantity
            item.product.save()

        # Clear cart
        cart_items.delete()
