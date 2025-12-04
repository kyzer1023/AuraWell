import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ordersApi } from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle, MapPin } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalAmount, refreshCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const addressString = `${shippingAddress.fullName}, ${shippingAddress.phone}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`;
      const response = await ordersApi.create(addressString);
      
      if (response.success) {
        setOrderId(response.orderId);
        setOrderSuccess(true);
        await refreshCart();
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-sage-800 mb-4">Your cart is empty</h1>
        <Link to="/products" className="text-sage-600 hover:text-sage-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-sage-800 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-sage-600 mb-2">Thank you for your purchase.</p>
          <p className="text-sage-500 text-sm mb-8">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="btn-primary">
              View My Orders
            </Link>
            <Link to="/products" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Cart
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-display font-bold text-sage-800 mb-8"
      >
        Checkout
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-sage-600" />
              </div>
              <h2 className="text-xl font-semibold text-sage-800">Shipping Address</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="012-345-6789"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Street address, apartment, unit, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Penang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Pulau Pinang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="11800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Place Order • RM${totalAmount.toFixed(2)}`
              )}
            </button>
          </motion.form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200 sticky top-24"
          >
            <h2 className="text-xl font-semibold text-sage-800 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sage-800 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-sage-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-sage-700">
                      RM{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 pt-4 space-y-2">
              <div className="flex justify-between text-sage-600">
                <span>Subtotal</span>
                <span>RM{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sage-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-sage-800 text-lg pt-2 border-t border-cream-200">
                <span>Total</span>
                <span>RM{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

