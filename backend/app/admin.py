from django.contrib import admin
from .models import User, Category, Product, ProductImage, Cart, CartItem, ShippingAddress, Order, OrderItem

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_seller', 'is_customer', 'is_staff']
    list_filter = ['is_seller', 'is_customer', 'is_staff']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'seller', 'price', 'stock', 'is_available', 'created_at']
    list_filter = ['category', 'is_available', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'user', 'total_amount', 'status', 'is_paid', 'created_at']
    list_filter = ['status', 'is_paid', 'created_at']
    search_fields = ['order_id', 'user__username']

@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'state', 'country', 'is_default']

admin.site.register(OrderItem)
admin.site.register(CartItem)
