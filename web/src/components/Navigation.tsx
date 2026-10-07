"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-alice-blue/70 backdrop-blur-lg border-b border-jet-black/10 shadow-sm pointer-events-auto font-sans transition-all duration-300">
        <Link href="/" className="text-2xl font-black text-jet-black tracking-tighter z-50 relative">
          Riders Bay<span className="text-orange">.</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="space-x-8 text-jet-black font-medium hidden md:flex items-center text-sm uppercase tracking-widest">
          <Link href="/about" className="hover:text-orange transition-colors">About</Link>
          <Link href="/competition" className="hover:text-orange transition-colors">Competition</Link>
          <Link href="/bike" className="hover:text-orange transition-colors">The Bike</Link>
          <Link href="/journey" className="hover:text-orange transition-colors">Journey</Link>
          <Link href="/student-hub" className="hover:text-orange transition-colors">Student Hub</Link>
          <Link href="/sponsorship" className="hover:text-orange transition-colors">Sponsors</Link>
          
          <Link 
            href="/contact" 
            className="ml-4 px-6 py-2 bg-jet-black text-alice-blue hover:bg-orange transition-all rounded-sm font-bold shadow-md"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-jet-black font-bold uppercase tracking-widest text-sm z-50 relative px-2 py-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-alice-blue z-40 transition-transform duration-500 ease-in-out flex flex-col justify-center items-center space-y-8 font-sans ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="flex flex-col items-center space-y-6 text-xl uppercase tracking-widest font-bold text-jet-black w-full px-6">
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 pb-4">About</Link>
          <Link href="/competition" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 pb-4">Competition</Link>
          <Link href="/bike" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 pb-4">The Bike</Link>
          <Link href="/journey" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 pb-4">Journey</Link>
          <Link href="/student-hub" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 pb-4">Student Hub</Link>
          <Link href="/sponsorship" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 pb-4">Sponsors</Link>
          
          <Link 
            href="/contact" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center px-6 py-4 bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold mt-4"
          >
            Contact
          </Link>
        </div>
      </div>
    </>
  );
}
