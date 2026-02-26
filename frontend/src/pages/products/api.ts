import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from '../../access/access.ts';

/**
 * Product Interface representing the backend Product model
 */
export interface Product {
    id: number;
    category: number;
    category_name: string;
    seller: number;
    name: string;
    slug: string;
    description: string;
    price: string; // Decimal is returned as string in JSON
    discount_price?: string;
    final_price: string;
    stock: number;
    is_available: boolean;
    images: { id: number; image: string; uploaded_at: string }[];
    created_at: string;
}

/**
 * Fetch all products
 */
export const getProducts = async (): Promise<Product[]> => {
    const url = createApiUrl('api/products/');
    const response = await fetch(url);
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
