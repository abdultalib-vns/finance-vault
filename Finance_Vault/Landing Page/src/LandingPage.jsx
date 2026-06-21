import React, { useState, useEffect } from 'react';
import { 
  Shield, Smartphone, Lock, Eye, EyeOff, Download, Upload, 
  TrendingUp, CreditCard, Banknote, PiggyBank, Wallet, 
  Calendar, LineChart, Gift, Moon, Sun, Globe, Fingerprint,
  Database, FileSpreadsheet, Zap, CheckCircle, ArrowRight,
  MessageCircle, Mail, Github, Twitter, ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('security');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Military-Grade Encryption',
      description: 'AES-256 encryption using CryptoJS. Your secrets are locked behind your Master PIN with bank-level security.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: '100% Local Storage',
      description: 'Your data never leaves your device. Complete privacy with browser localStorage. No servers, no cloud, no tracking.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Fingerprint className="w-12 h-12" />,
      title: 'Biometric Login',
      description: 'Face ID, Touch ID, and fingerprint support via WebAuthn. Quick and secure access on iOS, Android, and desktop.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <FileSpreadsheet className="w-12 h-12" />,
      title: 'Import/Export Vault',
      description: 'Backup and restore your entire financial portfolio. Import from Excel templates using SheetJS for quick setup.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: '20+ Currencies',
      description: 'Support for USD, INR, EUR, JPY, GBP, PHP, and 15+ more currencies with proper locale formatting.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <Smartphone className="w-12 h-12" />,
      title: 'Progressive Web App',
      description: 'Install on any device. Works offline. Native app experience with bottom navigation and smooth animations.',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const accountTypes = [
    { icon: <Banknote />, name: 'Bank Accounts', desc: 'Track balances, encrypted account numbers' },
    { icon: <CreditCard />, name: 'Credit Cards', desc: 'Expense tracking, bill generation, cashback' },
    { icon: <TrendingUp />, name: 'Fixed Deposits', desc: 'Maturity calculator, interest tracking' },
    { icon: <Calendar />, name: 'Recurring Deposits', desc: 'Monthly installments, overdue alerts' },
    { icon: <LineChart />, name: 'Mutual Funds', desc: 'Investment tracking, current value' },
    { icon: <Wallet />, name: 'Pay Later', desc: 'Credit limit, expense tracking' },
    { icon: <PiggyBank />, name: 'Other Assets', desc: 'Encrypted notes for any financial data' }
  ];

  const steps = [
    { num: '01', title: 'Create Master PIN', desc: 'Set up a 4-6 digit PIN to encrypt all your data' },
    { num: '02', title: 'Add Accounts', desc: 'Add banks, cards, FDs, RDs, mutual funds, or any asset' },
    { num: '03', title: 'Track Everything', desc: 'Monitor balances, expenses, bills, and cashback' },
    { num: '04', title: 'Stay Secure', desc: 'Auto-lock, biometric login, encrypted backups' }
  ];

  const faqs = [
    {
      q: 'Is my data really safe?',
      a: 'Yes! All sensitive data is encrypted using AES-256 encryption with your Master PIN. Data never leaves your device and is stored only in your browser\'s local storage.'
    },
    {
      q: 'Can I access Finance Vault offline?',
      a: 'Absolutely! Finance Vault is a Progressive Web App (PWA) that works completely offline. Install it on your device and use it anywhere, anytime.'
    },
    {
      q: 'What happens if I forget my PIN?',
      a: 'You can use the security question/answer recovery feature. Alternatively, you\'ll need to reset the app (which clears all data), so always keep encrypted backups!'
    },
    {
      q: 'How do I backup my data?',
      a: 'Go to Settings → Export Vault. Enter your PIN to create an encrypted .fvbackup file. Store it securely on cloud storage or external drives.'
    },
    {
      q: 'Can I use this on multiple devices?',
      a: 'Yes! Export your vault from one device and import it on another. Since all data is local, you\'ll need to manually sync via backup files.'
    },
    {
      q: 'Is there a subscription fee?',
      a: 'No! Finance Vault is completely free. No subscriptions, no ads, no hidden costs. Your financial privacy shouldn\'t cost money.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/50">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Finance Vault
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Your Money, Your Privacy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <a 
                href="#app"
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105"
              >
                <Lock className="w-4 h-4" />
                Open Vault
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-20 pb-32 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              100% Private • 100% Secure • 100% Free
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight mb-8">
              <span className="text-gray-900 dark:text-white">Your Financial Life,</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Locked & Secured
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The ultimate privacy-first personal finance tracker. Track 7 account types, manage expenses, 
              generate bills, and monitor cashback — all with military-grade encryption and zero cloud storage.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <a 
                href="#app"
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105"
              >
                <Lock className="w-6 h-6" />
                Launch Finance Vault
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#features"
                className="flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-gray-300 dark:border-gray-700 px-8 py-5 rounded-2xl font-bold text-lg hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <Eye className="w-6 h-6" />
                Explore Features
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { num: '7', label: 'Account Types' },
                { num: '20+', label: 'Currencies' },
                { num: '100%', label: 'Local Storage' },
                { num: 'AES-256', label: 'Encryption' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    {stat.num}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Mockup Section */}
      <section className="container mx-auto px-6 pb-32 relative">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Designed for Mobile,
                  <br />
                  <span className="text-blue-400">Perfected for You</span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Native app experience with smooth animations, bottom navigation, swipeable cards, 
                  and pull-to-refresh. Install as PWA for full offline access.
                </p>
                <ul className="space-y-4">
                  {[
                    'Track all 7 account types in one place',
                    'Generate bills from credit card expenses',
                    'Monitor RD installments with overdue alerts',
                    'Log cashback from every source',
                    'Auto-lock with idle timeout protection',
                    'Dark mode for comfortable night viewing'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* iPhone Mockup */}
              <div className="relative">
                <div className="mx-auto w-[300px] h-[620px] bg-gray-950 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-950 rounded-b-3xl z-20"></div>
                  
                  {/* Screen */}
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden pt-8">
                    {/* Header */}
                    <div className="px-6 pb-4">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-gray-900">Finance Vault</span>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Gift className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      
                      {/* Balance Card */}
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl">
                        <p className="text-blue-100 text-sm font-medium mb-2">Total Balance</p>
                        <h3 className="text-4xl font-bold text-white mb-1">$24,580</h3>
                        <div className="flex items-center gap-2 text-green-300 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>+12.5% this month</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Cards */}
                    <div className="px-6 space-y-3 pb-20">
                      {[
                        { icon: <Banknote className="w-5 h-5" />, name: 'Chase Checking', amount: '$8,450', color: 'bg-blue-500' },
                        { icon: <CreditCard className="w-5 h-5" />, name: 'Amex Gold', amount: '$2,340', color: 'bg-purple-500' },
                        { icon: <TrendingUp className="w-5 h-5" />, name: 'Fixed Deposit', amount: '$10,000', color: 'bg-green-500' }
                      ].map((acc, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex items-center justify-between hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className={`${acc.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                              {acc.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{acc.name}</p>
                              <p className="text-xs text-gray-500">Active</p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">{acc.amount}</p>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
                      <div className="flex justify-around items-center">
                        {[
                          { icon: <Banknote className="w-6 h-6" />, active: true },
                          { icon: <CreditCard className="w-6 h-6" />, active: false },
                          { icon: <Gift className="w-6 h-6" />, active: false },
                          { icon: <Wallet className="w-6 h-6" />, active: false }
                        ].map((nav, i) => (
                          <div key={i} className={`p-2 rounded-xl ${nav.active ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}>
                            {nav.icon}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white dark:bg-gray-800 transition-colors">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Built for Privacy & Security
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Enterprise-grade security meets personal finance. No compromises, no subscriptions, no tracking.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Types */}
      <section className="py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Track Every Financial Asset
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              7 account types to cover your entire financial portfolio. From banks to mutual funds, track it all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {accountTypes.map((type, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  {type.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white dark:bg-gray-800 transition-colors">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              No accounts, no registrations, no personal information. Just create a PIN and start tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                  <div className="text-6xl font-black text-transparent bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-32 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Everything You Need & More</h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Advanced features that make Finance Vault the most comprehensive personal finance tracker
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              { 
                icon: <CreditCard className="w-8 h-8" />,
                title: 'Expense Tracking',
                desc: 'Track every credit card expense with date, amount, cashback, and status. Filter by paid/unpaid/billed.'
              },
              {
                icon: <FileSpreadsheet className="w-8 h-8" />,
                title: 'Bill Generation',
                desc: 'Auto-generate monthly bills from unpaid expenses. Track due dates and payment status.'
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'RD Installments',
                desc: 'Monthly installment tracker with overdue alerts, progress bars, and maturity estimates.'
              },
              {
                icon: <Gift className="w-8 h-8" />,
                title: 'Cashback Tracker',
                desc: 'Log cashback from cards, apps, and offers. Total summary with source breakdown.'
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: 'Auto-Lock',
                desc: 'Idle timeout protection. Auto-lock after 2-10 minutes of inactivity for security.'
              },
              {
                icon: <Download className="w-8 h-8" />,
                title: 'Backup & Restore',
                desc: 'Export encrypted .fvbackup files. Import on any device to restore your entire vault.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all border border-white/20">
                <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-blue-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white dark:bg-gray-800 transition-colors">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about Finance Vault
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, i) => (
              <details 
                key={i}
                className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer p-8 font-semibold text-lg text-gray-900 dark:text-white list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-6 h-6 text-blue-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-8 pb-8 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Take Control?
          </h2>
          <p className="text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
            Join thousands who trust Finance Vault to keep their financial data private and secure.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <a 
              href="#app"
              className="group inline-flex items-center justify-center gap-3 bg-white text-blue-600 px-10 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Lock className="w-6 h-6" />
              Launch Finance Vault
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#features"
              className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-6 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all"
            >
              <Eye className="w-6 h-6" />
              Learn More
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              No Registration Required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              100% Free Forever
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Open Source
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Works Offline
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Finance Vault</span>
              </div>
              <p className="text-sm leading-relaxed">
                Your privacy-first personal finance tracker. Built with love for people who value security.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#app" className="hover:text-blue-400 transition-colors">Launch App</a></li>
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a></li>
                <li><a href="#docs" className="hover:text-blue-400 transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#guide" className="hover:text-blue-400 transition-colors">User Guide</a></li>
                <li><a href="#security" className="hover:text-blue-400 transition-colors">Security</a></li>
                <li><a href="#privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#changelog" className="hover:text-blue-400 transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="#github" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#twitter" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#email" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2026 Finance Vault. All rights reserved.</p>
            <p className="text-gray-500">
              Made with <span className="text-red-500">❤</span> for your financial privacy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
