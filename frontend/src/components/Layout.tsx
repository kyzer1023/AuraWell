import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, LogOut, Settings, Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: '/products', label: 'Shop All' },
    { to: '/products?category=vitamins', label: 'Vitamins' },
    { to: '/products?category=supplements', label: 'Supplements' },
    { to: '/products?category=aromatherapy', label: 'Aromatherapy' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center group-hover:bg-sage-700 transition-colors">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-2xl font-semibold text-sage-800">
                AuraWell
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sage-600 hover:text-sage-800 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="relative p-2 text-sage-600 hover:text-sage-800 transition-colors"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-2 text-sage-600 hover:text-sage-800 transition-colors"
                    >
                      <User className="w-6 h-6" />
                      <span className="hidden sm:block font-medium">
                        {user?.firstName}
                      </span>
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-cream-200 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-cream-200">
                            <p className="font-medium text-sage-800">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-sage-500">{user?.email}</p>
                          </div>
                          
                          <Link
                            to="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sage-600 hover:bg-cream-100 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            My Orders
                          </Link>
                          
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sage-600 hover:bg-cream-100 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 w-full text-left text-terracotta-600 hover:bg-cream-100 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sage-600 hover:text-sage-800 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-sage-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-cream-200 bg-white"
            >
              <nav className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sage-600 hover:bg-cream-100 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-sage-800 text-cream-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-sage-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-xl font-semibold">AuraWell</span>
              </div>
              <p className="text-cream-300 text-sm">
                Your trusted source for wellness products, from vitamins to aromatherapy.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><Link to="/products?category=vitamins" className="hover:text-white transition-colors">Vitamins</Link></li>
                <li><Link to="/products?category=supplements" className="hover:text-white transition-colors">Supplements</Link></li>
                <li><Link to="/products?category=aromatherapy" className="hover:text-white transition-colors">Aromatherapy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-sage-700 text-center text-sm text-cream-400">
            <p>&copy; {new Date().getFullYear()} AuraWell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

