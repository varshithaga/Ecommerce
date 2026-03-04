import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from '../../access/access.ts';

/**
 * Product Interface representing the backend Product model
 */
export interface ProductImage {
    id: number;
    image: string;
    alt_text?: string;
    is_feature_image: boolean;
    uploaded_at: string;
}

export interface ProductVariant {
    id: number;
    product: number;
    name: string;
    sku?: string;
    price?: string;
    stock: number;
    image?: string;
}

export interface ProductReview {
    id: number;
    product: number;
    user: number;
    username: string;
    rating: number;
    comment: string;
    image?: string;
    is_verified_purchase: boolean;
    created_at: string;
}

/**
 * Product Interface representing the backend Product model
 */
export interface Product {
    id: number;
    category: number;
    category_name: string;
    category_slug: string;
    seller: number;
    name: string;
    slug: string;
    brand: string;
    model_name?: string;
    model_number?: string;
    sku?: string;
    hsn_code?: string;
    generic_name?: string;

    description: string;
    highlights: string;
    specifications: Record<string, any>;

    price: string; // Decimal is returned as string in JSON
    discount_price?: string;
    final_price: string;

    stock: number;
    is_available: boolean;

    // Policy & Returns
    return_days: number;
    return_policy: string;
    replacement_policy: string;
    delivery_info: string;

    // Warranty
    warranty_summary?: string;
    warranty_period?: string;
    warranty_service_type?: string;
    warranty_covered?: string;
    warranty_not_covered?: string;

    // Manufacturer Details
    country_of_origin?: string;
    manufacturer_details?: string;
    packer_details?: string;
    importer_details?: string;
    net_quantity?: string;

    // Dimensions
    product_weight?: string;
    product_dimensions?: string;

    // Performance & Stats
    average_rating: string;
    review_count: number;

    // Flags
    is_bestseller: boolean;
    is_featured: boolean;
    is_new: boolean;

    // SEO & Marketing
    meta_title?: string;
    meta_description?: string;
    video_url?: string;

    images: ProductImage[];
    variants: ProductVariant[];
    reviews: ProductReview[];
    created_at: string;
}

/**
 * Paginated Product Response
 */
export interface PaginatedProductResponse {
    results: Product[];
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
}

/**
 * Fetch all products (with search, category, and pagination)
 */
export const getProducts = async (search: string = "", page: number = 1, category: string = ""): Promise<PaginatedProductResponse> => {
    const url = new URL(createApiUrl('api/products/'));
    if (search) url.searchParams.append('search', search);
    if (category) url.searchParams.append('category', category);
    url.searchParams.append('page', page.toString());

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id: number | string): Promise<Product> => {
    const url = createApiUrl(`api/products/${id}/`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Product not found');
    return await response.json();
};

/**
 * Add a new product (Admin/Seller only)
 */
export const createProduct = async (formData: FormData): Promise<Product> => {
    const url = createApiUrl('api/products/');
    const headers = await getAuthHeadersFile();

    // Note: Fetch with FormData automatically handles boundary if Content-Type is NOT set manually
    // However, the helper might set it. Let's handle it carefully.
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': headers['Authorization']
        },
        body: formData,
    });

    if (!response.ok) throw new Error('Failed to create product');
    return await response.json();
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: number, data: FormData | Partial<Product>): Promise<Product> => {
    const url = createApiUrl(`api/products/${id}/`);

    let headers: Record<string, string> = {};
    let body: any;

    if (data instanceof FormData) {
        const authHeaders = await getAuthHeadersFile();
        headers = { 'Authorization': authHeaders['Authorization'] };
        body = data;
    } else {
        headers = await getAuthHeaders();
        body = JSON.stringify(data);
    }

    const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: body,
    });

    if (!response.ok) throw new Error('Failed to update product');
    return await response.json();
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: number): Promise<void> => {
    const url = createApiUrl(`api/products/${id}/`);
    const headers = await getAuthHeaders();

    const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
    });

    if (!response.ok) throw new Error('Failed to delete product');
};
/**
 * Add a product to the user's shopping cart
 */
export const addToCart = async (productId: number, quantity: number = 1): Promise<any> => {
    const url = createApiUrl('api/cart/add_to_cart/');
    const headers = await getAuthHeaders();

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error('Please sign in to add items to your cart');
        throw new Error('Failed to add item to cart');
    }
    return await response.json();
};
