"use client";

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import * as THREE from 'three';
import ErrorBoundary from '@/components/ErrorBoundary';

function ChassisModel() {
  const geom = useLoader(STLLoader, '/models/chassis.stl');

  // Ensure the geometry is properly centered and computed
  useMemo(() => {
    geom.computeVertexNormals();
  }, [geom]);

  return (
    <Center scale={0.002}>
      {/* Adjusted rotation to make the chassis stand upright instead of laying flat */}
      <mesh geometry={geom} rotation={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8} 
          roughness={0.3} 
        />
      </mesh>
    </Center>
  );
}

export default function BikeExplorer() {
  const [showTouchHint, setShowTouchHint] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setShowTouchHint(false);
      return;
    }
    const t = setTimeout(() => setShowTouchHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full h-[45vh] md:h-[60vh] bg-alice-blue/30 rounded-xl overflow-hidden relative border border-jet-black/10">
      {showTouchHint && (
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm md:hidden cursor-pointer select-none"
          onClick={() => setShowTouchHint(false)}
          onTouchStart={() => setShowTouchHint(false)}
        >
          <div className="text-center text-white">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-white opacity-90 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <p className="text-sm font-mono uppercase tracking-widest mb-1">Drag to Rotate</p>
            <p className="text-sm font-mono uppercase tracking-widest mb-4">Pinch to Zoom</p>
            <p className="text-xs text-white/60">Tap anywhere to start</p>
          </div>
        </div>
      )}
      <ErrorBoundary 
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs uppercase font-mono tracking-widest text-orange mb-2">3D Acceleration Unavailable</span>
            <p className="text-xs text-grey max-w-xs font-light">Interactive WebGL viewer could not initialize on this device mode.</p>
          </div>
        }
      >
        <Canvas camera={{ position: [2, 1.5, 3], fov: 45 }}>
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <ChassisModel />
            <OrbitControls 
              enableZoom={true} 
              enablePan={false}
              autoRotate={true}
              autoRotateSpeed={1.0}
              maxPolarAngle={Math.PI / 2 + 0.1}
              touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      <div className="absolute bottom-4 left-4 pointer-events-none flex flex-col max-w-[calc(100%-2rem)]">
        <span className="text-[10px] uppercase font-mono tracking-widest text-jet-black/70 bg-white/70 px-2 py-1 rounded mb-1 w-max max-w-full truncate shadow-sm backdrop-blur">
          Interactive Explorer
        </span>
        <span className="text-[10px] uppercase font-mono tracking-widest text-orange bg-jet-black/80 px-2 py-1 rounded w-max max-w-full truncate shadow-sm backdrop-blur">
          Loaded: Chassis 300mm STL
        </span>
      </div>
    </div>
  );
}
