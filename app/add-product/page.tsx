'use client';

import { useState, useEffect } from 'react';
import { Camera, ArrowLeft, CheckCircle2, IndianRupee, Tag, Warehouse, Loader2 } from 'lucide-react';
import { logAction } from '../lib/logger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { supabase } from '../lib/supabase';

export default function AddProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: 'Grains & Millets',
    description: ''
  });
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = t('Product name must be at least 3 characters');
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = t('Enter a valid price greater than 0');
    }
    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = t('Enter a valid stock amount');
    }
    if (formData.description.length < 10) {
      newErrors.description = t('Description should be at least 10 characters');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      } else {
        // Verify role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'farmer') {
          alert(t('Only farmers can list products.'));
          router.push('/');
        }
      }
    }
    checkAuth();
  }, [router, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let image_url = '';
      if (image) {
        const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(`products/${fileName}`, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-media')
          .getPublicUrl(`products/${fileName}`);

        image_url = publicUrl;
      }

      const { error } = await supabase.from('products').insert([
        {
          name: formData.name,
          price: parseFloat(formData.price),
          stock: formData.stock,
          unit: formData.unit,
          category: formData.category,
          description: formData.description,
          image_url: image_url,
          farmer_id: user.id
        }
      ]);

      if (error) throw error;
      
      logAction('CREATE_PRODUCT', { userId: user.id, details: { name: formData.name, price: formData.price } });

      setSubmitted(true);
    } catch (error: any) {
      alert(t('Failed to list product: ') + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{t('Product Listed!')}</h1>
        <p className="text-gray-500 mb-10 max-w-xs mx-auto">{t('Your harvest is now live on the marketplace and visible to customers.')}</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/market-place" className="bg-green-700 text-white py-5 rounded-3xl font-bold hover:bg-green-800 transition-all shadow-xl shadow-green-100">
            {t('View Marketplace')}
          </Link>
          <button onClick={() => setSubmitted(false)} className="text-green-700 font-bold hover:underline">
            {t('List Another Product')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-20">
      {/* HEADER */}
      <div className="bg-white p-6 flex items-center gap-4 border-b sticky top-0 z-20 shadow-sm">
        <Link href="/">
          <ArrowLeft className="text-gray-600 hover:text-green-700 transition-colors" />
        </Link>
        <h1 className="text-2xl font-black text-green-800 tracking-tight">{t('New Listing')}</h1>
      </div>

      <div className="max-w-xl mx-auto p-6 mt-4">
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">

          {/* CAMERA UPLOAD SECTION */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">{t('Product Photo')}</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              <div className="w-full h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-gray-400 overflow-hidden relative transition-all group-hover:bg-green-50 group-hover:border-green-200">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                      <Camera size={32} />
                    </div>
                    <span className="font-bold text-sm">{t('Tap to upload or take photo')}</span>
                    <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider font-bold">{t('High quality images sell faster')}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* PRODUCT NAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-2 text-gray-400 uppercase tracking-widest ml-2">
                <Tag size={14} /> {t('Product Name')}
              </label>
              <input
                required
                type="text"
                placeholder={t('e.g. Organic Finger Millet')}
                className={`w-full p-5 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 text-black font-bold placeholder:text-gray-300 ${errors.name ? 'ring-2 ring-red-400' : ''}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase">{errors.name}</p>}
            </div>

            {/* PRICE & QUANTITY */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-2 text-gray-400 uppercase tracking-widest ml-2">
                  <IndianRupee size={14} /> {t('Price')}
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    placeholder="0.00"
                    className={`w-full p-5 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 text-black font-bold placeholder:text-gray-300 ${errors.price ? 'ring-2 ring-red-400' : ''}`}
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      if (errors.price) setErrors({ ...errors, price: null });
                    }}
                  />
                  <span className="absolute right-5 top-5 text-[10px] font-bold text-gray-400 uppercase">per {formData.unit}</span>
                </div>
                {errors.price && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-2 text-gray-400 uppercase tracking-widest ml-2">
                  <Warehouse size={14} /> {t('Stock')}
                </label>
                <input
                  required
                  type="text"
                  placeholder={t('e.g. 500')}
                  className="w-full p-5 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 text-black font-bold placeholder:text-gray-300"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            {/* UNIT & CATEGORY */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">{t('Selling Unit')}</label>
                <select
                  className="w-full p-5 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 text-black font-bold appearance-none cursor-pointer"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="kg">kilogram (kg)</option>
                  <option value="g">gram (g)</option>
                  <option value="ltr">liter (ltr)</option>
                  <option value="doz">dozen</option>
                  <option value="piece">piece</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">{t('Category')}</label>
                <select
                  className="w-full p-5 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 text-black font-bold appearance-none cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Grains">Grains & Millets</option>
                  <option value="Dairy">Dairy Products</option>
                  <option value="Fruits">Fresh Fruits</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Honey">Honey & Syrups</option>
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">{t('Description')}</label>
              <textarea
                placeholder={t('How was it grown? Is it organic?')}
                rows={4}
                className={`w-full p-5 rounded-3xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 text-black font-bold resize-none ${errors.description ? 'ring-2 ring-red-400' : ''}`}
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
              ></textarea>
              {errors.description && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase">{errors.description}</p>}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            disabled={submitting}
            type="submit"
            className="w-full bg-green-700 text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-green-100 hover:bg-green-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              t('LIST HARVEST NOW')
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-10">
          {t('By listing, you agree to our fair trade policies and quality standards.')}
        </p>
      </div>
    </div>
  );
}