"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from '@/components/Experience';
import ErrorBoundary from '@/components/ErrorBoundary';

function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export default function Canvas3D() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(isWebGLSupported());
  }, []);

  if (supported === false) {
    return null;
  }

  if (supported === null) {
    return null;
  }

  return (
    <ErrorBoundary fallback={null}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
