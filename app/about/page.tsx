'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import {
  Users,
  Target,
  Heart,
  Leaf,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();

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

      {/* ===== HERO SECTION ===== */}
      <motion.section
        className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 pt-32 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="max-w-4xl text-center z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <div className="glass px-6 py-3 rounded-full flex items-center gap-2">
              <Leaf className="text-green-400" size={18} />
              <span className="text-sm font-semibold text-green-300">
                {t('About FarmToHome')}
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text">
              {t('Revolutionizing Agriculture')}
            </span>
            <br />
            <span className="text-white">
              {t('One Connection at a Time')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {t('We believe in building a sustainable future by connecting farmers directly with consumers, eliminating middlemen, and ensuring fair trade for all.')}
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Link href="/shopping">
              <motion.button
                className="btn-primary group flex items-center gap-2 px-8 py-4 text-lg mx-auto"
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
          </motion.div>
        </motion.div>
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

      {/* ===== STORY SECTION ===== */}
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
              <motion.div
                className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-green-600/30 to-cyan-600/30 rounded-2xl border-2 border-green-600/30 flex items-center justify-center relative z-10"
                whileHover={{ y: -10 }}
              >
                <div className="text-center">
                  <Leaf className="text-green-400 mb-4 mx-auto" size={64} />
                  <p className="text-green-300 font-semibold text-lg">
                    {t('50K+ Active Farmers')}
                  </p>
                  <p className="text-gray-400 mt-2">
                    {t('Connected to millions of consumers')}
                  </p>
                </div>
              </motion.div>
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

      {/* ===== ACHIEVEMENTS SECTION ===== */}
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
            <motion.div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-600" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t('Join Us in Building the Future')}
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
                {t('Whether you\'re a farmer or consumer, join thousands already enjoying fresh, fair, and transparent food.')}
              </p>

              <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shopping">
                  <motion.button
                    className="btn-primary px-8 py-4 text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('Shop Now')}
                  </motion.button>
                </Link>
                <Link href="/sell-product">
                  <motion.button
                    className="btn-secondary px-8 py-4 text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('Sell Your Products')}
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== FAQ SECTION ===== */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-b from-[#0a1f1e] to-[#0f2f2e]"
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
    </div>
  );
}
