
"use client";
import { Cover } from "@/components/ui/cover";
import { 
  Navbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle, 
  NavbarButton 
} from "@/components/ui/resizable-navbar";
import { useState, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image"; 
import dynamic from 'next/dynamic';
import { signIn, signOut, useSession } from "next-auth/react";

import person1 from "../public/testimonial/Soumaditya.jpg";
import person2 from "../public/testimonial/Akash.jpg"; 
import person3 from "../public/testimonial/Nachiketa.jpg";
import person4 from "../public/testimonial/MU.jpg"
import { OrbitingCircles } from "@/components/ui/circle";
import heroImage from "../public/hero/dashboard.jpeg"; //
import QuickAnalytics from "@/components/QuickAnalytics"; 

const AnimatedTestimonials = dynamic(
  () => import('@/components/ui/animated-testimonials').then(mod => mod.AnimatedTestimonials),
  { 
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-black/20 rounded-lg animate-pulse"></div>
  }
);

const FeaturesSectionDemo = dynamic(
  () => import('@/components/ui/Feature').then((mod) => mod.FeaturesSectionDemo),
  { 
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-black/20 rounded-lg animate-pulse"></div>
  }
);

const PricingPlans = dynamic(
  () => import('@/components/ui/pricing-plans').then((mod) => mod.PricingPlans),
  { 
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-black/20 rounded-lg animate-pulse"></div>
  }
);

const CustomNavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <span className="font-bold text-2xl text-white">SF</span>
      <span className="font-medium text-white">Sim-Fluence</span>
    </Link>
  );
};

