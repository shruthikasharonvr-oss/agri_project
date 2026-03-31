'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  ShieldCheck, Loader2, Search,
  ArrowRight, Info, CheckCircle2, TrendingUp, X, Plus, Camera, MapPin, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { logAction } from '../lib/logger';

const MOCK_ADOPTIONS = [
  {
    id: 'mock-a1',
    title: "Vechur Cow Breed",
    asset_type: "Animal",
    profiles: { full_name: "Kasaragod Heritage Farm" },
    description: "Sponsor a rare Vechur cow and receive fresh A2 milk products and profit share from cattle breeding. Supports biodiversity conservation.",
    current_funding: 45000,
    target_funding: 80000,
    profit_share: 35,
    image_url: "https://images.unsplash.com/photo-1596522868827-678785f7cd45?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 'mock-a2',
    title: "Organic Paddy Field (2 Acres)",
    asset_type: "Land",
    profiles: { full_name: "Green Valley Cooperatives" },
    description: "Adopt a segment of our organic Basmati rice fields. Track growth with live sensors and share the harvest. No pesticides used.",
    current_funding: 120000,
    target_funding: 200000,
    profit_share: 40,
    image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 'mock-a3',
    title: "Siddagiri Mango Grove",
    asset_type: "Tree",
    profiles: { full_name: "Western Ghats Orchards" },
    description: "Sponsor a group of 10 Alphonso Mango trees. Enjoy seasonal harvests and long-term dividend growth from high-yield exports.",
    current_funding: 15000,
    target_funding: 50000,
    profit_share: 30,
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1580&auto=format&fit=crop"
  }
];

