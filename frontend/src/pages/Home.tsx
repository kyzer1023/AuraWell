import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Heart, Shield, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Natural Ingredients',
    description: 'Carefully sourced, pure ingredients for optimal wellness.',
  },
  {
    icon: Heart,
    title: 'All Ages Welcome',
    description: 'Products tailored from toddlers to the elderly.',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Rigorous testing for safety and effectiveness.',
  },
  {
    icon: Sparkles,
    title: 'Holistic Wellness',
    description: 'Supporting your complete health journey.',
  },
];

const categories = [
  {
    name: 'Vitamins',
    description: 'Essential daily nutrition',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
    href: '/products?category=vitamins',
    color: 'from-amber-500/80',
  },
  {
    name: 'Supplements',
    description: 'Boost your wellness',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600',
    href: '/products?category=supplements',
    color: 'from-blue-500/80',
  },
  {
    name: 'Aromatherapy',
    description: 'Relax and rejuvenate',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
    href: '/products?category=aromatherapy',
    color: 'from-purple-500/80',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-100 via-cream-100 to-cream-200" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sage-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-terracotta-200 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-sage-100 text-sage-700 rounded-full text-sm font-medium mb-6">
                ✨ Wellness for Every Generation
              </span>
              
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-sage-900 leading-tight mb-6">
                Nourish Your
                <span className="text-sage-600 block">Natural Glow</span>
              </h1>
              
              <p className="text-xl text-sage-600 mb-8 max-w-lg">
                Discover premium vitamins, supplements, and aromatherapy products 
                crafted for wellness at every stage of life.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary flex items-center gap-2 text-lg">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/products?category=vitamins" className="btn-outline text-lg">
                  Explore Vitamins
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-sage-200 to-cream-200 rounded-full" />
                <img
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"
                  alt="Wellness products"
                  className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-cover rounded-full shadow-2xl"
                />
                
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 right-0 bg-white rounded-2xl shadow-lg p-4"
                >
                  <Leaf className="w-8 h-8 text-sage-500" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-20 -left-4 bg-white rounded-2xl shadow-lg p-4"
                >
                  <Heart className="w-8 h-8 text-terracotta-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-sage-800 mb-4">
              Why Choose AuraWell?
            </h2>
            <p className="text-sage-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality wellness products 
              for you and your family.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-sage-600" />
                </div>
                <h3 className="font-semibold text-sage-800 mb-2">{feature.title}</h3>
                <p className="text-sage-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-sage-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-sage-600">
              Find the perfect products for your wellness journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={category.href}
                  className="group block relative aspect-[4/5] rounded-3xl overflow-hidden"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} to-transparent`} />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-display font-bold mb-1">{category.name}</h3>
                    <p className="text-white/80">{category.description}</p>
                    <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium group-hover:gap-2 transition-all">
                      Shop now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sage-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Start Your Wellness Journey Today
            </h2>
            <p className="text-sage-200 mb-8 text-lg">
              Join thousands of customers who trust AuraWell for their health and wellness needs.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sage-700 font-semibold rounded-xl hover:bg-cream-100 transition-colors"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

