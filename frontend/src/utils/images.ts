// Centralized image path configuration for the application
// Product images are uploaded by admin and served from the backend API

// Backend API base URL for images
const API_BASE_URL = 'http://localhost:9090';

// Default fallback image when product image is not found
export const defaultProductImage = '/images/products/default-product.jpg';

// Helper function to get the full image URL
// Handles both API paths (/api/images/...) and local paths (/images/...)
export function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return defaultProductImage;
  
  // If it's an API path from uploaded images, prepend the backend URL
  if (imageUrl.startsWith('/api/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // For local paths or full URLs, return as-is
  return imageUrl;
}
