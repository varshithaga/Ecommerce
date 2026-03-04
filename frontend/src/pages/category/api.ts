import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from '../../access/access.ts';

/**
 * Category Interface representing the backend Category model
 */
export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image?: string;
    created_at: string;
}

/**
 * Paginated Category Response
 */
export interface PaginatedCategoryResponse {
    results: Category[];
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
}

/**
 * Fetch all categories (with search and pagination)
 */
export const getCategories = async (search: string = "", page: number = 1): Promise<PaginatedCategoryResponse> => {
    const url = new URL(createApiUrl('api/categories/'));
    if (search) url.searchParams.append('search', search);
    url.searchParams.append('page', page.toString());

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
};

/**
 * Fetch a single category by ID
 */
export const getCategoryById = async (id: number | string): Promise<Category> => {
    const url = createApiUrl(`api/categories/${id}/`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Category not found');
    return await response.json();
};

/**
 * Create a new category (Admin only)
 */
export const createCategory = async (formData: FormData): Promise<Category> => {
    const url = createApiUrl('api/categories/');
    const headers = await getAuthHeadersFile();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': headers['Authorization']
        },
        body: formData,
    });

    if (!response.ok) throw new Error('Failed to create category');
    return await response.json();
};

/**
 * Update an existing category
 */
export const updateCategory = async (id: number, data: FormData | Partial<Category>): Promise<Category> => {
    const url = createApiUrl(`api/categories/${id}/`);

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

    if (!response.ok) throw new Error('Failed to update category');
    return await response.json();
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: number): Promise<void> => {
    const url = createApiUrl(`api/categories/${id}/`);
    const headers = await getAuthHeaders();

    const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
    });

    if (!response.ok) throw new Error('Failed to delete category');
};
