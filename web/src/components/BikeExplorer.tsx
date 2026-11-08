"use client";

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center, useGLTF, ContactShadows, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from '@/components/ErrorBoundary';

// Preload the model
useGLTF.preload('/moto.glb');

function ScramblerModel() {
  const { scene } = useGLTF('/moto.glb');

  // Clone and enhance for interactive viewer
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            // Higher env map intensity for interactive viewer (user wants to see reflections)
            mat.envMapIntensity = 1.5;
            
            // Allow LED glow to bloom through tonemapping
            if (mat.emissiveIntensity > 0) {
              mat.toneMapped = false;
            }
            
            mat.needsUpdate = true;
          }
        });
      }
    });

    return clone;
  }, [scene]);

  return (
    <Center scale={1}>
      <primitive object={clonedScene} />
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
    <div className="w-full h-[45vh] md:h-[60vh] bg-gradient-to-b from-alice-blue/40 to-jet-black/[0.03] rounded-xl overflow-hidden relative border border-jet-black/10 shadow-inner">
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
        <Canvas 
          camera={{ position: [2.2, 1.2, 2.8], fov: 38 }}
          gl={{ 
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
            outputColorSpace: THREE.SRGBColorSpace,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 2]}
          shadows
        >
          <Suspense fallback={null}>
            {/* HDR Environment for chrome, steel, gold reflections */}
            <Environment preset="city" />
            
            {/* Studio Lighting — 4 point rig matching Blender setup */}
            <ambientLight intensity={0.3} color="#f8f9fa" />
            
            {/* Key Light — warm from above-right */}
            <directionalLight 
              position={[3, 4, 3]} 
              intensity={1.8} 
              color="#fff7eb" 
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            
            {/* Fill Light — cool blue from opposite */}
            <directionalLight position={[-2.5, 2, 1.5]} intensity={0.7} color="#bfe6ff" />
            
            {/* Rim Light — brand orange accent defining silhouette */}
            <spotLight 
              position={[1.5, 1.5, -2]} 
              intensity={2.5} 
              color="#FF7300" 
              angle={0.35} 
              penumbra={0.9}
              distance={10}
              decay={2}
            />
            
            {/* Bottom bounce fill */}
            <pointLight position={[0, -1, 0]} intensity={0.4} color="#f2f2ff" distance={5} decay={2} />
            
            <ScramblerModel />
            
            {/* Contact shadows for grounding */}
            <ContactShadows 
              position={[0, -0.85, 0]} 
              opacity={0.45} 
              scale={8} 
              blur={2.2} 
              far={3}
              color="#2B303A"
            />
            
            <OrbitControls 
              enableZoom={true} 
              enablePan={false}
              autoRotate={true}
              autoRotateSpeed={0.6}
              maxPolarAngle={Math.PI / 2 + 0.15}
              minPolarAngle={0.2}
              minDistance={1.2}
              maxDistance={5.5}
              touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
              dampingFactor={0.08}
              enableDamping={true}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      {/* Info badges */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex flex-col max-w-[calc(100%-2rem)]">
        <span className="text-[10px] uppercase font-mono tracking-widest text-jet-black/70 bg-white/70 px-2 py-1 rounded mb-1 w-max max-w-full truncate shadow-sm backdrop-blur">
          Interactive Explorer
        </span>
        <span className="text-[10px] uppercase font-mono tracking-widest text-orange bg-jet-black/80 px-2 py-1 rounded w-max max-w-full truncate shadow-sm backdrop-blur">
          Smart Scrambler — Full Assembly GLB
        </span>
      </div>
    </div>
  );
}
