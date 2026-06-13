import { useState } from 'react';
import { useLocation } from 'wouter';
import { Building2, Smartphone, ShieldCheck, PieChart, Users, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => setLocation('/signup');
  const handleLogin = () => setLocation('/login');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      <SEO 
        title="EstateLedger | Property Management Software Kenya" 
        description="The premium property management system in Kenya. Automate rent collection via M-Pesa, manage tenants, track expenses, and view your ledger with architectural precision."
      />
      
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Building2 size={18} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                EstateLedger
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogin}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={handleGetStarted}
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-primary/5 -z-10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Built highly optimized for the Kenyan market
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Manage your rental empire with <span className="text-primary">architectural precision.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The premium property management system designed to eliminate spreadsheet chaos. Automate M-Pesa rent collections, generate professional invoices, and delight your tenants with a dedicated portal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
            >
              Start Free Trial <ArrowRight size={18} />
            </button>
            <button 
              onClick={handleLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card text-foreground border border-border px-8 py-3.5 rounded-lg font-medium hover:bg-secondary transition-all"
            >
              Owner Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Engineered for your workflow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to run your properties smoothly, packaged into an elegant digital office.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Smartphone size={24} className="text-primary" />,
                title: "M-Pesa Ready",
                description: "Reconcile rent payments directly from M-Pesa statements effortlessly. Say goodbye to hunting down transaction codes."
              },
              {
                icon: <PieChart size={24} className="text-primary" />,
                title: "eTIMS Compliant",
                description: "Generate compliant tax records and professional invoices at the click of a button. Stay fully compliant as a landlord."
              },
              {
                icon: <Users size={24} className="text-primary" />,
                title: "Tenant Portals",
                description: "Provide a premium experience. Tenants can log in to view rent balances, download receipts, and submit maintenance flags."
              },
              {
                icon: <ShieldCheck size={24} className="text-primary" />,
                title: "Architectural Ledger",
                description: "Zero missing records. An immutable, secure ledger history of every payment, expense, and contract signing."
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 rounded-3xl bg-primary relative overflow-hidden text-center">
            <div className="absolute inset-0 w-full h-full opacity-10"
              style={{
                backgroundImage: 'url(/assets/login_splash.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to elevate your property management?</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Join the new standard of real estate management in Kenya. Setup takes less than 5 minutes.</p>
              <button 
                onClick={handleGetStarted}
                className="bg-background text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-colors shadow-lg"
              >
                Create your account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            <span className="font-bold tracking-tight">EstateLedger</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EstateLedger. Built for Kenya.
          </div>
        </div>
      </footer>
    </div>
  );
}
