# 🌾 FarmToHome - Agricultural E-Commerce Platform

A modern, intelligent agricultural marketplace connecting farmers directly with customers. Built with **Next.js**, **TypeScript**, **React**, and powered by **AI**, **Google Translate**, and real-time features.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Key Features

### 🛍️ **E-Commerce**
- Real-time product marketplace
- Shopping cart with persistent state
- Checkout and payment integration
- Order tracking and management

### 👨‍🌾 **Farmer Tools**
- Farmer dashboard for product management
- Sales analytics and reporting
- Product listing and inventory management
- Live harvesting and adoption tracking

### 🤖 **AI & Intelligence**
- AI Assistant for agricultural advice
- Chat system for farmer-customer communication
- Virtual harvest game for education
- Crop recommendation system

### 🌐 **Multi-Language Support**
- **13 Languages Supported**:
  - English, Hindi, Tamil, Telugu, Kannada
  - Malayalam, Marathi, Gujarati, Bengali
  - Punjabi, Urdu, Odia, Assamese
- Real-time Google Translate integration
- Language detection and automatic translation

### 🔐 **Authentication & Security**
- Email and Phone-based OTP verification
- Firebase authentication
- Role-based access control (Farmer/Customer)
- Session management and logout

### 📊 **Weather & Insights**
- Real-time weather information
- Agricultural weather insights
- Crop-specific recommendations

### 📱 **User Experience**
- Fully responsive design
- Beautiful UI with Tailwind CSS
- Smooth animations with Framer Motion
- Optimized for mobile devices

---

## 🏗️ Project Structure

```
farm_to_home/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx              # Root layout with Google Translate
│   ├── globals.css             # Global styles
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── orders/            # Order management
│   │   └── chat/              # Chat endpoints
│   ├── auth/                   # Authentication pages
│   ├── login/                  # Login page with OTP
│   ├── register/               # Registration with validation
│   ├── market-place/           # Product marketplace
│   ├── shopping/               # Shopping & product browsing
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout process
│   ├── chat/                   # Chat system
│   ├── ai-assistant/           # AI-powered assistant
│   ├── weather/                # Weather information
│   ├── farmer/                 # Farmer-specific pages
│   │   ├── dashboard/         # Farmer dashboard
│   │   ├── sales/             # Sales reports
│   │   └── adoptions/         # Product adoptions
│   ├── components/             # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── LanguageSelectorV2.tsx  # Multi-language selector
│   │   ├── AgriAssistant.tsx
│   │   └── ...
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── CartContext.tsx     # Cart state
│   │   └── TranslationContext.tsx  # Translation state
│   ├── lib/                    # Utility libraries
│   │   ├── validations.ts      # Form validation utilities
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── supabase.ts         # Supabase configuration
│   │   ├── otpService.ts       # OTP handling
│   │   ├── emailService.ts     # Email notifications
│   │   ├── auditLog.ts         # Activity logging
│   │   └── logger.ts           # Error logging
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuth.ts          # Authentication hook
│   ├── types/                  # TypeScript type definitions
│   └── constants/              # Constants and config
│       └── translations.ts     # Translation strings
├── public/                     # Static assets
│   ├── images/
│   └── ...
├── package.json               # Dependencies
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS config
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Git
- GitHub account (for deployment)
- Firebase account
- Supabase account

### **Installation**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/farm-to-home.git
cd farm_to_home

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Fill in your credentials in .env.local
# - Firebase keys
# - Supabase credentials
# - Email service config
# - API endpoints
```

### **Development**

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### **Building for Production**

```bash
# Build optimized production version
npm run build

# Start production server
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file with the following:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Email Service
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@farmtohome.com

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## ✅ Form Validations

Comprehensive validation utilities are included for all forms:

```typescript
// Available validators
validateEmail(email)           // RFC-compliant email
validatePassword(password)      // Min 8 chars, special chars
validateUsername(username)      // 3-20 chars, alphanumeric
validateName(name)             // Letters and spaces
validatePhone(phone)           // Indian format: +91XXXXXXXXXX
validateOTP(otp)              // 6 digits
validateRequired(value, name)  // Required field check
validateMinLength(value, min, name)
validateMaxLength(value, max, name)
validateNumberRange(value, min, max, name)
validateURL(url)              // Valid URL format
validatePasswordMatch(pwd1, pwd2)  // Confirm password

// Form-level validation
validateLoginForm(data)        // Entire login form
validateRegistrationForm(data) // Entire registration form
```

---

## 🌐 Multi-Language Support

The application supports real-time language translation using Google Translate:

```typescript
// Usage in components
import { useTranslation } from '../contexts/TranslationContext';

function MyComponent() {
  const { currentLang, changeLanguage } = useTranslation();
  
  return (
    <button onClick={() => changeLanguage('ta')}>
      Translate to Tamil
    </button>
  );
}
```

**Supported Languages**:
- English (en), Hindi (hi), Tamil (ta), Telugu (te)
- Kannada (kn), Malayalam (ml), Marathi (mr)
- Gujarati (gu), Bengali (bn), Punjabi (pa)
- Urdu (ur), Odia (or), Assamese (as)

---

## 📊 Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 with Turbopack |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS + Framer Motion |
| **State Management** | React Context API |
| **Authentication** | Firebase Auth + OTP |
| **Database** | Firebase + Supabase |
| **APIs** | Next.js API Routes |
| **Translation** | Google Translate API |
| **Real-time** | Firebase Realtime DB |
| **UI Components** | Lucide React Icons |
| **Forms** | React with Validation |
| **Deployment** | Vercel |

---

## 🎯 Key Pages

| Page | Path | Description |
|------|------|-------------|
| Homepage | `/` | Landing page with features |
| Marketplace | `/market-place` | Browse and search products |
| Shopping | `/shopping` | Product catalog |
| Cart | `/cart` | Shopping cart management |
| Checkout | `/checkout` | Purchase completion |
| Chat | `/chat` | Farmer-customer communication |
| AI Assistant | `/ai-assistant` | Agricultural AI help |
| Weather | `/weather` | Weather forecast & insights |
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |
| Farmer Dashboard | `/farmer/dashboard` | Farmer management panel |
| Account | `/account` | User account settings |

---

## 🚢 Deployment

### **Deploy to Vercel** (Recommended)

1. Push your code to GitHub
2. Connect GitHub to Vercel
3. Set environment variables in Vercel
4. Push to deploy automatically

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### **Production Checklist**
- [ ] Environment variables configured
- [ ] Database backups set up
- [ ] Email service tested
- [ ] Firebase security rules updated
- [ ] SSL certificate configured
- [ ] Performance monitoring enabled
- [ ] Error logging configured
- [ ] Analytics implemented

---

## 📈 Performance

- ⚡ **Fast**: Optimized with Next.js Turbopack
- 📦 **Lightweight**: Code splitting and lazy loading
- 🔄 **Efficient**: Image optimization and caching
- 📱 **Responsive**: Mobile-first design
- ♿ **Accessible**: WCAG compliant

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Dependencies Issue**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support & Contribution

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions
- **Pull Requests**: Contributions welcome!
- **Email**: support@farmtohome.com

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for styling
- Firebase & Supabase for backend services
- Google Translate for multi-language support
- All contributors and community members

---

## 📞 Contact

- **Website**: https://farmtohome.com
- **Email**: support@farmtohome.com
- **GitHub**: https://github.com/YOUR_USERNAME/farm-to-home
- **Twitter**: @FarmToHome

---

**Made with ❤️ for sustainable agriculture and direct farmer-consumer commerce**
