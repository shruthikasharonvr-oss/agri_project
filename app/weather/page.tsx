'use client';

import { useState, useEffect } from 'react';
import { Cloud, MapPin, Loader2, Wind, Droplets, Eye, Gauge, Sun, CloudRain, CloudSnow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';

const weatherIcons: { [key: string]: React.ReactNode } = {
    'Clear': <Sun className="w-full h-full text-yellow-400" />,
    'Clouds': <Cloud className="w-full h-full text-gray-400" />,
    'Rain': <CloudRain className="w-full h-full text-blue-400" />,
    'Snow': <CloudSnow className="w-full h-full text-cyan-300" />,
};

export default function WeatherPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGetWeather = () => {
        setLoading(true);
        setError(null);

        if (!("geolocation" in navigator)) {
            setError("Location is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

                    if (!API_KEY) {
                       throw new Error('Weather API Key missing.');
                    }

                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                    );
                    
                    if (!response.ok) throw new Error('Weather API Error');
                    const data = await response.json();

                    setWeather({
                        temp: Math.round(data.main.temp),
                        condition: data.weather[0].main,
                        humidity: data.main.humidity,
                        windSpeed: Math.round(data.wind.speed * 3.6),
                        location: data.name,
                        feelsLike: Math.round(data.main.feels_like),
                        visibility: (data.visibility / 1000).toFixed(1),
                        pressure: data.main.pressure,
                    });
                } catch (err: any) {
                    setError(err.message || 'Failed to fetch weather. Check your connection.');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError("Please allow location access to see your local weather.");
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        handleGetWeather();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1f1e] via-[#0f2f2e] to-[#0a1f1e] pb-20 pt-32 flex flex-col items-center">
            <main className="w-full max-w-2xl mx-auto p-6 md:p-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 gradient-text">
                        Local Weather
                    </h1>
                    <p className="text-gray-400 text-lg">Stay informed about conditions in your area</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Loading State */}
                    {loading && (
                        <motion.div
                            className="glass p-12 rounded-2xl flex flex-col items-center justify-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                                <Loader2 className="text-green-400 mb-4" size={48} />
                            </motion.div>
                            <p className="text-gray-300 font-semibold text-center">
                                Fetching weather data for your location...
                            </p>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <motion.div
                            className="glass p-8 rounded-2xl border border-red-500/30 bg-red-500/10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-red-400 mb-2">Oops!</h3>
                                <p className="text-gray-300">{error}</p>
                            </div>
                            <motion.button 
                                onClick={handleGetWeather}
                                className="btn-primary w-full"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Try Again
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Weather Display */}
                    {weather && !loading && (
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Main Weather Card */}
                            <motion.div
                                className="glass p-10 rounded-2xl text-center"
                                whileHover={{ scale: 1.02 }}
                            >
                                {/* Location */}
                                <motion.div
                                    className="flex items-center justify-center gap-2 mb-6 text-green-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <MapPin size={20} />
                                    <span className="font-semibold text-lg">{weather.location}</span>
                                </motion.div>

                                {/* Weather Icon */}
                                <motion.div
                                    className="w-24 h-24 mx-auto mb-6"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    {weatherIcons[weather.condition] || (
                                        <Cloud className="w-full h-full text-gray-400" />
                                    )}
                                </motion.div>

                                {/* Temperature */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="text-7xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                        {weather.temp}°C
                                    </div>
                                    <p className="text-xl text-gray-400 mb-4">
                                        {weather.condition}
                                    </p>
                                    <p className="text-gray-400">
                                        Feels like <span className="text-green-400 font-semibold">{weather.feelsLike}°C</span>
                                    </p>
                                </motion.div>
                            </motion.div>

                            {/* Weather Details Grid */}
                            <motion.div
                                className="grid grid-cols-2 gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {[
                                    { icon: Wind, label: 'Wind Speed', value: `${weather.windSpeed} km/h` },
                                    { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
                                    { icon: Eye, label: 'Visibility', value: `${weather.visibility} km` },
                                    { icon: Gauge, label: 'Pressure', value: `${weather.pressure} mb` },
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="glass p-6 rounded-xl text-center group cursor-pointer"
                                        whileHover={{ y: -5, scale: 1.05 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                    >
                                        <motion.div
                                            className="text-green-400 mb-3 inline-block"
                                            whileHover={{ rotate: 12, scale: 1.2 }}
                                        >
                                            <item.icon size={28} />
                                        </motion.div>
                                        <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                                        <p className="text-lg font-bold text-white">{item.value}</p>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Refresh Button */}
                            <motion.div
                                className="flex justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.button 
                                    onClick={handleGetWeather}
                                    className="btn-secondary px-8 py-3"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Refresh Weather
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
