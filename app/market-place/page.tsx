'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Star, ArrowLeft, Loader2, Info, Plus, X, Camera, Package } from 'lucide-react';
import { logAction } from '../lib/logger';
import Link from 'next/link';
import { useTranslation } from '../contexts/TranslationContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Fallback products if DB is empty - 12 core marketplace products
const MOCK_PRODUCTS = [
  {
    id: 'mock-1',
    name: "Organic Ragi Flour",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 60,
    unit: "kg",
    rating: 4.8,
    category: "Grains",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKlkLRUmc3NuhvhdVOuCQLqcG4yo14oSE6vg&s",
    color: "bg-orange-100",
    emoji: "🌾"
  },
  {
    id: 'mock-2',
    name: "Fresh Cow Ghee",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 850,
    unit: "500ml",
    rating: 4.9,
    category: "Dairy",
    image_url: "https://images.unsplash.com/photo-1596522868827-678785f7cd45?q=80&w=2000&auto=format&fit=crop",
    color: "bg-yellow-100",
    emoji: "🍯"
  },
  {
    id: 'mock-3',
    name: "Pure Wild Honey",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 450,
    unit: "kg",
    rating: 5.0,
    category: "Honey",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMm2fiyXRMp1b6Qs7ChWvnsyCJKki-2SoaJg&s",
    color: "bg-amber-50",
    emoji: "🐝"
  },
  {
    id: 'mock-4',
    name: "Premium Basmati Rice",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 320,
    unit: "kg",
    rating: 4.7,
    category: "Grains",
    image_url: "https://images.unsplash.com/photo-1586080876198-6e2ce93ef6ba?q=80&w=2000&auto=format&fit=crop",
    color: "bg-yellow-50",
    emoji: "🌾"
  },
  {
    id: 'mock-5',
    name: "Fresh Tomatoes",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 45,
    unit: "kg",
    rating: 4.6,
    category: "Vegetables",
    image_url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=2000&auto=format&fit=crop",
    color: "bg-red-50",
    emoji: "🍅"
  },
  {
    id: 'mock-6',
    name: "Banana Bunch",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 80,
    unit: "dozen",
    rating: 4.8,
    category: "Fruits",
    image_url: "https://images.unsplash.com/photo-1587182142653-2f31e908e1b4?q=80&w=2000&auto=format&fit=crop",
    color: "bg-yellow-50",
    emoji: "🍌"
  },
  {
    id: 'mock-7',
    name: "Organic Spinach",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 35,
    unit: "kg",
    rating: 4.9,
    category: "Vegetables",
    image_url: "https://m.media-amazon.com/images/I/6190UDgSyIL._AC_UF1000,1000_QL80_.jpg",
    color: "bg-green-100",
    emoji: "🥬"
  },
  {
    id: 'mock-8',
    name: "Alphonso Mangoes",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 1200,
    unit: "dozen",
    rating: 4.7,
    category: "Fruits",
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1580&auto=format&fit=crop",
    color: "bg-yellow-50",
    emoji: "🥭"
  },
  {
    id: 'mock-9',
    name: "Turmeric Powder",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 250,
    unit: "kg",
    rating: 4.9,
    category: "Spices",
    image_url: "https://images.unsplash.com/photo-1596040306246-1c2ca6b08bbb?q=80&w=2000&auto=format&fit=crop",
    color: "bg-amber-100",
    emoji: "✨"
  },
  {
    id: 'mock-10',
    name: "Coconut Oil",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 320,
    unit: "ltr",
    rating: 4.8,
    category: "Oils",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4B02KYH5EVtUMaXrqSJcXzNi0hjJwYoDR9A&s",
    color: "bg-blue-50",
    emoji: "🥥"
  },
  {
    id: 'mock-11',
    name: "Fresh Carrot",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 40,
    unit: "kg",
    rating: 4.7,
    category: "Vegetables",
    image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=2000&auto=format&fit=crop",
    color: "bg-orange-50",
    emoji: "🥕"
  },
  {
    id: 'mock-12',
    name: "Pearl Millet",
    farmer_id: null,
    profiles: { full_name: "Local Farmer" },
    price: 120,
    unit: "kg",
    rating: 4.8,
    category: "Grains",
    image_url: "https://images.unsplash.com/photo-1586254965502-e96da69f04da?q=80&w=2000&auto=format&fit=crop",
    color: "bg-amber-50",
    emoji: "🌾"
  }
];

