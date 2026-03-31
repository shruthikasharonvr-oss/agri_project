'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { X, ShoppingCart, Plus, Star, TrendingUp, Search, Filter, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logAction } from '../lib/auditLog';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  description?: string;
  seller?: string;
  rating?: number;
  sold?: number;
  category?: string;
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
}

// Product Categories
const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🛒' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'dairy', name: 'Dairy & Ghee', icon: '🥛' },
  { id: 'grains', name: 'Grains & Flour', icon: '🌾' },
  { id: 'oils', name: 'Oils & Spices', icon: '🫒' },
  { id: 'honey', name: 'Honey', icon: '🍯' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Organic Ragi Flour',
    price: 60,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=60',
    description: 'High quality organic ragi flour from certified farms',
    seller: 'Farm Direct',
    rating: 4.8,
    sold: 2400,
    category: 'grains',
    inStock: true,
    isFeatured: true,
    discount: 10,
  },
  {
    id: 2,
    name: 'Fresh Cow Ghee',
    price: 850,
    image: 'https://images.unsplash.com/photo-1595521925162-7aae4d755e78?auto=format&fit=crop&w=500&q=60',
    description: 'Pure cow ghee from organic farms, made fresh daily',
    seller: 'Dairy Hub',
    rating: 4.9,
    sold: 1890,
    category: 'dairy',
    inStock: true,
    isFeatured: true,
  },
  {
    id: 3,
    name: 'Alphonso Mangoes',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=60',
    description: 'Fresh Alphonso mangoes from Ratnagiri, premium quality',
    seller: 'Mango Estates',
    rating: 4.7,
    sold: 3200,
    category: 'fruits',
    inStock: true,
    isFeatured: false,
    discount: 5,
  },
  {
    id: 4,
    name: 'Pure Wild Honey',
    price: 450,
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=500&q=60',
    description: 'Raw unfiltered honey from wild bees, no additives',
    seller: 'Honey Farm',
    rating: 4.9,
    sold: 5120,
    category: 'honey',
    inStock: true,
    isFeatured: true,
  },
  {
    id: 5,
    name: 'Premium Basmati Rice',
    price: 280,
    image: 'https://images.unsplash.com/photo-1586857999919-91fba59ae5a4?auto=format&fit=crop&w=500&q=60',
    description: 'Long-grain, aromatic basmati rice',
    seller: 'Rice Valley',
    rating: 4.9,
    sold: 3890,
    category: 'grains',
    inStock: true,
    isFeatured: true,
    discount: 8,
  },
  {
    id: 6,
    name: 'Fresh Tomatoes',
    price: 40,
    image: 'https://images.unsplash.com/photo-1592924357228-7aa7a46e2b0f?auto=format&fit=crop&w=500&q=60',
    description: 'Farm fresh tomatoes delivered daily from local farms',
    seller: 'Vegetable Farm',
    rating: 4.6,
    sold: 8940,
    category: 'vegetables',
    inStock: true,
    isFeatured: false,
    discount: 15,
  },
  {
    id: 7,
    name: 'Banana Bunch',
    price: 90,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60',
    description: 'Fresh yellow bananas, ripened naturally',
    seller: 'Fruit Hub',
    rating: 4.6,
    sold: 4567,
    category: 'fruits',
    inStock: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: 8,
    name: 'Organic Spinach',
    price: 30,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=500&q=60',
    description: 'Fresh organic spinach, pesticide-free greens',
    seller: 'Green Valley',
    rating: 4.7,
    sold: 3450,
    category: 'vegetables',
    inStock: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: 9,
    name: 'Turmeric Powder',
    price: 180,
    image: 'https://images.unsplash.com/photo-1596040299275-f8e418d06dc2?auto=format&fit=crop&w=500&q=60',
    description: 'Pure, high-curcumin turmeric powder from organic farms',
    seller: 'Spice Master',
    rating: 4.8,
    sold: 2345,
    category: 'oils',
    inStock: true,
    isFeatured: false,
  },
  {
    id: 10,
    name: 'Coconut Oil',
    price: 320,
    image: 'https://images.unsplash.com/photo-1599599810694-b3fa3a51b5a5?auto=format&fit=crop&w=500&q=60',
    description: 'Virgin cold pressed coconut oil, first extraction',
    seller: 'Coconut Co',
    rating: 4.8,
    sold: 1560,
    category: 'oils',
    inStock: true,
    isFeatured: false,
  },
  {
    id: 11,
    name: 'Fresh Carrot',
    price: 50,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=500&q=60',
    description: 'Orange, sweet carrots from local farms',
    seller: 'Farm Fresh',
    rating: 4.4,
    sold: 1234,
    category: 'vegetables',
    inStock: true,
    isFeatured: false,
  },
  {
    id: 12,
    name: 'Pearl Millet',
    price: 120,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60',
    description: 'Premium pearl millet (Bajra), rich in nutrients and minerals',
    seller: 'Grain Masters',
    rating: 4.5,
    sold: 890,
    category: 'grains',
    inStock: true,
    isFeatured: false,
  },
];

