'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from '../contexts/TranslationContext';
import { supabase } from '../lib/supabase';
import {
    MapPin, Truck, CreditCard, ChevronRight,
    CheckCircle2, ArrowLeft, Loader2, Info,
    Home, Smartphone, User, Navigation, Sprout
} from 'lucide-react';
import { logAction } from '../lib/logger';
import { logAction as logAuditAction } from '../lib/auditLog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRazorpay } from 'react-razorpay';

// Mock Hubs Data
const FARMER_HUBS = [
    { id: 1, name: 'Bengaluru Rural Hub', pincode: '562135', lat: 13.22, lng: 77.58 },
    { id: 2, name: 'Mandya Sugarcane Hub', pincode: '571401', lat: 12.52, lng: 76.89 },
    { id: 3, name: 'Mysuru Organic Center', pincode: '570001', lat: 12.30, lng: 76.64 },
    { id: 4, name: 'Hassan Dairy Hub', pincode: '573201', lat: 13.01, lng: 76.10 },
    { id: 5, name: 'Tumakuru Coconut Hub', pincode: '572101', lat: 13.34, lng: 77.10 }
];

export default function CheckoutPage() {
    const { cart, totalAmount, clearCart } = useCart();
    const { t } = useTranslation();
    const router = useRouter();
    const { Razorpay } = useRazorpay();

    const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Delivery, 3: Summary, 5: Confirmed
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [nearestHub, setNearestHub] = useState<any>(null);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        pincode: '',
        address: '',
        city: '',
        state: 'Karnataka'
    });
    const [errors, setErrors] = useState<any>({});

    const validateStep1 = () => {
        const newErrors: any = {};
        
        // Name: Alphabets and spaces only, 2-50 chars
        if (!/^[a-zA-Z\s]{2,50}$/.test(formData.fullName.trim())) {
            newErrors.fullName = t('Enter a valid name (alphabets only, min 2 chars)');
        }

        // Phone: 10 digits
        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone = t('Enter a valid 10-digit mobile number');
        }

        // Pincode: 6 digits
        if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = t('Enter a valid 6-digit pincode');
        }

        if (!formData.city.trim()) newErrors.city = t('City is required');
        if (!formData.address.trim()) newErrors.address = t('Address is required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        async function loadUserData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, phone_number')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile.full_name || '',
                        phone: profile.phone_number || ''
                    }));
                }
            }
            setLoading(false);
        }
        loadUserData();
    }, []);

    // Haversine-esque logic to find nearest hub based on pincode prefix
    const calculateDelivery = (pincode: string) => {
        if (pincode.length < 3) return;

        // Simulating a "Find Nearest Hub" logic
        // In a real app, this would use a Geo-spatial query or API
        const matchedHub = FARMER_HUBS.find(h => h.pincode.startsWith(pincode.slice(0, 2))) || FARMER_HUBS[0];
        setNearestHub(matchedHub);
    };

    const handlePlaceOrder = async () => {
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            if (!cart || cart.length === 0) {
                throw new Error('Cart is empty');
            }

            // Validate form data
            if (!validateStep1()) {
                setSubmitting(false);
                return;
            }

            // Log before order creation
            console.log('Placing order with cart items:', {
                itemCount: cart.length,
                items: cart.map(item => ({ id: item.id, name: item.name, qty: item.quantity })),
                totalAmount,
                timestamp: new Date().toISOString()
            });

            // Create Order via API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    items: cart,
                    total_amount: totalAmount,
                    shipping_address: formData,
                    hub_id: nearestHub?.id || null,
                    payment_method: 'UPI'
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Order creation failed:', {
                    status: response.status,
                    error: responseData.error,
                    details: responseData.details,
                    timestamp: new Date().toISOString()
                });
                throw new Error(responseData.details || responseData.error || 'Failed to create order');
            }

            if (!responseData.order?.id) {
                throw new Error('Order created but no ID returned');
            }

            console.log('Order created successfully:', {
                orderId: responseData.order.id,
                amount: responseData.order.total_amount,
                timestamp: new Date().toISOString()
            });

            // Store order ID for QR generation
            setOrderId(responseData.order.id);

            logAction('CREATE_ORDER', { 
                userId: user.id, 
                details: { 
                    orderId: responseData.order.id, 
                    amount: totalAmount,
                    itemCount: cart.length
                } 
            });

            // Proceed to Razorpay payment
            const options: any = {
                key: 'rzp_test_MockKey123',
                amount: totalAmount * 100,
                currency: 'INR',
                name: 'FarmToHome',
                description: 'Fresh Harvest Payment',
                order_id: responseData.order.id,
                handler: function (response: any) {
                    confirmPayment(responseData.order.id);
                },
                prefill: {
                    name: formData.fullName,
                    contact: formData.phone,
                },
                theme: {
                    color: '#15803d'
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error('Payment failed:', response.error);
                alert(t('Payment Failed: ') + response.error.description);
            });
            rzp.open();

        } catch (error: any) {
            console.error('Order placement error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            alert(t('Failed to process order') + ': ' + (error.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    const confirmPayment = async (confirmedOrderId: string) => {
        setSubmitting(true);
        
        // Simulate payment verification delay
        setTimeout(async () => {
            try {
                console.log('Confirming payment for order:', confirmedOrderId);

                // Update Order Status in database
                if (confirmedOrderId && !confirmedOrderId.startsWith('MOCK-')) {
                    const { error: updateError } = await supabase
                        .from('orders')
                        .update({ order_status: 'Confirmed', payment_status: 'Paid' })
                        .eq('id', confirmedOrderId);

                    if (updateError) {
                        console.error('Error updating order status:', updateError);
                        throw updateError;
                    }
                    
                    console.log('Order status updated to Confirmed:', confirmedOrderId);
                }

                // Generate QR Code for UPI Payment
                try {
                    const qrResponse = await fetch(`/api/generate-qr?orderId=${confirmedOrderId}&amount=${totalAmount}`);
                    if (qrResponse.ok) {
                        const qrData = await qrResponse.json();
                        setQrCodeUrl(qrData.qrCodeUrl);
                        console.log('QR Code generated successfully');
                    } else {
                        console.warn('QR code generation failed but order is confirmed');
                    }
                } catch (qrError) {
                    console.error('QR code generation error:', qrError);
                    // Don't fail the order if QR generation fails
                }

                const { data: { user } } = await supabase.auth.getUser();
                
                // Send Confirmation Email
                if (user?.email && !user.email.endsWith('@farmtohome.temporary')) {
                    try {
                        const emailResponse = await fetch('/api/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: user.email,
                                type: 'order_confirmation',
                                data: {
                                    name: formData.fullName,
                                    totalAmount: totalAmount,
                                    orderId: confirmedOrderId,
                                    address: `${formData.address}, ${formData.city}, ${formData.pincode}`,
                                    itemCount: cart.length
                                }
                            })
                        });

                        if (!emailResponse.ok) {
                            console.warn('Email send failed but order is confirmed');
                        } else {
                            console.log('Confirmation email sent successfully');
                        }
                    } catch (emailError) {
                        console.error('Email sending error:', emailError);
                        // Don't fail the order if email fails
                    }
                }

                // Log the order placement
                const username = localStorage.getItem('username') || 'Unknown';
                const role = localStorage.getItem('role') || 'Customer';
                logAuditAction(username, role, 'Place Order');

                logAction('PAYMENT_VERIFIED', { 
                    userId: user?.id, 
                    details: { 
                        orderId: confirmedOrderId, 
                        amount: totalAmount,
                        itemCount: cart.length,
                        timestamp: new Date().toISOString()
                    } 
                });

                console.log('Order confirmed and logged:', confirmedOrderId);

                setCurrentStep(5); // Show Confirmed Screen
                clearCart();
                
            } catch (err: any) {
                console.error('Payment confirmation error:', err);
                // Still show success screen since payment was processed
                setCurrentStep(5);
                clearCart();
            } finally {
                setSubmitting(false);
            }
        }, 2000);
    };

    if (cart.length === 0 && currentStep !== 4) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-bold mb-4">{t('Your cart is empty')}</h2>
                <Link href="/market-place" className="bg-green-700 text-white px-6 py-2 rounded-xl font-bold">
                    {t('Go to Marketplace')}
                </Link>
            </div>
        );
    }

    const steps = [
        { id: 1, name: t('Address'), icon: MapPin },
        { id: 2, name: t('Delivery'), icon: Truck },
        { id: 3, name: t('Summary'), icon: CreditCard }
    ];

    const upiUrl = `upi://pay?pa=farmtohome@upi&pn=FarmToHome&am=${totalAmount}&cu=INR&tn=Order_${orderId || 'Payment'}`;

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* STEPPER */}
            {currentStep < 5 && (
                <div className="bg-white border-b sticky top-[64px] z-30">
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                            <div
                                className="absolute top-1/2 left-0 h-0.5 bg-green-600 -translate-y-1/2 transition-all duration-500 z-0"
                                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {steps.map((step) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.id ? 'bg-green-600 text-white shadow-lg' : 'bg-white border-2 border-gray-100 text-gray-300'
                                        }`}>
                                        <step.icon size={20} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-green-700' : 'text-gray-300'
                                        }`}>
                                        {step.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-6 pt-10">
                <div className="bg-white rounded-[32px] p-2 pr-6 shadow-xl border border-gray-100 flex items-center gap-6 overflow-hidden">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                        <img 
                            src="https://images.unsplash.com/photo-1591123164101-da61218f4078?q=80&w=2000&auto=format&fit=crop" 
                            alt="Trust our farmers" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{t('Secure Checkout')}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{t('Directly supporting farmer livelihoods')}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                        <Sprout size={14} className="text-green-700" />
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">100% {t('Organic')}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 mt-4">
                {currentStep === 5 ? (
                    <div className="bg-white rounded-[40px] p-16 shadow-xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8">
                            <CheckCircle2 size={64} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-4">{t('Order Confirmed!')}</h1>
                        <p className="text-gray-500 font-bold mb-8 max-w-sm leading-relaxed">
                            {t('Thank you for supporting our farmers. Your fresh harvest is being prepared for dispatch.')}
                        </p>
                        <div className="bg-green-50 px-6 py-3 rounded-2xl font-black text-green-700 uppercase tracking-widest text-xs mb-6">
                            {t('Order ID')}: {orderId}
                        </div>

                        {/* QR Code Display */}
                        {qrCodeUrl && (
                            <div className="mb-10 p-6 bg-gray-50 rounded-[24px] border-2 border-gray-100 w-full max-w-sm">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('UPI Payment QR Code')}</p>
                                <img 
                                    src={qrCodeUrl} 
                                    alt="UPI Payment QR Code" 
                                    className="w-full rounded-xl border-4 border-white shadow-lg"
                                />
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-4">
                                    {t('Scan with any UPI app to complete payment')}
                                </p>
                            </div>
                        )}

                        <Link href="/account" className="bg-gray-900 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-tighter hover:bg-green-700 transition-all shadow-xl">
                            {t('View My Orders')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN: FORMS */}
                        <div className="lg:col-span-2 space-y-6">
                            {currentStep === 1 && (
                                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                                        <MapPin className="text-green-700" /> {t('Shipping Info')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t('Full Name')}</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 font-bold"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                />
                                                <User className="absolute left-4 top-4 text-gray-300" size={18} />
                                            </div>
                                            {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase animate-bounce">{errors.fullName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t('Phone Number')}</label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 font-bold"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                                <Smartphone className="absolute left-4 top-4 text-gray-300" size={18} />
                                            </div>
                                            {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase animate-bounce">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t('Pincode')}</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 font-bold"
                                                    value={formData.pincode}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, pincode: e.target.value });
                                                        if (e.target.value.length === 6) calculateDelivery(e.target.value);
                                                    }}
                                                />
                                                <MapPin className="absolute left-4 top-4 text-gray-300" size={18} />
                                            </div>
                                            {errors.pincode && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase animate-bounce">{errors.pincode}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t('City')}</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 font-bold"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                            {errors.city && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase animate-bounce">{errors.city}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t('Detailed Address')}</label>
                                            <textarea
                                                rows={3}
                                                className="w-full p-4 rounded-[24px] bg-gray-50 border-none outline-none focus:ring-2 focus:ring-green-500 font-bold resize-none"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            ></textarea>
                                            {errors.address && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase animate-bounce">{errors.address}</p>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (validateStep1()) setCurrentStep(2);
                                        }}
                                        className="w-full mt-10 bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-xl"
                                    >
                                        {t('Confirm Address')} <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                                    <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                                        <Truck className="text-green-700" /> {t('Delivery Method')}
                                    </h2>

                                    {nearestHub ? (
                                        <div className="space-y-6">
                                            <div className="bg-green-50 p-8 rounded-[32px] border-2 border-green-600 relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Navigation size={14} className="text-green-700" />
                                                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t('Nearest Hub Detected')}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-green-900 mb-4 uppercase">{nearestHub.name}</h3>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold text-green-700/60 uppercase mb-1">{t('Estimated Delivery')}</p>
                                                            <p className="text-2xl font-black text-green-800">{nearestHub.id % 2 === 0 ? t('Same Day Delivery') : t('Delivery in 2 Days')}</p>
                                                        </div>
                                                        <CheckCircle2 size={32} className="text-green-600" />
                                                    </div>
                                                </div>
                                                <Truck size={120} className="absolute -bottom-10 -right-10 text-green-600/10 -rotate-12" />
                                            </div>

                                            <div className="bg-gray-50 p-6 rounded-[24px] flex items-start gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-700 shrink-0">
                                                    <Info size={20} />
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed font-bold">
                                                    {t('Your harvest will be dispatched from our community hub to ensure maximum freshness and minimum carbon footprint.')}
                                                </p>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setCurrentStep(1)}
                                                    className="flex-1 border-2 border-gray-100 text-gray-400 py-5 rounded-3xl font-black uppercase tracking-tighter hover:bg-gray-50 transition-all"
                                                >
                                                    {t('Back')}
                                                </button>
                                                <button
                                                    onClick={() => setCurrentStep(3)}
                                                    className="flex-[2] bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-tighter hover:bg-green-700 transition-all shadow-xl"
                                                >
                                                    {t('Proceed to Summary')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <Loader2 className="animate-spin text-green-700 mx-auto mb-4" size={32} />
                                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{t('Calculating Logistics...')}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                                        <CreditCard className="text-green-700" /> {t('Payment Summary')}
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="border border-gray-100 rounded-[32px] overflow-hidden">
                                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Final Order Split')}</span>
                                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">70/30 Fair Trade</span>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-bold text-gray-500">{t('Farmer Contribution (70%)')}</p>
                                                    <p className="text-sm font-black text-gray-900">₹{(totalAmount * 0.7).toLocaleString()}</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-bold text-gray-500">{t('Platform & Investor (30%)')}</p>
                                                    <p className="text-sm font-black text-gray-900">₹{(totalAmount * 0.3).toLocaleString()}</p>
                                                </div>
                                                <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                                                    <p className="text-lg font-black text-gray-900 uppercase">{t('Total Payable')}</p>
                                                    <p className="text-3xl font-black text-green-800 tracking-tighter">₹{totalAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white border-2 border-green-600 p-6 rounded-[24px] flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-700 font-black shadow-sm">UPI</div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase text-xs">{t('Secure UPI Interface')}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{t('Compatible with GPay, PhonePe, Paytm')}</p>
                                                </div>
                                            </div>
                                            <CheckCircle2 size={24} className="text-green-600" />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setCurrentStep(2)}
                                                className="flex-1 border-2 border-gray-100 text-gray-400 py-5 rounded-3xl font-black uppercase tracking-tighter hover:bg-gray-50 transition-all"
                                            >
                                                {t('Back')}
                                            </button>
                                            <button
                                                onClick={handlePlaceOrder}
                                                disabled={submitting}
                                                className="flex-[2] bg-green-700 text-white py-5 rounded-3xl font-black uppercase tracking-tighter hover:bg-green-800 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                                            >
                                                {submitting ? <Loader2 className="animate-spin" /> : t('Confirm & Generate QR')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: SUMMARY BRIEF */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 sticky top-48">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-6">{t('Order Summary')}</h3>
                                <div className="space-y-4 mb-8">
                                    {cart.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover rounded-xl" /> : '🌾'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-gray-800 uppercase truncate">{t(item.name)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.quantity} x ₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">{t('Subtotal')}</p>
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">₹{totalAmount}</p>
                                    </div>
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">{t('Delivery')}</p>
                                        <p className="text-sm font-black text-green-600 uppercase tracking-tighter">{t('Free')}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-black text-gray-900 uppercase">{t('Total')}</p>
                                        <p className="text-xl font-black text-green-800 tracking-tighter">₹{totalAmount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
