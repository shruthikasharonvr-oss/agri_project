'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from './contexts/TranslationContext';
import { 
  ShoppingCart, 
  MessageCircle, 
  Cloud, 
  Globe, 
  Zap,
  Star,
  ArrowRight,
  Leaf,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Truck,
  LogIn,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Target,
  Heart,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse position for cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: { y: [-30, 30] },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f1e] via-[#0f2f2e] to-[#0a1f1e]">
      {/* Animated Background Orbs */}
      <motion.div
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-green-600 to-cyan-600 opacity-10 blur-3xl"
        style={{ top: -100, right: -100 }}
        animate={{ y: [0, 100, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-cyan-600 to-green-600 opacity-10 blur-3xl"
        style={{ bottom: -100, left: -100 }}
        animate={{ y: [0, -100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cursor Glow Effect */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          filter: 'blur(40px)',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 140 }}
      />

      {/* ===== HERO SECTION ===== */}
      <motion.section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://media.istockphoto.com/id/1401722160/photo/sunny-plantation-with-growing-soya.jpg?s=612x612&w=0&k=20&c=r_Y3aJ-f-4Oye0qU_TBKvqGUS1BymFHdx3ryPkyyV0w=')`,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 z-0" />
        {/* Floating 3D Agricultural Icons */}
        {/* Tractor Icon */}
        <motion.div
          className="absolute top-40 right-20 z-10"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ perspective: '1200px' }}
        >
          <motion.div
            animate={{ rotateY: [0, 360], rotateX: [0, 20] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="2"/>
              {/* Tractor */}
              <g fill="#22c55e">
                <ellipse cx="35" cy="55" rx="8" ry="12" />
                <rect x="40" y="45" width="20" height="15" rx="2" />
                <circle cx="30" cy="70" r="6" />
                <circle cx="55" cy="70" r="6" />
              </g>
            </svg>
          </motion.div>
        </motion.div>

        {/* Wheat/Crop Icon */}
        <motion.div
          className="absolute top-64 left-20 z-10"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ perspective: '1200px' }}
        >
          <motion.div
            animate={{ rotateY: [0, -360], rotateZ: [0, 15] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2"/>
              {/* Wheat stalks */}
              <g stroke="#10b981" strokeWidth="2" fill="none">
                <line x1="40" y1="70" x2="38" y2="35" />
                <line x1="50" y1="75" x2="50" y2="30" />
                <line x1="60" y1="70" x2="62" y2="35" />
                <line x1="35" y1="40" x2="30" y2="25" />
                <line x1="50" y1="35" x2="45" y2="15" />
                <line x1="65" y1="40" x2="70" y2="25" />
              </g>
              {/* Wheat head */}
              <circle cx="48" cy="32" r="4" fill="#10b981" />
              <circle cx="52" cy="30" r="4" fill="#10b981" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Leaf/Plant Icon */}
        <motion.div
          className="absolute bottom-60 right-40 z-10"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ perspective: '1200px' }}
        >
          <motion.div
            animate={{ rotateX: [0, 20, 0], rotateY: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="2"/>
              {/* Leaf shape */}
              <path
                d="M 50 25 Q 65 40 60 60 Q 50 70 40 60 Q 35 40 50 25"
                fill="#22c55e"
                opacity="0.8"
              />
              {/* Leaf vein */}
              <line x1="50" y1="25" x2="50" y2="65" stroke="#0a1f1e" strokeWidth="1" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="max-w-4xl text-center z-10 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-block mb-6"
          >
            <div className="glass px-6 py-3 rounded-full flex items-center gap-2">
              <Sparkles className="text-green-400" size={18} />
              <span className="text-sm font-semibold text-green-300">
                {t('Welcome to Modern Agriculture')}
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text">
              {t('Fresh From Farms')}
            </span>
            <br />
            <span className="text-white">
              {t('Delivered With Intelligence')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {t('A clean, modern marketplace for direct buying, transparent farming, and AI-powered agricultural decisions. Supporting farmers and consumers together.')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/shopping">
              <motion.button
                className="btn-primary group flex items-center gap-2 px-8 py-4 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('Start Shopping')}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.span>
              </motion.button>
            </Link>

            <Link href="/chat">
              <motion.button
                className="btn-secondary px-8 py-4 text-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={20} />
                {t('Chat with Farmers')}
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { icon: Users, label: '10K+', desc: t('Active Farmers') },
              { icon: Truck, label: '500K+', desc: t('Orders Delivered') },
              { icon: Star, label: '4.9/5', desc: t('Rating') },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="glass p-4 rounded-lg"
                whileHover={{ y: -5 }}
              >
                <stat.icon className="text-green-400 mx-auto mb-2" size={24} />
                <div className="font-bold text-lg text-white">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ===== WHY CHOOSE US SECTION ===== */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-b from-[#0a1f1e] to-[#0f2f2e]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Left Image */}
            <motion.div
              className="relative group order-2 md:order-1"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-cyan-600 opacity-20 blur-xl rounded-2xl group-hover:opacity-40 transition-opacity" />
              <motion.img
                src="https://girlsglobe.files.wordpress.com/2014/01/12099649316_de0eb914c0_b.jpg"
                alt="Sustainable Agriculture"
                className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl border-2 border-green-600/30 shadow-2xl relative z-10"
                loading="lazy"
              />
            </motion.div>

            {/* Right Content */}
            <motion.div
              className="order-1 md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-green-400 font-semibold text-lg">
                  {t('Why Choose Us')}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                {t('Building a Sustainable Future')}
              </h2>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {t('We believe in connecting farmers directly with consumers, eliminating unnecessary intermediaries and ensuring fair prices for everyone. Our platform leverages cutting-edge technology to make agriculture more transparent, efficient, and sustainable.')}
              </p>

              {/* Benefits List */}
              <motion.div
                className="space-y-4 mb-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    icon: Leaf,
                    title: t('100% Organic & Fresh'),
                    desc: t('Directly from verified farms'),
                  },
                  {
                    icon: Users,
                    title: t('Fair Trade Certified'),
                    desc: t('Supporting farmers\' livelihoods'),
                  },
                  {
                    icon: TrendingUp,
                    title: t('Transparent Pricing'),
                    desc: t('No hidden charges or markups'),
                  },
                  {
                    icon: Award,
                    title: t('Quality Guaranteed'),
                    desc: t('Every product verified & tested'),
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex gap-4 items-start glass p-4 rounded-lg hover:bg-green-600/10 transition-colors"
                    variants={itemVariants}
                  >
                    <div className="flex-shrink-0">
                      <item.icon className="text-green-400 mt-1" size={24} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <Link href="/shopping">
                <motion.button
                  className="btn-primary px-8 py-4 text-lg flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('Explore Fresh Produce')}
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== FEATURES SECTION ===== */}
      <motion.section
        className="relative py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">FarmToHome</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('Experience the next generation of agricultural marketplace with cutting-edge technology')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                image: 'https://www.smsfoundation.org/wp-content/uploads/2025/09/the-vital-role-of-women-to-indian-agriculture.jpg',
                title: 'Direct from Farmers',
                desc: 'Buy fresh produce directly from verified farmers with complete transparency',
              },
              {
                image: 'https://www.nkosh.in/UploadDoc/Blog/20260220030011_0.png',
                title: 'AI-Powered Insights',
                desc: 'Get intelligent recommendations and weather-based farming suggestions',
              },
              {
                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNExXVtRWTiBsbKrdHx2PyqDW3EDqUEd3W7A&s',
                title: 'Global Reach',
                desc: 'Connect with farmers and consumers worldwide for better opportunities',
              },
              {
                image: 'https://cdn.ai-forall.com/ifa_dev_media/7_Ways_Smart_Agriculture_Lowers_Food_Prices_f28544ad66.jpg',
                title: 'Smart Pricing',
                desc: 'Fair prices for farmers and affordable fresh produce for consumers',
              },
              {
                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcD05cTAi7i8cy81ZlMHgU7G5stkMJezfRvQ&s',
                title: 'Weather Tracking',
                desc: 'Real-time weather data and crop management tools for better harvests',
              },
              {
                image: 'https://thumbs.dreamstime.com/b/organic-product-circle-vector-stamp-406183304.jpg',
                title: 'Quality Assured',
                desc: 'Every product verified for quality and freshness before delivery',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="card-product p-6 group cursor-pointer overflow-hidden"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-green-600/20 to-cyan-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                >
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== CTA SECTION ===== */}
      <motion.section
        className="relative py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-narrow">
          <motion.div
            className="glass p-12 md:p-20 rounded-2xl text-center relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Gradient background animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.6 }}
            />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t('Ready to Transform Agriculture?')}
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
                {t('Join thousands of farmers and consumers building a better, smarter food system today.')}
              </p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <Link href="/shopping">
                  <motion.button
                    className="btn-primary px-8 py-4 text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started Now
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-b from-[#0f2f2e] to-[#0a1f1e]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('How It Works')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('Easy, transparent, and efficient - just four simple steps to fresh produce')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: '01',
                title: t('Login'),
                desc: t('Create your account or sign in as a farmer or customer'),
                icon: LogIn,
              },
              {
                step: '02',
                title: t('Browse Products'),
                desc: t('Explore fresh produce from verified farmers in your area'),
                icon: ShoppingCart,
              },
              {
                step: '03',
                title: t('Add to Cart'),
                desc: t('Select items and add them to your cart with ease'),
                icon: Zap,
              },
              {
                step: '04',
                title: t('Order & Deliver'),
                desc: t('Checkout securely and get fresh produce in 24 hours'),
                icon: Truck,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="relative glass p-8 rounded-2xl group hover:border-green-500 transition-all"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                {/* Connecting line */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-green-600 to-cyan-600 transform -translate-y-1/2" />
                )}

                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-cyan-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <item.icon className="text-green-400 mb-4 mt-8" size={32} />
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <motion.section
        className="relative py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('What Our Users Say')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('Join thousands of satisfied farmers and consumers')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                name: t('Rajesh Kumar'),
                role: t('Farmer from Punjab'),
                text: t('FarmToHome helped me reach customers directly. I increased my income by 40% in just 3 months!'),
                rating: 5,
              },
              {
                name: t('Priya Sharma'),
                role: t('Homemaker from Delhi'),
                text: t('The freshness and quality of produce is outstanding. I trust FarmToHome completely!'),
                rating: 5,
              },
              {
                name: t('Amit Patel'),
                role: t('Farmer from Gujarat'),
                text: t('The transparency in pricing and fair payment system makes FarmToHome the best platform for us farmers.'),
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="glass p-8 rounded-2xl hover:border-green-500 transition-all"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 text-lg">"{testimonial.text}"</p>
                <div className="border-t border-gray-700 pt-4">
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-small text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== STATS SECTION ===== */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-r from-green-600/10 to-cyan-600/10 border-y border-green-600/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { number: '50K+', label: t('Active Farmers') },
              { number: '100K+', label: t('Happy Customers') },
              { number: '1M+', label: t('Orders Delivered') },
              { number: '₹500Cr', label: t('Total Revenue') },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                variants={itemVariants}
              >
                <motion.div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.number}
                </motion.div>
                <p className="text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== MISSION VISION VALUES SECTION ===== */}
      <motion.section
        className="relative py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('Our Mission, Vision & Values')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('The core principles driving FarmToHome forward')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Target,
                title: t('Our Mission'),
                desc: t('To empower farmers with direct market access and provide consumers with the freshest, most transparent food options while building a sustainable agricultural ecosystem.'),
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Heart,
                title: t('Our Vision'),
                desc: t('A world where every farmer thrives, every consumer enjoys fresh produce, and technology bridges the gap between countryside and cities sustainably.'),
                color: 'from-pink-500 to-red-500',
              },
              {
                icon: Zap,
                title: t('Our Values'),
                desc: t('Transparency, Sustainability, Fairness, Innovation, and Community. We stand by these principles in every decision we make.'),
                color: 'from-yellow-500 to-orange-500',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="glass p-8 rounded-2xl border border-green-600/20 hover:border-green-500/50 transition-all"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-6 text-white`}
                >
                  <item.icon size={32} />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== OUR STORY SECTION ===== */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-b from-[#0f2f2e] to-[#0a1f1e]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('Our Story')}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                {t('FarmToHome started with a simple observation: farmers were struggling to get fair prices for their hard work, while consumers paid premium prices for produce. We decided to change that.')}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                {t('In 2023, we launched FarmToHome as a platform to connect farmers directly with consumers. Today, we have:')}{' '}
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  t('50,000+ active farmers on our platform'),
                  t('100,000+ happy customers across the country'),
                  t('1 million+ orders successfully delivered'),
                  t('₹500 crore in direct farmer revenue'),
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="text-green-400 text-xl mt-1">✓</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-300 text-lg leading-relaxed">
                {t('And we\'re just getting started. Our goal is to revolutionize how food reaches your table.')}
              </p>
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="relative group order-first md:order-last"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-cyan-600 opacity-20 blur-xl rounded-2xl group-hover:opacity-40 transition-opacity" />
              <motion.img
                src="https://sc0.blr1.digitaloceanspaces.com/large/825694-44451-osbjomwiat-1477850784.jpg"
                alt="Farm to Home Story"
                className="w-full h-[400px] md:h-[500px] rounded-2xl border-2 border-green-600/30 object-cover"
                whileHover={{ y: -10 }}
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== TEAM SECTION ===== */}
      <motion.section
        className="relative py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('Meet Our Team')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('Passionate people building the future of agriculture')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                name: t('Rajiv Singh'),
                role: t('CEO & Co-founder'),
                bio: t('Former agricultural entrepreneur with 15+ years of farming experience'),
              },
              {
                name: t('Priya Verma'),
                role: t('CTO & Co-founder'),
                bio: t('Tech innovator focused on solving real-world problems through AI'),
              },
              {
                name: t('Amit Kumar'),
                role: t('COO'),
                bio: t('Operations expert ensuring smooth supply chain management'),
              },
              {
                name: t('Sarah Chen'),
                role: t('Head of Sustainability'),
                bio: t('Environmental scientist committed to green agriculture'),
              },
            ].map((member, idx) => (
              <motion.div
                key={idx}
                className="glass p-6 rounded-2xl text-center group hover:border-green-500 transition-all"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold"
                  whileHover={{ scale: 1.1 }}
                >
                  {member.name.charAt(0)}
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className="text-green-400 text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== AWARDS SECTION ===== */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-b from-[#0f2f2e] to-[#0a1f1e]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('Awards & Recognition')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('Recognized by industry leaders for innovation and impact')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Award,
                title: t('Best AgriTech Startup 2024'),
                org: 'Indian Tech Awards',
              },
              {
                icon: Star,
                title: t('5-Star Rating'),
                org: '50,000+ Customer Reviews',
              },
              {
                icon: TrendingUp,
                title: t('Fast Growing Agri-Platform'),
                org: 'Economic Times',
              },
            ].map((award, idx) => (
              <motion.div
                key={idx}
                className="glass p-8 rounded-2xl text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                >
                  <award.icon size={32} />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">{award.title}</h3>
                <p className="text-gray-400">{award.org}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== FAQ SECTION ===== */}
      <motion.section
        className="relative py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container-narrow">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('Frequently Asked Questions')}
            </h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                q: t('How do I buy fresh produce?'),
                a: t('Sign up, browse our marketplace, select your products, add to cart, and checkout. Products are delivered within 24 hours.'),
              },
              {
                q: t('How do farmers benefit from FarmToHome?'),
                a: t('Farmers get direct access to customers, fair prices without middlemen, secure payments, and market insights.'),
              },
              {
                q: t('Is FarmToHome products certified organic?'),
                a: t('We partner with verified organic and sustainable farms. Each farmer profile shows their certifications and practices.'),
              },
              {
                q: t('What are the delivery charges?'),
                a: t('Delivery is free for orders above ₹500 in selected areas. Standard delivery takes 24 hours from order placement.'),
              },
            ].map((faq, idx) => (
              <motion.details
                key={idx}
                className="glass p-6 rounded-xl cursor-pointer group"
                variants={itemVariants}
              >
                <summary className="flex items-center justify-between font-semibold text-white text-lg">
                  {faq.q}
                  <motion.span
                    className="text-green-400 text-xl"
                    initial={{ rotate: 0 }}
                    whileInView={{ rotate: 180 }}
                    viewport={{ once: true }}
                  >
                    ▼
                  </motion.span>
                </summary>
                <p className="text-gray-300 mt-4">{faq.a}</p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800 bg-gradient-to-b from-[#0a1f1e] to-[#0f2f2e] py-12 px-4">
        <div className="container-wide">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🌾</span> FarmToHome
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Fresh produce directly from farmers to your table. Supporting sustainable agriculture and fair trade.
              </p>
              {/* Social Icons */}
              <motion.div className="flex gap-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <motion.a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400 hover:bg-green-600/40 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Facebook size={18} />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400 hover:bg-green-600/40 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter size={18} />
                </motion.a>
                <motion.a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400 hover:bg-green-600/40 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin size={18} />
                </motion.a>
                <motion.a
                  href="mailto:contact@farmtohome.com"
                  className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400 hover:bg-green-600/40 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail size={18} />
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Links Columns */}
            {[
              {
                title: 'Platform',
                links: [
                  { name: 'Shopping', href: '/shopping' },
                  { name: 'Chat', href: '/chat' },
                  { name: 'Weather', href: '/weather' },
                  { name: 'AI Assistant', href: '/ai-assistant' },
                ],
              },
              {
                title: 'For Farmers',
                links: [
                  { name: 'Dashboard', href: '/farmer/dashboard' },
                  { name: 'Sell Products', href: '/sell-product' },
                  { name: 'Tracking', href: '/tracking' },
                  { name: 'Support', href: '/policy' },
                ],
              },
              {
                title: 'Policies',
                links: [
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms & Conditions', href: '/terms' },
                  { name: 'Cookies', href: '/policy' },
                  { name: 'Contact Us', href: '/chat' },
                ],
              },
            ].map((col, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-green-400 transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <motion.div
            className="border-t border-gray-800 pt-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © 2024 FarmToHome. All rights reserved. | {t('Fresh From Farms, Delivered With Intelligence')}
              </p>
              <motion.div
                className="flex gap-6 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Link href="/privacy" className="hover:text-green-400 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-green-400 transition-colors">
                  Terms
                </Link>
                <Link href="/policy" className="hover:text-green-400 transition-colors">
                  Cookies
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