// Move the Footer dynamic import outside of the component return statement
const Footer = dynamic(
  () => import('@/components/ui/footer').then((mod) => mod.Footer),
  { 
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-black/20 animate-pulse"></div>
  }
);

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Update the navItems array in your home page
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Simulation", link: "/simulation" },
    { name: "Analytics", link: "/analytics" },
    { name: "About", link: "/about" },
  ];
  
  
  const testimonials = [
    {
      quote: "Sim-Fluence has transformed how we approach social media marketing. The predictive analytics are incredibly accurate and have helped us optimize our content strategy.",
      name: "Soumaditya Pal",
      designation: "Marketing Director",
      src: person1
    },
    {
      quote: "The simulation capabilities of this platform are outstanding. We've seen a 40% increase in engagement since implementing the insights from Sim-Fluence.",
      name: "Akash Laha",
      designation: "Social Media Manager",
      src: person2
    },
    {
      quote: "As a content creator, Sim-Fluence has been invaluable in helping me understand what resonates with my audience before I publish.",
      name: "Nachiketa Pahari",
      designation: "Content Strategist",
      src: person3
    },
    {
      quote: "The AI-powered audience simulation is like nothing I've seen before. It's given us unprecedented insights into how our campaigns will perform.",
      name: "MU Ahemad",
      designation: "Digital Marketing Specialist",
      src: person4
    }
  ];

  const ProfileDropdown = () => {
    if (!session) return null;
    
    return (
      <div className="relative" ref={profileDropdownRef}>
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {session.user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </button>
        
        {isProfileDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {session.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session.user?.email || 'user@example.com'}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  signOut();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pt-0 pb-20 gap-16 sm:p-20 sm:pt-0 font-[family-name:var(--font-geist-sans)] bg-black text-white">
      <Navbar className="mt-0 top-0">
        <NavBody>
          <CustomNavbarLogo />
          <NavItems items={navItems} />
          <div className="relative z-20 flex flex-row items-center justify-end gap-2">
            {session ? (
              <ProfileDropdown />
            ) : (
              <button onClick={() => signIn("reddit")}>Login with Reddit</button>
            )}
          </div>
        </NavBody>
        
        <MobileNav>
          <MobileNavHeader>
            <CustomNavbarLogo />
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
          
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item, idx) => (
              <NavbarButton
                key={idx}
                href={item.link}
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </NavbarButton>
            ))}
            {session ? (
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-white/70">
                      {session.user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button className="w-full justify-start" onClick={() => signIn("reddit")}>Login with Reddit</button>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      
      <main className="flex flex-col gap-[32px] row-start-2 items-center text-center">
        <div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
            Analyze your Post Reach
          </h1>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            at{" "}
            <Cover className="inline-block px-4 py-2">
              <span className="text-white">Sim-Fluence</span>
            </Cover>
          </h1>
        </div>
        <p className="text-xl mt-2 text-gray-400 max-w-2xl">
          Understand your social media influence with powerful analytics and simulation tools
        </p>
       
        <div className="w-full max-w-6xl mt-10 mb-8">
          <div className="relative w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden">
            <Image 
              src={heroImage.src} 
              alt="Sim-Fluence Platform" 
              className="w-full h-full object-cover rounded-xl"
              fill
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
             
            </div>
          </div>
        </div>
        
      
        <Suspense fallback={<div className="w-full h-[400px] bg-black/20 rounded-lg animate-pulse"></div>}>
          <FeaturesSectionDemo />
        </Suspense>
        
        {/* Remove PricingPlans from here */}
        
        <div className="w-full max-w-6xl mt-16">
          <div className="flex flex-col md:flex-row gap-8 xl:border rounded-md dark:border-neutral-800 border-white/10 p-4 sm:p-8">
       
            <div className="md:w-2/3 md:border-r dark:border-neutral-800 border-white/10 pr-4 sm:pr-8">
              <Suspense fallback={<div className="w-full h-[400px] bg-black/20 rounded-lg animate-pulse"></div>}>
                <AnimatedTestimonials 
                  testimonials={testimonials.map(t => ({ ...t, src: t.src.src }))} 
                  autoplay={true} 
                />
              </Suspense>
            </div>
      
            <div className="relative md:w-1/3 h-[400px] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <OrbitingCircles className="text-white/70" iconSize={35}>
                  <div className="border-2 border-white p-2 rounded-full bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </div>
                  <div className="border-2 border-white p-2 rounded-full bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </div>
                  <div className="border-2 border-white p-2 rounded-full bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                </OrbitingCircles>
                
                <OrbitingCircles radius={120} reverse className="text-white/70" iconSize={28}>
                  <div className="border-2 border-white p-2 rounded-full bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                  </div>
                  <div className="border-2 border-white p-2 rounded-full bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </div>
                  <div className="border-2 border-white p-2 rounded-full bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 2a10 10 0 0 0-3.16 19.5c.5.08.66-.22.66-.48v-1.7c-2.67.6-3.23-1.13-3.23-1.13-.44-1.1-1.08-1.4-1.08-1.4-.88-.6.07-.6.07-.6.97.07 1.48 1 1.48 1 .87 1.52 2.27 1.07 2.83.82.08-.65.35-1.09.63-1.34-2.13-.25-4.37-1.07-4.37-4.76 0-1.05.37-1.93 1-2.6-.1-.25-.43-1.22.09-2.55 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.1c.85 0 1.7.1 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.52 1.33.19 2.3.1 2.55.62.67 1 1.55 1 2.6 0 3.7-2.25 4.5-4.4 4.75.36.3.68.9.68 1.8v2.67c0 .27.16.57.67.48A10 10 0 0 0 12 2z"></path>
                    </svg>
                  </div>
                  <div className="border-2 border-white p-2 rounded-full bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M7 10v12"></path>
                      <path d="M15 10v12"></path>
                      <path d="M11 14v8"></path>
                      <path d="M11 2v8"></path>
                      <rect x="3" y="10" width="4" height="12"></rect>
                      <rect x="17" y="10" width="4" height="12"></rect>
                      <path d="M7 2h10v8H7z"></path>
                    </svg>
                  </div>
                </OrbitingCircles>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add PricingPlans component after testimonials */}
        <Suspense fallback={<div className="w-full h-[400px] bg-black/20 rounded-lg animate-pulse"></div>}>
          <PricingPlans />
        </Suspense>
      </main>
      
    
      <Suspense fallback={<div className="w-full h-[200px] bg-black/20 animate-pulse"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
}
