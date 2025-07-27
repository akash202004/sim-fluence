"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import UserAnalytics from "@/components/UserAnalytics";
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
import { motion } from "framer-motion";
import { signIn, signOut } from "next-auth/react";

export default function SimulationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
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

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
    
    // Show welcome message when user first loads the page after login
    if (session && status === "authenticated") {
      setShowWelcomeMessage(true);
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => setShowWelcomeMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [session, status, router]);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Simulation", link: "/simulation" },
    { name: "Analytics", link: "/analytics" },
    { name: "About", link: "/about" },
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

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar className="mt-0 top-0">
        <NavBody>
          <div className="relative z-20 flex items-center">
            <span className="text-xl font-bold text-black dark:text-white">Sim-Fluence</span>
          </div>
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
            <div className="relative z-20 flex items-center">
              <span className="text-xl font-bold text-black dark:text-white">Sim-Fluence</span>
            </div>
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
      
      {/* Welcome Notification */}
      {showWelcomeMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span>Welcome! You've successfully logged in with Reddit.</span>
          </div>
        </motion.div>
      )}

      {/* Welcome Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {session?.user?.name || 'User'}! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Ready to explore your social media analytics and insights.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => router.push("/predict-reach")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Predict Social Media Reach
            </button>
            <button
              onClick={() => router.push("/caption-generator")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Caption Generator
            </button>
            <button
              onClick={() => router.push("/simulation-history")}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Simulation History
            </button>
          </div>
        </motion.div>
        
        {/* User Profile Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <UserAnalytics />
        </motion.div>
        
        {/* Conditional Analytics Display */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <UserAnalytics />
          </motion.div>
        )}
      </div>
    </main>
  );
}