"use client";

import React from 'react';

interface OperationsBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
}

export default function OperationsBanner({
  title,
  subtitle = "PROJECT OPERATIONS",
  description,
  action,
  children,
}: OperationsBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#111622] text-white p-6 sm:p-8 border border-slate-800 shadow-md">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d111a] via-[#141a26] to-[#121620] pointer-events-none" />

      {/* Stylized Glowing Golden-Orange Arc Curve matching Mockup */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        preserveAspectRatio="none"
        viewBox="0 0 1000 180"
      >
        <defs>
          <linearGradient id="bannerOrangeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#fb923c" stopOpacity="0.9" />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
          </linearGradient>
          <filter id="bannerGlowBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Soft background glow line */}
        <path
          d="M 350 180 C 600 165, 780 115, 1000 48"
          stroke="url(#bannerOrangeGlow)"
          strokeWidth="3.5"
          fill="none"
          filter="url(#bannerGlowBlur)"
        />
        {/* Crisp core stroke */}
        <path
          d="M 350 180 C 600 165, 780 115, 1000 48"
          stroke="#fed7aa"
          strokeWidth="1.2"
          strokeOpacity="0.85"
          fill="none"
        />
        {/* Secondary subtle wave */}
        <path
          d="M 420 180 C 660 170, 830 135, 1000 70"
          stroke="#f97316"
          strokeWidth="1"
          strokeOpacity="0.3"
          fill="none"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.22em] text-slate-400 uppercase font-sans">
            {subtitle}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans mt-0.5">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
