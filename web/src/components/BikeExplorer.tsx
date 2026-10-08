"use client";

import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';

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
          color="#FFB347" 
          metalness={0.7} 
          roughness={0.2} 
        />
      </mesh>
    </Center>
  );
}

export default function BikeExplorer() {
  return (
    <div className="w-full h-[60vh] bg-alice-blue/30 rounded-xl overflow-hidden relative border border-jet-black/10">
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
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-4 pointer-events-none flex flex-col">
        <span className="text-[10px] uppercase font-mono tracking-widest text-jet-black/70 bg-white/70 px-2 py-1 rounded mb-1 w-max shadow-sm backdrop-blur">
          Interactive Explorer
        </span>
        <span className="text-[10px] uppercase font-mono tracking-widest text-orange bg-jet-black/80 px-2 py-1 rounded w-max shadow-sm backdrop-blur">
          Loaded: Chassis 300mm STL
        </span>
      </div>
    </div>
  );
}
