from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils.text import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

# ===============================
# 1️⃣ CUSTOM USER MODEL
# ===============================
class User(AbstractUser):
    """
    Custom User model where:
    - Admin (is_staff/is_superuser) can add products.
    - Customer (is_customer=True) can buy products.
    """
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_seller = models.BooleanField(default=False)  # Can be used to designate Admin/Staff as sellers
    is_customer = models.BooleanField(default=True)

    def __str__(self):
        return self.username


# ===============================
# 2️⃣ CATEGORY MODEL
# ===============================
class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ===============================
# 3️⃣ PRODUCT MODEL
# ===============================
class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    model_name = models.CharField(max_length=255, blank=True, null=True)
    model_number = models.CharField(max_length=100, blank=True, null=True)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Stock Keeping Unit")
    hsn_code = models.CharField(max_length=20, blank=True, null=True, help_text="Harmonized System of Nomenclature code for tax")
    generic_name = models.CharField(max_length=255, blank=True, null=True, help_text="Common name of product, e.g., Smartphone, Shirt")
    
    description = models.TextField(help_text="Detailed product description")
    highlights = models.TextField(blank=True, help_text="Key features, separate with newlines for bullet points")
    specifications = models.JSONField(default=dict, blank=True, help_text="Store technical specs as key-value pairs")

    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    stock = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)
    
    # 📜 Policies & Returns
    return_days = models.PositiveIntegerField(default=7)
    return_policy = models.CharField(max_length=255, blank=True, null=True, default="7-Day Return Policy")
    replacement_policy = models.CharField(max_length=255, blank=True, null=True, default="7-Day Replacement Policy")
    delivery_info = models.CharField(max_length=255, blank=True, null=True, default="Free Delivery in 3-5 business days")
    
    # 🛡️ Warranty Info
    warranty_summary = models.CharField(max_length=255, blank=True, null=True, help_text="Short warranty string, e.g., 1 Year Manufacturer Warranty")
    warranty_period = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 12 Months")
    warranty_service_type = models.TextField(blank=True, null=True, help_text="e.g., On-site or Carry-in")
    warranty_covered = models.TextField(blank=True, null=True, help_text="What is covered? (Manufacturing defects, etc.)")
    warranty_not_covered = models.TextField(blank=True, null=True, help_text="What is NOT covered? (Physical damage, etc.)")

    # 🏭 Manufacturer / Compliance Info (Required for most countries)
    country_of_origin = models.CharField(max_length=100, blank=True, null=True)
    manufacturer_details = models.TextField(blank=True, null=True, help_text="Name and Address of Manufacturer")
    packer_details = models.TextField(blank=True, null=True, help_text="Name and Address of Packer")
    importer_details = models.TextField(blank=True, null=True, help_text="Name and Address of Importer")
    net_quantity = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 1 unit, 500g, 10 pieces")
    
    # 📏 Dimensions & Weight
    product_weight = models.CharField(max_length=50, blank=True, null=True, help_text="Weight including unit, e.g., 200g")
    product_dimensions = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 15 x 7 x 0.8 cm")
    
    # 📈 Performance & Stats
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.PositiveIntegerField(default=0)
    
    # 🏷️ Flags & Badges
    is_bestseller = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)

    # 🔍 SEO & Marketing
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True, help_text="URL for product demo video")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def final_price(self):
        return self.discount_price if self.discount_price and self.discount_price < self.price else self.price

    def update_rating(self):
        from django.db.models import Avg
        reviews = self.reviews.all()
        if reviews.exists():
            self.average_rating = reviews.aggregate(Avg('rating'))['rating__avg']
            self.review_count = reviews.count()
        else:
            self.average_rating = 0.00
            self.review_count = 0
        self.save()

    def __str__(self):
        return self.name


# ===============================
# 4️⃣ PRODUCT IMAGES
# ===============================
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_feature_image = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"


# ===============================
# 5️⃣ PRODUCT VARIANTS (Size, Color, etc.)
# ===============================
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    name = models.CharField(max_length=100, help_text="e.g., XL Silver, 8GB RAM / 128GB Storage")
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, help_text="Override base product price if needed")
    stock = models.PositiveIntegerField(default=0)
    
    image = models.ImageField(upload_to="variants/", blank=True, null=True, help_text="Variant specific image (optional)")
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


# ===============================
# 6️⃣ PRODUCT REVIEWS
# ===============================
class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    image = models.ImageField(upload_to="reviews/", blank=True, null=True)
    
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating} stars)"


# ===============================
# 7️⃣ WISHLIST
# ===============================
class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist")
    products = models.ManyToManyField(Product, related_name="wishlisted_by", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Wishlist"


# ===============================
# 8️⃣ CART MODEL
# ===============================
class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def get_total_price(self):
        return sum(item.total_price() for item in self.items.all())

    def __str__(self):
        return f"Cart - {self.user.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def total_price(self):
        return self.product.final_price() * self.quantity

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"


# ===============================
# 9️⃣ SHIPPING ADDRESS
# ===============================
class ShippingAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shipping_addresses")
    phone = models.CharField(max_length=15)
    address_line = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.city}"


# ===============================
# 🔟 ORDER MODEL
# ===============================
class Order(models.Model):
    ORDER_STATUS = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    PAYMENT_METHODS = (
        ('COD', 'Cash on Delivery'),
        ('Card', 'Card'),
        ('UPI', 'UPI'),
        ('NetBanking', 'Net Banking'),
    )

    order_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    shipping_address = models.ForeignKey(ShippingAddress, on_delete=models.SET_NULL, null=True)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='Pending')
    is_paid = models.BooleanField(default=False)
    cancel_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_id} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def total_price(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


# ===============================
# 1️⃣1️⃣ NOTIFICATION MODEL
# ===============================
class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} → {self.user.username}"


# ===============================
# 1️⃣2️⃣ SIGNALS (Auto-create Cart, Wishlist & Update Rating)
# ===============================
@receiver(post_save, sender=User)
def create_customer_assets(sender, instance, created, **kwargs):
    if created:
        Cart.objects.get_or_create(user=instance)
        Wishlist.objects.get_or_create(user=instance)


@receiver(post_save, sender=ProductReview)
def update_product_rating(sender, instance, **kwargs):
    instance.product.update_rating()