from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Sum
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Category, Product, ProductImage, Cart, CartItem, ShippingAddress, Order, OrderItem, ProductReview, Notification, FCMDevice
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer, 
    CartSerializer, CartItemSerializer, ShippingAddressSerializer, OrderSerializer,
    RegisterSerializer, MyTokenObtainPairSerializer, ProductReviewSerializer,
    WishlistSerializer, NotificationSerializer, FCMDeviceSerializer
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
    pagination_class = Pagination

    def get_queryset(self):
        queryset = User.objects.all().order_by("-date_joined") if hasattr(User, 'date_joined') else User.objects.all().order_by("-id")
        
        is_admin_or_seller = self.request.user.is_staff or self.request.user.is_seller

        if not is_admin_or_seller:
            queryset = queryset.filter(id=self.request.user.id)
            
        search = self.request.query_params.get("search")
        if search and is_admin_or_seller:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
            
        role = self.request.query_params.get("role")
        if role == "customer" and is_admin_or_seller:
            queryset = queryset.filter(is_customer=True, is_seller=False)
            
        return queryset

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

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        
        if not user.check_password(old_password):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"status": "success", "message": "Password updated successfully"})

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
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        brand = self.request.query_params.get("brand")
        sort = self.request.query_params.get("sort")

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

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if brand:
            queryset = queryset.filter(brand__name__icontains=brand)

        if sort == 'price_asc':
            return queryset.order_by('price')
        elif sort == 'price_desc':
            return queryset.order_by('-price')
        elif sort == 'rating':
            return queryset.order_by('-average_rating')
        elif sort == 'newest':
            return queryset.order_by('-created_at')

        return queryset.order_by("-created_at")

    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        product = self.get_object()
        related_products = Product.objects.filter(category=product.category).exclude(id=product.id).order_by('?')[:4]
        serializer = self.get_serializer(related_products, many=True)
        return Response(serializer.data)

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
        else:
            # Allow admin/seller to filter by user_id
            user_id = self.request.query_params.get("user_id")
            if user_id:
                queryset = queryset.filter(user_id=int(user_id))

        # Apply search and status filtering
        search = self.request.query_params.get("search")
        status_filter = self.request.query_params.get("status")

        # Period filtering
        period = self.request.query_params.get("period")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if period:
            from .utils import get_period_range
            start, end = get_period_range(period, start_date, end_date)
            if start and end:
                queryset = queryset.filter(created_at__date__range=[start, end])

        if status_filter and status_filter.lower() != "all":
            queryset = queryset.filter(status=status_filter)

        if search:
            queryset = queryset.filter(
                Q(order_id__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__phone__icontains=search) |
                Q(total_amount__icontains=search)
            )

        payment_method = self.request.query_params.get("payment_method")
        if payment_method and payment_method.lower() != "all":
            queryset = queryset.filter(payment_method=payment_method)

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
        total_sales = queryset.aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        if limit and str(limit).lower() == "all":
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                "count": queryset.count(),
                "total_sales": total_sales,
                "status_counts": status_summary,
                "results": serializer.data
            })

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data["status_counts"] = status_summary
            paginated_response.data["total_sales"] = total_sales
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "total_sales": total_sales,
            "status_counts": status_summary,
            "results": serializer.data
        })

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        import csv
        from django.http import HttpResponse

        queryset = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'

        writer = csv.writer(response)
        writer.writerow(['Order ID', 'Customer', 'Email', 'Date', 'Amount', 'Status', 'Payment Method'])

        for order in queryset:
            writer.writerow([
                order.order_id,
                order.user.get_full_name() or order.user.username,
                order.user.email,
                order.created_at.strftime('%Y-%m-%d %H:%M'),
                order.total_amount,
                order.status,
                order.payment_method
            ])

        return response

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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard_stats(self, request):
        user = request.user
        if not (user.is_staff or user.is_seller):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
            
        orders = Order.objects.all()
        
        total_sales = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_orders = orders.count()
        
        # Recent 5 orders
        recent_orders = orders.order_by('-created_at')[:5]
        recent_orders_data = self.get_serializer(recent_orders, many=True).data
        
        # Status breakdown
        status_counts = (
            orders.values("status")
            .annotate(count=Count("id"))
            .order_by()
        )
        status_summary = {entry["status"]: entry["count"] for entry in status_counts}
        
        return Response({
            "total_sales": total_sales,
            "total_orders": total_orders,
            "recent_orders": recent_orders_data,
            "status_counts": status_summary
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        
        if order.status in ['Delivered', 'Cancelled']:
            return Response({"error": "Order cannot be cancelled"}, status=status.HTTP_400_BAD_REQUEST)
            
        cancel_reason = request.data.get("reason", "No reason provided")
        order.status = "Cancelled"
        order.cancel_reason = cancel_reason
        order.save()
        
        return Response({
            "status": "success", 
            "message": "Order cancelled successfully"
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reorder(self, request, pk=None):
        order = self.get_object()
        user = request.user
        
        from .models import Cart, CartItem
        cart, _ = Cart.objects.get_or_create(user=user)
        
        for order_item in order.items.all():
            if order_item.product and order_item.product.stock > 0:
                cart_item, created = CartItem.objects.get_or_create(cart=cart, product=order_item.product)
                if not created:
                    cart_item.quantity += order_item.quantity
                else:
                    cart_item.quantity = order_item.quantity
                cart_item.save()
                
        return Response({
            "status": "success",
            "message": "Items added to cart successfully for reorder"
        })

class ProductReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = ProductReview.objects.all()
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_review(self, request):
        product_id = request.query_params.get('product')
        if not product_id:
             return Response({"error": "Product ID required"}, status=status.HTTP_400_BAD_REQUEST)
        review = ProductReview.objects.filter(product_id=product_id, user=request.user).first()
        if review:
             return Response(self.get_serializer(review).data)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        user = request.user
        
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product_id=product_id,
            order__status='Delivered'
        ).exists()

        if not has_purchased:
            return Response({"detail": "You can only review products that have been delivered to you."}, status=status.HTTP_400_BAD_REQUEST)
            
        review = ProductReview.objects.filter(product_id=product_id, user=user).first()
        
        if review:
            serializer = self.get_serializer(review, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_verified_purchase=True)

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot edit someone else's review.")
        serializer.save(is_verified_purchase=True)
        
    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot delete someone else's review.")
        instance.delete()

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import Wishlist
        return Wishlist.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        from .models import Wishlist
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        from .models import Wishlist
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        if product in wishlist.products.all():
            wishlist.products.remove(product)
            return Response({"message": "Product removed from wishlist", "in_wishlist": False}, status=status.HTTP_200_OK)
        else:
            wishlist.products.add(product)
            return Response({"message": "Product added to wishlist", "in_wishlist": True}, status=status.HTTP_200_OK)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = Pagination

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"status": "success", "message": "All notifications marked as read."})

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "success", "message": "Notification marked as read."})

class FCMDeviceViewSet(viewsets.ModelViewSet):
    queryset = FCMDevice.objects.all()
    serializer_class = FCMDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FCMDevice.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Allow updating the token if it already exists by deleting the old one first or just get_or_create logic
        token = self.request.data.get('token')
        FCMDevice.objects.filter(token=token).delete()
        serializer.save(user=self.request.user)