function MarketplacePageContent() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const catQuery = searchParams.get('cat');
  useEffect(() => {
    if (catQuery) setActiveCategory(catQuery);
  }, [catQuery]);

  const { addToCart, itemCount } = useCart();

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Grains',
    price: '',
    unit: 'kg',
    description: '',
    benefits: '',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Honey', 'Oils', 'Spices'];

  const fetchProducts = async () => {
    setLoading(true);
    let dbProducts = [];
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      dbProducts = data;
    } else {
      dbProducts = MOCK_PRODUCTS;
    }

    // Load custom localStorage products
    const localSaved = localStorage.getItem('localMarketProducts');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        dbProducts = [...parsed, ...dbProducts];
      } catch (e) {
        console.error(e);
      }
    }

    // Remove duplicates by product name
    const uniqueProductsMap = new Map();
    dbProducts.forEach((product) => {
      const productName = (product.name || '').trim().toLowerCase();
      if (productName && !uniqueProductsMap.has(productName)) {
        uniqueProductsMap.set(productName, product);
      }
    });
    
    const uniqueProducts = Array.from(uniqueProductsMap.values());
    setProducts(uniqueProducts);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Check Role from localStorage
    const savedRole = localStorage.getItem('role');
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const validateListing = () => {
    const newErrors: any = {};
    if (!newProduct.name.trim() || newProduct.name.length < 3) {
      newErrors.name = t('Name must be at least 3 characters');
    }
    if (isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
      newErrors.price = t('Enter a valid price');
    }
    if (newProduct.description.length < 10) {
      newErrors.description = t('Details should be at least 10 characters');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateListing()) return;
    
    // Check if product with same name already exists
    const productNameLower = newProduct.name.trim().toLowerCase();
    const productExists = products.some(p => 
      (p.name || '').trim().toLowerCase() === productNameLower
    );
    
    if (productExists) {
      alert(t('A product with this name already exists in the marketplace!'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      const savedName = localStorage.getItem('username') || 'Local Farmer';

      const customProduct = {
        id: 'local-' + Date.now(),
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        unit: newProduct.unit,
        description: newProduct.description,
        benefits: newProduct.benefits,
        image_url: newProduct.imageUrl || 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?q=80&w=2000&auto=format&fit=crop',
        profiles: { full_name: savedName },
        rating: 5.0,
        color: "bg-green-50",
        emoji: "📦"
      };

      const existing = localStorage.getItem('localMarketProducts');
      const parsed = existing ? JSON.parse(existing) : [];
      const updatedLocal = [customProduct, ...parsed];
      localStorage.setItem('localMarketProducts', JSON.stringify(updatedLocal));

      // Append visually (deduplication will handle it on next fetch)
      setProducts(prev => [customProduct, ...prev]);

      setIsModalOpen(false);
      setNewProduct({ name: '', category: 'Grains', price: '', unit: 'kg', description: '', benefits: '', imageUrl: '' });
    } catch (err: any) {
      alert(t('Failed to list product: ') + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* HEADER & SEARCH */}
      <div className="bg-white p-4 border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/"><ArrowLeft className="text-gray-400 hover:text-green-700 transition-colors" /></Link>
              <h1 className="text-xl font-black text-green-800 tracking-tight uppercase">{t('Marketplace')}</h1>
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-all">
              <ShoppingCart className="text-gray-700" size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={t('Search fresh produce or farmers...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-[24px] bg-gray-100 border-none outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all shadow-inner"
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* BANNER */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="h-64 md:h-80 rounded-[60px] overflow-hidden relative shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1592394533824-9440e5d68530?q=80&w=2000&auto=format&fit=crop" 
            alt="Fresh Harvest" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/60 to-transparent flex flex-col justify-center px-12">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">Fresh From <br/> <span className="text-green-400">The Soil</span></h2>
            <p className="text-white/80 font-black uppercase tracking-widest text-sm">{t('Directly supporting 5k+ local farmers')}</p>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="bg-white border-b overflow-x-auto whitespace-nowrap px-4 py-3 flex gap-3 no-scrollbar sticky top-[133px] z-10 shadow-sm mt-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat
              ? 'bg-green-700 text-white shadow-lg shadow-green-100'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
          >
            {t(cat)}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-6xl mx-auto p-6 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-700 mb-4" size={40} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('Loading fresh harvest...')}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all hover:-translate-y-2">
                <Link href={`/product/${product.id}`} className="block">
                  <div className={`h-56 ${product.color || 'bg-green-50'} flex items-center justify-center text-6xl relative overflow-hidden`}>
                    <span className="group-hover:scale-125 transition-transform duration-500">{product.emoji || '📦'}</span>
                    <div className="absolute top-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white/20">
                        <Info size={16} className="text-green-700" />
                      </div>
                    </div>
                    {/* Organic Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-green-700 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg border border-green-600/50">
                        {t('Organic')}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pt-6 flex-grow flex flex-col">
                    <div className="mb-2">
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em]">{t(product.category)}</span>
                      <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-green-700 transition-colors uppercase truncate">{t(product.name)}</h3>
                    </div>
                    {product.benefits && (
                      <p className="text-[9px] font-bold text-orange-600 mb-2 uppercase tracking-tight italic">✨ {t(product.benefits)}</p>
                    )}
                    <p className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">by {product.profiles?.full_name || t('Local Farmer')}</p>

                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < Math.floor(product.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                      ))}
                      <span className="text-[10px] font-black text-gray-300 ml-1">{product.rating || 5.0}</span>
                    </div>
                  </div>
                </Link>

                <div className="px-6 pb-6 mt-auto flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 leading-none tracking-tighter">₹{product.price}</span>
                    <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-1">per {product.unit}</span>
                  </div>
                  {userRole !== 'Farmer' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                          unit: product.unit,
                          image_url: product.image_url || '',
                          farmer_name: product.profiles?.full_name || 'Farmer'
                        });
                      }}
                      className="bg-green-700 text-white p-4 rounded-2xl hover:bg-green-800 transition-all shadow-xl shadow-green-100 active:scale-95"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[60px] p-20 text-center border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">{t('No products found matching your search.')}</p>
            <button
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="bg-green-50 text-green-700 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-green-700 hover:text-white transition-all"
            >
              {t('Reset Filters')}
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button for Farmers */}
      {userRole === 'Farmer' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-10 right-10 bg-green-700 text-white w-20 h-20 rounded-[30px] shadow-2xl flex items-center justify-center hover:bg-green-800 transition-all hover:rotate-90 active:scale-90 z-40"
        >
          <Plus size={40} />
        </button>
      )}

      {/* Modal for adding products */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[60px] overflow-hidden shadow-2xl"
            >
              <div className="p-12">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">{t('List Your Harvest')}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleListingSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image URL */}
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Image URL')}</label>
                       <input
                         type="text"
                         value={newProduct.imageUrl}
                         onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                         className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 placeholder:text-gray-300 transition-all uppercase leading-none"
                         placeholder="https://example.com/image.jpg"
                       />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Product Name')}</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 placeholder:text-gray-300 transition-all uppercase leading-none"
                        placeholder="e.g. Organic Ragi"
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-black ml-4 mt-1 uppercase">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Category')}</label>
                      <select
                        value={newProduct.category}
                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 transition-all uppercase appearance-none"
                      >
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{t(c)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 text-black">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Price')} (₹)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 transition-all uppercase"
                          placeholder="00.00"
                        />
                      </div>
                      {errors.price && <p className="text-[10px] text-red-500 font-black ml-4 mt-1 uppercase">{errors.price}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Per Unit')}</label>
                      <select
                        value={newProduct.unit}
                        onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                        className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 transition-all uppercase appearance-none"
                      >
                        <option value="kg">KG</option>
                        <option value="500ml">500ML</option>
                        <option value="ltr">LTR</option>
                        <option value="doz">DOZ</option>
                        <option value="box">BOX</option>
                      </select>
                    </div>

                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Details')}</label>
                      <textarea
                        value={newProduct.description}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-gray-900 transition-all resize-none min-h-[120px]"
                        placeholder={t("Tell shoppers about your harvest process...")}
                      />
                      {errors.description && <p className="text-[10px] text-red-500 font-black ml-4 mt-1 uppercase">{errors.description}</p>}
                    </div>

                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Special Benefits')}</label>
                      <textarea
                        value={newProduct.benefits}
                        onChange={e => setNewProduct({ ...newProduct, benefits: e.target.value })}
                        className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-gray-900 transition-all resize-none min-h-[120px]"
                        placeholder={t("e.g. Rich in Magnesium, High Fiber...")}
                      />
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-green-700 text-white py-8 rounded-[40px] font-black uppercase tracking-tighter text-xl shadow-2xl shadow-green-100 flex items-center justify-center gap-3 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Package size={24} />
                        {t('Instant Live Listing')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-green-700" size={40} />
        </div>
      }
    >
      <MarketplacePageContent />
    </Suspense>
  );
}
