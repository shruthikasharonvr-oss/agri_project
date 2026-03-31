// app/constants/translations.ts
export const translations = {
  en: {
    welcome: "Welcome to FarmToHome",
    subtitle: "Fresh from the farm to your doorstep",
    searchPlaceholder: "Search for crops (e.g. Ragi)...",
    registerFarmer: "Register as Farmer",
    registerCustomer: "Register as Customer",
    login: "Already have an account? Sign In",
    navHome: "Home",
    navMarket: "Marketplace",
    navChat: "Chat",
  },
  hi: {
    welcome: "FarmToHome में आपका स्वागत है",
    subtitle: "खेत से सीधे आपके दरवाजे तक ताजा",
    searchPlaceholder: "फसलें खोजें (जैसे रागी)...",
    registerFarmer: "किसान के रूप में पंजीकरण करें",
    registerCustomer: "ग्राहक के रूप में पंजीकरण करें",
    login: "पहले से ही एक खाता है? साइन इन करें",
    navHome: "होम",
    navMarket: "बाजार",
    navChat: "चैट",
  },
  kn: {
    welcome: "FarmToHome ಗೆ ಸ್ವಾಗತ",
    subtitle: "ಹೊಲದಿಂದ ನೇರವಾಗಿ ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ ತಾಜಾ",
    searchPlaceholder: "ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ (ಉದಾ. ರಾಗಿ)...",
    registerFarmer: "ರೈತರಾಗಿ ನೋಂದಾಯಿಸಿ",
    registerCustomer: "ಗ್ರಾಹಕರಾಗಿ ನೋಂದಾಯಿಸಿ",
    login: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ",
    navHome: "ಹೋಮ್",
    navMarket: "ಮಾರುಕಟ್ಟೆ",
    navChat: "ಚಾಟ್",
  },
  te: {
    welcome: "FarmToHome కు స్వాగతం",
    subtitle: "పొలం నుండి నేరుగా మీ ఇంటి వద్దకు తాజాగా",
    searchPlaceholder: "పంటల కోసం వెతకండి (ఉదా. రాగి)...",
    registerFarmer: "రైతుగా నమోదు చేసుకోండి",
    registerCustomer: "కస్టమర్‌గా నమోదు చేసుకోండి",
    login: "ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి",
    navHome: "హోమ్",
    navMarket: "మార్కెట్",
    navChat: "చాట్",
  },
  ta: {
    welcome: "FarmToHome-க்கு வரவேற்கிறோம்",
    subtitle: "பண்ணையிலிருந்து நேரடியாக உங்கள் வீட்டு வாசலுக்கு",
    searchPlaceholder: "பயிர்களைத் தேடுங்கள் (உதாரணம்: ராகி)...",
    registerFarmer: "விவசாயியாக பதிவு செய்யுங்கள்",
    registerCustomer: "வாடிக்கையாளராக பதிவு செய்யுங்கள்",
    login: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக",
    navHome: "முகப்பு",
    navMarket: "சந்தை",
    navChat: "அரட்டை",
  }
};

// Build a reverse lookup: English text → { lang: translatedText }
// This is used by TranslationContext's t() function for instant static lookups.
type LangCode = keyof typeof translations;
const enEntries = translations.en;
export const staticTranslations: Record<string, Record<string, string>> = {};

for (const key of Object.keys(enEntries) as (keyof typeof enEntries)[]) {
  const englishText = enEntries[key];
  staticTranslations[englishText] = {};
  for (const lang of Object.keys(translations) as LangCode[]) {
    if (lang === 'en') continue;
    staticTranslations[englishText][lang] = translations[lang][key];
  }
}