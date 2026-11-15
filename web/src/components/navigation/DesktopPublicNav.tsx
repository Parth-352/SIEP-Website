import React from 'react';
import Link from 'next/link';

interface DesktopPublicNavProps {
  pathname: string;
  user: any;
  isInstalled: boolean;
  installApp: () => void;
  onLogout: () => void;
}

export default function DesktopPublicNav({
  pathname,
  user,
  isInstalled,
  installApp,
  onLogout,
}: DesktopPublicNavProps) {
  return (
    <>
      <Link 
        href="/" 
        className={`uppercase tracking-wider text-xs transition-colors ${
          pathname === '/' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
        }`}
      >
        Home
      </Link>
      <Link 
        href="/about" 
        className={`uppercase tracking-wider text-xs transition-colors ${
          pathname === '/about' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
        }`}
      >
        About
      </Link>
      <Link 
        href="/competition" 
        className={`uppercase tracking-wider text-xs transition-colors ${
          pathname === '/competition' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
        }`}
      >
        Competition
      </Link>
      <Link 
        href="/contact" 
        className={`uppercase tracking-wider text-xs transition-colors ${
          pathname === '/contact' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
        }`}
      >
        Contact
      </Link>

      {/* Action Buttons Section */}
      <div className="flex items-center gap-3 pl-3 border-l border-jet-black/15">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="h-9 px-3.5 rounded-xl bg-jet-black text-alice-blue text-xs font-sans font-bold uppercase tracking-wider hover:bg-orange transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <span>Portal &rarr;</span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="h-9 px-3 rounded-xl border border-jet-black/15 text-grey hover:text-red-600 hover:border-red-400 hover:bg-red-50 text-xs font-sans font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className={`h-9 px-4 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5 border ${
              pathname === '/login'
                ? 'bg-orange/10 text-orange border-orange/40 shadow-sm'
                : 'bg-white/70 border-jet-black/15 text-jet-black hover:border-orange hover:text-orange hover:bg-orange/5'
            }`}
          >
            <span>Portal Login</span>
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        )}

        {!isInstalled && (
          <button
            type="button"
            onClick={installApp}
            title="Install Web App on your phone or computer"
            className="h-9 px-3 rounded-xl border border-orange/40 bg-orange/10 hover:bg-orange text-jet-black hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden xl:inline">Install App</span>
          </button>
        )}
      </div>
    </>
  );
}