export default function AdoptionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newAdoption, setNewAdoption] = useState({
    title: '',
    asset_type: 'Land',
    location: '',
    description: '',
    target_funding: '',
    profit_share: '30'
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Adoptions
    const { data, error } = await supabase
      .from('adoptions')
      .select('*, profiles(full_name)')
      .eq('status', 'Available')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setAdoptions(data);
    } else {
      setAdoptions(MOCK_ADOPTIONS);
    }

    // Check Role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setUserRole(profile?.role || 'customer');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Auth required');

      let image_url = null;
      if (uploadFile) {
        const fileName = `adoption-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const { error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(`adoptions/${fileName}`, uploadFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-media')
          .getPublicUrl(`adoptions/${fileName}`);
        image_url = publicUrl;
      }

      const { error: insertError } = await supabase.from('adoptions').insert([{
        title: newAdoption.title,
        asset_type: newAdoption.asset_type,
        location: newAdoption.location,
        description: newAdoption.description,
        target_funding: Number(newAdoption.target_funding),
        profit_share: Number(newAdoption.profit_share),
        image_url,
        farmer_id: user.id,
        status: 'Available',
        current_funding: 0
      }]);

      if (insertError) throw insertError;
      
      logAction('ADOPTION_SUCCESS', { userId: user.id, details: { title: newAdoption.title, type: newAdoption.asset_type } });

      setIsModalOpen(false);
      setNewAdoption({ title: '', asset_type: 'Land', location: '', description: '', target_funding: '', profit_share: '30' });
      setUploadFile(null);
      setUploadPreview(null);
      fetchData();
    } catch (err: any) {
      alert(t('Failed to list land: ') + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdoptions = adoptions.filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.asset_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-green-700 mb-4" size={48} />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('Growing your opportunities...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* BANNER */}
        <div className="mb-16 h-64 md:h-80 rounded-[60px] overflow-hidden relative shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1589133104705-076f80905479?q=80&w=2000&auto=format&fit=crop" 
            alt="Traditional Farming" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-12">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-2">{t('Invest in Tradition')}</h2>
            <p className="text-green-400 font-black uppercase tracking-widest text-sm">{t('Sponsor livestock and land directly')}</p>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <TrendingUp size={14} /> {t('Agricultural Investment')}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-none">
              Adopt a Better <span className="text-green-700">{t('Future')}</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-xl font-medium">
              {t('Directly sponsor livestock and land. Watch your investment grow with real-time updates and share the harvest profit.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="hidden lg:block relative w-64 h-40 rounded-[32px] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSun2pujy_dCZLsF2VWumdltD_yDnlU4BFXTw&s" 
                alt="Farmer" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                <p className="text-white text-[10px] font-black uppercase tracking-widest">{t('Trust our Farmers')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPolicy(true)}
              className="flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-8 py-5 rounded-[24px] font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <ShieldCheck size={20} className="text-green-600" /> {t('Trust & Policies')}
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-2xl mb-16 mx-auto lg:mx-0">
          <input
            type="text"
            placeholder={t('Search assets, types, or farmers...')}
            className="w-full p-6 pl-16 bg-white rounded-[32px] border-none shadow-xl shadow-gray-200/50 focus:ring-2 focus:ring-green-500 outline-none transition-all text-lg font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-6 top-6 text-gray-300" size={28} />
        </div>

        {/* ASSET GRID */}
        {filteredAdoptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredAdoptions.map((asset) => {
              const progress = Math.min(100, Math.max(0, (asset.current_funding || 0) / (asset.target_funding || 1) * 100));

              return (
                <div key={asset.id} className="group bg-white rounded-[48px] shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className="relative aspect-[4/3] bg-green-50 flex items-center justify-center overflow-hidden">
                    {asset.image_url ? (
                      <img src={asset.image_url} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="text-8xl transition-all group-hover:scale-125 duration-500">
                        {asset.asset_type === 'Animal' ? '🐄' : asset.asset_type === 'Land' ? '🌾' : asset.asset_type === 'Tree' ? '🥭' : '🚜'}
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-green-700 uppercase tracking-widest shadow-sm">
                        {t(asset.asset_type)}
                      </span>
                    </div>
                  </div>

                  <div className="p-10 flex-grow flex flex-col">
                    <div
                      onClick={() => router.push(`/adoptions/${asset.id}`)}
                      className="mb-6 cursor-pointer"
                    >
                      <h3 className="text-2xl font-black text-gray-900 mb-1 leading-tight group-hover:text-green-700 transition-colors uppercase truncate">{t(asset.title)}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('by')} {asset.profiles?.full_name}</p>
                    </div>

                    <p
                      onClick={() => router.push(`/adoptions/${asset.id}`)}
                      className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium cursor-pointer"
                    >
                      {asset.description}
                    </p>

                    {/* Funding Progress */}
                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Funding Progress')}</p>
                        <p className="text-sm font-black text-green-700">{progress.toFixed(0)}%</p>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(22,163,74,0.3)]"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('Goal')}</p>
                        <p className="text-lg font-black text-gray-900">₹{asset.target_funding?.toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100/50 text-orange-700">
                        <p className="text-[9px] font-black text-orange-300 uppercase tracking-widest mb-1">{t('Return')}</p>
                        <p className="text-lg font-black">{asset.profit_share || 30}%</p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/adoptions/${asset.id}`)}
                      className="mt-auto w-full bg-gray-900 group-hover:bg-green-700 text-white py-5 rounded-[24px] font-black uppercase tracking-tighter flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-100 group-hover:shadow-green-100 active:scale-95"
                    >
                      {t('View Details')} <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[60px] p-24 text-center border border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <Info size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">{t('No opportunities found')}</h3>
            <p className="text-gray-400 max-w-sm mx-auto font-medium">{t('Try adjusting your search or check back later for new agricultural breakthroughs.')}</p>
          </div>
        )}



        {/* POLICY MODAL */}
        {showPolicy && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-[48px] max-w-xl w-full p-12 relative shadow-2xl border border-gray-100 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full opacity-50 blur-3xl"></div>

              <button
                onClick={() => setShowPolicy(false)}
                className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>

              <h2 className="text-4xl font-black mb-8 text-green-800 tracking-tighter uppercase">{t('Investment Policy')}</h2>

              <div className="space-y-8 text-gray-600">
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-sm shrink-0 shadow-sm">1</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-widest">{t('Direct Sponsoring')}</p>
                    <p className="text-sm leading-relaxed font-medium">{t('Your contribution acts as a direct investment in the farm asset, facilitating sustainable growth and high-quality yield.')}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-sm shrink-0 shadow-sm">2</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-widest">{t('Profit Sharing')}</p>
                    <p className="text-sm leading-relaxed font-medium">{t('Profits from the harvest are strictly divided: 70% to the Farmer (for maintenance) and 30% to the Investor (You).')}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-sm shrink-0 shadow-sm">3</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-widest">{t('Risk Management')}</p>
                    <p className="text-sm leading-relaxed font-medium">{t('Agriculture involves natural risks. Our platform ensures all assets are covered by local agricultural insurance policies.')}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPolicy(false)}
                className="w-full mt-12 bg-green-700 text-white py-6 rounded-[28px] font-black uppercase tracking-tighter hover:bg-green-800 transition-all shadow-2xl shadow-green-100 active:scale-95"
              >
                </button>
            </div>
          </div>
        )}

        {/* Floating Action Button for Farmers */}
        {userRole === 'farmer' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-10 right-10 bg-green-700 text-white w-20 h-20 rounded-[30px] shadow-2xl flex items-center justify-center hover:bg-green-800 transition-all hover:rotate-90 active:scale-90 z-40"
          >
            <Plus size={40} />
          </button>
        )}

        {/* Modal for adding adoptions */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
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
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">{t('List Your Asset')}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleListingSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Media Upload */}
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">{t('Asset Photo')}</label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="relative h-48 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-green-200 transition-colors overflow-hidden group"
                        >
                          {uploadPreview ? (
                            <img src={uploadPreview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-green-700 shadow-sm group-hover:scale-110 transition-transform">
                                <Camera size={32} />
                              </div>
                              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('Upload Photo')}</span>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Asset Title')}</label>
                        <input
                          type="text"
                          value={newAdoption.title}
                          onChange={e => setNewAdoption({ ...newAdoption, title: e.target.value })}
                          className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 placeholder:text-gray-300 transition-all uppercase leading-none"
                          placeholder="e.g. Vechur Cow"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Asset Type')}</label>
                        <select
                          value={newAdoption.asset_type}
                          onChange={e => setNewAdoption({ ...newAdoption, asset_type: e.target.value })}
                          className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 transition-all uppercase appearance-none"
                        >
                          <option value="Land">Land</option>
                          <option value="Tree">Tree</option>
                          <option value="Animal">Animal</option>
                          <option value="Machinery">Machinery</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Target Funding')} (₹)</label>
                        <input
                          type="number"
                          value={newAdoption.target_funding}
                          onChange={e => setNewAdoption({ ...newAdoption, target_funding: e.target.value })}
                          className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 transition-all uppercase"
                          placeholder="00000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Profit Share')} (%)</label>
                        <input
                          type="number"
                          value={newAdoption.profit_share}
                          onChange={e => setNewAdoption({ ...newAdoption, profit_share: e.target.value })}
                          className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 transition-all uppercase"
                          placeholder="30"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Location')}</label>
                        <div className="relative">
                          <MapPin className="absolute left-6 top-6 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={newAdoption.location}
                            onChange={e => setNewAdoption({ ...newAdoption, location: e.target.value })}
                            className="w-full p-6 pl-14 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-black text-gray-900 uppercase"
                            placeholder="Village, State"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2 text-black">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Investment Details')}</label>
                        <textarea
                          value={newAdoption.description}
                          onChange={e => setNewAdoption({ ...newAdoption, description: e.target.value })}
                          className="w-full p-6 rounded-[32px] bg-gray-50 border-none outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-gray-900 transition-all resize-none min-h-[120px]"
                          placeholder="Explain the perks for investors..."
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
                          <Sparkles size={24} />
                          {t('Launch Investment')}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
