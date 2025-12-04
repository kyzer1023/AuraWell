import { Link } from 'react-router-dom';
import type { Product } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getImageUrl } from '@/utils/images';

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  vitamins: 'bg-amber-100 text-amber-700',
  supplements: 'bg-blue-100 text-blue-700',
  aromatherapy: 'bg-purple-100 text-purple-700',
};

const ageGroupLabels: Record<string, string> = {
  toddler: 'Toddler',
  child: 'Children',
  teen: 'Teens',
  adult: 'Adults',
  elderly: 'Seniors',
  all: 'All Ages',
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    setIsAdding(true);
    try {
      await addToCart(product.id);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group"
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-cream-100">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Category Badge */}
          <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[product.category] || 'bg-gray-100 text-gray-700'}`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </span>
          
          {/* Quick Add Button */}
          {isAuthenticated && product.stock > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className="absolute bottom-3 right-3 w-10 h-10 bg-sage-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-sage-700 disabled:opacity-50"
            >
              {isAdding ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </motion.button>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-sage-500 font-medium">
              {ageGroupLabels[product.ageGroup]}
            </span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-xs text-terracotta-600 font-medium">
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-xs text-red-600 font-medium">
                Out of stock
              </span>
            )}
          </div>
          
          <h3 className="font-medium text-sage-800 group-hover:text-sage-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-sage-500 mt-1 line-clamp-2">
            {product.description}
          </p>
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-semibold text-sage-800">
              RM{product.price.toFixed(2)}
            </span>
            
            {isAuthenticated && product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-800 font-medium transition-colors md:hidden"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

