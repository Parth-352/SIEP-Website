"use client";

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  valueColor?: string;
  subProgress?: number;
  subProgressColor?: string;
  onClick?: () => void;
}

export default function StatCard({
  label,
  value,
  icon,
  iconBg = "bg-blue-50 text-blue-600 border-blue-100",
  valueColor = "text-slate-900",
  subProgress,
  subProgressColor = "bg-orange-500",
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}
        >
          {icon}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 tracking-wide font-sans truncate">
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-extrabold font-sans tracking-tight mt-0.5 ${valueColor}`}>
            {value}
          </p>
        </div>
      </div>

      {typeof subProgress === 'number' && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${subProgressColor}`}
            style={{ width: `${Math.min(100, Math.max(0, subProgress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
