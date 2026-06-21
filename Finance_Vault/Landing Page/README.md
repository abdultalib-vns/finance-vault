# Finance Vault - Landing Page

A super professional, modern landing page for Finance Vault - the privacy-first personal finance tracker.

## 🚀 Features

- **Modern Design**: Gradient backgrounds, smooth animations, and responsive layout
- **Dark Mode**: Toggle between light and dark themes
- **Interactive Sections**: 
  - Hero with animated stats
  - iPhone mockup preview
  - Feature grid with hover effects
  - 7 account types showcase
  - How it works timeline
  - FAQ accordion
  - CTA sections
- **Fully Responsive**: Mobile-first design that works on all devices
- **SEO Optimized**: Meta tags, OpenGraph, and Twitter cards
- **Accessible**: ARIA labels, focus styles, and semantic HTML

## 🛠️ Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons

## 📦 Installation

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

## 🏃‍♂️ Running the Project

```bash
# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
Landing Page/
├── src/
│   ├── LandingPage.jsx    # Main landing page component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles & Tailwind
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

## 🎨 Customization

### Colors
The landing page uses a blue/indigo gradient theme. To customize:
- Edit gradient colors in `LandingPage.jsx`
- Modify Tailwind theme in `tailwind.config.js`

### Content
All content is in `src/LandingPage.jsx`:
- Features array
- Account types
- Steps
- FAQs
- Footer links

### Animations
Custom animations are defined in `src/index.css`:
- Float animation
- Gradient animation
- Pulse effects

## 🔗 Linking to Finance Vault App

Replace all `href="#app"` links with the actual URL to your Finance Vault application:

```jsx
<a href="/app">Launch Finance Vault</a>
// or
<a href="https://yourdomain.com/app">Launch Finance Vault</a>
```

## 📱 Progressive Web App

To link this landing page with your PWA:
1. Add proper manifest.json
2. Configure service worker
3. Add app icons to `/public`

## 🌐 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
# Copy dist/ to your gh-pages branch
```

## 📄 License

Created for Finance Vault - Your Privacy-First Personal Finance Tracker

## 🤝 Contributing

This landing page showcases:
- ✅ 7 Account Types (Bank, Card, FD, RD, MF, PayLater, Other)
- ✅ AES-256 Encryption
- ✅ Biometric Authentication
- ✅ 100% Local Storage
- ✅ Import/Export Vault
- ✅ Expense Tracking
- ✅ Bill Management
- ✅ Cashback Tracker
- ✅ Multi-Currency Support
- ✅ PWA Support
- ✅ Dark Mode

---

Made with ❤️ for your financial privacy
