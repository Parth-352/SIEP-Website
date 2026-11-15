"use client";

import React from 'react';

export default function CampusLocationBanner() {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-jet-black/10 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center shrink-0 font-mono text-base">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-grey font-bold block mb-0.5">
            Campus Location &amp; Workshop
          </span>
          <span className="text-xs sm:text-sm font-semibold text-jet-black">
            SNJB&apos;s Late Sau. Kantabai Bhavarlalji Jain College of Engineering
          </span>
          <span className="text-xs text-grey block font-mono mt-0.5">
            Neminagar, Chandwad, Nashik, Maharashtra – 423101
          </span>
        </div>
      </div>
    </div>
  );
}
