"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

// This is a placeholder for the future /models/ebike-explorer.glb
// Expected future features: system selection, highlighting, isolated views
function BikePlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 2]} />
      <meshStandardMaterial color="#2B303A" wireframe />
    </mesh>
  );
}

export default function BikeExplorer() {
  return (
    <div className="w-full h-[60vh] bg-alice-blue/30 rounded-xl overflow-hidden relative border border-jet-black/10">
      <Canvas camera={{ position: [2, 2, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <BikePlaceholder />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <span className="text-[10px] uppercase font-mono tracking-widest text-jet-black/50 bg-white/50 px-2 py-1 rounded">
          Interactive Explorer [Asset Pending]
        </span>
      </div>
    </div>
  );
}
