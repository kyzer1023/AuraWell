import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi } from '@/services/api';
import type { Product } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ArrowLeft, Loader2, Check } from 'lucide-react';
import { getImageUrl } from '@/utils/images';

const categoryColors: Record<string, string> = {
  vitamins: 'bg-amber-100 text-amber-700',
  supplements: 'bg-blue-100 text-blue-700',
  aromatherapy: 'bg-purple-100 text-purple-700',
};

const ageGroupLabels: Record<string, string> = {
  toddler: 'Toddler (0-3 years)',
  child: 'Children (4-12 years)',
  teen: 'Teens (13-19 years)',
  adult: 'Adults (20-64 years)',
  elderly: 'Seniors (65+ years)',
  all: 'All Ages',
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const data = await productsApi.getById(id!);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product!.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-sage-800">Product not found</h1>
        <Link to="/products" className="mt-4 text-sage-600 hover:text-sage-800">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-square rounded-3xl overflow-hidden bg-cream-100"
        >
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          {/* Category Badge */}
          <span
            className={`inline-block self-start px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              categoryColors[product.category] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </span>

          <h1 className="text-4xl font-display font-bold text-sage-800 mb-4">
            {product.name}
          </h1>

          <p className="text-3xl font-semibold text-sage-700 mb-6">
            RM{product.price.toFixed(2)}
          </p>

          <p className="text-sage-600 leading-relaxed mb-6">{product.description}</p>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-cream-100 rounded-xl">
              <p className="text-sm text-sage-500">Suitable For</p>
              <p className="font-medium text-sage-800">
                {ageGroupLabels[product.ageGroup]}
              </p>
            </div>
            <div className="p-4 bg-cream-100 rounded-xl">
              <p className="text-sm text-sage-500">Stock</p>
              <p
                className={`font-medium ${
                  product.stock > 10
                    ? 'text-green-600'
                    : product.stock > 0
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {product.stock > 10
                  ? 'In Stock'
                  : product.stock > 0
                  ? `Only ${product.stock} left`
                  : 'Out of Stock'}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-sage-700 mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-cream-300 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-sage-600 hover:bg-cream-100 transition-colors rounded-l-xl"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center font-medium text-sage-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-sage-600 hover:bg-cream-100 transition-colors rounded-r-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-sage-500 text-sm">
                  Subtotal: RM{(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              added
                ? 'bg-green-600 text-white'
                : product.stock === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-sage-600 text-white hover:bg-sage-700'
            }`}
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : added ? (
              <>
                <Check className="w-5 h-5" />
                Added to Cart!
              </>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </button>

          {!isAuthenticated && (
            <p className="mt-4 text-center text-sage-500 text-sm">
              <Link to="/login" className="text-sage-700 font-medium hover:text-sage-800">
                Sign in
              </Link>{' '}
              to add items to your cart
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

