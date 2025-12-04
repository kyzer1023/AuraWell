import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '@/services/api';
import type { Order } from '@/services/api';
import { motion } from 'framer-motion';
import { Package, Loader2, ShoppingBag } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
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
            No orders yet
          </h1>
          <p className="text-sage-500 mb-8">
            Start shopping to see your orders here.
          </p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-display font-bold text-sage-800 mb-8"
      >
        My Orders
      </motion.h1>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-cream-200">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sage-500">Order ID</p>
                    <p className="font-mono text-sm text-sage-800">{order.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status]
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <p className="text-sm text-sage-500 mt-1">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-sage-600">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-sage-800 font-medium">
                    RM{(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="text-sm text-sage-500 mb-4">
              <span className="font-medium">Ship to:</span> {order.shippingAddress}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-cream-200">
              <span className="font-medium text-sage-700">Total</span>
              <span className="text-xl font-semibold text-sage-800">
                RM{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

