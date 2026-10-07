import React from 'react';

interface EngineeringStageProps {
  number: string;
  category: string;
  title: string;
  description: string;
  metadata?: string;
  align?: 'left' | 'right' | 'center';
}

export default function EngineeringStage({ number, category, title, description, metadata, align = 'left' }: EngineeringStageProps) {
  const alignClass = align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const widthClass = align === 'center' ? 'w-full' : 'w-full md:w-1/2';
  
  return (
    <section className={`h-[100dvh] flex flex-col justify-end md:justify-center ${alignClass} p-6 pb-24 md:p-24 ${align === 'center' ? 'w-full' : 'w-full'}`}>
      <div className={`pointer-events-auto ${widthClass} flex flex-col ${alignClass} bg-alice-blue/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-xl`}>
        <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block">
          {number} / {category}
        </span>
        <h2 className="text-4xl md:text-7xl font-bold text-jet-black tracking-tight mb-2 uppercase">
          {title}
        </h2>
        {metadata && (
          <h3 className="text-lg md:text-xl text-orange font-medium mb-4 uppercase tracking-wider">
            {metadata}
          </h3>
        )}
        <p className={`text-grey text-sm md:text-lg font-light ${align === 'center' ? 'max-w-lg' : 'max-w-sm'}`}>
          {description}
        </p>
      </div>
    </section>
  );
}
