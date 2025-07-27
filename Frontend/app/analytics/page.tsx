"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserAnalytics from "@/components/UserAnalytics";
import Leaderboard from "@/components/Leaderboard";
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

export default function AnalyticsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analytics' | 'leaderboard'>('analytics');

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
  }, [session, status, router]);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Simulation", link: "/simulation" },
    { name: "Analytics", link: "/analytics" },
    { name: "About", link: "/about" },
  ];

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
            <NavbarButton as="button" variant="secondary" onClick={() => router.push("/simulation")}>New Simulation</NavbarButton>
            <NavbarButton as="button" onClick={() => router.push("/")}>Home</NavbarButton>
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
            <NavbarButton as="button" variant="secondary" className="w-full justify-start" onClick={() => router.push("/simulation")}>New Simulation</NavbarButton>
            <NavbarButton as="button" className="w-full justify-start" onClick={() => router.push("/")}>Home</NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Social Media Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your social media performance and compare with others
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            My Analytics
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'analytics' ? (
            <UserAnalytics />
          ) : (
            <Leaderboard sortBy="followers" limit={10} />
          )}
        </motion.div>
      </div>
    </main>
  );
} 