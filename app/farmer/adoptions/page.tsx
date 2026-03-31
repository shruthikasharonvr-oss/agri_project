'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ShieldCheck, Loader2, Search,
  ArrowRight, Info, CheckCircle2, TrendingUp, X, Plus, Camera, MapPin, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../contexts/TranslationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function FarmerAdoptionsPage() {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }

    const { data, error } = await supabase
      .from('adoptions')
      .select('*, profiles(full_name)')
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setAdoptions(data || []);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    setUserRole(profile?.role || 'customer');
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

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <TrendingUp size={14} /> {t('Agricultural Investment')}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-none">
              My <span className="text-green-700">{t('Adoptions')}</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-xl font-medium">
              {t('Manage your listed adoptions and track funding progress.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
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

        {/* FLOATING PLUS BUTTON */}
        {userRole === 'farmer' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-10 right-10 w-20 h-20 bg-green-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-200 hover:scale-110 active:scale-90 transition-all z-[100] group"
          >
            <Plus size={36} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        )}

        {/* ASSET LISTING MODAL */}
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
                      <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center"><Sparkles size={20} /></div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter">{t('List for Adoption')}</h2>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleListingSubmit} className="space-y-5">
                    {/* Photo Upload */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative h-40 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all overflow-hidden"
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
                          <Camera className="text-gray-300 group-hover:text-green-500 mb-2" size={32} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-green-600">{t('Upload Land/Asset Photo')}</span>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Asset Title')}</label>
                      <input
                        required
                        value={newAdoption.title}
                        onChange={e => setNewAdoption({ ...newAdoption, title: e.target.value })}
                        placeholder="e.g. fertile land in villupuram"
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Location')}</label>
                        <div className="relative">
                          <input
                            required
                            value={newAdoption.location}
                            onChange={e => setNewAdoption({ ...newAdoption, location: e.target.value })}
                            placeholder="Villupuram"
                            className="w-full p-4 pl-10 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none"
                          />
                          <MapPin size={16} className="absolute left-4 top-4 text-gray-300" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Asset Type')}</label>
                        <select
                          value={newAdoption.asset_type}
                          onChange={e => setNewAdoption({ ...newAdoption, asset_type: e.target.value })}
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none appearance-none"
                        >
                          <option value="Land">{t('Land')}</option>
                          <option value="Animal">{t('Animal')}</option>
                          <option value="Tree">{t('Tree')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Target (₹)')}</label>
                        <input
                          required
                          type="number"
                          value={newAdoption.target_funding}
                          onChange={e => setNewAdoption({ ...newAdoption, target_funding: e.target.value })}
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Profit Share %')}</label>
                        <input
                          required
                          type="number"
                          value={newAdoption.profit_share}
                          onChange={e => setNewAdoption({ ...newAdoption, profit_share: e.target.value })}
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">{t('Why Adopt This?')}</label>
                      <textarea
                        required
                        value={newAdoption.description}
                        onChange={e => setNewAdoption({ ...newAdoption, description: e.target.value })}
                        placeholder="Share the story..."
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all border-none resize-none h-24"
                      />
                    </div>

                    <button
                      disabled={isSubmitting}
                      className="w-full bg-green-700 text-white py-5 rounded-[24px] font-black uppercase tracking-tighter shadow-2xl shadow-green-100 hover:bg-green-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : t('Confirm Asset Listing')}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                {t('Accept & Continue')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
