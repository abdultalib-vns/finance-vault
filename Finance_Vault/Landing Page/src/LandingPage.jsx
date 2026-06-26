import React, { useState, useEffect } from 'react';
import { 
  Shield, Smartphone, EyeOff, Fingerprint, CloudOff, Box, 
  Banknote, CreditCard, LineChart, Bitcoin, Home, Car, PiggyBank, MoreHorizontal,
  PieChart, Globe, Folder, Bell, Moon, FileText,
  ChevronDown, Apple, Play, Star, CheckCircle, Github, Twitter, Linkedin,
  ArrowRight, Sparkles, Lock, ChevronRight, Settings, MessageSquare, Zap, Target
} from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-white/10 overflow-x-hidden">
      
      {/* 1. Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center max-w-[1440px]">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#E3E5E8] to-[#A8A8A8] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <div className="w-[30px] h-[30px] rounded-full bg-[#111111] flex items-center justify-center">
                 <Shield className="w-4 h-4 text-[#E3E5E8]" strokeWidth={2} />
              </div>
            </div>
            <span className="text-xl font-medium tracking-tight">FinAura</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#A8A8A8]">
            <a href="#features" className="hover:text-[#F5F5F5] transition-colors">Features</a>
            <a href="#security" className="hover:text-[#F5F5F5] transition-colors">Security</a>
            <a href="#pricing" className="hover:text-[#F5F5F5] transition-colors">Pricing</a>
            <a href="#about" className="hover:text-[#F5F5F5] transition-colors">About</a>
          </div>
          <div className="flex items-center gap-6">
            <button className="hidden md:block text-[15px] font-medium text-[#A8A8A8] hover:text-[#F5F5F5] transition-colors">Login</button>
            <button className="h-10 px-5 rounded-full bg-[#E3E5E8] text-[#0A0A0A] text-[15px] font-semibold transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(227,229,232,0.15)]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 max-w-[1440px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111111] mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#A8A8A8]" />
            <span className="text-xs font-medium text-[#A8A8A8] uppercase tracking-wider">FinAura 2.0 is here</span>
          </div>
          
          <h1 className="text-[4rem] md:text-[5rem] lg:text-[72px] font-medium tracking-tighter leading-[1.05] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-[#F5F5F5] to-[#A8A8A8]">
            Own Your<br />Financial Future.
          </h1>
          
          <p className="text-lg md:text-[18px] text-[#A8A8A8] mb-12 max-w-xl leading-relaxed font-light">
            An AI-powered personal finance platform that helps you track spending, automate budgeting, optimize investments, eliminate unnecessary expenses, and build lasting wealth—all in one beautifully engineered experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
            <button className="group flex items-center justify-center h-14 px-8 rounded-full bg-[#E3E5E8] text-[#0A0A0A] text-[15px] font-medium hover:bg-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Get Started
            </button>
            <button className="group flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[#111111] border border-[rgba(255,255,255,0.06)] text-[#F5F5F5] text-[15px] font-medium hover:bg-[#171717] transition-all">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="flex-1 relative w-full max-w-[600px] perspective-[2000px]">
           <div className="absolute inset-0 bg-gradient-to-tr from-[#E3E5E8]/5 to-transparent blur-[120px] rounded-full"></div>
           <div className="relative w-full aspect-[4/3] bg-[#111111] rounded-[24px] border border-[rgba(255,255,255,0.06)] shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] p-6 transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-[-5deg] transition-transform duration-1000 ease-out flex flex-col gap-4 overflow-hidden">
              {/* Dashboard Header */}
              <div className="flex justify-between items-center mb-4">
                 <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#171717] border border-[rgba(255,255,255,0.04)]"></div>
                    <div>
                       <div className="h-3 w-24 bg-[#171717] rounded-full mb-2"></div>
                       <div className="h-2 w-16 bg-[#171717] rounded-full"></div>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-[#171717] border border-[rgba(255,255,255,0.04)]"></div>
              </div>
              {/* Main Chart */}
              <div className="h-40 bg-[#171717] rounded-[16px] border border-[rgba(255,255,255,0.02)] p-4 relative overflow-hidden flex items-end gap-2">
                 <div className="absolute top-4 left-4 h-4 w-32 bg-[#262626] rounded-full"></div>
                 {[40, 55, 45, 70, 65, 80, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-[#E3E5E8]/20 to-[#E3E5E8]/5 rounded-t-md" style={{ height: `${h}%` }}></div>
                 ))}
              </div>
              {/* Cards */}
              <div className="flex gap-4">
                 <div className="flex-1 h-24 bg-[#171717] rounded-[16px] border border-[rgba(255,255,255,0.02)] p-4 flex flex-col justify-between">
                    <div className="h-3 w-16 bg-[#262626] rounded-full"></div>
                    <div className="h-5 w-24 bg-[#E3E5E8]/20 rounded-full"></div>
                 </div>
                 <div className="flex-1 h-24 bg-[#171717] rounded-[16px] border border-[rgba(255,255,255,0.02)] p-4 flex flex-col justify-between">
                    <div className="h-3 w-20 bg-[#262626] rounded-full"></div>
                    <div className="h-5 w-20 bg-[#E3E5E8]/20 rounded-full"></div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 3. Trust Section */}
      <section className="py-12 border-y border-[rgba(255,255,255,0.04)] bg-[#0A0A0A]">
        <div className="container mx-auto px-6 max-w-[1240px] text-center text-[#7B7B7B] text-[13px] font-medium tracking-widest uppercase">
          <p className="mb-8">Trusted by thousands of professionals</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale">
             {/* Abstract minimalist logos */}
             <div className="flex items-center gap-2"><div className="w-6 h-6 border-2 border-current rounded-sm"></div><span>ACME CORP</span></div>
             <div className="flex items-center gap-2"><div className="w-6 h-6 border-2 border-current rounded-full"></div><span>GLOBEX</span></div>
             <div className="flex items-center gap-2"><div className="w-6 h-6 border-2 border-current transform rotate-45"></div><span>SOYLENT</span></div>
             <div className="flex items-center gap-2"><div className="w-6 h-6 border-2 border-current rounded-tl-full rounded-br-full"></div><span>INITECH</span></div>
          </div>
        </div>
      </section>

      {/* 4. Feature Grid */}
      <section id="features" className="py-32 max-w-[1240px] mx-auto px-6">
         <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-[36px] font-medium tracking-tight mb-6">Engineered for Wealth</h2>
            <p className="text-[18px] text-[#A8A8A8] font-light">A suite of precision tools designed to give you absolute clarity and control over your net worth.</p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
               { icon: <Zap />, title: 'AI Spending Intelligence', desc: 'Auto-categorizes transactions with 99.9% accuracy and identifies hidden patterns.' },
               { icon: <Target />, title: 'Smart Budget Automation', desc: 'Dynamic budgets that adapt to your income changes and unexpected expenses.' },
               { icon: <LineChart />, title: 'Investment Insights', desc: 'Track your portfolio performance in real-time across all brokerages.' },
               { icon: <EyeOff />, title: 'Subscription Detection', desc: 'Automatically finds and helps you cancel forgotten recurring charges.' },
               { icon: <Box />, title: 'Financial Goals', desc: 'Visualize your path to financial independence with predictive forecasting.' },
               { icon: <Lock />, title: 'Secure Vault', desc: 'Bank-level encryption ensures your data remains perfectly private.' }
            ].map((f, i) => (
               <div key={i} className="group p-8 rounded-[24px] bg-[#111111] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="w-12 h-12 rounded-full bg-[#171717] border border-[rgba(255,255,255,0.04)] flex items-center justify-center mb-8 text-[#E3E5E8] group-hover:scale-110 transition-transform duration-500">
                     {f.icon}
                  </div>
                  <h3 className="text-[20px] font-medium mb-3 text-[#F5F5F5]">{f.title}</h3>
                  <p className="text-[15px] text-[#A8A8A8] leading-relaxed font-light">{f.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* 5. Product Showcase (Alternating) */}
      <section className="py-32 max-w-[1440px] mx-auto px-6 flex flex-col gap-32">
         {/* Feature 1 */}
         <div className="flex flex-col lg:flex-row items-center gap-16 max-w-[1240px] mx-auto">
            <div className="flex-1 lg:pr-12">
               <h2 className="text-[36px] font-medium tracking-tight mb-6 text-[#F5F5F5]">Smart Budgeting. <br/><span className="text-[#A8A8A8]">Redefined.</span></h2>
               <p className="text-[18px] text-[#A8A8A8] leading-relaxed font-light mb-8">
                  Stop looking in the rearview mirror. Our predictive budgeting engine forecasts your end-of-month balance before the month even begins, letting you make adjustments in real-time.
               </p>
               <ul className="space-y-4">
                  {['Dynamic allocation rules', 'Zero-based budgeting support', 'Predictive cashflow alerts'].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-[15px] text-[#A8A8A8]">
                        <CheckCircle className="w-5 h-5 text-[#E3E5E8]" strokeWidth={1.5} />
                        {item}
                     </li>
                  ))}
               </ul>
            </div>
            <div className="flex-1 w-full bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
               <div className="w-full h-64 bg-[#171717] rounded-[16px] border border-[rgba(255,255,255,0.02)] flex flex-col gap-4 p-6 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                     <div className="h-4 w-32 bg-[#262626] rounded-full"></div>
                     <div className="h-4 w-16 bg-[#262626] rounded-full"></div>
                  </div>
                  {[70, 45, 90].map((w, i) => (
                     <div key={i} className="w-full bg-[#0A0A0A] rounded-full h-8 overflow-hidden border border-[rgba(255,255,255,0.02)]">
                        <div className="h-full bg-gradient-to-r from-[#7B7B7B] to-[#E3E5E8] opacity-80" style={{ width: `${w}%` }}></div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Feature 2 */}
         <div className="flex flex-col lg:flex-row-reverse items-center gap-16 max-w-[1240px] mx-auto">
            <div className="flex-1 lg:pl-12">
               <h2 className="text-[36px] font-medium tracking-tight mb-6 text-[#F5F5F5]">Absolute Clarity. <br/><span className="text-[#A8A8A8]">On every cent.</span></h2>
               <p className="text-[18px] text-[#A8A8A8] leading-relaxed font-light mb-8">
                  Connect all your accounts securely and watch as every transaction is perfectly categorized, tagged, and analyzed. Understand your net worth at a macroscopic or microscopic level.
               </p>
               <button className="flex items-center gap-2 text-[15px] font-medium text-[#F5F5F5] hover:text-[#E3E5E8] transition-colors border-b border-[rgba(255,255,255,0.2)] pb-1">
                  Explore Analytics <ArrowRight className="w-4 h-4" />
               </button>
            </div>
            <div className="flex-1 w-full bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
               <div className="w-full h-64 bg-[#171717] rounded-[16px] border border-[rgba(255,255,255,0.02)] p-6 flex items-end justify-between gap-3">
                  {[20, 35, 25, 60, 45, 80, 65, 95].map((h, i) => (
                     <div key={i} className="flex-1 bg-gradient-to-t from-[#E3E5E8]/20 to-[#E3E5E8]/10 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 6. AI Section */}
      <section className="py-32 bg-[#111111] border-y border-[rgba(255,255,255,0.04)] relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E3E5E8]/5 rounded-full blur-[150px] pointer-events-none"></div>
         <div className="container mx-auto px-6 max-w-[1240px] relative z-10 text-center">
            <Sparkles className="w-8 h-8 text-[#E3E5E8] mx-auto mb-8" strokeWidth={1.5} />
            <h2 className="text-[36px] font-medium tracking-tight mb-6">Meet your new wealth advisor.</h2>
            <p className="text-[18px] text-[#A8A8A8] font-light max-w-2xl mx-auto mb-16">
               Ask natural language questions about your finances, get personalized saving strategies, and receive proactive alerts when your spending patterns shift.
            </p>
            
            <div className="max-w-3xl mx-auto bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-6 text-left shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
               <div className="flex flex-col gap-6">
                  <div className="flex gap-4 items-end justify-end">
                     <div className="bg-[#171717] border border-[rgba(255,255,255,0.04)] px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] text-[#F5F5F5]">
                        How much did I spend on dining out last month compared to my average?
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#E3E5E8] to-[#A8A8A8] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                     </div>
                     <div className="bg-[#111111] border border-[rgba(255,255,255,0.04)] px-5 py-4 rounded-2xl rounded-tl-sm text-[15px] text-[#A8A8A8] leading-relaxed">
                        You spent <strong>$845</strong> on dining out in May, which is <strong>24% higher</strong> than your 6-month average of $680. <br/><br/>
                        Most of the increase came from weekend dinners. If you reduce your weekend dining budget by 15%, you'll be back on track to hit your $10k savings goal by December.
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 7. Statistics Section */}
      <section className="py-32 max-w-[1240px] mx-auto px-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
               { value: '$2.8B', label: 'Assets Managed' },
               { value: '99.99%', label: 'Platform Uptime' },
               { value: '4.9★', label: 'User Rating' },
               { value: '250K+', label: 'Active Users' }
            ].map((stat, i) => (
               <div key={i} className="text-center">
                  <div className="text-[48px] md:text-[64px] font-medium tracking-tighter text-[#F5F5F5] mb-2">{stat.value}</div>
                  <div className="text-[15px] text-[#7B7B7B] uppercase tracking-widest font-medium">{stat.label}</div>
               </div>
            ))}
         </div>
      </section>

      {/* 8. Security Section */}
      <section id="security" className="py-32 bg-[#111111] border-y border-[rgba(255,255,255,0.04)]">
         <div className="container mx-auto px-6 max-w-[1240px]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
               <div className="max-w-2xl">
                  <h2 className="text-[36px] font-medium tracking-tight mb-6">Zero-Knowledge Architecture</h2>
                  <p className="text-[18px] text-[#A8A8A8] font-light">Your financial data is yours alone. We cannot see it, mine it, or sell it. Bank-level encryption secures every bit of information.</p>
               </div>
               <div className="w-16 h-16 rounded-full bg-[#171717] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#E3E5E8]" />
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                  { title: 'Private by Default', desc: 'End-to-end encryption ensures only you hold the keys to your financial data.' },
                  { title: 'Biometric Auth', desc: 'Secure your vault locally with FaceID, TouchID, or physical security keys.' },
                  { title: 'Offline Mode', desc: 'Fully functional without an internet connection for maximum operational security.' }
               ].map((s, i) => (
                  <div key={i} className="pt-8 border-t border-[rgba(255,255,255,0.06)]">
                     <h3 className="text-[20px] font-medium mb-3 text-[#F5F5F5]">{s.title}</h3>
                     <p className="text-[15px] text-[#A8A8A8] font-light leading-relaxed">{s.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 9. Pricing */}
      <section id="pricing" className="py-32 max-w-[1240px] mx-auto px-6">
         <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-[36px] font-medium tracking-tight mb-6">Transparent Pricing</h2>
            <p className="text-[18px] text-[#A8A8A8] font-light">Simple plans for every stage of your financial journey.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
            {[
               { name: 'Free', price: '$0', desc: 'Essential tools to track your net worth.', btn: 'Get Started' },
               { name: 'Pro', price: '$12', desc: 'Advanced analytics and AI insights.', btn: 'Start Trial', highlighted: true },
               { name: 'Business', price: '$49', desc: 'For freelancers and small businesses.', btn: 'Contact Sales' }
            ].map((plan, i) => (
               <div key={i} className={`p-8 rounded-[24px] flex flex-col ${plan.highlighted ? 'bg-[#111111] border-[rgba(255,255,255,0.15)] shadow-[0_20px_40px_rgba(0,0,0,0.6)] border transform md:-translate-y-4 relative' : 'bg-transparent border border-[rgba(255,255,255,0.06)]'}`}>
                  {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E3E5E8] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">Most Popular</div>}
                  <h3 className="text-[20px] font-medium mb-2">{plan.name}</h3>
                  <div className="text-[48px] font-medium tracking-tighter mb-4">{plan.price}<span className="text-[18px] text-[#7B7B7B] font-light">/mo</span></div>
                  <p className="text-[15px] text-[#A8A8A8] mb-8 flex-1 font-light">{plan.desc}</p>
                  <button className={`w-full py-4 rounded-full text-[15px] font-medium transition-all ${plan.highlighted ? 'bg-[#E3E5E8] text-[#0A0A0A] hover:bg-white' : 'bg-[#171717] text-[#F5F5F5] hover:bg-[#262626] border border-[rgba(255,255,255,0.04)]'}`}>
                     {plan.btn}
                  </button>
               </div>
            ))}
         </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-32 bg-[#111111] border-y border-[rgba(255,255,255,0.04)]">
         <div className="max-w-[800px] mx-auto px-6">
            <h2 className="text-[36px] font-medium tracking-tight mb-16 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
               {[
                  { q: 'Is my data truly private?', a: 'Yes. FinAura utilizes end-to-end zero-knowledge encryption. Your data is encrypted locally on your device before it ever reaches our servers. We literally do not have the keys to view your financial data.' },
                  { q: 'Can I connect multiple bank accounts?', a: 'Absolutely. Pro and Business plans support unlimited connections to over 11,000 financial institutions globally via secure API integrations.' },
                  { q: 'How does the AI advisor work?', a: 'Our AI analyzes your anonymized, encrypted spending patterns locally on your device to offer personalized insights, without ever sending raw transaction data to cloud-based LLMs.' },
                  { q: 'Is there a free trial for Pro?', a: 'Yes, we offer a 14-day fully featured free trial of FinAura Pro. No credit card required.' }
               ].map((faq, i) => (
                  <details key={i} className="group border-b border-[rgba(255,255,255,0.06)] pb-6 mb-6">
                     <summary className="flex justify-between items-center text-[18px] font-medium cursor-pointer list-none text-[#F5F5F5] hover:text-[#E3E5E8] transition-colors">
                        <span>{faq.q}</span>
                        <ChevronDown className="w-5 h-5 text-[#7B7B7B] group-open:rotate-180 transition-transform duration-300" />
                     </summary>
                     <div className="text-[15px] text-[#A8A8A8] mt-4 leading-relaxed font-light pr-12">
                        {faq.a}
                     </div>
                  </details>
               ))}
            </div>
         </div>
      </section>

      {/* 11. Final CTA */}
      <section className="py-40 text-center px-6 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E3E5E8]/5 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="relative z-10">
            <h2 className="text-[48px] md:text-[64px] font-medium tracking-tighter mb-8 max-w-3xl mx-auto leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-[#F5F5F5] to-[#A8A8A8]">
               Start Building Better<br/>Financial Habits Today.
            </h2>
            <button className="h-14 px-10 rounded-full bg-[#E3E5E8] text-[#0A0A0A] text-[16px] font-medium hover:bg-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95">
               Get Started Free
            </button>
         </div>
      </section>

      {/* 12. Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.06)] pt-24 pb-12">
         <div className="container mx-auto px-6 max-w-[1240px]">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24 text-[14px]">
               <div className="col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#E3E5E8] to-[#A8A8A8] flex items-center justify-center">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#111111] flex items-center justify-center">
                           <Shield className="w-4 h-4 text-[#E3E5E8]" strokeWidth={2} />
                        </div>
                     </div>
                     <span className="text-lg font-medium tracking-tight">FinAura</span>
                  </div>
                  <p className="text-[#A8A8A8] font-light max-w-xs leading-relaxed">
                     The future operating system for personal wealth. Designed with precision, built for privacy.
                  </p>
               </div>
               
               <div>
                  <h4 className="font-medium text-[#F5F5F5] mb-6">Product</h4>
                  <ul className="space-y-4 text-[#A8A8A8] font-light">
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Features</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Security</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Pricing</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Changelog</a></li>
                  </ul>
               </div>
               
               <div>
                  <h4 className="font-medium text-[#F5F5F5] mb-6">Company</h4>
                  <ul className="space-y-4 text-[#A8A8A8] font-light">
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">About</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Careers</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Contact</a></li>
                  </ul>
               </div>
               
               <div>
                  <h4 className="font-medium text-[#F5F5F5] mb-6">Legal</h4>
                  <ul className="space-y-4 text-[#A8A8A8] font-light">
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Privacy</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Terms</a></li>
                     <li><a href="#" className="hover:text-[#F5F5F5] transition-colors">Security</a></li>
                  </ul>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[rgba(255,255,255,0.06)] text-[13px] text-[#7B7B7B]">
               <p>© 2026 FinAura Inc. All rights reserved.</p>
               <div className="flex gap-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-[#F5F5F5] transition-colors"><Twitter className="w-4 h-4" /></a>
                  <a href="#" className="hover:text-[#F5F5F5] transition-colors"><Linkedin className="w-4 h-4" /></a>
                  <a href="#" className="hover:text-[#F5F5F5] transition-colors"><Github className="w-4 h-4" /></a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
