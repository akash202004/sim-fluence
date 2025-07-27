"use client";

import React from "react";
import { motion } from "framer-motion";
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
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Footer } from "@/components/ui/footer";

export default function AboutPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Simulation", link: "/simulation" },
    { name: "Analytics", link: "/analytics" },
    { name: "About", link: "/about" },
  ];

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
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => signIn("reddit")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login with Reddit
              </button>
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
              <button 
                onClick={() => signOut()}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => signIn("reddit")}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login with Reddit
              </button>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1 
            className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About Sim-Fluence
          </motion.h1>
          <motion.p 
            className="mt-5 max-w-3xl mx-auto text-xl text-gray-500 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Revolutionizing content testing with AI-powered audience simulation
          </motion.p>
        </div>
        
        <div className="mt-20">
          <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Our Mission</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300">
                  <p>
                    At Sim-Fluence, we&apos;re on a mission to help content creators, marketers, and businesses understand how their content will perform before it goes live. By leveraging advanced AI and machine learning, we simulate real audience reactions to provide actionable insights.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Our Vision</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300">
                  <p>
                    We envision a world where content creators can confidently publish material knowing exactly how their audience will respond. Our platform aims to eliminate the guesswork from content strategy, helping you create more engaging and effective content.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-10 bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Our Technology</h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                <p className="mb-4">
                  Sim-Fluence uses cutting-edge AI to create virtual personas that mimic real human behavior. Our platform:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Creates detailed audience simulations based on demographic data</li>
                  <li>Models social networks and influence patterns</li>
                  <li>Predicts content engagement and virality potential</li>
                  <li>Generates realistic feedback and comments</li>
                  <li>Provides actionable insights to improve your content</li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Our Team</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              We&apos;re a passionate team of AI researchers, data scientists, and content strategists dedicated to transforming how content is created and shared.
            </p>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}