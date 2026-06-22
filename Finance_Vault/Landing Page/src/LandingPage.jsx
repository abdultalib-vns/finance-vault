import React, { useState, useEffect } from 'react';
import { 
  Shield, Smartphone, EyeOff, Fingerprint, CloudOff, Box, 
  Banknote, CreditCard, LineChart, Bitcoin, Home, Car, PiggyBank, MoreHorizontal,
  PieChart, Globe, Folder, Bell, Moon, FileText,
  ChevronDown, Apple, Play, Star, CheckCircle, Github, Twitter, Linkedin,
  ArrowRight, Sparkles, Lock, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  // Enforce dark theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const stats = [
    { value: '1M+', label: 'Active Users' },
    { value: '5M+', label: 'Downloads' },
    { value: '100%', label: 'Secure' },
    { value: '4.8/5', label: '10k+ Reviews' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 1. Navigation / Header */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#050505]/70 border-b border-white/[0.05] transition-all">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-zinc-100 tracking-tight">FinAura</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Sign In</button>
            <button className="h-9 px-4 rounded-full bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-all hover:scale-105 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32">
        {/* Abstract Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none flex justify-center">
          <div className="absolute top-[-10%] w-[60%] h-[80%] rounded-[100%] bg-blue-600/40 blur-[100px]"></div>
          <div className="absolute top-[10%] w-[40%] h-[60%] rounded-[100%] bg-purple-600/40 blur-[100px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 max-w-7xl flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">The Ultimate Personal Finance App</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white mb-8 tracking-tighter leading-[1.1]">
            Your Financial Life,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-indigo-600">
              Locked & Secured.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The most comprehensive personal finance app that keeps your financial life completely secure, private, and always under your control.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20 w-full sm:w-auto">
            <button className="group flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-zinc-100 text-zinc-900 font-semibold hover:bg-white transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <Apple className="w-5 h-5" />
              Download for iOS
            </button>
            <button className="group flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-white/5 border border-white/10 text-zinc-100 font-semibold hover:bg-white/10 transition-all">
              <Play className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
              Download for Android
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 pt-10 border-t border-white/5 w-full max-w-4xl">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-3xl font-bold text-zinc-100 tracking-tight mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Mobile Experience Highlight */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="rounded-[2.5rem] border border-white/10 bg-zinc-900/30 backdrop-blur-3xl p-8 md:p-16 lg:p-20 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
            
            {/* Subtle Inner Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="flex-1 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-6 tracking-tighter leading-tight">
                Designed for Mobile,<br />
                <span className="text-zinc-500">Perfected for You.</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-lg">
                The ultimate mobile-first experience. Everything you need to manage your money, beautifully crafted right in your pocket.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Intuitive & beautiful interface',
                  'Light & Dark mode support',
                  'Biometric authentication',
                  '128-bit bank-grade encryption',
                  'Real-time sync across devices'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-zinc-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative z-10 flex-1 flex justify-center lg:justify-end">
              {/* Phone Mockup Wrapper */}
              <div className="relative w-[300px] h-[620px] bg-[#0A0A0A] rounded-[3rem] border-[8px] border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,1)] rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out">
                 
                 {/* Dynamic Island / Notch */}
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20"></div>
                 
                 <div className="h-full w-full bg-[#050505] flex flex-col pt-14 pb-8 px-5 relative">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5"></div>
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5"></div>
                    </div>

                    <div className="mb-8">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Total Balance</p>
                      <h3 className="text-4xl font-bold text-white tracking-tight">$24,500<span className="text-zinc-500">.00</span></h3>
                    </div>
                    
                    {/* Chart Mockup */}
                    <div className="h-32 mb-8 flex items-end justify-between gap-2">
                       <div className="w-full bg-blue-500/20 h-[40%] rounded-sm"></div>
                       <div className="w-full bg-blue-500/40 h-[60%] rounded-sm"></div>
                       <div className="w-full bg-blue-500/60 h-[80%] rounded-sm relative">
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-400">+$2.4k</div>
                       </div>
                       <div className="w-full bg-blue-500/80 h-[70%] rounded-sm"></div>
                       <div className="w-full bg-blue-500 h-[100%] rounded-sm"></div>
                    </div>
                    
                    {/* Transactions */}
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Home className="w-5 h-5 text-zinc-300" /></div>
                           <div>
                             <p className="font-semibold text-zinc-200 text-sm">Rent</p>
                             <p className="text-[10px] text-zinc-500">Today</p>
                           </div>
                        </div>
                        <p className="font-bold text-zinc-200 text-sm">-$1,200</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Banknote className="w-5 h-5 text-zinc-300" /></div>
                           <div>
                             <p className="font-semibold text-zinc-200 text-sm">Groceries</p>
                             <p className="text-[10px] text-zinc-500">Yesterday</p>
                           </div>
                        </div>
                        <p className="font-bold text-zinc-200 text-sm">-$150</p>
                      </div>
                    </div>

                    {/* Bottom Nav Mockup */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-14 bg-zinc-800/80 backdrop-blur border border-white/10 rounded-full flex justify-around items-center px-4">
                      <div className="w-8 h-8 rounded-full bg-white/20"></div>
                      <div className="w-8 h-8 rounded-full bg-transparent border border-white/20"></div>
                      <div className="w-8 h-8 rounded-full bg-transparent border border-white/20"></div>
                      <div className="w-8 h-8 rounded-full bg-transparent border border-white/20"></div>
                    </div>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. Security & Privacy Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-100 mb-6 tracking-tighter">Built for Privacy & Security</h2>
            <p className="text-lg text-zinc-400">Your financial data is yours alone. We employ bank-grade security to ensure it stays exactly that way.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield />, title: 'Military-Grade Encryption', desc: 'Your data is protected with AES-256 encryption both in transit and at rest.' },
              { icon: <Smartphone />, title: '100% Local Storage', desc: 'Choose to keep your data completely offline on your device for maximum privacy.' },
              { icon: <EyeOff />, title: 'No Data Mining', desc: 'We never sell or share your data. You are the customer, not the product.' },
              { icon: <Fingerprint />, title: 'Biometric Protection', desc: 'Lock your vault with FaceID, TouchID or device passcode.' },
              { icon: <CloudOff />, title: 'Fully Offline Mode', desc: 'Works completely offline. No internet connection required to view or edit data.' },
              { icon: <Box />, title: 'Comprehensive Backups', desc: 'Automatic encrypted backups to your preferred cloud storage provider.' }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-zinc-900/20 border border-white/5 hover:bg-zinc-900/40 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mb-6 text-zinc-300 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Asset Tracking Grid (Bento Style) */}
      <section className="py-24 relative border-y border-white/5 bg-[#030303]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-100 mb-6 tracking-tighter">Track Every Asset</h2>
              <p className="text-lg text-zinc-400">From cash to crypto, real estate to retirement funds, track it all in one unified dashboard.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-100 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full transition-colors">
              View All Supported Assets <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { icon: <Banknote />, title: 'Bank Accounts', desc: 'Checking, savings, & CDs', span: 'col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20' },
               { icon: <CreditCard />, title: 'Credit Cards', desc: 'Track balances and limits', span: 'col-span-1 bg-zinc-900/30' },
               { icon: <LineChart />, title: 'Investments', desc: 'Stocks, bonds & ETFs', span: 'col-span-1 bg-zinc-900/30' },
               { icon: <Bitcoin />, title: 'Cryptocurrency', desc: 'Wallets & exchanges', span: 'col-span-1 bg-zinc-900/30' },
               { icon: <Home />, title: 'Real Estate', desc: 'Property values & mortgages', span: 'col-span-1 bg-zinc-900/30' },
               { icon: <Car />, title: 'Vehicles', desc: 'Cars, boats & loans', span: 'col-span-1 lg:col-span-2 bg-zinc-900/30' },
               { icon: <PiggyBank />, title: 'Cash', desc: 'Physical currency', span: 'col-span-1 bg-zinc-900/30' },
               { icon: <MoreHorizontal />, title: 'And More...', desc: 'Custom categories', span: 'col-span-1 bg-white/5 border-dashed border-white/20' }
             ].map((a, i) => (
               <div key={i} className={`p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] flex flex-col justify-between ${a.span}`}>
                 <div className="w-10 h-10 text-zinc-400 mb-8">{a.icon}</div>
                 <div>
                   <h3 className="text-lg font-semibold text-zinc-100 mb-1">{a.title}</h3>
                   <p className="text-sm text-zinc-500">{a.desc}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works (Steps) */}
      <section className="py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-100 mb-6 tracking-tighter">Get Started In Minutes</h2>
            <p className="text-lg text-zinc-400">No complex setups or bank logins required. Start tracking your net worth instantly.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between relative gap-12 md:gap-4">
             <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
             {[
               { num: '01', title: 'Download the App', desc: 'Available on iOS and Android devices.' },
               { num: '02', title: 'Create Your Vault', desc: 'Set up your secure PIN and biometrics.' },
               { num: '03', title: 'Add Your Assets', desc: 'Manually add or import your balances.' },
               { num: '04', title: 'Track & Grow', desc: 'Watch your net worth grow over time.' }
             ].map((s, i) => (
               <div key={i} className="relative z-10 flex flex-col items-center text-center flex-1">
                 <div className="w-12 h-12 bg-[#050505] text-zinc-300 font-bold text-sm rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-8 ring-[#050505]">
                   {s.num}
                 </div>
                 <h3 className="text-base font-semibold text-zinc-100 mb-2">{s.title}</h3>
                 <p className="text-sm text-zinc-500 max-w-[200px]">{s.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 7. Additional Features */}
      <section className="py-32 relative border-t border-white/5">
         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-100 mb-6 tracking-tighter">Everything You Need & More</h2>
              <p className="text-lg text-zinc-400 max-w-2xl">Packed with powerful features to give you complete control over your finances.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
              {[
                { icon: <PieChart className="w-5 h-5" />, title: 'Advanced Analytics', desc: 'Deep dive into your financial health with beautiful, interactive charts and graphs.' },
                { icon: <Globe className="w-5 h-5" />, title: 'Multi-Currency', desc: 'Support for over 150 fiat currencies and major cryptocurrencies.' },
                { icon: <Folder className="w-5 h-5" />, title: 'Custom Categories', desc: 'Organize your finances exactly how you want with unlimited custom categories.' },
                { icon: <Bell className="w-5 h-5" />, title: 'Custom Reminders', desc: 'Set alerts for bills, subscriptions, and financial milestones.' },
                { icon: <Moon className="w-5 h-5" />, title: 'Dark Mode', desc: 'A beautiful, OLED-optimized dark mode for late-night finance sessions.' },
                { icon: <FileText className="w-5 h-5" />, title: 'Export & Reports', desc: 'Generate detailed PDF and CSV reports for tax season or personal review.' }
              ].map((f, i) => (
                <div key={i} className="bg-[#050505] p-10 hover:bg-zinc-900/30 transition-colors">
                   <div className="w-10 h-10 bg-white/5 border border-white/5 text-zinc-300 rounded-xl flex items-center justify-center mb-6">{f.icon}</div>
                   <h3 className="text-lg font-semibold text-zinc-100 mb-2">{f.title}</h3>
                   <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4 tracking-tighter">Frequently Asked Questions</h2>
            <p className="text-zinc-400">Everything you need to know about FinAura Vault.</p>
          </div>
          
          <div className="space-y-4">
             {[
               { q: 'Is my data really secure?', a: 'Yes, we use bank-grade AES-256 encryption. Your data never leaves your device unencrypted.' },
               { q: 'Do I need to link my bank accounts?', a: 'No, FinAura Vault works completely offline. You can manually enter balances or import data.' },
               { q: 'What happens if I lose my phone?', a: 'You can easily restore your data on a new device using your secure encrypted backup file.' },
               { q: 'Is there a monthly subscription?', a: 'No, FinAura Vault offers a generous free tier, with optional one-time purchases for premium features.' },
               { q: 'Can I access my data on multiple devices?', a: 'Yes, you can sync your encrypted backups via your preferred cloud provider (iCloud, Google Drive, etc).' },
               { q: 'How do I export my data?', a: 'You can export all your data anytime in CSV or JSON format from the settings menu.' }
             ].map((faq, i) => (
               <details key={i} className="group rounded-2xl border border-white/5 bg-zinc-900/20 overflow-hidden">
                 <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-zinc-300 hover:text-zinc-100 transition-colors">
                   <span>{faq.q}</span>
                   <span className="transition-transform duration-300 group-open:rotate-180">
                     <ChevronDown className="w-4 h-4 text-zinc-500" />
                   </span>
                 </summary>
                 <div className="text-sm text-zinc-500 px-6 pb-6 pt-2 leading-relaxed">
                   {faq.a}
                 </div>
               </details>
             ))}
          </div>
        </div>
      </section>

      {/* 9. Bottom CTA Section */}
      <section className="py-32 relative overflow-hidden border-t border-white/5 bg-[#030303]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-[100%] blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10 max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold text-zinc-100 mb-6 tracking-tighter">Ready to Take Control?</h2>
          <p className="text-lg text-zinc-400 mb-10">Download FinAura Vault today and start your journey to financial peace of mind.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <button className="flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-zinc-100 text-zinc-900 font-semibold hover:bg-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Apple className="w-5 h-5" />
              Download for iOS
            </button>
            <button className="flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-white/5 border border-white/10 text-zinc-100 font-semibold hover:bg-white/10 transition-all">
              <Play className="w-5 h-5 text-zinc-400" />
              Download for Android
            </button>
          </div>
          <p className="text-xs text-zinc-500 font-medium">No credit card required. 14-day free trial on premium features.</p>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="border-t border-white/5 bg-[#030303] pt-20 pb-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-lg font-bold text-zinc-100 tracking-tight">FinAura Vault</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mb-6">
                The most secure, private, and powerful personal finance app designed for modern wealth building.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-colors"><Github className="w-4 h-4" /></a>
              </div>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-sm font-semibold text-zinc-100 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Updates</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="text-sm font-semibold text-zinc-100 mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Status</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-4 lg:col-span-2">
              <h4 className="text-sm font-semibold text-zinc-100 mb-4">Subscribe to updates</h4>
              <p className="text-sm text-zinc-500 mb-4">Get the latest news and feature releases.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-300 w-full focus:outline-none focus:border-blue-500 transition-colors" />
                <button className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors">Join</button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 gap-4">
            <span className="text-xs text-zinc-600 font-medium">© 2026 FinAura Vault. All rights reserved.</span>
            <div className="flex gap-6 text-xs text-zinc-600 font-medium">
              <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
