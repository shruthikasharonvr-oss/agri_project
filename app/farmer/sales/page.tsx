'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Star, ArrowLeft, Loader2, Info, Plus, X, Camera, Package } from 'lucide-react';
import { logAction } from '../../lib/logger';
import Link from 'next/link';
import { useTranslation } from '../../contexts/TranslationContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Fallback products if DB is empty
const MOCK_PRODUCTS = [
  {
    id: 'mock-1',
    name: "Organic Ragi Flour",
    farmer_id: null,
    profiles: { full_name: "Somanna G." },
    price: 60,
    unit: "kg",
    rating: 4.8,
    category: "Grains",
    image_url: null,
    color: "bg-orange-100",
    emoji: "🌾"
  },
  {
    id: 'mock-2',
    name: "Fresh Gir Cow Ghee",
    farmer_id: null,
    profiles: { full_name: "Lakshmi Farm" },
    price: 850,
    unit: "500ml",
    rating: 4.9,
    category: "Dairy",
    image_url: null,
    color: "bg-yellow-100",
    emoji: "🍯"
  },
  {
    id: 'mock-3',
    name: "Alphonso Mangoes",
    farmer_id: null,
    profiles: { full_name: "Ratnagiri Orchards" },
    price: 1200,
    unit: "doz",
    rating: 4.7,
    category: "Fruits",
    image_url: null,
    color: "bg-yellow-50",
    emoji: "🥭"
  },
  {
    id: 'mock-4',
    name: "Pure Wild Honey",
    farmer_id: null,
    profiles: { full_name: "Forest Tribal Coop" },
    price: 450,
    unit: "kg",
    rating: 5.0,
    category: "Honey",
    image_url: null,
    color: "bg-amber-50",
    emoji: "🐝"
  }
];

export default function FarmerSalesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { addToCart, itemCount } = useCart();

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Grains',
    price: '',
    unit: 'kg',
    description: ''
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Grains', 'Dairy', 'Fruits', 'Honey', 'Vegetables'];

  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(full_name)')
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setProducts(data);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Check Role
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUserRole(profile?.role || 'customer');
      }
    };
    checkRole();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

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
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Auth required');

      let image_url = null;
      if (uploadFile) {
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const { error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(`products/${fileName}`, uploadFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-media')
          .getPublicUrl(`products/${fileName}`);
        image_url = publicUrl;
      }

      const { error: insertError } = await supabase.from('products').insert([{
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        unit: newProduct.unit,
        description: newProduct.description,
        image_url,
        farmer_id: user.id
      }]);

      if (insertError) throw insertError;
      
      logAction('CREATE_PRODUCT', { userId: user.id, details: { name: newProduct.name, price: newProduct.price, source: 'marketplace_modal' } });

      setIsModalOpen(false);
      setNewProduct({ name: '', category: 'Grains', price: '', unit: 'kg', description: '' });
      setUploadFile(null);
      setUploadPreview(null);
      fetchProducts();
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
              <h1 className="text-xl font-black text-green-800 tracking-tight uppercase">{t('My Sales')}</h1>
            </div>
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

      {/* CATEGORY FILTER */}
      <div className="bg-white border-b overflow-x-auto whitespace-nowrap px-4 py-3 flex gap-3 no-scrollbar sticky top-[133px] z-10 shadow-sm">
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
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <span className="group-hover:scale-125 transition-transform duration-500">{product.emoji || '📦'}</span>
                    )}
                    <div className="absolute top-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white/20">
                        <Info size={16} className="text-green-700" />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pt-6 flex-grow flex flex-col">
                    <div className="mb-2">
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em]">{t(product.category)}</span>
                      <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-green-700 transition-colors uppercase truncate">{t(product.name)}</h3>
                    </div>
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

      {/* FLOATING PLUS BUTTON */}
      {userRole === 'farmer' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-10 right-10 w-20 h-20 bg-green-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-200 hover:scale-110 active:scale-90 transition-all z-[100] group"
        >
          <Plus size={36} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      )}

      {/* LISTING MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[48px] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center"><Package size={20} /></div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{t('List New Product')}</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleListingSubmit} className="space-y-6">
                  {/* Photo Upload */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-48 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all overflow-hidden"
                  >
                    {uploadPreview ? (
                      <>
                        <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Camera className="text-white" size={32} />
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="text-gray-300 group-hover:text-green-500 mb-2" size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-green-600">{t('Upload Product Photo')}</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Produce Name')}</label>
                    <input
                      required
                      value={newProduct.name}
                      onChange={e => {
                        setNewProduct({ ...newProduct, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="e.g. Wild Forest Honey"
                      className={`w-full p-5 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none ${errors.name ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4 uppercase">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Price (₹)')}</label>
                      <input
                        required
                        type="number"
                        value={newProduct.price}
                        onChange={e => {
                          setNewProduct({ ...newProduct, price: e.target.value });
                          if (errors.price) setErrors({ ...errors, price: null });
                        }}
                        placeholder="0.00"
                        className={`w-full p-5 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none ${errors.price ? 'ring-2 ring-red-400' : ''}`}
                      />
                      {errors.price && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4 uppercase">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Unit')}</label>
                      <input
                        required
                        value={newProduct.unit}
                        onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                        placeholder="kg / 500ml"
                        className="w-full p-5 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Category')}</label>
                    <select
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none appearance-none"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Produce Details')}</label>
                    <textarea
                      required
                      value={newProduct.description}
                      onChange={e => {
                        setNewProduct({ ...newProduct, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: null });
                      }}
                      placeholder="Fresh from the farm..."
                      className={`w-full p-5 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none resize-none h-24 ${errors.description ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {errors.description && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4 uppercase">{errors.description}</p>}
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="w-full bg-green-700 text-white py-6 rounded-[28px] font-black uppercase tracking-tighter shadow-2xl shadow-green-100 hover:bg-green-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : t('Confirm Listing')}
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
