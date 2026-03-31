'use client';

import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/TranslationContext';

export default function CartPage() {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, totalAmount, itemCount, clearCart } = useCart();
    const { t } = useTranslation();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                    <ShoppingBag size={40} className="text-gray-300" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('Your cart is empty')}</h1>
                <p className="text-gray-500 mb-8 max-w-xs">{t('Looks like you haven\'t added any fresh harvest yet.')}</p>
                <Link href="/market-place">
                    <button className="bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-800 transition-all shadow-xl shadow-green-100">
                        <ArrowLeft size={18} /> {t('Start Shopping')}
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white p-6 border-b sticky top-0 z-20">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Link href="/market-place">
                        <ArrowLeft className="text-gray-600 hover:text-green-700 transition-colors" />
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-900">{t('My Cart')}</h1>
                    <span className="ml-auto text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        {itemCount} {t('Items')}
                    </span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-4">
                {cart.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4 group">
                        <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center text-4xl shrink-0">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                "🌾"
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 truncate uppercase text-sm">{t(item.name)}</h3>
                            <p className="text-xs text-gray-400 mb-2">{t('by')} {item.farmer_name}</p>
                            <div className="flex items-center justify-between">
                                <p className="font-black text-green-800">₹{item.price}</p>
                                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-500 hover:text-red-500 shadow-sm transition-all"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="font-bold text-gray-700 min-w-[20px] text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-500 hover:text-green-600 shadow-sm transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                <button
                    onClick={clearCart}
                    className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors pt-2 px-4"
                >
                    {t('Clear Entire Cart')}
                </button>
            </div>

            {/* CHECKOUT BOX */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{t('Total Amount')}</p>
                        <p className="text-2xl font-black text-gray-900">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={() => router.push('/checkout')}
                        className="bg-green-700 text-white px-10 py-5 rounded-3xl font-bold flex items-center gap-3 hover:bg-green-800 transition-all shadow-xl shadow-green-100 active:scale-95"
                    >
                        {t('Checkout Now')} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