const STORAGE_KEY = 'farmer_products';

export default function ShoppingPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter and Sort States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'vegetables',
  });

  useEffect(() => {
    const userRole = localStorage.getItem('role') || '';
    const userName = localStorage.getItem('username') || '';
    
    setRole(userRole);
    setUsername(userName);

    const loadProducts = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const customProducts = stored ? JSON.parse(stored) : [];
      
      // Combine products and remove duplicates by name
      const allProducts = [...DEFAULT_PRODUCTS, ...customProducts];
      const uniqueProductsMap = new Map();
      
      allProducts.forEach((product) => {
        const productNameKey = (product.name || '').trim().toLowerCase();
        // Keep first occurrence (DEFAULT_PRODUCTS first, then custom)
        if (productNameKey && !uniqueProductsMap.has(productNameKey)) {
          uniqueProductsMap.set(productNameKey, product);
        }
      });
      
      const uniqueProducts = Array.from(uniqueProductsMap.values());
      setProducts(uniqueProducts);
    };

    loadProducts();
  }, []);

  // Advanced filtering and sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      // Category filter
      const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
      
      // Search filter
      const searchMatch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seller?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Price filter
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      
      // Rating filter
      const ratingMatch = !p.rating || p.rating >= minRating;
      
      // Stock filter
      const stockMatch = p.inStock !== false;

      return categoryMatch && searchMatch && priceMatch && ratingMatch && stockMatch;
    });

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'popularity':
        default:
          return (b.sold || 0) - (a.sold || 0);
      }
    });

    return sorted;
  }, [products, selectedCategory, searchQuery, priceRange, minRating, sortBy]);

  // Featured products
  const featuredProducts = useMemo(() => 
    products.filter(p => p.isFeatured).slice(0, 4),
    [products]
  );

  const onAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: 'item',
      image_url: product.image,
      farmer_name: product.seller || 'Local Farmer',
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.image.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Check if product with same name already exists
    const productNameKey = formData.name.trim().toLowerCase();
    const productExists = products.some(p => 
      (p.name || '').trim().toLowerCase() === productNameKey
    );

    if (productExists) {
      alert('A product with this name already exists in the marketplace!');
      return;
    }

    const newProduct: Product = {
      id: `custom_${Date.now()}`,
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      image: formData.image.trim(),
      description: formData.description.trim() || 'Farm fresh product',
      seller: username,
      rating: 4.8,
      sold: 0,
      category: formData.category,
      inStock: true,
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const customProducts = stored ? JSON.parse(stored) : [];
    customProducts.push(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customProducts));

    logAction(username, role, 'Add Product');

    setProducts([...products, newProduct]);
    setFormData({
      name: '',
      price: '',
      description: '',
      image: '',
      category: 'vegetables',
    });
    setShowAddForm(false);

    alert('Product added successfully!');
  };

  const isFarmer = role === 'Farmer';
  const maxPrice = Math.max(...products.map(p => p.price));

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1f1e] via-[#0f2f2e] to-[#0a1f1e]">
      <div className="container-wide py-24">
        {/* Header Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Marketplace</h1>
              <p className="text-gray-400 text-lg">Discover fresh, organic products from verified farmers</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              {isFarmer && (
                <motion.button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center gap-2 px-6 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} />
                  Add Product
                </motion.button>
              )}
              <Link href="/cart">
                <motion.button
                  className="btn-secondary px-6 py-3 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart size={20} />
                  Cart
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            className="glass p-4 rounded-xl flex items-center gap-3 mb-6"
            whileHover={{ scale: 1.02 }}
          >
            <Search className="text-green-400" size={20} />
            <input
              type="text"
              placeholder="Search products, farmers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-white placeholder-gray-500 flex-1 text-lg"
            />
          </motion.div>

          {/* Categories Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scroll-smooth">
            {CATEGORIES.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setPriceRange([0, maxPrice]);
                  setMinRating(0);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                    : 'bg-white/5 text-gray-300 border border-gray-700/50 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && selectedCategory === 'all' && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-400" size={28} />
              Featured Products
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="card-product relative overflow-hidden group"
                  whileHover={{ y: -10 }}
                >
                  {/* Badge */}
                  {product.discount && (
                    <motion.div
                      className="absolute top-3 right-3 badge bg-red-500/20 text-red-300 border-red-500/30 z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {product.discount}% OFF
                    </motion.div>
                  )}

                  {/* Color Background - No Image */}
                  <div className="relative h-48 overflow-hidden rounded-xl mb-4 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-4xl">
                    <span>📦</span>
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-4">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{product.seller}</p>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < Math.floor(product.rating!) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{product.rating}</span>
                      </div>
                    )}

                    {/* Price and Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold gradient-text">
                          ₹{product.price}
                        </div>
                        {product.discount && (
                          <div className="text-xs text-gray-500 line-through">
                            ₹{Math.round(product.price / (1 - product.discount / 100))}
                          </div>
                        )}
                      </div>
                      <motion.button
                        onClick={() => onAddToCart(product)}
                        className="btn-icon-glow"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ShoppingCart size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Filters and Products Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <motion.div
              className="glass p-6 rounded-2xl sticky top-24"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-6 lg:block">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Filter size={20} className="text-green-400" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b border-gray-700">
                <h4 className="font-semibold text-white mb-4">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">₹{priceRange[0]}</span>
                    <span className="text-gray-400">₹{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="input w-full text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                      className="input w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6 pb-6 border-b border-gray-700">
                <h4 className="font-semibold text-white mb-4">Minimum Rating</h4>
                <div className="space-y-2">
                  {[0, 3, 3.5, 4, 4.5, 5].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={minRating === rating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="w-4 h-4 accent-green-500 cursor-pointer"
                      />
                      <span className="text-gray-300 group-hover:text-white transition">
                        {rating === 0 ? 'All Ratings' : `${rating}★ & above`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <h4 className="font-semibold text-white mb-4">Sort By</h4>
                <div className="space-y-2">
                  {[
                    { value: 'popularity', label: 'Most Popular' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'newest', label: 'Newest First' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4 accent-green-500 cursor-pointer"
                      />
                      <span className="text-gray-300 group-hover:text-white transition">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Filter Toggle for Mobile */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-secondary w-full mb-6 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={18} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </motion.button>

            {/* Results Info */}
            <motion.div
              className="mb-6 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2 text-gray-400">
                <TrendingUp size={18} />
                <span>Showing {filteredAndSortedProducts.length} products</span>
              </div>
              <motion.button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setPriceRange([0, maxPrice]);
                  setMinRating(0);
                  setSortBy('popularity');
                }}
                className="text-sm text-green-400 hover:text-green-300 transition"
              >
                Reset Filters
              </motion.button>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <AnimatePresence>
                {filteredAndSortedProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    className="card-product relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -10 }}
                  >
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                      {product.isNew && (
                        <motion.div
                          className="badge bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          NEW
                        </motion.div>
                      )}
                      {product.discount && (
                        <motion.div
                          className="badge bg-red-500/20 text-red-300 border-red-500/30 text-xs"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {product.discount}% OFF
                        </motion.div>
                      )}
                    </div>

                    {/* Color Background - No Image */}
                    <div className="relative h-48 overflow-hidden rounded-xl mb-4 group bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-5xl">
                      <span>📦</span>
                      {product.sold && (
                        <motion.div
                          className="absolute bottom-3 left-3 badge bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {product.sold} sold
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4">
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 hover:text-green-400 transition">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">{product.seller}</p>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < Math.floor(product.rating!) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">({product.rating})</span>
                        </div>
                      )}

                      {/* Price and Button */}
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-2xl font-bold gradient-text">
                            ₹{product.price}
                          </div>
                          {product.discount && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{Math.round(product.price / (1 - product.discount / 100))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => onAddToCart(product)}
                            className="btn-icon-glow flex-1 flex items-center justify-center"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ShoppingCart size={18} />
                          </motion.button>
                          <motion.button
                            className="btn-icon-secondary"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredAndSortedProducts.length === 0 && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search className="mx-auto text-gray-500 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                <motion.button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, maxPrice]);
                    setMinRating(0);
                  }}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddForm && isFarmer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass w-full max-w-md p-8 rounded-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Product</h2>
                <motion.button
                  onClick={() => setShowAddForm(false)}
                  className="btn-icon"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Fresh Tomatoes"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input w-full"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 100"
                    min="1"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Fresh farm tomatoes..."
                    rows={3}
                    className="input w-full resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="input w-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Product
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
