'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../contexts/TranslationContext';
import { Loader2 } from 'lucide-react';

export default function SellProductPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [category, setCategory] = useState('Grains');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = ['Grains', 'Dairy', 'Fruits', 'Honey', 'Vegetables'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase.from('products').insert([
                {
                    name,
                    price: Number(price),
                    unit,
                    category,
                    image_url: imageUrl || null,
                    // Assuming the table has a foreign key `farmer_id` that can be null for now
                },
            ]);
            if (insertError) throw insertError;
            // Redirect to marketplace to see the new listing
            router.push('/market-place');
        } catch (err: any) {
            console.error('Error inserting product:', err);
            setError(err.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-[32px] shadow-lg p-8 w-full max-w-lg space-y-6"
            >
                <h1 className="text-2xl font-extrabold text-green-800 text-center">
                    {t('Sell Your Product')}
                </h1>
                {error && (
                    <p className="text-red-600 text-center font-medium">{error}</p>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Product Name')}
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Price')}
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Unit')}
                        </label>
                        <input
                            type="text"
                            required
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full p-3 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Category')}
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {t(cat)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Image URL (optional)')}
                    </label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-3 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 text-white py-3 rounded-2xl hover:bg-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {t('Adding...')}
                        </>
                    ) : (
                        t('Add Product')
                    )}
                </button>
            </form>
        </div>
    );
}
