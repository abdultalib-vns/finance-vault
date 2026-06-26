import React, { useState, useEffect } from 'react';
import { 
  Shield, Smartphone, EyeOff, Fingerprint, CloudOff, Box, 
  Banknote, CreditCard, LineChart, Bitcoin, Home, Car, PiggyBank, MoreHorizontal,
  PieChart, Globe, Folder, Bell, Moon, FileText,
  ChevronDown, Apple, Play, Star, CheckCircle, Github, Twitter, Linkedin,
  ArrowRight, Sparkles, Lock, ChevronRight, Settings
} from 'lucide-react';

export default function LandingPage() {
  const stats = [
    { value: '1M+', label: 'Active Users' },
    { value: '5M+', label: 'Downloads' },
    { value: '100%', label: 'Secure' },
    { value: '4.8/5', label: '10k+ Reviews' }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#2d62ff]/20 overflow-x-hidden">
      
      {/* 1. Navigation / Header */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-[#262626]/10 transition-all">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2d62ff] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-black tracking-tight">FinAura</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="hidden md:block text-base font-semibold text-gray-600 hover:text-[#2d62ff] transition-colors">Sign In</button>
            <button className="h-12 px-6 rounded-[128px] bg-black hover:bg-gray-800 text-white text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 bg-[#f8fafc] rounded-b-[64px] shadow-[0_10px_40px_-10px_rgba(45,98,255,0.05)]">
        <div className="container mx-auto px-6 relative z-10 max-w-7xl flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2d62ff]/20 bg-white shadow-sm mb-10">
            <Sparkles className="w-4 h-4 text-[#2d62ff]" />
            <span className="text-sm font-bold text-[#2d62ff]">The Ultimate Personal Finance App</span>
          </div>
          
          <h1 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-bold text-black mb-8 tracking-tighter leading-[1]">
            Shop easy.<br />
            <span className="text-[#2d62ff]">
              Locked & Secured.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The most comprehensive personal finance app that keeps your financial life completely secure, private, and always under your control.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24 w-full sm:w-auto">
            <button className="group flex items-center justify-center gap-3 h-16 px-10 rounded-[128px] bg-[#2d62ff] text-white text-lg font-semibold hover:bg-blue-700 transition-all shadow-[0_10px_30px_-10px_rgba(45,98,255,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(45,98,255,0.6)] hover:-translate-y-1">
              <Apple className="w-6 h-6" />
              Download for iOS
            </button>
            <button className="group flex items-center justify-center gap-3 h-16 px-10 rounded-[128px] bg-white border-2 border-[#262626] text-black text-lg font-semibold hover:bg-gray-50 transition-all hover:-translate-y-1">
              <Play className="w-6 h-6 text-black" />
              Download for Android
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-10 pt-12 border-t border-[#262626]/10 w-full max-w-4xl">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-4xl font-bold text-black tracking-tight mb-2">{stat.value}</div>
                <div className="text-base font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Mobile Experience Highlight */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="rounded-[64px] border border-[#262626]/10 bg-[#f8fafc] p-8 md:p-16 lg:p-20 shadow-[var(--shadow-chromatic)] relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
            
            {/* Subtle Inner Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2d62ff]/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="flex-1 relative z-10">
              <h2 className="text-[3.5rem] md:text-[4rem] font-bold text-black mb-6 tracking-tighter leading-[1.1]">
                Designed for Mobile,<br />
                <span className="text-gray-400">Perfected for You.</span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
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
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2d62ff]/10 text-[#2d62ff]">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-black font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative z-10 flex-1 flex justify-center lg:justify-end">
              {/* Phone Mockup Wrapper */}
              <div className="relative w-[300px] h-[620px] bg-white rounded-[50px] border-[12px] border-[#f8fafc] shadow-[0_20px_50px_rgba(45,98,255,0.15)] overflow-hidden ring-1 ring-[#262626]/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out">
                 
                 {/* Dynamic Island / Notch */}
                 <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#262626] rounded-full z-20"></div>
                 
                 <div className="h-full w-full bg-white flex flex-col pt-16 pb-8 px-6 relative">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-10 h-10 rounded-full bg-[#f8fafc] border border-[#262626]/5"></div>
                      <div className="w-10 h-10 rounded-full bg-[#f8fafc] border border-[#262626]/5"></div>
                    </div>

                    <div className="mb-8">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Balance</p>
                      <h3 className="text-[2rem] font-bold text-black tracking-tight">$24,500<span className="text-gray-400">.00</span></h3>
                    </div>
                    
                    {/* Chart Mockup */}
                    <div className="h-32 mb-10 flex items-end justify-between gap-3">
                       <div className="w-full bg-[#2d62ff]/10 h-[40%] rounded-md"></div>
                       <div className="w-full bg-[#2d62ff]/20 h-[60%] rounded-md"></div>
                       <div className="w-full bg-[#2d62ff]/30 h-[80%] rounded-md relative">
                         <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-[#2d62ff] bg-white px-2 py-1 rounded-md shadow-sm">+$2.4k</div>
                       </div>
                       <div className="w-full bg-[#2d62ff]/60 h-[70%] rounded-md"></div>
                       <div className="w-full bg-[#2d62ff] h-[100%] rounded-md"></div>
                    </div>
                    
                    {/* Transactions */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-[24px] bg-[#f8fafc] border border-[#262626]/5 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center"><Home className="w-5 h-5 text-[#2d62ff]" /></div>
                           <div>
                             <p className="font-bold text-black text-sm">Rent</p>
                             <p className="text-xs font-medium text-gray-500">Today</p>
                           </div>
                        </div>
                        <p className="font-bold text-black text-sm">-$1,200</p>
                      </div>
                      <div className="p-4 rounded-[24px] bg-[#f8fafc] border border-[#262626]/5 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center"><Banknote className="w-5 h-5 text-[#2d62ff]" /></div>
                           <div>
                             <p className="font-bold text-black text-sm">Groceries</p>
                             <p className="text-xs font-medium text-gray-500">Yesterday</p>
                           </div>
                        </div>
                        <p className="font-bold text-black text-sm">-$150</p>
                      </div>
                    </div>

                    {/* Bottom Nav Mockup */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-16 bg-white/90 backdrop-blur-md border border-[#262626]/10 shadow-lg rounded-[128px] flex justify-around items-center px-4">
                      <div className="w-10 h-10 rounded-full bg-[#2d62ff]/10 flex items-center justify-center"><Home className="w-4 h-4 text-[#2d62ff]" /></div>
                      <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center"><PieChart className="w-4 h-4 text-gray-400" /></div>
                      <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center"><CreditCard className="w-4 h-4 text-gray-400" /></div>
                      <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center"><Settings className="w-4 h-4 text-gray-400" /></div>
                    </div>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. Security & Privacy Features Grid */}
      <section className="py-24 relative bg-[#f8fafc]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-[3rem] font-bold text-black mb-6 tracking-tighter">Built for Privacy & Security</h2>
            <p className="text-xl text-gray-600">Your financial data is yours alone. We employ bank-grade security to ensure it stays exactly that way.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Shield />, title: 'Military-Grade Encryption', desc: 'Your data is protected with AES-256 encryption both in transit and at rest.' },
              { icon: <Smartphone />, title: '100% Local Storage', desc: 'Choose to keep your data completely offline on your device for maximum privacy.' },
              { icon: <EyeOff />, title: 'No Data Mining', desc: 'We never sell or share your data. You are the customer, not the product.' },
              { icon: <Fingerprint />, title: 'Biometric Protection', desc: 'Lock your vault with FaceID, TouchID or device passcode.' },
              { icon: <CloudOff />, title: 'Fully Offline Mode', desc: 'Works completely offline. No internet connection required to view or edit data.' },
              { icon: <Box />, title: 'Comprehensive Backups', desc: 'Automatic encrypted backups to your preferred cloud storage provider.' }
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-[50px] bg-white border border-[#262626]/5 hover:border-[#2d62ff]/20 transition-all shadow-[var(--shadow-low)] hover:shadow-[var(--shadow-chromatic)] hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#f8fafc] rounded-[24px] flex items-center justify-center mb-6 text-[#2d62ff] group-hover:bg-[#2d62ff] group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{f.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Asset Tracking Grid (Bento Style) */}
      <section className="py-24 relative bg-white border-t border-[#262626]/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-[3rem] md:text-[3.5rem] font-bold text-black mb-6 tracking-tighter leading-[1]">Track Every Asset</h2>
              <p className="text-xl text-gray-600">From cash to crypto, real estate to retirement funds, track it all in one unified dashboard.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-base font-bold text-black bg-white hover:bg-gray-50 border-2 border-[#262626] px-8 py-4 rounded-[128px] transition-all hover:-translate-y-1">
              View All Supported Assets <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { icon: <Banknote />, title: 'Bank Accounts', desc: 'Checking, savings, & CDs', span: 'col-span-2 lg:col-span-2 row-span-2 bg-[#2d62ff]/5 border-[#2d62ff]/20' },
               { icon: <CreditCard />, title: 'Credit Cards', desc: 'Track balances and limits', span: 'col-span-1 bg-[#f8fafc]' },
               { icon: <LineChart />, title: 'Investments', desc: 'Stocks, bonds & ETFs', span: 'col-span-1 bg-[#f8fafc]' },
               { icon: <Bitcoin />, title: 'Cryptocurrency', desc: 'Wallets & exchanges', span: 'col-span-1 bg-[#f8fafc]' },
               { icon: <Home />, title: 'Real Estate', desc: 'Property values & mortgages', span: 'col-span-1 bg-[#f8fafc]' },
               { icon: <Car />, title: 'Vehicles', desc: 'Cars, boats & loans', span: 'col-span-1 lg:col-span-2 bg-[#f8fafc]' },
               { icon: <PiggyBank />, title: 'Cash', desc: 'Physical currency', span: 'col-span-1 bg-[#f8fafc]' },
               { icon: <MoreHorizontal />, title: 'And More...', desc: 'Custom categories', span: 'col-span-1 bg-white border-dashed border-[#262626]/20' }
             ].map((a, i) => (
               <div key={i} className={`p-8 md:p-10 rounded-[50px] border border-[#262626]/5 shadow-[var(--shadow-low)] flex flex-col justify-between hover:shadow-[var(--shadow-chromatic)] hover:-translate-y-1 transition-all ${a.span}`}>
                 <div className="w-12 h-12 text-[#2d62ff] mb-10">{a.icon}</div>
                 <div>
                   <h3 className="text-2xl font-bold text-black mb-2">{a.title}</h3>
                   <p className="text-base text-gray-500 font-medium">{a.desc}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works (Steps) */}
      <section className="py-32 bg-[#f8fafc]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-[3rem] md:text-[3.5rem] font-bold text-black mb-6 tracking-tighter">Get Started In Minutes</h2>
            <p className="text-xl text-gray-600">No complex setups or bank logins required. Start tracking your net worth instantly.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between relative gap-12 md:gap-4">
             <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#262626]/10 to-transparent"></div>
             {[
               { num: '01', title: 'Download the App', desc: 'Available on iOS and Android devices.' },
               { num: '02', title: 'Create Your Vault', desc: 'Set up your secure PIN and biometrics.' },
               { num: '03', title: 'Add Your Assets', desc: 'Manually add or import your balances.' },
               { num: '04', title: 'Track & Grow', desc: 'Watch your net worth grow over time.' }
             ].map((s, i) => (
               <div key={i} className="relative z-10 flex flex-col items-center text-center flex-1">
                 <div className="w-16 h-16 bg-white text-black font-bold text-xl rounded-full flex items-center justify-center mb-8 border-4 border-[#f8fafc] shadow-md ring-1 ring-[#262626]/5">
                   {s.num}
                 </div>
                 <h3 className="text-xl font-bold text-black mb-3">{s.title}</h3>
                 <p className="text-base font-medium text-gray-500 max-w-[200px]">{s.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 7. Additional Features */}
      <section className="py-32 relative bg-white">
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="mb-16">
              <h2 className="text-[3rem] md:text-[3.5rem] font-bold text-black mb-6 tracking-tighter leading-[1]">Everything You Need & More</h2>
              <p className="text-xl text-gray-600 max-w-2xl">Packed with powerful features to give you complete control over your finances.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#262626]/5 rounded-[64px] overflow-hidden border border-[#262626]/5 shadow-[var(--shadow-low)]">
              {[
                { icon: <PieChart className="w-6 h-6" />, title: 'Advanced Analytics', desc: 'Deep dive into your financial health with beautiful, interactive charts and graphs.' },
                { icon: <Globe className="w-6 h-6" />, title: 'Multi-Currency', desc: 'Support for over 150 fiat currencies and major cryptocurrencies.' },
                { icon: <Folder className="w-6 h-6" />, title: 'Custom Categories', desc: 'Organize your finances exactly how you want with unlimited custom categories.' },
                { icon: <Bell className="w-6 h-6" />, title: 'Custom Reminders', desc: 'Set alerts for bills, subscriptions, and financial milestones.' },
                { icon: <Moon className="w-6 h-6" />, title: 'Dark Mode', desc: 'A beautiful, OLED-optimized dark mode for late-night finance sessions.' },
                { icon: <FileText className="w-6 h-6" />, title: 'Export & Reports', desc: 'Generate detailed PDF and CSV reports for tax season or personal review.' }
              ].map((f, i) => (
                <div key={i} className="bg-white p-12 hover:bg-[#f8fafc] transition-colors">
                   <div className="w-14 h-14 bg-[#2d62ff]/5 border border-[#2d62ff]/10 text-[#2d62ff] rounded-[24px] flex items-center justify-center mb-8">{f.icon}</div>
                   <h3 className="text-2xl font-bold text-black mb-3">{f.title}</h3>
                   <p className="text-base font-medium text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="py-32 bg-[#f8fafc]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-20">
            <h2 className="text-[3rem] font-bold text-black mb-4 tracking-tighter">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about FinAura Vault.</p>
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
               <details key={i} className="group rounded-[32px] border border-[#262626]/10 bg-white overflow-hidden shadow-sm hover:shadow-[var(--shadow-chromatic)] transition-shadow">
                 <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-8 text-black hover:text-[#2d62ff] transition-colors text-lg">
                   <span>{faq.q}</span>
                   <span className="transition-transform duration-300 group-open:rotate-180">
                     <ChevronDown className="w-5 h-5 text-gray-400" />
                   </span>
                 </summary>
                 <div className="text-base text-gray-600 px-8 pb-8 pt-0 leading-relaxed font-medium">
                   {faq.a}
                 </div>
               </details>
             ))}
          </div>
        </div>
      </section>

      {/* 9. Bottom CTA Section */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2d62ff]/5 rounded-[100%] blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10 max-w-3xl">
          <h2 className="text-[3.5rem] md:text-[4.5rem] font-bold text-black mb-6 tracking-tighter leading-[1]">Ready to Take Control?</h2>
          <p className="text-xl text-gray-600 mb-12">Download FinAura Vault today and start your journey to financial peace of mind.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
            <button className="flex items-center justify-center gap-3 h-16 px-10 rounded-[128px] bg-[#2d62ff] text-white font-semibold hover:bg-blue-700 transition-all shadow-[0_10px_30px_-10px_rgba(45,98,255,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(45,98,255,0.6)] hover:-translate-y-1 text-lg">
              <Apple className="w-6 h-6" />
              Download for iOS
            </button>
            <button className="flex items-center justify-center gap-3 h-16 px-10 rounded-[128px] bg-white border-2 border-[#262626] text-black font-semibold hover:bg-gray-50 transition-all hover:-translate-y-1 text-lg">
              <Play className="w-6 h-6 text-black" />
              Download for Android
            </button>
          </div>
          <p className="text-sm text-gray-500 font-bold">No credit card required. 14-day free trial on premium features.</p>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="border-t border-[#262626]/10 bg-[#f8fafc] pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-[#2d62ff] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-xl font-bold text-black tracking-tight">FinAura Vault</span>
              </div>
              <p className="text-base text-gray-600 leading-relaxed max-w-xs mb-8 font-medium">
                The most secure, private, and powerful personal finance app designed for modern wealth building.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#262626]/10 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#2d62ff] transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#262626]/10 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#2d62ff] transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white border border-[#262626]/10 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#2d62ff] transition-colors"><Github className="w-4 h-4" /></a>
              </div>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-base font-bold text-black mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">Updates</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="text-base font-bold text-black mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">API</a></li>
                <li><a href="#" className="hover:text-[#2d62ff] transition-colors">Status</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-4 lg:col-span-2">
              <h4 className="text-base font-bold text-black mb-6">Subscribe to updates</h4>
              <p className="text-sm text-gray-500 mb-6 font-medium">Get the latest news and feature releases.</p>
              <div className="flex gap-3">
                <input type="email" placeholder="Email address" className="bg-white border border-[#262626]/20 rounded-full px-5 py-3 text-base text-black w-full focus:outline-none focus:border-[#2d62ff] transition-colors shadow-sm" />
                <button className="bg-black text-white px-6 py-3 rounded-full text-base font-bold hover:bg-gray-800 transition-colors shadow-sm">Join</button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-[#262626]/10 pt-10 gap-4">
            <span className="text-sm text-gray-500 font-bold">© 2026 FinAura Vault. All rights reserved.</span>
            <div className="flex gap-8 text-sm text-gray-500 font-bold">
              <a href="#" className="hover:text-[#2d62ff] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#2d62ff] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
