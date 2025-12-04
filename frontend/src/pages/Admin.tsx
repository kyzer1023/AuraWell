import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/services/api';
import type { Product, Order } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { getImageUrl } from '@/utils/images';

const categories = ['vitamins', 'supplements', 'aromatherapy'];
const ageGroups = ['toddler', 'child', 'teen', 'adult', 'elderly', 'all'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  ageGroup: string;
  imageUrl: string;
}

const emptyProduct: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: 'vitamins',
  ageGroup: 'adult',
  imageUrl: '',
};

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Product form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(emptyProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'products') {
        const data = await adminApi.getProducts();
        setProducts(data);
      } else {
        const data = await adminApi.getOrders();
        setOrders(data.sort((a, b) => b.createdAt - a.createdAt));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPG, PNG, GIF, or WebP.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await adminApi.uploadImage(file);
      if (result.success && result.imageUrl) {
        setProductForm((prev) => ({ ...prev, imageUrl: result.imageUrl }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.category,
        ageGroup: productForm.ageGroup,
        imageUrl: productForm.imageUrl,
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, productData);
      } else {
        await adminApi.createProduct(productData);
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm(emptyProduct);
      setUploadError(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      ageGroup: product.ageGroup,
      imageUrl: product.imageUrl,
    });
    setUploadError(null);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await adminApi.deleteProduct(productId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      fetchData();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-sage-800">Admin Panel</h1>

        {activeTab === 'products' && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm(emptyProduct);
              setUploadError(null);
              setShowProductModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-cream-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-sage-600 text-sage-800'
              : 'border-transparent text-sage-500 hover:text-sage-700'
          }`}
        >
          <Package className="w-5 h-5" />
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-sage-600 text-sage-800'
              : 'border-transparent text-sage-500 hover:text-sage-700'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          Orders
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
        </div>
      ) : activeTab === 'products' ? (
        /* Products Table */
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sage-700">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sage-700">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sage-700">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sage-700">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-sage-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sage-800">{product.name}</p>
                          <p className="text-sm text-sage-500">{product.ageGroup}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sage-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-sage-800">
                      RM{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          product.stock > 10
                            ? 'text-green-600'
                            : product.stock > 0
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-sage-600 hover:bg-cream-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-sm text-sage-500">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-sage-500">{formatDate(order.createdAt)}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                    statusColors[order.status]
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="text-sm text-sage-600 mb-3">
                <span className="font-medium">Ship to:</span> {order.shippingAddress}
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-sage-600">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-sage-800">
                      RM{(item.priceAtPurchase * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-cream-200 flex justify-between">
                <span className="font-medium text-sage-700">Total</span>
                <span className="font-semibold text-sage-800">
                  RM{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-sage-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 text-sage-400 hover:text-sage-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    required
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Price (RM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, stock: e.target.value }))
                      }
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="input-field"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Age Group
                    </label>
                    <select
                      value={productForm.ageGroup}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, ageGroup: e.target.value }))
                      }
                      className="input-field"
                    >
                      {ageGroups.map((age) => (
                        <option key={age} value={age}>
                          {age.charAt(0).toUpperCase() + age.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Product Image
                  </label>
                  
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed border-cream-300 rounded-xl cursor-pointer hover:border-sage-400 hover:bg-cream-50 transition-colors ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-sage-600" />
                          <span className="text-sage-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-sage-500" />
                          <span className="text-sage-600">Upload Image</span>
                        </>
                      )}
                    </label>
                    
                    <span className="text-xs text-sage-400">
                      JPG, PNG, GIF, WebP (max 10MB)
                    </span>
                  </div>

                  {/* Upload Error */}
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-500">{uploadError}</p>
                  )}

                  {/* Image Preview */}
                  {productForm.imageUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-cream-100 border border-cream-200">
                        <img
                          src={getImageUrl(productForm.imageUrl)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-sage-600 flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          Image uploaded
                        </p>
                        <button
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, imageUrl: '' }))}
                          className="text-sm text-red-500 hover:text-red-600 mt-1"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  )}

                  {/* No Image Placeholder */}
                  {!productForm.imageUrl && !isUploading && (
                    <div className="mt-3 p-4 bg-cream-50 rounded-xl border border-cream-200 text-center">
                      <ImageIcon className="w-8 h-8 text-sage-300 mx-auto mb-2" />
                      <p className="text-sm text-sage-400">No image uploaded yet</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editingProduct ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
