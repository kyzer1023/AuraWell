import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '@/services/api';
import type { Product } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { Filter, Loader2 } from 'lucide-react';

const categories = [
  { value: '', label: 'All Products' },
  { value: 'vitamins', label: 'Vitamins' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'aromatherapy', label: 'Aromatherapy' },
];

const ageGroups = [
  { value: '', label: 'All Ages' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Children' },
  { value: 'teen', label: 'Teens' },
  { value: 'adult', label: 'Adults' },
  { value: 'elderly', label: 'Seniors' },
  { value: 'all', label: 'Universal' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const ageGroup = searchParams.get('ageGroup') || '';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, category, ageGroup]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (ageGroup) {
      filtered = filtered.filter((p) => p.ageGroup === ageGroup || p.ageGroup === 'all');
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleAgeGroupChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('ageGroup', value);
    } else {
      params.delete('ageGroup');
    }
    setSearchParams(params);
  };

  const currentCategory = categories.find((c) => c.value === category);
  const currentAgeGroup = ageGroups.find((a) => a.value === ageGroup);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold text-sage-800"
        >
          {currentCategory?.label || 'All Products'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sage-600 mt-2"
        >
          {filteredProducts.length} products available
        </motion.p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-sage-600 text-white'
                    : 'bg-cream-200 text-sage-600 hover:bg-cream-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Age Group Filter */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-cream-200 text-sage-600 rounded-full text-sm font-medium hover:bg-cream-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {currentAgeGroup?.value ? currentAgeGroup.label : 'Age Group'}
          </button>
        </div>

        {/* Age Group Dropdown */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-cream-200"
          >
            <p className="text-sm font-medium text-sage-700 mb-3">Filter by Age Group</p>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((age) => (
                <button
                  key={age.value}
                  onClick={() => {
                    handleAgeGroupChange(age.value);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    ageGroup === age.value
                      ? 'bg-sage-600 text-white'
                      : 'bg-cream-100 text-sage-600 hover:bg-cream-200'
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sage-500 text-lg">No products found matching your criteria.</p>
          <button
            onClick={() => setSearchParams({})}
            className="mt-4 text-sage-600 font-medium hover:text-sage-800"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

