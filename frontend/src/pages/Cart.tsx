import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '@/utils/images';

export default function Cart() {
  const { items, totalAmount, isLoading, updateQuantity, removeFromCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, quantity);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemove = async (productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-sage-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-sage-800 mb-4">
            Your cart is empty
          </h1>
          <p className="text-sage-500 mb-8">
            Looks like you haven't added any products yet.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-display font-bold text-sage-800 mb-8"
      >
        Shopping Cart
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-cream-200 flex gap-4 sm:gap-6"
              >
                {/* Image */}
                <Link to={`/products/${item.productId}`} className="shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-cream-100">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-semibold text-sage-800 hover:text-sage-600 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sage-600 mt-1">RM{item.price.toFixed(2)}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-cream-300 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={updatingItems.has(item.productId) || item.quantity <= 1}
                        className="p-2 text-sage-600 hover:bg-cream-100 transition-colors rounded-l-lg disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium text-sage-800">
                        {updatingItems.has(item.productId) ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={updatingItems.has(item.productId)}
                        className="p-2 text-sage-600 hover:bg-cream-100 transition-colors rounded-r-lg disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={updatingItems.has(item.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="font-semibold text-sage-800">
                    RM{item.subtotal.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200 sticky top-24"
          >
            <h2 className="text-xl font-semibold text-sage-800 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sage-600">
                <span>Subtotal ({items.length} items)</span>
                <span>RM{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sage-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-cream-200 pt-4 flex justify-between font-semibold text-sage-800 text-lg">
                <span>Total</span>
                <span>RM{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/products"
              className="block text-center mt-4 text-sage-600 hover:text-sage-800 font-medium"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

